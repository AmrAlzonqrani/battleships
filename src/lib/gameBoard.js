import { Ship } from './ship.js';

export class GameBoard {
  #ships = [];
  #shipsTracker = new Map();
  #squares = new Map();
  #attacks = new Set();

  #shipsLimitPerSize = {
    1: 2,
    2: 3,
    3: 2,
    4: 1,
    5: 1,
  };
  #shipsCountPerSize = {
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0,
  };

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
    return this.#ships.map((ship) => ship.shipData);
  }

  viewSquare(square) {
    if (!this.#isValidSquare(square))
      throw new Error('invalid square query request');

    const sqString = square.toString();
    const ship = this.#squares.get(sqString);
    const hit = this.#attacks.has(sqString);

    return { ship: ship ? ship.shipData : null, hit };
  }

  #placeShipOnBoard(x, y, size, vertical) {
    const squares = [];
    let outGrid = false;

    if (vertical) {
      if (!this.#isValidCoord(y + size - 1)) outGrid = true;

      for (let i = y; i < y + size; i++) {
        squares.push([x, i]);
      }
    } else {
      if (!this.#isValidCoord(x + size - 1)) outGrid = true;

      for (let i = x; i < x + size; i++) {
        squares.push([i, y]);
      }
    }

    const overlaps = squares.some((square) =>
      this.#squares.has(square.toString())
    );

    return { squares, outGrid, overlaps };
  }

  placeShip(x, y, size, vertical = true) {
    if ([x, y].some((coord) => !this.#isValidCoord(coord)))
      throw new Error('invalid board coordinates');
    if (this.#shipsCountPerSize[size] >= this.#shipsLimitPerSize[size])
      throw new Error(`cannot place more ships with size of ${size}`);

    const shipPlace = this.#placeShipOnBoard(x, y, size, vertical);

    if (shipPlace.outGrid) throw new Error('placing ship out of board bounds');
    if (shipPlace.overlaps)
      throw new Error(
        'one or more of the specified squares contains another ship'
      );

    const id = `ship-${this.#ships.length + 1}`;
    const ship = new Ship(size, id);

    shipPlace.squares.forEach((square) =>
      this.#squares.set(square.toString(), ship)
    );
    this.#ships.push(ship);
    this.#shipsTracker.set(id, { vertical, length: size, origin: [x, y] });
    this.#shipsCountPerSize[size]++;
  }

  rotateShip(shipId) {
    const shipPlace = this.#shipsTracker.get(shipId);
    const [x, y] = shipPlace.origin;
    const ship = this.#squares.get(shipPlace.origin.toString());

    this.#squares.delete(shipPlace.origin.toString());
    //remove origin square to prevent false overlapping (overlaps with itself)

    const oldPlace = this.#placeShipOnBoard(
      x,
      y,
      shipPlace.length,
      shipPlace.vertical
    );
    const newPlace = this.#placeShipOnBoard(
      x,
      y,
      shipPlace.length,
      !shipPlace.vertical
    );
    if (newPlace.outGrid || newPlace.overlaps) {
      this.#squares.set(shipPlace.origin.toString(), ship); //re-insert origin
      return false;
    }

    oldPlace.squares.forEach((square) =>
      this.#squares.delete(square.toString())
    );
    newPlace.squares.forEach((square) =>
      this.#squares.set(square.toString(), ship)
    );
    this.#shipsTracker.set(shipId, {
      vertical: !shipPlace.vertical,
      length: shipPlace.length,
      origin: shipPlace.origin,
    });
    return true;
  }

  receiveAttack(square) {
    let hit = false;
    if (!this.#isValidSquare(square))
      throw new Error('invalid square coordinates');

    const sqString = square.toString();
    if (this.#attacks.has(sqString))
      throw new Error('the specified square is already attacked');

    const ship = this.#squares.get(sqString);
    if (ship) {
      ship.hit();
      hit = true;
    }

    this.#attacks.add(sqString);
    return hit;
  }

  allSunk() {
    if (this.#ships.length === 0) return false;
    return this.#ships.every((ship) => ship.isSunk());
  }
}
