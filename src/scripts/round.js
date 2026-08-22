import { Player } from './models/player.js';
import { ComputerPlayer } from './models/computerPlayer.js';

const PHASES = Object.freeze({
  REGISTER: 'register',
  PLACEMENT: 'placement',
  PLAYING: 'playing',
  GAME_OVER: 'game over',
});
const AI_MODES = Object.freeze({
  RANDOM: 'random',
  ADVANCED: 'advanced',
});

const players = [];
let phase = PHASES.REGISTER;
let activePlayer = 0;
let opponent = 1;
let aiMode = AI_MODES.ADVANCED;

function resetGame() {
  players.length = 0;
  phase = PHASES.REGISTER;
  activePlayer = 0;
  opponent = 1;
  aiMode = AI_MODES.ADVANCED;
}

function registerPlayer(name) {
  if (players.length === 2)
    throw new Error(
      'two players already registered, remove at least one player to add new one'
    );
  players.push(new Player(name));
}

function isValidPlayerIndex(num) {
  return Number.isInteger(num) && (num === 0 || num === 1);
}

function getPlayersNames() {
  return players.map((player) => player.name);
}

function getAiMode() {
  return aiMode;
}

function changePlayerName(playerNo, newName) {
  if (!isValidPlayerIndex(playerNo)) throw new Error('invalid player index');
  if (!players[playerNo]) throw new Error('player not found');

  players[playerNo].name = newName;
}

function changeAiMode() {
  if (aiMode === AI_MODES.ADVANCED) aiMode = AI_MODES.RANDOM;
  else aiMode = AI_MODES.ADVANCED;
}

function removeLastPlayer() {
  if (players.length === 0) throw new Error('no registered players');
  if (phase === PHASES.PLAYING)
    throw new Error('can\'t remove player during "playing" phase');
  players.pop();
  if (players.length === 0) phase = PHASES.REGISTER;
}

function newRound() {
  if (players.length === 0)
    throw new Error('register at least one player to start a round');

  if (players.length === 1) {
    const computer = new ComputerPlayer();
    players.push(computer);
    players[0].board.clearBoard();
  } else if (players.length === 2) {
    players.forEach((player) => player.board.clearBoard());
  }

  phase = PHASES.PLACEMENT;
}

function viewPlayerShips(playerNo) {
  if (!isValidPlayerIndex(playerNo)) throw new Error('invalid player index');
  if (!players[playerNo]) throw new Error('player not found');

  return players[playerNo].board.viewShips();
}

function viewPlayerSquare(playerNo, square) {
  if (!isValidPlayerIndex(playerNo)) throw new Error('invalid player index');
  if (!players[playerNo]) throw new Error('player not found');

  return players[playerNo].board.viewSquare(square);
}

function placeShip(playerNo, shipData) {
  if (phase !== PHASES.PLACEMENT)
    throw new Error('can\'t place ships out of the "placement" phase');
  if (!isValidPlayerIndex(playerNo)) throw new Error('invalid player index');

  players[playerNo].board.placeShip(
    shipData.x,
    shipData.y,
    shipData.size,
    shipData.vertical
  );
}

function removeShip(playerNo, shipId) {
  if (phase !== PHASES.PLACEMENT)
    throw new Error('can\'t remove ships out of the "placement" phase');
  if (!isValidPlayerIndex(playerNo)) throw new Error('invalid player index');

  players[playerNo].board.removeShip(shipId);
}

function clearBoard(playerNo) {
  if (phase !== PHASES.PLACEMENT)
    throw new Error('can\'t clear board out of the "placement" phase');
  if (!isValidPlayerIndex(playerNo)) throw new Error('invalid player index');

  players[playerNo].board.clearBoard();
}

function rotateShip(playerNo, shipId) {
  if (phase !== PHASES.PLACEMENT)
    throw new Error('can\'t rotate ship out of the "placement" phase');
  if (!isValidPlayerIndex(playerNo)) throw new Error('invalid player index');

  players[playerNo].board.rotateShip(shipId);
}

function randomizeShips(playerNo) {
  if (phase !== PHASES.PLACEMENT)
    throw new Error('cant\'t place ships out of the "placement" phase');
  if (!isValidPlayerIndex(playerNo)) throw new Error('invalid player index');

  players[playerNo].board.clearBoard();
  players[playerNo].placeShipsRandomly();
}

function startGame() {
  if (phase !== PHASES.PLACEMENT)
    throw new Error('can\'t start the game before the "placement" phase');

  if (players[1] instanceof ComputerPlayer) randomizeShips(1);

  if (
    players[0].board.viewShips().length < 9 ||
    players[1].board.viewShips().length < 9
  )
    throw new Error(
      'both players must place all their ships before starting the game'
    );

  phase = PHASES.PLAYING;
}

function changeTurn() {
  if (phase !== PHASES.PLAYING)
    throw new Error('must start the game first to change turn');

  [activePlayer, opponent] = [opponent, activePlayer];
}

function getActivePlayerData() {
  if (players.length === 0) throw new Error('must register a player first');

  const name = getPlayersNames()[activePlayer];
  return { name, index: activePlayer };
}

function isGameOver() {
  if (players[0].board.allSunk() || players[1].board.allSunk()) {
    phase = PHASES.GAME_OVER;
    return true;
  }
  return false;
}

function attack(square) {
  if (phase !== PHASES.PLAYING)
    throw new Error('can\'t attack opponent out of "playing" phase');

  if (players[activePlayer] instanceof ComputerPlayer) {
    let result;
    let gameOver = false;
    if (aiMode === AI_MODES.RANDOM) {
      result = players[activePlayer].randomAttack(players[opponent].board);
    } else if (aiMode === AI_MODES.ADVANCED) {
      result = players[activePlayer].huntShips(players[opponent].board);
    }

    if (!result.hit) changeTurn();
    if (result.sunk) gameOver = isGameOver();
    return { ...result, gameOver };
  } else {
    const result = players[activePlayer].attackOpponent(
      players[opponent].board,
      square
    );
    let gameOver = false;

    if (!result.hit) changeTurn();
    if (result.sunk) gameOver = isGameOver();
    return { ...result, square, gameOver };
  }
}

export {
  resetGame,
  registerPlayer,
  getPlayersNames,
  getAiMode,
  changePlayerName,
  changeAiMode,
  removeLastPlayer,
  newRound,
  viewPlayerShips,
  viewPlayerSquare,
  placeShip,
  removeShip,
  clearBoard,
  rotateShip,
  randomizeShips,
  startGame,
  getActivePlayerData,
  attack,
};
