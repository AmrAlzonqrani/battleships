import { Ship } from './ship.js';

export class GameBoard {
  #ships = [];
  #squares = new Map();
  #attacks = new Set();

  #isValidCoord(coord) {
    return Number.isInteger(coord) && coord <= 10 && coord >= 1;
  }

  #isValidSquare(square) {
    return (
      Array.isArray(square) &&
      square.length === 2 &&
      square.every((v) => this.#isValidCoord(v))
    );
  }

  viewShips() {
    return this.#ships;
  }

  viewSquare(square) {
    if (!this.#isValidSquare(square))
      throw new Error('invalid square query request');

    const sqString = square.toString();
    const ship = this.#squares.get(sqString) ?? null;
    const hit = this.#attacks.has(sqString);

    return { ship, hit };
  }

  placeShip(x, y, size, vertical = true) {
    if ([x, y].some((coord) => !this.#isValidCoord(coord)))
      throw new Error('invalid board coordinates');

    const squares = [];
    const ship = new Ship(size);

    if (vertical) {
      if (!this.#isValidCoord(y + size - 1))
        throw new Error('placing ship out of board bounds');

      for (let i = y; i < y + size; i++) {
        squares.push([x, i]);
      }
    } else {
      if (!this.#isValidCoord(x + size - 1))
        throw new Error('placing ship out of board bounds');
      for (let i = x; i < x + size; i++) {
        squares.push([i, y]);
      }
    }

    const overlaps = squares.some((square) =>
      this.#squares.has(square.toString())
    );
    if (overlaps)
      throw new Error(
        'one or more of the specified squares contains another ship'
      );

    squares.forEach((square) => this.#squares.set(square.toString(), ship));

    this.#ships.push(ship);
  }

  receiveAttack(square) {
    if (!this.#isValidSquare(square))
      throw new Error('invalid square coordinates');

    const sqString = square.toString();
    if (this.#attacks.has(sqString))
      throw new Error('the specified square is already hit');

    const ship = this.#squares.get(sqString);
    if (ship) ship.hit();

    this.#attacks.add(sqString);
  }

  allSunk() {
    if (this.#ships.length === 0) return false;
    return this.#ships.every((ship) => ship.isSunk());
  }
}
