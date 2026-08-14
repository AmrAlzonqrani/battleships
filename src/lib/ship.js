export class Ship {
  #size;
  #hits = 0;

  constructor(size) {
    if (!Ship.#isValidSize(size))
      throw new Error('invalid size, expects an integer between 1 and 5');
    this.#size = size;
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
}
