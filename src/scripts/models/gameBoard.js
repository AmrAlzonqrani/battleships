import { Ship } from './ship.js';

export class GameBoard {
  #ships = new Map();
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
    return Array.from(this.#ships.values()).map((ship) => ship.shipData);
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

    const id = `ship-${this.#ships.size + 1}`;
    const ship = new Ship(size, id);

    shipPlace.squares.forEach((square) =>
      this.#squares.set(square.toString(), ship)
    );
    this.#ships.set(id, ship);
    this.#shipsTracker.set(id, {
      vertical,
      origin: [x, y],
      squares: shipPlace.squares,
    });
    this.#shipsCountPerSize[size]++;
  }

  #isValidId(id) {
    return this.#ships.has(id);
  }

  removeShip(shipId) {
    if (!this.#isValidId(shipId)) throw 'invalid ship remove request';

    this.#ships.delete(shipId);
    const squares = this.#shipsTracker.get(shipId).squares;
    this.#shipsTracker.delete(shipId);
    squares.forEach((sq) => {
      this.#squares.delete(sq.toString());
    });
  }

  clearBoard() {
    this.#ships.clear();
    this.#shipsTracker.clear();
    this.#squares.clear();
    this.#attacks.clear();
    this.#shipsCountPerSize = {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
    };
  }

  rotateShip(shipId) {
    if (!this.#isValidId(shipId)) throw new Error('invalid ship id');
    const shipPlace = this.#shipsTracker.get(shipId);
    const [x, y] = shipPlace.origin;
    const ship = this.#squares.get(shipPlace.origin.toString());

    this.#squares.delete(shipPlace.origin.toString());
    //remove origin square to prevent false overlapping (overlaps with itself)
    const newPlace = this.#placeShipOnBoard(
      x,
      y,
      shipPlace.squares.length,
      !shipPlace.vertical
    );
    if (newPlace.outGrid || newPlace.overlaps) {
      this.#squares.set(shipPlace.origin.toString(), ship); //re-insert origin
      return false;
    }

    shipPlace.squares.forEach((square) =>
      this.#squares.delete(square.toString())
    );
    newPlace.squares.forEach((square) =>
      this.#squares.set(square.toString(), ship)
    );
    this.#shipsTracker.set(shipId, {
      vertical: !shipPlace.vertical,
      origin: shipPlace.origin,
      squares: newPlace.squares,
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
    if (this.#ships.size === 0) return false;
    let sunkShips = 0;
    this.#ships.forEach((ship) => {
      if (ship.isSunk()) sunkShips++;
    });

    return this.#ships.size === sunkShips;
  }
}
