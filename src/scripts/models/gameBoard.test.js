import { GameBoard } from './gameBoard.js';
import { expect } from '@jest/globals';

describe('GameBoard instance', () => {
  const invalidCoords = [
    -2,
    0,
    11,
    23,
    2.2,
    true,
    undefined,
    '2',
    'two',
    [2],
    { size: 2 },
  ];

  const invalidIds = [
    'some ship',
    { fakeShipId: true },
    3,
    null,
    undefined,
    false,
  ];

  let board;
  beforeEach(() => (board = new GameBoard()));

  describe('initial state', () => {
    test('viewShips() returns empty array for an empty board', () => {
      expect(board.viewShips()).toStrictEqual([]);
    });

    test('viewSquare() returns object with ship property of null and hit property of false for any given square coordinated', () => {
      const initialSquare = { ship: null, hit: false };

      expect(board.viewSquare([1, 1])).toStrictEqual(initialSquare);
      expect(board.viewSquare([1, 2])).toStrictEqual(initialSquare);
      expect(board.viewSquare([2, 1])).toStrictEqual(initialSquare);
      expect(board.viewSquare([2, 3])).toStrictEqual(initialSquare);
      expect(board.viewSquare([1, 3])).toStrictEqual(initialSquare);
    });

    test('viewSquare() throws for invalid query requests', () => {
      invalidCoords.forEach((value) => {
        expect(() => board.viewSquare(value)).toThrow(
          'invalid square query request'
        );
        expect(() => board.viewSquare([1, value])).toThrow(
          'invalid square query request'
        );
      });
    });
  });

  describe('placeShip()', () => {
    test('creates a ship object and place it on the board, and assign occupied squares to the ship', () => {
      board.placeShip(1, 1, 2);
      const ships = board.viewShips();

      expect(ships).toHaveLength(1);
      expect(ships[0].size).toBe(2);
      expect(ships[0].hits).toBe(0);
      expect(board.viewSquare([1, 1]).ship).toStrictEqual(ships[0]);
      expect(board.viewSquare([1, 2]).ship).toStrictEqual(ships[0]);
    });

    test('places multiple ships and correctly assign occupied squares to each ship', () => {
      board.placeShip(1, 1, 2);
      board.placeShip(3, 1, 1);
      board.placeShip(1, 4, 5, false);

      const ships = board.viewShips();
      expect(ships).toHaveLength(3);

      const oneSquareShip = ships.find((ship) => ship.size === 1);
      const twoSquareShip = ships.find((ship) => ship.size === 2);
      const fiveSquareShip = ships.find((ship) => ship.size === 5);

      expect(board.viewSquare([3, 1]).ship).toStrictEqual(oneSquareShip);
      expect(board.viewSquare([1, 1]).ship).toStrictEqual(twoSquareShip);
      expect(board.viewSquare([1, 2]).ship).toStrictEqual(twoSquareShip);
      expect(board.viewSquare([1, 4]).ship).toStrictEqual(fiveSquareShip);
      expect(board.viewSquare([2, 4]).ship).toStrictEqual(fiveSquareShip);
      expect(board.viewSquare([3, 4]).ship).toStrictEqual(fiveSquareShip);
      expect(board.viewSquare([4, 4]).ship).toStrictEqual(fiveSquareShip);
      expect(board.viewSquare([5, 4]).ship).toStrictEqual(fiveSquareShip);
    });

    test('throws when trying to place a ship on a square that is already occupied by another ship', () => {
      board.placeShip(1, 1, 3);
      board.placeShip(3, 1, 4, false);

      expect(() => board.placeShip(1, 1, 3)).toThrow(
        'one or more of the specified squares contains another ship'
      );

      expect(() => board.placeShip(1, 2, 2)).toThrow(
        'one or more of the specified squares contains another ship'
      );

      expect(() => board.placeShip(6, 1, 2)).toThrow(
        'one or more of the specified squares contains another ship'
      );
    });

    test('throws for a given invalid or out of board bounds (10x10) coordinates', () => {
      invalidCoords.forEach((value) => {
        expect(() => board.placeShip(value, 1, 2)).toThrow(
          'invalid board coordinates'
        );
      });

      invalidCoords.forEach((value) => {
        expect(() => board.placeShip(1, value, 2)).toThrow(
          'invalid board coordinates'
        );
      });

      expect(() => board.placeShip(1, 10, 1)).not.toThrow();
      expect(() => board.placeShip(2, 10, 2)).toThrow(
        'placing ship out of board bounds'
      );
      expect(() => board.placeShip(3, 7, 5)).toThrow(
        'placing ship out of board bounds'
      );
      expect(() => board.placeShip(9, 1, 3, false)).toThrow(
        'placing ship out of board bounds'
      );
    });

    describe('limits the placed ships according to its size as follows:', () => {
      test('2 one-square ships', () => {
        board.placeShip(1, 1, 1);
        board.placeShip(5, 5, 1, false);
        expect(() => board.placeShip(1, 5, 1)).toThrow(
          'cannot place more ships with size of 1'
        );
      });

      test('3 two-squares ships', () => {
        board.placeShip(1, 1, 2);
        board.placeShip(5, 5, 2, false);
        board.placeShip(10, 6, 2);
        expect(() => board.placeShip(1, 5, 2)).toThrow(
          'cannot place more ships with size of 2'
        );
      });

      test('2 three-squares ships', () => {
        board.placeShip(1, 1, 3);
        board.placeShip(5, 5, 3, false);
        expect(() => board.placeShip(1, 5, 3)).toThrow(
          'cannot place more ships with size of 3'
        );
      });

      test('1 four-squares ship', () => {
        board.placeShip(1, 1, 4);
        expect(() => board.placeShip(1, 5, 4)).toThrow(
          'cannot place more ships with size of 4'
        );
      });

      test('1 five-squares ship', () => {
        board.placeShip(1, 1, 5);
        expect(() => board.placeShip(1, 5, 5)).toThrow(
          'cannot place more ships with size of 5'
        );
      });

      test('place all ships', () => {
        board.placeShip(1, 1, 5);
        board.placeShip(2, 1, 4);
        board.placeShip(3, 1, 3);
        board.placeShip(4, 1, 3);
        board.placeShip(5, 1, 2);
        board.placeShip(6, 1, 2);
        board.placeShip(7, 1, 2);
        board.placeShip(8, 1, 1);
        board.placeShip(9, 1, 1);

        for (let i = 1; i <= 5; i++) {
          expect(() => board.placeShip(1, 6, i, false)).toThrow(
            `cannot place more ships with size of ${i}`
          );
        }
      });
    });
  });

  describe('removeShip()', () => {
    test('removes a ship given its id', () => {
      board.placeShip(1, 4, 3);
      board.placeShip(7, 3, 4);
      const secondShip = board.viewShips().find((ship) => ship.size === 4);
      board.removeShip(secondShip.id);
      const shipsAfter = board.viewShips();
      expect(shipsAfter).toHaveLength(1);
      expect(shipsAfter[0].size).toBe(3);
      expect(board.viewSquare([7, 3]).ship).toBeNull();
    });

    test('enables placing ships in the emptied square after a ship remove', () => {
      board.placeShip(1, 4, 3);
      const ships = board.viewShips();
      board.removeShip(ships[0].id);
      expect(() => board.placeShip(1, 4, 3)).not.toThrow();
    });

    test('throws for invalid ids or unsuccessful remove', () => {
      invalidIds.forEach((id) =>
        expect(() => board.removeShip(id)).toThrow(
          'invalid ship remove request'
        )
      );
    });
  });

  describe('clearBoard()', () => {
    test('clears all ships on the board, and reset board to its initial state', () => {
      const initialSquare = { ship: null, hit: false };
      board.placeShip(2, 2, 5);
      board.placeShip(3, 5, 4);
      board.receiveAttack([2, 2]);
      board.receiveAttack([1, 1]);

      board.clearBoard();
      expect(board.viewShips()).toHaveLength(0);
      expect(board.viewSquare([2, 2])).toStrictEqual(initialSquare);
      expect(board.viewSquare([1, 1])).toStrictEqual(initialSquare);
      expect(() => board.placeShip(2, 2, 5)).not.toThrow();
    });
  });

  describe('receiveAttack()', () => {
    test('returns false, and marks specified square as hit for an empty square', () => {
      expect(board.receiveAttack([1, 1])).toBe(false);
      expect(board.viewSquare([1, 1]).hit).toBe(true);

      board.receiveAttack([3, 3]);
      board.receiveAttack([5, 1]);
      expect(board.viewSquare([3, 3]).hit).toBe(true);
      expect(board.viewSquare([5, 1]).hit).toBe(true);
    });

    test("returns true, and marks specified square as hit for occupied square, and calls the ship's hit method to increment its hit count", () => {
      board.placeShip(1, 1, 3);
      board.placeShip(5, 2, 2, false);

      expect(board.receiveAttack([1, 1])).toBe(true);
      expect(board.receiveAttack([1, 3])).toBe(true);
      expect(board.viewSquare([1, 1]).hit).toBe(true);
      expect(board.viewSquare([1, 3]).hit).toBe(true);
      expect(board.viewSquare([1, 3]).ship.hits).toBe(2);

      board.receiveAttack([5, 2]);
      board.receiveAttack([6, 2]);
      expect(board.viewSquare([5, 2]).ship.isSunk).toBe(true);
    });

    test('throws for invalid square coordinates', () => {
      invalidCoords.forEach((value) => {
        expect(() => board.receiveAttack(value)).toThrow(
          'invalid square coordinates'
        );
        expect(() => board.receiveAttack([1, value])).toThrow(
          'invalid square coordinates'
        );
      });
    });

    test('throws when trying to re-attack an already attacked square', () => {
      board.placeShip(1, 1, 2);
      board.receiveAttack([4, 4]);
      board.receiveAttack([1, 1]);

      expect(() => board.receiveAttack([4, 4])).toThrow(
        'the specified square is already attacked'
      );
      expect(() => board.receiveAttack([1, 1])).toThrow(
        'the specified square is already attacked'
      );
      expect(board.viewShips()[0].hits).toBe(1);
    });
  });

  describe('allSunk()', () => {
    test('returns false for an empty board', () => {
      expect(board.allSunk()).toBe(false);
    });

    test('returns false for a board with at least one ship that is not sunk', () => {
      board.placeShip(1, 1, 2);
      expect(board.allSunk()).toBe(false);

      board.placeShip(3, 3, 1);
      expect(board.allSunk()).toBe(false);
      board.receiveAttack([3, 3]);
      board.receiveAttack([1, 1]);
      expect(board.viewSquare([3, 3]).ship.isSunk).toBe(true);
      expect(board.allSunk()).toBe(false);
    });

    test('returns true if all ships placed on the board is sunk', () => {
      board.placeShip(1, 1, 1);
      board.receiveAttack([1, 1]);
      expect(board.allSunk()).toBe(true);

      board.placeShip(3, 3, 1);
      expect(board.allSunk()).toBe(false);
      board.receiveAttack([3, 3]);
      expect(board.allSunk()).toBe(true);
    });
  });

  describe('rotateShip()', () => {
    test('given a ship id rotates the specified ship from vertical to horizontal and vice versa, and returns true', () => {
      board.placeShip(9, 1, 2);
      const ship = board.viewShips()[0];

      expect(board.rotateShip(ship.id)).toBe(true);
      expect(board.viewSquare([9, 1]).ship).toStrictEqual(ship);
      expect(board.viewSquare([9, 2]).ship).toBeNull();
      expect(board.viewSquare([10, 1]).ship).toStrictEqual(ship);

      expect(board.rotateShip(ship.id)).toBe(true);
      expect(board.viewSquare([9, 1]).ship).toStrictEqual(ship);
      expect(board.viewSquare([9, 2]).ship).toStrictEqual(ship);
      expect(board.viewSquare([10, 1]).ship).toBeNull();
    });

    test("returns false and doesn't rotate the ship if the rotation position is an overlapping position or out of the board bounds", () => {
      board.placeShip(9, 1, 3);
      const ship = board.viewShips()[0];

      expect(board.rotateShip(ship.id)).toBe(false);
      expect(board.viewSquare([9, 1]).ship).toStrictEqual(ship);
      expect(board.viewSquare([9, 2]).ship).toStrictEqual(ship);
      expect(board.viewSquare([9, 3]).ship).toStrictEqual(ship);
      expect(board.viewSquare([10, 1]).ship).toBeNull();

      board.placeShip(7, 1, 4);
      const fourSquares = board.viewShips().find((ship) => ship.size === 4);

      expect(board.rotateShip(fourSquares.id)).toBe(false);
      expect(board.viewSquare([7, 1]).ship).toStrictEqual(fourSquares);
      expect(board.viewSquare([7, 2]).ship).toStrictEqual(fourSquares);
      expect(board.viewSquare([7, 3]).ship).toStrictEqual(fourSquares);
      expect(board.viewSquare([7, 4]).ship).toStrictEqual(fourSquares);
      expect(board.viewSquare([8, 1]).ship).toBeNull();
    });

    test('throws for invalid ids', () => {
      invalidIds.forEach((id) =>
        expect(() => board.rotateShip(id)).toThrow('invalid ship id')
      );
    });
  });
});
