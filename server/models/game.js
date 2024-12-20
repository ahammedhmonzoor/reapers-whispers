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
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Player'
  }],
  bannedPlayers: [{
    playerId: String,
    username: String,
    bannedAt: Date
  }],
  mutedPlayers: [{
    playerId: String,
    username: String,
    mutedAt: Date,
    duration: Number // in minutes, null for permanent
  }],
  messages: [{
    sender: String,
    text: String,
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  maze: {
    layout: [[Number]], // 2D array representing maze layout
    size: Number,
    puzzles: [{
      position: {
        x: Number,
        y: Number
      },
      type: String,
      prompt: String,
      answer: String,
      difficulty: Number
    }]
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  finishedAt: Date
});

module.exports = mongoose.model('Game', gameSchema);
