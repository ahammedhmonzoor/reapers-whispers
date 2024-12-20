const Game = require('../models/game');

class GameHandler {
  constructor(io) {
    this.io = io;
    this.games = new Map(); // gameId -> game state
    this.playerSockets = new Map(); // playerId -> socket
  }

  initialize() {
    this.io.on('connection', (socket) => {
      console.log('Client connected:', socket.id);

      socket.on('joinGame', (data) => this.handleJoinGame(socket, data));
      socket.on('startGame', (data) => this.handleStartGame(socket, data));
      socket.on('movePlayer', (data) => this.handlePlayerMove(socket, data));
      socket.on('usePowerUp', (data) => this.handleUsePowerUp(socket, data));
      socket.on('requestValidMoves', (data) => this.handleRequestValidMoves(socket, data));
      socket.on('disconnect', () => this.handleDisconnect(socket));
    });
  }

  async handleJoinGame(socket, { gameId, username }) {
    try {
      let game = await Game.findOne({ gameId });
      
      if (!game) {
        game = new Game({
          gameId,
          hostId: socket.id,
          status: 'waiting',
          players: [],
          board: {
            cells: Array(16).fill(null),
            traps: [],
            safeZones: []
          }
        });
      }

      if (game.status !== 'waiting') {
        socket.emit('gameError', 'Game has already started');
        return;
      }

      if (game.players.length >= game.gameSettings.maxPlayers) {
        socket.emit('gameError', 'Game is full');
        return;
      }

      // Check if player is already in game
      const existingPlayer = game.players.find(p => p.username === username);
      if (existingPlayer) {
        socket.emit('gameError', 'Username already taken');
        return;
      }

      // Add player to game
      const newPlayer = {
        id: socket.id,
        username,
        isReaper: false,
        position: null,
        isAlive: true,
        powerUps: []
      };

      game.players.push(newPlayer);
      await game.save();

      // Store socket mapping
      this.playerSockets.set(socket.id, socket);
      socket.join(gameId);

      // Broadcast updated game state
      this.broadcastGameState(game);
    } catch (error) {
      console.error('Error joining game:', error);
      socket.emit('gameError', 'Failed to join game');
    }
  }

  async handleStartGame(socket, { gameId }) {
    try {
      const game = await Game.findOne({ gameId });
      if (!game) {
        socket.emit('gameError', 'Game not found');
        return;
      }

      if (game.hostId !== socket.id) {
        socket.emit('gameError', 'Only the host can start the game');
        return;
      }

      if (game.players.length < 2) {
        socket.emit('gameError', 'Need at least 2 players to start');
        return;
      }

      // Randomly select reaper
      const reaperIndex = Math.floor(Math.random() * game.players.length);
      game.players[reaperIndex].isReaper = true;

      // Assign random starting positions
      const positions = this.getRandomStartPositions(game.players.length);
      game.players.forEach((player, index) => {
        player.position = positions[index];
      });

      // Initialize game state
      game.status = 'playing';
      game.currentTurn = {
        playerId: game.players[0].id,
        startTime: new Date(),
        timeLimit: game.gameSettings.turnTimeLimit
      };

      await game.save();
      this.games.set(gameId, game);

      // Broadcast game start
      this.broadcastGameState(game);
      this.startTurnTimer(game);
    } catch (error) {
      console.error('Error starting game:', error);
      socket.emit('gameError', 'Failed to start game');
    }
  }

  async handlePlayerMove(socket, { gameId, position }) {
    try {
      const game = await Game.findOne({ gameId });
      if (!game || game.status !== 'playing') return;

      const player = game.players.find(p => p.id === socket.id);
      if (!player || !player.isAlive) return;

      if (game.currentTurn.playerId !== socket.id) {
        socket.emit('gameError', 'Not your turn');
        return;
      }

      if (!game.canMove(socket.id, position)) {
        socket.emit('gameError', 'Invalid move');
        return;
      }

      // Update player position
      player.position = position;

      // Check for reaper kills
      if (player.isReaper) {
        game.players.forEach(p => {
          if (!p.isReaper && p.isAlive && p.position === position) {
            p.isAlive = false;
          }
        });
      }

      // Check game over conditions
      if (game.isGameOver()) {
        game.status = 'finished';
        game.winner = game.getWinner();
        await game.save();
        this.broadcastGameState(game);
        return;
      }

      // Move to next turn
      this.moveToNextTurn(game);
      await game.save();
      this.broadcastGameState(game);
    } catch (error) {
      console.error('Error handling move:', error);
      socket.emit('gameError', 'Failed to make move');
    }
  }

  async handleUsePowerUp(socket, { gameId, powerUp }) {
    try {
      const game = await Game.findOne({ gameId });
      if (!game || game.status !== 'playing') return;

      const player = game.players.find(p => p.id === socket.id);
      if (!player || !player.isAlive) return;

      const powerUpIndex = player.powerUps.indexOf(powerUp);
      if (powerUpIndex === -1) {
        socket.emit('gameError', 'Power-up not available');
        return;
      }

      // Apply power-up effect
      switch (powerUp) {
        case 'shield':
          // Implement shield logic
          break;
        case 'reveal':
          // Send reaper position to player
          if (!player.isReaper) {
            const reaper = game.players.find(p => p.isReaper);
            socket.emit('reaperRevealed', { position: reaper.position });
          }
          break;
        case 'speed':
          // Implement speed boost logic
          break;
      }

      // Remove used power-up
      player.powerUps.splice(powerUpIndex, 1);
      await game.save();
      
      // Update player's power-ups
      socket.emit('powerUps', player.powerUps);
    } catch (error) {
      console.error('Error using power-up:', error);
      socket.emit('gameError', 'Failed to use power-up');
    }
  }

  async handleRequestValidMoves(socket, { gameId }) {
    try {
      const game = await Game.findOne({ gameId });
      if (!game || game.status !== 'playing') return;

      const player = game.players.find(p => p.id === socket.id);
      if (!player || !player.isAlive) return;

      const validMoves = game.getValidMoves(player.position);
      socket.emit('validMoves', validMoves);
    } catch (error) {
      console.error('Error getting valid moves:', error);
      socket.emit('gameError', 'Failed to get valid moves');
    }
  }

  handleDisconnect(socket) {
    this.playerSockets.delete(socket.id);
    // Handle player disconnection logic
  }

  // Helper methods
  getRandomStartPositions(playerCount) {
    const positions = [];
    const available = Array.from({ length: 16 }, (_, i) => i);
    
    for (let i = 0; i < playerCount; i++) {
      const randomIndex = Math.floor(Math.random() * available.length);
      positions.push(available.splice(randomIndex, 1)[0]);
    }
    
    return positions;
  }

  moveToNextTurn(game) {
    const currentPlayerIndex = game.players.findIndex(p => p.id === game.currentTurn.playerId);
    let nextPlayerIndex = (currentPlayerIndex + 1) % game.players.length;

    // Skip dead players
    while (!game.players[nextPlayerIndex].isAlive) {
      nextPlayerIndex = (nextPlayerIndex + 1) % game.players.length;
      if (nextPlayerIndex === currentPlayerIndex) break;
    }

    game.currentTurn = {
      playerId: game.players[nextPlayerIndex].id,
      startTime: new Date(),
      timeLimit: game.gameSettings.turnTimeLimit
    };
  }

  startTurnTimer(game) {
    setTimeout(() => {
      this.handleTurnTimeout(game);
    }, game.gameSettings.turnTimeLimit * 1000);
  }

  async handleTurnTimeout(game) {
    if (game.status !== 'playing') return;

    // Skip to next turn if current player hasn't moved
    this.moveToNextTurn(game);
    await game.save();
    this.broadcastGameState(game);
    this.startTurnTimer(game);
  }

  broadcastGameState(game) {
    this.io.to(game.gameId).emit('gameState', {
      players: game.players,
      status: game.status,
      currentTurn: game.currentTurn,
      winner: game.winner
    });
  }
}

module.exports = GameHandler;
