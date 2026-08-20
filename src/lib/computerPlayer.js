import { Player } from './player.js';

export class ComputerPlayer extends Player {
  #deliveredAttacks = {};
  #discoveredSquares = [];

  constructor(name = 'computer') {
    super(name);
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
    const [x, y] = square;
    const hit = this.attackOpponent(board, [x, y]);

    if (!this.#deliveredAttacks[x]) this.#deliveredAttacks[x] = [y];
    else this.#deliveredAttacks[x].push(y);

    if (hit) this.#discoveredSquares.push([x, y]);
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
          //confirm that at least one block in the axis is valid (recognize false pattern)
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

    //find if the two neighbors have other neighbors in their axis
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

  #detectShipSquares(shipId, board) {
    return this.#discoveredSquares.filter(
      (sq) => board.viewSquare(sq).ship.id === shipId
    );
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
      //attack randomly if no ships discovered
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
      //attack near squares if no patterns yet
      let square;
      let validNeighbors = [];

      for (let i = 0; i < this.#discoveredSquares.length; i++) {
        if (validNeighbors.length > 0) break;
        square = this.#discoveredSquares[i];
        validNeighbors = this.#getValidSquareNeighbors(square);
      } //confirm that the selected square to attack its neighbors has valid ones

      const attackSq =
        validNeighbors[Math.floor(Math.random() * validNeighbors.length)];

      this.#deliverAttack(board, attackSq);

      const postSunkShips = board.viewShips().filter((ship) => ship.isSunk);
      if (postSunkShips.length > preSunkShips.length) {
        //if a ship sinks untrack its squares (remove from discovered)
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

    //get valid squares to attack in the discovered pattern axis
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

    //pick random one of them and attack it
    const randomAttackSq =
      attackSqs[Math.floor(Math.random() * attackSqs.length)];

    this.#deliverAttack(board, randomAttackSq);

    const postSunkShips = board.viewShips().filter((ship) => ship.isSunk);
    if (postSunkShips.length > preSunkShips.length) {
      //if a ship sinks and untrack its square
      const sunkShip = this.#getSunkShip(preSunkShips, postSunkShips);
      const squares = this.#detectShipSquares(
        randomAttackSq,
        sunkShip.size,
        board
      );
      this.#unTrackDiscoveredSquares(squares);
    }
  }
}
