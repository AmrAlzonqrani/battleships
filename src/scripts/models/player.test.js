import { Player } from './player.js';
import { beforeEach, describe, expect, test } from '@jest/globals';

const invalidNames = [
  22,
  null,
  { name: 'player' },
  true,
  '',
  'really unnecessary long player name that should not indeed be that long',
];

describe('Player class', () => {
  describe('constructor', () => {
    test('constructs a Player object with a "name" property with value of the passed name, or default to "player" if no name is passed', () => {
      expect(new Player('amr').name).toBe('amr');
      expect(new Player().name).toBe('player');
    });

    test('only accepts strings between 1 and 50 characters as name argument', () => {
      const fiftyCharacterLong = new Array(50).fill('a').join('');

      expect(() => new Player('a')).not.toThrow();
      expect(() => new Player(fiftyCharacterLong)).not.toThrow();
      expect(() => new Player(`a${fiftyCharacterLong}`)).toThrow(
        'invalid player name, expect a string between 1 and 50 characters'
      );
      invalidNames.forEach((name) => {
        expect(() => new Player(name)).toThrow(
          'invalid player name, expect a string between 1 and 50 characters'
        );
      });
    });
  });
});

describe('Player instance', () => {
  let player;
  beforeEach(() => (player = new Player()));

  describe('name property', () => {
    test('can change name to other valid name', () => {
      expect(player.name).toBe('player');
      player.name = 'new name';
      expect(player.name).toBe('new name');
    });

    test("throws and doesn't change name to invalid names", () => {
      invalidNames.forEach((name) => {
        expect(() => (player.name = name)).toThrow(
          'invalid player name, expect a string between 1 and 50 characters'
        );
      });
    });
  });

  describe('board property', () => {
    test("board property manages interactions with player's board", () => {
      player.board.placeShip(1, 1, 2);
      const ships = player.board.viewShips();
      const ship = ships[0];

      expect(ships).toHaveLength(1);
      expect(player.board.viewSquare([1, 1]).ship).toStrictEqual(ship);
      expect(player.board.rotateShip(ship.id)).toBe(true);
      expect(player.board.allSunk()).toBe(false);

      player.board.receiveAttack([1, 1]);
      expect(player.board.viewSquare([1, 1]).hit).toBe(true);
    });
  });

  describe('attackOpponent()', () => {
    test('delivers hit to the specified board by calling its receiveAttack method in the specified coordinations', () => {
      const opponent = new Player();

      player.attackOpponent(opponent.board, [1, 1]);
      expect(opponent.board.viewSquare([1, 1]).hit).toBe(true);
      expect(() => player.attackOpponent(opponent.board, [11, 1])).toThrow();
      expect(() => player.attackOpponent(opponent.board, [1, 1])).toThrow();
    });

    test('returns the attack result returned by the receiveAttack method of the attacked board', () => {
      const opponent = new Player();
      opponent.board.placeShip(1, 1, 3);

      expect(player.attackOpponent(opponent.board, [1, 1])).toStrictEqual({
        hit: true,
        sunk: false,
      });
      expect(player.attackOpponent(opponent.board, [1, 2])).toStrictEqual({
        hit: true,
        sunk: false,
      });
      expect(player.attackOpponent(opponent.board, [2, 1])).toStrictEqual({
        hit: false,
        sunk: false,
      });
    });

    test('throws for invalid boards', () => {
      invalidNames.forEach((value) => {
        expect(() => player.attackOpponent(value, [1, 1])).toThrow(
          'invalid opponent board'
        );
      });

      expect(() => player.attackOpponent(undefined, [1, 1])).toThrow(
        'invalid opponent board'
      );
    });
  });

  describe('placeShipsRandomly()', () => {
    test('place all ships according to the game rules', () => {
      const totalShips = 9;
      for (let i = 0; i < 99; i++) {
        const player = new Player();
        expect(() => player.placeShipsRandomly()).not.toThrow();
        expect(player.board.viewShips()).toHaveLength(totalShips);
      }
    });
  });
});
