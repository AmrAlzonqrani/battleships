import { Ship } from './ship.js';
import { describe, expect } from '@jest/globals';

describe('Ship class', () => {
  describe('constructor', () => {
    test('constructs Ship instance when the passed size argument is valid integer', () => {
      expect(new Ship(3)).toBeInstanceOf(Ship);
      expect(new Ship(2)).toBeInstanceOf(Ship);
    });

    test('throws when called with size argument with non-integer values', () => {
      const invalidSizes = [2.2, true, undefined, '2', 'two', [2], { size: 2 }];

      invalidSizes.forEach((value) => {
        expect(() => new Ship(value)).toThrow(
          'invalid size, expects an integer between 1 and 5'
        );
      });
    });

    test('throws for size smaller than 1 or bigger than 5', () => {
      expect(() => new Ship(0)).toThrow(
        'invalid size, expects an integer between 1 and 5'
      );

      expect(() => new Ship(-2)).toThrow(
        'invalid size, expects an integer between 1 and 5'
      );

      expect(() => new Ship(6)).toThrow(
        'invalid size, expects an integer between 1 and 5'
      );

      expect(() => new Ship(11)).toThrow(
        'invalid size, expects an integer between 1 and 5'
      );
    });

    test('throws when called without size arguments', () => {
      expect(() => new Ship()).toThrow(
        'invalid size, expects an integer between 1 and 5'
      );
    });
  });
});

describe('Ship instance', () => {
  let ship;
  beforeEach(() => {
    ship = new Ship(3);
  });

  describe('size property', () => {
    test('returns the ship size set at construction', () => {
      expect(ship.size).toBe(3);
    });
  });

  describe('hit()', () => {
    test('increments hit count', () => {
      ship.hit();
      expect(ship.hits).toBe(1);

      ship.hit();
      expect(ship.hits).toBe(2);
    });
  });

  describe('isSunk()', () => {
    test('returns false if the ship is not sunk (hits is less than size)', () => {
      expect(ship.isSunk()).toBe(false);
    });

    test('return tre if the ship is sunk (hits is equal to size)', () => {
      ship.hit();
      ship.hit();
      ship.hit();

      expect(ship.isSunk()).toBe(true);
    });
  });
});
