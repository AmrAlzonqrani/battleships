import { GameBoard } from './gameBoard.js';

export class Player {
  #name;
  #board = new GameBoard();

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
    opponentBoard.receiveAttack(square);
  }
}
