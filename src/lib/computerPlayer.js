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
  #discoveredSquares = [];

  constructor() {
    super('computer');
    for (let i = 0; i < 10; i++) {
      this.#boardGrid[i] = new Array(10).fill(true);
    }
  }

  #pickRandomSquare() {
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
    } else {
      //if row isn't empty check non-attacked squares and pick random one
      // then push square number to the row

      const validSquares = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].filter(
        (sqNumber) => !this.#deliveredAttacks[x].includes(sqNumber)
      );

      y = validSquares[Math.floor(Math.random() * validSquares.length)];
    }

    return [x, y];
  }

  #deliverAttack(board, square) {
    //console.log(square);
    const [x, y] = square;
    const hit = this.attackOpponent(board, [x, y]);

    if (!this.#deliveredAttacks[x]) this.#deliveredAttacks[x] = [y];
    else this.#deliveredAttacks[x].push(y);

    if (hit) {
      this.#discoveredSquares.push([x, y]);
      //console.log(square, board.viewSquare(square))
    }
  }

  randomAttack(board) {
    const square = this.#pickRandomSquare();
    this.#deliverAttack(board, square);
  }

  #findPattern() {
    const hits = this.#discoveredSquares;
    const squares = [];
    let vertical;

    //find two neighbors
    for (let i = 0; i < hits.length; i++) {
      const start = hits[i];
      const [x, y] = start;

      const upNeighbor = hits.find((sq) => sq[0] === x && sq[1] === y - 1);
      if (upNeighbor) {
        if (
          this.#isValidAttackSquare([x, y + 1]) ||
          this.#isValidAttackSquare([x, y - 2])
        ) {
          //at least one block in the row is valid (recognize false pattern)
          squares.push([x, y - 1], start);
          vertical = true;
          break;
        }
      }
      const downNeighbor = hits.find((sq) => sq[0] === x && sq[1] === y + 1);
      if (downNeighbor) {
        if (
          this.#isValidAttackSquare([x, y - 1]) ||
          this.#isValidAttackSquare([x, y + 2])
        ) {
          squares.push(start, [x, y + 1]);
          vertical = true;
          break;
        }
      }
      const leftNeighbor = hits.find((sq) => sq[0] === x - 1 && sq[1] === y);
      if (leftNeighbor) {
        if (
          this.#isValidAttackSquare([x + 1, y]) ||
          this.#isValidAttackSquare([x - 2, y])
        ) {
          squares.push([x - 1, y], start);
          vertical = false;
          break;
        }
      }
      const rightNeighbor = hits.find((sq) => sq[0] === x + 1 && sq[1] === y);
      if (rightNeighbor) {
        if (
          this.#isValidAttackSquare([x - 1, y]) ||
          this.#isValidAttackSquare([x + 2, y])
        ) {
          squares.push(start, [x + 1, y]);
          vertical = false;
          break;
        }
      }
    }

    if (squares.length === 0) return undefined; //if no neighbors found return

    //find if the two neighbors have other neighbors in their line
    if (vertical) {
      let up = squares[0];
      let down = squares[squares.length - 1];

      while (up[1] > 1) {
        const upNeighbor = hits.find(
          (sq) => sq[1] === up[1] - 1 && sq[0] === up[0]
        );
        if (!upNeighbor) break;
        squares.unshift(upNeighbor);
        up = upNeighbor;
      }

      while (down[1] < 10) {
        const downNeighbor = hits.find(
          (sq) => sq[1] === down[1] + 1 && sq[0] === down[0]
        );
        if (!downNeighbor) break;
        squares.push(downNeighbor);
        down = downNeighbor;
      }
    } else {
      let left = squares[0];
      let right = squares[squares.length - 1];

      while (left[0] > 1) {
        const leftNeighbor = hits.find(
          (sq) => sq[0] === left[0] - 1 && sq[1] === left[1]
        );
        if (!leftNeighbor) break;
        squares.unshift(leftNeighbor);
        left = leftNeighbor;
      }

      while (right[0] < 10) {
        const rightNeighbor = hits.find(
          (sq) => sq[0] === right[0] + 1 && sq[1] === right[1]
        );
        if (!rightNeighbor) break;
        squares.push(rightNeighbor);
        right = rightNeighbor;
      }
    }

    return { squares, vertical };
  }

  #isValidAttackSquare(square) {
    const [x, y] = square;
    return (
      x >= 1 &&
      y >= 1 &&
      x <= 10 &&
      y <= 10 &&
      (!this.#deliveredAttacks[x] || !this.#deliveredAttacks[x].includes(y))
    );
  }

  #getValidSquareNeighbors(square) {
    const [x, y] = square;
    const neighbors = [
      [x - 1, y],
      [x + 1, y],
      [x, y - 1],
      [x, y + 1],
    ];
    return neighbors.filter((sq) => this.#isValidAttackSquare(sq));
  }

  #getSunkShip(preSunk, postSunk) {
    return postSunk.find(
      (postShip) => !preSunk.some((preShip) => preShip.id === postShip.id)
    );
  }

  #detectShipSquares(square, shipSize, board) {
    if (shipSize === 1) return [square];
    const ship = [square];
    const shipId = board.viewSquare(square).ship.id;
    const [x, y] = square;

    const verticalAdjacent = this.#discoveredSquares.find((sq) => {
      const isAdjacent = sq[0] === x && Math.abs(sq[1] - y) === 1;
      if (!isAdjacent) return false;
      return board.viewSquare(sq).ship.id === shipId;
    });

    if (verticalAdjacent) {
      const adjacentUp = verticalAdjacent[1] < y;
      if (adjacentUp) {
        for (let i = 1; i < shipSize; i++) {
          ship.push([x, y - i]);
        }
      } else {
        for (let i = 1; i < shipSize; i++) {
          ship.push([x, y + i]);
        }
      }

      return ship;
    }

    const horizontalAdjacent = this.#discoveredSquares.find((sq) => {
      const isAdjacent = sq[1] === y && Math.abs(sq[0] - x) === 1;
      if (!isAdjacent) return false;
      return board.viewSquare(sq).ship.id === shipId;
    });

    if (horizontalAdjacent) {
      const adjacentLeft = horizontalAdjacent[0] < x;
      if (adjacentLeft) {
        for (let i = 1; i < shipSize; i++) {
          ship.push([x - i, y]);
        }
      } else {
        for (let i = 1; i < shipSize; i++) {
          ship.push([x + i, y]);
        }
      }

      return ship;
    }

    return ship;
  }

  #unTrackDiscoveredSquares(squares) {
    squares.forEach((square) => {
      const index = this.#discoveredSquares.findIndex(
        (sq) => sq.toString() === square.toString()
      );
      if (index !== -1) this.#discoveredSquares.splice(index, 1);
    });
  }

  huntShips(board) {
    const length = this.#discoveredSquares.length;
    const preSunkShips = board.viewShips().filter((ship) => ship.isSunk);

    if (length === 0) {
      const random = this.#pickRandomSquare();
      this.#deliverAttack(board, random);

      const postSunkShips = board.viewShips().filter((ship) => ship.isSunk);
      if (postSunkShips.length > preSunkShips.length)
        this.#unTrackDiscoveredSquares([random]);

      return;
    }

    let pattern;
    if (length > 1) pattern = this.#findPattern();

    if (length === 1 || !pattern) {
      let square;
      let validNeighbors = [];

      for (let i = 0; i < this.#discoveredSquares.length; i++) {
        if (validNeighbors.length > 0) break;
        square = this.#discoveredSquares[i];
        validNeighbors = this.#getValidSquareNeighbors(square);
      }

      // if(validNeighbors.length === 0) {
      //   this.#unTrackDiscoveredSquares([square]);
      //   this.huntShips(board);
      // }

      const attackSq =
        validNeighbors[Math.floor(Math.random() * validNeighbors.length)];

      // if(!attackSq) {
      //   console.log(this.#discoveredSquares);
      //   console.log(board.viewShips());
      //   console.log(this.#deliveredAttacks);
      // }
      this.#deliverAttack(board, attackSq);

      const postSunkShips = board.viewShips().filter((ship) => ship.isSunk);
      if (postSunkShips.length > preSunkShips.length) {
        const sunkShip = this.#getSunkShip(preSunkShips, postSunkShips);

        if (sunkShip.size === 1) this.#unTrackDiscoveredSquares([attackSq]);
        else {
          const squares = this.#detectShipSquares(
            attackSq,
            sunkShip.size,
            board
          );
          this.#unTrackDiscoveredSquares(squares);
        }
      }

      return;
    }

    const { squares, vertical } = pattern;
    const attackSqs = [];

    if (vertical) {
      const x = squares[0][0];
      const upY = squares[0][1] - 1;
      const downY = squares[squares.length - 1][1] + 1;

      if (this.#isValidAttackSquare([x, upY])) attackSqs.push([x, upY]);
      if (this.#isValidAttackSquare([x, downY])) attackSqs.push([x, downY]);
    } else {
      const y = squares[0][1];
      const leftX = squares[0][0] - 1;
      const rightX = squares[squares.length - 1][0] + 1;

      if (this.#isValidAttackSquare([leftX, y])) attackSqs.push([leftX, y]);
      if (this.#isValidAttackSquare([rightX, y])) attackSqs.push([rightX, y]);
    }

    const randomAttackSq =
      attackSqs[Math.floor(Math.random() * attackSqs.length)];

    this.#deliverAttack(board, randomAttackSq);

    const postSunkShips = board.viewShips().filter((ship) => ship.isSunk);
    if (postSunkShips.length > preSunkShips.length) {
      const sunkShip = this.#getSunkShip(preSunkShips, postSunkShips);
      const squares = this.#detectShipSquares(
        randomAttackSq,
        sunkShip.size,
        board
      );
      this.#unTrackDiscoveredSquares(squares);
    }
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
