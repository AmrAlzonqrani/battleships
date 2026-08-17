import { ComputerPlayer } from './computerPlayer.js';
import { beforeEach, expect } from '@jest/globals';

describe('ComputerPlayer instance', () => {
  let ai;
  beforeEach(() => (ai = new ComputerPlayer()));

  describe('randomAttack() method', () => {
    test('picks a valid non-attacked square in the passed board and attacks it', () => {
      const opponent = new ComputerPlayer();
      ai.randomAttack(opponent.board);

      let attacks = 0;
      for (let i = 1; i <= 10; i++) {
        for (let j = 1; j <= 10; j++) {
          if (opponent.board.viewSquare([i, j]).hit) attacks++;
        }
      }

      expect(attacks).toBe(1);
    });

    test('delivers multiple valid random attacks', () => {
      const opponent = new ComputerPlayer();
      ai.randomAttack(opponent.board);
      ai.randomAttack(opponent.board);
      ai.randomAttack(opponent.board);
      ai.randomAttack(opponent.board);

      let attacks = 0;
      for (let i = 1; i <= 10; i++) {
        for (let j = 1; j <= 10; j++) {
          if (opponent.board.viewSquare([i, j]).hit) attacks++;
        }
      }

      expect(attacks).toBe(4);
    });

    test("doesn't pick the same square twice", () => {
      const opponent = new ComputerPlayer();

      for (let i = 0; i < 100; i++) {
        expect(() => ai.randomAttack(opponent.board)).not.toThrow();
      }

      expect(() => ai.randomAttack(opponent.board)).toThrow(
        'no more unique squares to attack'
      );
    });
  });

  describe('placeShipsRandomly()', () => {
    test('place all ships according to the game rules', () => {
      const totalShips = 9;
      for (let i = 0; i < 99; i++) {
        const ai = new ComputerPlayer();
        expect(() => ai.placeShipsRandomly()).not.toThrow();
        expect(ai.board.viewShips()).toHaveLength(totalShips);
      }
    });
  });
});
