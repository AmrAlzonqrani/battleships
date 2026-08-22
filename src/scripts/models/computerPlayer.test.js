import { ComputerPlayer } from './computerPlayer.js';
import { beforeEach, describe, expect } from '@jest/globals';

describe('ComputerPlayer instance', () => {
  let ai;
  beforeEach(() => (ai = new ComputerPlayer()));

  function countAttacks(board) {
    let attacks = 0;
    for (let i = 1; i <= 10; i++) {
      for (let j = 1; j <= 10; j++) {
        if (board.viewSquare([i, j]).hit) attacks++;
      }
    }
    return attacks;
  }

  describe('randomAttack() method', () => {
    let opponent;
    beforeEach(() => (opponent = new ComputerPlayer()));

    test('picks a valid non-attacked square in the passed board and attacks it', () => {
      ai.randomAttack(opponent.board);
      expect(countAttacks(opponent.board)).toBe(1);
    });

    test('delivers multiple valid random attacks', () => {
      ai.randomAttack(opponent.board);
      ai.randomAttack(opponent.board);
      ai.randomAttack(opponent.board);
      ai.randomAttack(opponent.board);

      expect(countAttacks(opponent.board)).toBe(4);
    });

    test("doesn't pick the same square twice", () => {
      for (let i = 0; i < 100; i++) {
        expect(() => ai.randomAttack(opponent.board)).not.toThrow();
      }

      expect(() => ai.randomAttack(opponent.board)).toThrow(
        'no more unique squares to attack'
      );
    });

    test('returns object with the attack result (hit, sunk) and the attacked square', () => {
      const returnV = ai.randomAttack(opponent.board);
      expect(Object.keys(returnV)).toHaveLength(3);
      expect(returnV).toHaveProperty('square');
      expect(returnV).toHaveProperty('hit');
      expect(returnV).toHaveProperty('sunk');
    });
  });

  describe('huntShips()', () => {
    const isAttacked = (board, square) => board.viewSquare(square).hit;
    const getNeighbors = (square) => {
      const [x, y] = square;
      return [
        [x - 1, y],
        [x + 1, y],
        [x, y - 1],
        [x, y + 1],
      ].filter((sq) => sq[0] >= 1 && sq[0] <= 10 && sq[1] >= 1 && sq[1] <= 10);
    };
    const getNonAttackedNeighbors = (board, square) => {
      const neighbors = getNeighbors(square);
      return neighbors.filter((sq) => !isAttacked(board, sq));
    };

    test("attack the opponent's board randomly while no ships discovered yet", () => {
      for (let i = 0; i < 10; i++) {
        const ai = new ComputerPlayer();
        const opponent = new ComputerPlayer();

        ai.huntShips(opponent.board);
        ai.huntShips(opponent.board);
        ai.huntShips(opponent.board);

        expect(countAttacks(opponent.board)).toBe(3);
      }
    });

    test('attacks adjacent valid squares next to a discovered ship when there is one until a pattern is discovered', () => {
      for (let i = 0; i < 50; i++) {
        const ai = new ComputerPlayer();
        const opponent = new ComputerPlayer();

        opponent.board.placeShip(10, 1, 3);
        const shipSquares = [
          [10, 1],
          [10, 2],
          [10, 3],
        ];

        while (opponent.board.viewShips()[0].hits === 0) {
          ai.huntShips(opponent.board);
        } //attack till a ship is discovered

        const discoverySquare = shipSquares.find((sq) =>
          isAttacked(opponent.board, sq)
        );

        const nonAttackedNeighbors = getNonAttackedNeighbors(
          opponent.board,
          discoverySquare
        );

        if (nonAttackedNeighbors.length === 1) continue; //the test is invalid

        let attacks = 0;
        for (let i = nonAttackedNeighbors.length; i > 0; i--) {
          ai.huntShips(opponent.board);
          attacks++;
          if (opponent.board.viewShips()[0].hits === 2) break;
        }

        const attackedAfterHunt = nonAttackedNeighbors.filter((sq) =>
          isAttacked(opponent.board, sq)
        );
        //expect number of attacked squares from the non attacked on discovery to equal attacks count after hunt
        expect(attackedAfterHunt).toHaveLength(attacks);
      }
    });

    test('attacks squares on the pattern line (vertical or horizontal) when pattern is discoverd (at least to adjacent squares) till the ship sinks', () => {
      for (let i = 0; i < 50; i++) {
        const ai = new ComputerPlayer();
        const opponent = new ComputerPlayer();

        opponent.board.placeShip(3, 3, 5, false);
        const shipSquares = [
          [3, 3],
          [4, 3],
          [5, 3],
          [6, 3],
          [7, 3],
        ];

        while (opponent.board.viewShips()[0].hits < 2) {
          ai.huntShips(opponent.board);
        } //attack the ship twice

        const shipHits = shipSquares
          .filter((sq) => isAttacked(opponent.board, sq))
          .sort((a, b) => a[0] - b[0]);

        const expectedAttacks = [
          [2, 3],
          [3, 3],
          [4, 3],
          [5, 3],
          [6, 3],
          [7, 3],
          [8, 3],
        ]
          .filter(
            (sq) =>
              !shipHits.some((hitSq) => sq.toString() === hitSq.toString())
          )
          .filter((sq) => !isAttacked(opponent.board, sq));

        let attacks = 0;
        while (!opponent.board.viewShips()[0].isSunk) {
          ai.huntShips(opponent.board);
          attacks++;
        }

        expect(attacks).toBeLessThanOrEqual(expectedAttacks.length);
      }
    });

    test('stops tracking squares or patterns that belongs to sunk ships and return to random attacks', () => {
      for (let i = 0; i < 50; i++) {
        let adjacentAttacked = 0;
        for (let j = 0; j < 5; j++) {
          const ai = new ComputerPlayer();
          const opponent = new ComputerPlayer();

          opponent.board.placeShip(2, 2, 2);
          const adjacentSquares = [
            [1, 2],
            [1, 3],
            [2, 1],
            [2, 4],
            [3, 2],
            [3, 3],
          ];

          while (!opponent.board.viewShips()[0].isSunk) {
            ai.huntShips(opponent.board);
          }

          if (countAttacks(opponent.board) === 100) continue;
          //if all the board is attacked skip

          const nonAttackedNeighbors = adjacentSquares.filter(
            (sq) => !isAttacked(opponent.board, sq)
          );

          ai.huntShips(opponent.board);

          const attacked = nonAttackedNeighbors.some((sq) =>
            isAttacked(opponent.board, sq)
          );
          if (attacked) adjacentAttacked++;
        }
        expect(adjacentAttacked).toBeLessThan(5);
      }
    });

    test('completes actual game start to end', () => {
      for (let i = 0; i < 100; i++) {
        const ai = new ComputerPlayer();
        const opponent = new ComputerPlayer();

        opponent.placeShipsRandomly();

        while (!opponent.board.allSunk()) {
          expect(() => ai.huntShips(opponent.board)).not.toThrow();
        }
      }
    });

    test('returns object with the attack result (hit, sunk) and the attacked square', () => {
      const opponent = new ComputerPlayer();
      const returnV = ai.huntShips(opponent.board);

      expect(Object.keys(returnV)).toHaveLength(3);
      expect(returnV).toHaveProperty('square');
      expect(returnV).toHaveProperty('hit');
      expect(returnV).toHaveProperty('sunk');
    });
  });
});
