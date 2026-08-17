import { Player } from './player.js';

export class ComputerPlayer extends Player {
  #deliveredAttacks = {};
  #shipsNumbersPerSize = {
    1: 2,
    2: 3,
    3: 2,
    4: 1,
    5: 1,
  };
  #boardGrid = new Array(10);

  constructor() {
    super('computer');
    for (let i = 0; i < 10; i++) {
      this.#boardGrid[i] = new Array(10).fill(true);
    }
  }

  randomAttack(board) {
    const validRows = [];
    for (let i = 1; i <= 10; i++) {
      if (!this.#deliveredAttacks[i] || this.#deliveredAttacks[i].length < 10)
        validRows.push(i);
    }
    //throw if no row has non-attacked squares
    if (validRows.length === 0)
      throw new Error('no more unique squares to attack');

    //pick random valid row
    const x = validRows[Math.floor(Math.random() * validRows.length)];
    let y;

    if (!this.#deliveredAttacks[x]) {
      //if row is empty pick random square
      // then assign the row with square number

      y = Math.floor(Math.random() * 10) + 1;
      this.#deliveredAttacks[x] = [y];
    } else {
      //if row isn't empty check non-attacked squares and pick random one
      // then push square number to the row

      const validSquares = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].filter(
        (sqNumber) => !this.#deliveredAttacks[x].includes(sqNumber)
      );

      y = validSquares[Math.floor(Math.random() * validSquares.length)];
      this.#deliveredAttacks[x].push(y);
    }

    this.attackOpponent(board, [x, y]);
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
