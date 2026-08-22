import * as round from './round.js';
import { beforeEach, describe, expect } from '@jest/globals';

afterEach(() => {
  round.resetGame();
});

const invalidPlayerIndex = [null, true, false, 2.2, '1', undefined, 2, -1];

describe('resetGame()', () => {
  test('clears all players, and resets the game to its initial state', () => {
    round.registerPlayer('first player');
    round.registerPlayer();
    round.changeAiMode();
    expect(round.getAiMode()).toBe('random');

    round.resetGame();

    expect(() => round.getPlayersNames()).toHaveLength(0);
    expect(round.getAiMode()).toBe('advanced');
  });
});

describe('registerPlayer()', () => {
  test('registers new player to the game', () => {
    round.registerPlayer('player');
    const players = round.getPlayersNames();
    expect(players).toHaveLength(1);
    expect(players[0]).toBe('player');
  });

  test('registers a maximum of 2 players', () => {
    round.registerPlayer();
    round.registerPlayer();
    expect(() => round.registerPlayer('player')).toThrow(
      'two players already registered, remove at least one player to add new one'
    );
  });
});

describe('getPlayersNames()', () => {
  test('returns empty array if no registered players yet', () => {
    expect(round.getPlayersNames()).toStrictEqual([]);
  });
  test('returns array of the current registered players', () => {
    round.registerPlayer('player');
    round.registerPlayer('other player');
    expect(round.getPlayersNames()).toStrictEqual(['player', 'other player']);
  });
});

describe('changePlayerName()', () => {
  test('changes the name for and already registered player giving its index', () => {
    round.registerPlayer('player');

    round.changePlayerName(0, 'new player name');
    expect(round.getPlayersNames()[0]).toBe('new player name');
  });

  test('throws for invalid player index', () => {
    invalidPlayerIndex.forEach((v) =>
      expect(() => round.changePlayerName(v)).toThrow('invalid player index')
    );
    expect(() => round.changePlayerName(0, 'new player')).toThrow(
      'player not found'
    );
  });
});

describe('changeAiMode()', () => {
  test('toggles the current ai mode between "advanced" and "random"', () => {
    expect(round.getAiMode()).toBe('advanced');
    round.changeAiMode();
    expect(round.getAiMode()).toBe('random');
  });
});

describe('removeLastPlayer()', () => {
  test('removes last registered player', () => {
    round.registerPlayer('p1');
    round.registerPlayer('p2');
    round.removeLastPlayer();
    const players = round.getPlayersNames();
    expect(players).toHaveLength(1);
    expect(players[0]).toBe('p1');
    round.removeLastPlayer();
    expect(round.getPlayersNames()).toHaveLength(0);
  });

  test('changes game phase to register phase when no players remaining players after remove', () => {
    round.registerPlayer('p1');
    round.registerPlayer('p2');
    round.newRound();
    round.placeShip(0, { x: 1, y: 1, size: 2 });
    round.removeLastPlayer();
    round.removeLastPlayer();

    expect(() => round.placeShip(0, { x: 1, y: 1, size: 2 })).toThrow(
      'can\'t place ships out of the "placement" phase'
    );
  });

  test('throws when called while no players registered', () => {
    expect(() => round.removeLastPlayer()).toThrow('no registered players');
  });

  test('throws when called in "playing" phase', () => {
    round.registerPlayer('p1');
    round.newRound();
    round.randomizeShips(0);
    round.startGame();
    expect(() => round.removeLastPlayer()).toThrow();
  });
});

describe('newRound()', () => {
  test('adds "computer player", and starts new round if only one player is registered', () => {
    expect(() => round.newRound()).toThrow(
      'register at least one player to start a round'
    );
    round.registerPlayer();
    expect(() => round.newRound()).not.toThrow();
    expect(round.getPlayersNames()).toHaveLength(2);
  });

  test('starts new round if two players are registered', () => {
    round.registerPlayer();
    round.registerPlayer();
    expect(() => round.newRound()).not.toThrow();
  });

  test('unlocks placement phase interactions when called successfully', () => {
    round.registerPlayer();
    expect(() => round.placeShip()).toThrow(
      'can\'t place ships out of the "placement" phase'
    );
    expect(() => round.removeShip()).toThrow(
      'can\'t remove ships out of the "placement" phase'
    );
    expect(() => round.clearBoard()).toThrow(
      'can\'t clear board out of the "placement" phase'
    );
    expect(() => round.rotateShip()).toThrow(
      'can\'t rotate ship out of the "placement" phase'
    );
    expect(() => round.randomizeShips()).toThrow(
      'cant\'t place ships out of the "placement" phase'
    );
    expect(() => round.startGame()).toThrow(
      'can\'t start the game before the "placement" phase'
    );

    round.newRound();

    expect(() => round.placeShip()).not.toThrow(/placement/i);
    expect(() => round.removeShip()).not.toThrow(/placement/i);
    expect(() => round.clearBoard()).not.toThrow(/placement/i);
    expect(() => round.rotateShip()).not.toThrow(/placement/i);
    expect(() => round.randomizeShips()).not.toThrow(/placement/i);
    expect(() => round.startGame()).not.toThrow(/placement/i);
  });
});

describe('viewPlayerShips() initial state', () => {
  test("returns the player's board viewShips method, given the player index", () => {
    round.registerPlayer();
    expect(round.viewPlayerShips(0)).toStrictEqual([]);
  });

  test('throws for invalid player index', () => {
    invalidPlayerIndex.forEach((v) =>
      expect(() => round.viewPlayerShips(v)).toThrow('invalid player index')
    );
    expect(() => round.viewPlayerShips(0)).toThrow('player not found');
  });
});

describe('viewPlayerSquare() initial state', () => {
  test("passes square to the player's board viewSquare method and returns its return value", () => {
    const initialSquare = { ship: null, hit: false };
    round.registerPlayer();
    expect(round.viewPlayerSquare(0, [1, 1])).toStrictEqual(initialSquare);
  });

  test('throws for invalid player index', () => {
    invalidPlayerIndex.forEach((v) =>
      expect(() => round.viewPlayerSquare(v, [1, 1])).toThrow(
        'invalid player index'
      )
    );
    expect(() => round.viewPlayerShips(0, [1, 1])).toThrow('player not found');
  });
});

describe('placeShip()', () => {
  beforeEach(() => {
    round.registerPlayer();
    round.newRound();
  });

  test('places a ship to the specified player board with specified shipData, using the board own method', () => {
    round.placeShip(0, { x: 1, y: 2, size: 2 });
    const ships = round.viewPlayerShips(0);
    expect(ships).toHaveLength(1);
    expect(round.viewPlayerSquare(0, [1, 2]).ship).toStrictEqual(ships[0]);
    expect(ships[0].size).toBe(2);
  });

  test('throws for invalid player index', () => {
    invalidPlayerIndex.forEach((v) =>
      expect(() => round.placeShip(v, { x: 1, y: 2, size: 2 })).toThrow(
        'invalid player index'
      )
    );
  });
});

describe('removeShip()', () => {
  beforeEach(() => {
    round.registerPlayer();
    round.newRound();
  });

  test('removes placed ship form the game board of a player given its index and ship id, using the board own method', () => {
    round.placeShip(0, { x: 1, y: 1, size: 2 });
    const ships = round.viewPlayerShips(0);
    round.removeShip(0, ships[0].id);
    expect(round.viewPlayerShips(0)).toHaveLength(0);
  });

  test('throws for invalid player index', () => {
    invalidPlayerIndex.forEach((v) => {
      expect(() => round.removeShip(v, 'ship-1')).toThrow(
        'invalid player index'
      );
    });
  });
});

describe('rotateShip()', () => {
  beforeEach(() => {
    round.registerPlayer();
    round.newRound();
  });

  test('rotates placed ship in the game board of a player given its index and ship id, using the board own method', () => {
    round.placeShip(0, { x: 1, y: 1, size: 2, vertical: false });
    const twoOneSq = round.viewPlayerSquare(0, [2, 1]);
    round.rotateShip(0, twoOneSq.ship.id);

    expect(round.viewPlayerSquare(0, [2, 1]).ship).toBeNull();
    expect(round.viewPlayerSquare(0, [1, 2]).ship).toStrictEqual(twoOneSq.ship);
  });

  test('throws for invalid player index', () => {
    invalidPlayerIndex.forEach((v) => {
      expect(() => round.rotateShip(v, 'ship-1')).toThrow(
        'invalid player index'
      );
    });
  });
});

describe('clearBoard()', () => {
  beforeEach(() => {
    round.registerPlayer();
    round.newRound();
  });

  test('removes all placed ship form the game board of a player given its index, using the board own method', () => {
    round.placeShip(0, { x: 1, y: 1, size: 2 });
    round.placeShip(0, { x: 3, y: 3, size: 4 });

    expect(round.viewPlayerShips(0)).toHaveLength(2);
    round.clearBoard(0);
    expect(round.viewPlayerShips(0)).toHaveLength(0);
  });

  test('throws for invalid player index', () => {
    invalidPlayerIndex.forEach((v) => {
      expect(() => round.clearBoard(v)).toThrow('invalid player index');
    });
  });
});

describe('randomizeShips()', () => {
  beforeEach(() => {
    round.registerPlayer();
    round.newRound();
  });

  test("places ships randomly on player's board given its index, using its own method", () => {
    const totalShips = 9;
    round.randomizeShips(0);
    expect(round.viewPlayerShips(0)).toHaveLength(totalShips);
  });

  test('throws for invalid player index', () => {
    invalidPlayerIndex.forEach((v) => {
      expect(() => round.randomizeShips(v)).toThrow('invalid player index');
    });
  });
});

describe('startGame()', () => {
  test('starts game with two players, only after "placement" phase when both players have all their ships placed', () => {
    round.registerPlayer();
    round.registerPlayer();
    round.newRound();

    expect(() => round.startGame()).toThrow(
      'both players must place all their ships before starting the game'
    );
    round.randomizeShips(0);
    round.randomizeShips(1);
    expect(() => round.startGame()).not.toThrow();
  });

  test('starts game with one player, only after "placement" phase when the player has all his ships placed', () => {
    round.registerPlayer();
    round.newRound();

    expect(() => round.startGame()).toThrow(
      'both players must place all their ships before starting the game'
    );
    round.randomizeShips(0);
    expect(() => round.startGame()).not.toThrow();
  });

  test('starts the "playing" game phase, and unlocks its interactions when called successfully', () => {
    round.registerPlayer();
    round.newRound();
    round.randomizeShips(0);

    expect(() => round.attack()).toThrow(
      'can\'t attack opponent out of "playing" phase'
    );
    round.startGame();
    expect(() => round.attack()).not.toThrow(/playing/i);
  });
});

describe('getActivePlayerData()', () => {
  test('returns the name and index of the current active player', () => {
    round.registerPlayer('new player');
    round.newRound();
    expect(round.getActivePlayerData()).toStrictEqual({
      index: 0,
      name: 'new player',
    });
  });

  test('throws when called before registering any players', () => {
    expect(() => round.getActivePlayerData()).toThrow(
      'must register a player first'
    );
  });
});

describe('attack()', () => {
  const boardSquares = [];

  beforeEach(() => {
    boardSquares.length = 0;
    for (let i = 1; i <= 10; i++) {
      for (let j = 1; j <= 10; j++) {
        boardSquares.push([i, j]);
      }
    }
    round.registerPlayer();
    round.newRound();
    round.randomizeShips(0);
    round.startGame();
  });

  function pickRandomSq() {
    const index = Math.floor(Math.random() * boardSquares.length);
    const square = boardSquares[index];
    boardSquares.splice(index, 1);
    return square;
  }

  describe('delivers attack from the current active player to its opponent', () => {
    test('for Player instance, given the square coordinates', () => {
      round.attack([1, 1]);
      expect(round.viewPlayerSquare(1, [1, 1]).hit).toBe(true);
    });

    test('for ComputerPlayer instance, without giving square coordinates', () => {
      let attack = round.attack(pickRandomSq());
      while (attack.hit) {
        attack = round.attack(pickRandomSq());
      }
      const computerAttack = round.attack();
      expect(round.viewPlayerSquare(0, computerAttack.square).hit).toBe(true);
    });
  });

  test('returns object with the attack data and whether the game is over', () => {
    const attack = round.attack(pickRandomSq());
    expect(Object.keys(attack)).toHaveLength(4);
    expect(attack).toHaveProperty('square');
    expect(attack).toHaveProperty('hit');
    expect(attack).toHaveProperty('sunk');
    expect(attack).toHaveProperty('gameOver');
  });

  test('detects when one player\'s ships is all sunk and declare the game over (change to "game over" phase)', () => {
    let attack;
    while (true) {
      do {
        attack = round.attack(pickRandomSq());
      } while (attack.hit && !attack.gameOver);

      if (attack.gameOver) break;

      do {
        attack = round.attack();
      } while (attack.hit && !attack.gameOver);

      if (attack.gameOver) break;
    }

    const loserIndex = round.getActivePlayerData().index === 0 ? 1 : 0;
    const ships = round.viewPlayerShips(loserIndex);

    expect(ships.every((ship) => ship.isSunk)).toBe(true);

    expect(() => round.attack()).toThrow(
      'can\'t attack opponent out of "playing" phase'
    );
  });
});
