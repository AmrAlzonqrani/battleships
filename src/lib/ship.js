export class Ship {
  #size;
  #hits = 0;
  #id;

  constructor(size, id) {
    if (!Ship.#isValidSize(size))
      throw new Error('invalid size, expects an integer between 1 and 5');
    this.#size = size;
    this.#id = id;
  }

  static #isValidSize(size) {
    return Number.isInteger(size) && size >= 1 && size <= 5;
  }

  get size() {
    return this.#size;
  }

  get hits() {
    return this.#hits;
  }

  hit() {
    this.#hits++;
  }

  isSunk() {
    return this.#hits === this.#size;
  }

  get shipData() {
    return {
      id: this.#id,
      size: this.#size,
      hits: this.#hits,
      isSunk: this.isSunk(),
    };
  }
}
