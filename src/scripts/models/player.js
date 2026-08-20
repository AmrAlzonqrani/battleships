import { GameBoard } from './gameBoard.js';

export class Player {
  #name;
  #board = new GameBoard();
  #shipsNumbersPerSize = {
    1: 2,
    2: 3,
    3: 2,
    4: 1,
    5: 1,
  };
  #boardGrid = new Array(10).fill(null).map(() => new Array(10).fill(true));

  constructor(name = 'player') {
    if (!Player.#isValidName(name))
      throw new Error(
        'invalid player name, expect a string between 1 and 50 characters'
      );
    this.#name = name;
  }

  static #isValidName(name) {
    return typeof name === 'string' && name.length <= 50 && name.length >= 1;
  }

  get name() {
    return this.#name;
  }

  get board() {
    return this.#board;
  }

  set name(newName) {
    if (!Player.#isValidName(newName))
      throw new Error(
        'invalid player name, expect a string between 1 and 50 characters'
      );
    this.#name = newName;
  }

  attackOpponent(opponentBoard, square) {
    if (!opponentBoard || !opponentBoard.receiveAttack)
      throw new Error('invalid opponent board');
    return opponentBoard.receiveAttack(square);
  }

  #getAvailablePlacesForShipSize(size, vertical) {
    const places = [];

    for (let x = 0; x < 10; x++) {
      for (let y = 0; y < 10; y++) {
        let validPlace = true;

        if (vertical) {
          for (let i = y; i < y + size; i++) {
            if (!this.#boardGrid[x] || !this.#boardGrid[x][i]) {
              validPlace = false;
              break;
            }
          }
        } else {
          for (let i = x; i < x + size; i++) {
            if (!this.#boardGrid[i] || !this.#boardGrid[i][y]) {
              validPlace = false;
              break;
            }
          }
        }

        if (validPlace) places.push([x + 1, y + 1]);
      }
    }

    return places;
  }

  placeShipsRandomly() {
    const sizes = Object.keys(this.#shipsNumbersPerSize).sort((a, b) => b - a);
    //sorting sizes in descending order

    for (const key of sizes) {
      const size = +key;
      const shipsCount = this.#shipsNumbersPerSize[key];
      for (let i = 0; i < shipsCount; i++) {
        const vertical = Math.random() > 0.5;
        const places = this.#getAvailablePlacesForShipSize(size, vertical);
        const [x, y] = places[Math.floor(Math.random() * places.length)];

        this.board.placeShip(x, y, size, vertical);

        if (vertical) {
          for (let i = y - 1; i < y + size - 1; i++) {
            this.#boardGrid[x - 1][i] = false;
          }
        } else {
          for (let i = x - 1; i < x + size - 1; i++) {
            this.#boardGrid[i][y - 1] = false;
          }
        }
      }
    }
  }
}
