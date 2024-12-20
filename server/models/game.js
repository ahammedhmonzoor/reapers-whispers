const mongoose = require('mongoose');

const gameSchema = new mongoose.Schema({
  gameId: {
    type: String,
    required: true,
    unique: true
  },
  hostId: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['waiting', 'playing', 'finished'],
    default: 'waiting'
  },
  players: [{
    id: String,
    username: String,
    isReaper: Boolean,
    position: Number, // 0-15 for 4x4 grid
    isAlive: {
      type: Boolean,
      default: true
    },
    powerUps: [{
      type: String,
      enum: ['shield', 'reveal', 'speed']
    }]
  }],
  board: {
    cells: [{
      type: Number,
      default: null
    }],
    traps: [{
      position: Number,
      type: String,
      enum: ['kill', 'slow', 'confuse']
    }],
    safeZones: [Number]
  },
  currentTurn: {
    playerId: String,
    startTime: Date,
    timeLimit: {
      type: Number,
      default: 30 // seconds
    }
  },
  gameSettings: {
    maxPlayers: {
      type: Number,
      default: 6
    },
    turnTimeLimit: {
      type: Number,
      default: 30
    },
    reaperRevealInterval: {
      type: Number,
      default: 5 // turns
    }
  },
  bannedPlayers: [{
    playerId: String,
    username: String,
    bannedAt: Date
  }],
  messages: [{
    sender: String,
    text: String,
    timestamp: {
      type: Date,
      default: Date.now
    },
    isReaperMessage: {
      type: Boolean,
      default: false
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  finishedAt: Date,
  winner: {
    type: String,
    enum: ['reaper', 'survivors', null],
    default: null
  }
});

// Game state helper methods
gameSchema.methods.isGameOver = function() {
  const survivors = this.players.filter(p => !p.isReaper && p.isAlive);
  return survivors.length === 0 || this.status === 'finished';
};

gameSchema.methods.getWinner = function() {
  if (this.status !== 'finished') return null;
  const survivors = this.players.filter(p => !p.isReaper && p.isAlive);
  return survivors.length === 0 ? 'reaper' : 'survivors';
};

gameSchema.methods.canMove = function(playerId, targetPosition) {
  const player = this.players.find(p => p.id === playerId);
  if (!player || !player.isAlive) return false;
  
  const currentPos = player.position;
  const validMoves = this.getValidMoves(currentPos);
  return validMoves.includes(targetPosition);
};

gameSchema.methods.getValidMoves = function(position) {
  const moves = [];
  const row = Math.floor(position / 4);
  const col = position % 4;
  
  // Add adjacent cells (up, down, left, right)
  if (row > 0) moves.push(position - 4); // up
  if (row < 3) moves.push(position + 4); // down
  if (col > 0) moves.push(position - 1); // left
  if (col < 3) moves.push(position + 1); // right
  
  return moves;
};

module.exports = mongoose.model('Game', gameSchema);
