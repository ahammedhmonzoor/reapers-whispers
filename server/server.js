const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
const GameHandler = require('./socket/gameHandler');

const app = express();
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/reapers-whispers', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('Connected to MongoDB');
}).catch((error) => {
  console.error('MongoDB connection error:', error);
});

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.IO
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Game state management
const games = new Map();

io.on('connection', (socket) => {
  socket.on('joinGame', ({ gameId, username }) => {
    try {
      let game = games.get(gameId);
      
      if (!game) {
        game = {
          id: gameId,
          players: [],
          board: Array(16).fill(null),
          currentTurn: null,
          isGameStarted: false,
          winner: null,
          gameOver: false,
          powerUps: []
        };
        games.set(gameId, game);
      }

      const existingPlayer = game.players.find(p => p.username === username);
      if (!existingPlayer) {
        const isReaper = game.players.length === 0;
        const player = {
          username,
          isReaper,
          position: isReaper ? 0 : 15,
          powerUps: []
        };
        game.players.push(player);
        game.board[player.position] = player;
      }

      socket.join(gameId);
      io.to(gameId).emit('gameState', game);
    } catch (error) {
      socket.emit('error', { message: error.message });
    }
  });

  socket.on('startNewGame', ({ gameId }) => {
    try {
      const game = games.get(gameId);
      if (!game) throw new Error('Game not found');

      // Reset game state but keep players
      game.board = Array(16).fill(null);
      game.players.forEach(player => {
        player.position = player.isReaper ? 0 : 15;
        player.powerUps = [];
        game.board[player.position] = player;
      });
      game.currentTurn = game.players[0].username;
      game.isGameStarted = true;
      game.winner = null;
      game.gameOver = false;
      game.powerUps = generatePowerUps();

      io.to(gameId).emit('gameState', game);
    } catch (error) {
      socket.emit('error', { message: error.message });
    }
  });

  socket.on('resetGame', ({ gameId }) => {
    try {
      const game = games.get(gameId);
      if (!game) throw new Error('Game not found');

      // Keep players but reset their positions and game state
      game.board = Array(16).fill(null);
      game.players.forEach(player => {
        player.position = player.isReaper ? 0 : 15;
        player.powerUps = [];
        game.board[player.position] = player;
      });
      game.currentTurn = null;
      game.isGameStarted = false;
      game.winner = null;
      game.gameOver = false;
      game.powerUps = [];

      io.to(gameId).emit('gameState', game);
    } catch (error) {
      socket.emit('error', { message: error.message });
    }
  });

  socket.on('movePlayer', ({ gameId, username, position }) => {
    try {
      const game = games.get(gameId);
      if (!game) throw new Error('Game not found');
      if (!game.isGameStarted) throw new Error('Game has not started');
      if (game.gameOver) throw new Error('Game is over');
      if (game.currentTurn !== username) throw new Error('Not your turn');

      const player = game.players.find(p => p.username === username);
      if (!player) throw new Error('Player not found');

      // Clear old position
      game.board[player.position] = null;
      
      // Update new position
      player.position = position;
      game.board[position] = player;

      // Check for power-up collection
      if (game.powerUps.includes(position)) {
        player.powerUps.push(generatePowerUp());
        game.powerUps = game.powerUps.filter(pos => pos !== position);
      }

      // Check win conditions
      checkWinConditions(game);

      // Next turn
      if (!game.gameOver) {
        const currentPlayerIndex = game.players.findIndex(p => p.username === username);
        game.currentTurn = game.players[(currentPlayerIndex + 1) % game.players.length].username;
      }

      io.to(gameId).emit('gameState', game);
    } catch (error) {
      socket.emit('error', { message: error.message });
    }
  });

  socket.on('usePowerUp', ({ gameId, username, powerUp }) => {
    try {
      const game = games.get(gameId);
      if (!game) throw new Error('Game not found');
      if (!game.isGameStarted) throw new Error('Game has not started');
      if (game.gameOver) throw new Error('Game is over');
      if (game.currentTurn !== username) throw new Error('Not your turn');

      const player = game.players.find(p => p.username === username);
      if (!player) throw new Error('Player not found');

      const powerUpIndex = player.powerUps.indexOf(powerUp);
      if (powerUpIndex === -1) throw new Error('Power-up not found');

      // Remove used power-up
      player.powerUps.splice(powerUpIndex, 1);

      // Apply power-up effect
      applyPowerUpEffect(game, player, powerUp);

      io.to(gameId).emit('gameState', game);
    } catch (error) {
      socket.emit('error', { message: error.message });
    }
  });

  socket.on('disconnect', () => {
    // Handle player disconnection
  });
});

function generatePowerUps() {
  const positions = [];
  for (let i = 0; i < 3; i++) {
    let position;
    do {
      position = Math.floor(Math.random() * 16);
    } while (positions.includes(position) || position === 0 || position === 15);
    positions.push(position);
  }
  return positions;
}

function generatePowerUp() {
  const powerUps = ['shield', 'reveal', 'speed'];
  return powerUps[Math.floor(Math.random() * powerUps.length)];
}

function applyPowerUpEffect(game, player, powerUp) {
  switch (powerUp) {
    case 'shield':
      // Implementation
      break;
    case 'reveal':
      // Implementation
      break;
    case 'speed':
      // Implementation
      break;
  }
}

function checkWinConditions(game) {
  const reaper = game.players.find(p => p.isReaper);
  const survivors = game.players.filter(p => !p.isReaper);

  // Reaper wins if at same position as any survivor
  for (const survivor of survivors) {
    if (survivor.position === reaper.position) {
      game.winner = 'reaper';
      game.gameOver = true;
      return;
    }
  }

  // Survivors win if they reach certain positions or conditions
  const survivorWinCondition = survivors.every(survivor => {
    // Add your win conditions here
    // For example: reaching specific positions or collecting items
    return false;
  });

  if (survivorWinCondition) {
    game.winner = 'survivors';
    game.gameOver = true;
  }
}

// Initialize game handler
const gameHandler = new GameHandler(io);
gameHandler.initialize();

// API routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
