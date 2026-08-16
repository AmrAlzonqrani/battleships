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
      const playerA = new Player();
      const playerB = new Player();

      playerA.attackOpponent(playerB.board, [1, 1]);
      expect(playerB.board.viewSquare([1, 1]).hit).toBe(true);
      expect(() => playerA.attackOpponent(playerB.board, [11, 1])).toThrow();
      expect(() => playerA.attackOpponent(playerB.board, [1, 1])).toThrow();
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
});
