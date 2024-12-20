require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const { generatePuzzle } = require('./utils/puzzleGenerator');

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// In-memory storage
const activeGames = new Map();
const bannedPlayers = new Map();

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('joinGame', ({ gameId, username }) => {
    try {
      if (bannedPlayers.get(gameId)?.has(socket.id)) {
        socket.emit('error', { message: 'You are banned from this game' });
        return;
      }

      let game = activeGames.get(gameId);
      if (!game) {
        game = {
          id: gameId,
          players: new Map(),
          host: socket.id,
          maze: Array(8).fill().map(() => Array(8).fill(0)),
          puzzles: new Map(),
          messages: [],
          mutedPlayers: new Set(),
        };
        // Create some paths in the maze
        [[0,0], [0,1], [1,1], [1,2], [2,2], [2,3], [3,3], [3,4]].forEach(([x,y]) => {
          game.maze[x][y] = 1;
        });
        activeGames.set(gameId, game);
      }

      game.players.set(socket.id, {
        id: socket.id,
        username,
        position: { x: 0, y: 0 },
        lives: 3,
        powerups: [],
      });

      socket.join(gameId);
      io.to(gameId).emit('playerJoined', {
        players: Array.from(game.players.values()),
        messages: game.messages
      });
    } catch (error) {
      socket.emit('error', { message: error.message });
    }
  });

  socket.on('sendMessage', ({ gameId, message }) => {
    const game = activeGames.get(gameId);
    if (!game || game.mutedPlayers.has(socket.id)) return;

    const player = game.players.get(socket.id);
    const newMessage = {
      id: Date.now(),
      sender: player.username,
      text: message,
      timestamp: new Date()
    };
    game.messages.push(newMessage);
    io.to(gameId).emit('newMessage', newMessage);
  });

  socket.on('movementAttempt', ({ gameId, direction }) => {
    const game = activeGames.get(gameId);
    if (!game || !game.players.has(socket.id)) return;

    const player = game.players.get(socket.id);
    const newPosition = {
      x: player.position.x + (direction === 'right' ? 1 : direction === 'left' ? -1 : 0),
      y: player.position.y + (direction === 'down' ? 1 : direction === 'up' ? -1 : 0)
    };

    if (newPosition.x >= 0 && newPosition.x < 8 && 
        newPosition.y >= 0 && newPosition.y < 8 && 
        game.maze[newPosition.x][newPosition.y] === 1) {
      
      const puzzle = generatePuzzle(newPosition);
      socket.emit('puzzleChallenge', { puzzle });
    }
  });

  socket.on('disconnect', () => {
    for (const [gameId, game] of activeGames) {
      if (game.players.has(socket.id)) {
        game.players.delete(socket.id);
        io.to(gameId).emit('playerLeft', { playerId: socket.id });
        
        if (socket.id === game.host && game.players.size > 0) {
          game.host = Array.from(game.players.keys())[0];
          io.to(gameId).emit('newHost', { hostId: game.host });
        }
        
        if (game.players.size === 0) {
          activeGames.delete(gameId);
          bannedPlayers.delete(gameId);
        }
      }
    }
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
