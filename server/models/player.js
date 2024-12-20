const mongoose = require('mongoose');

const playerSchema = new mongoose.Schema({
  socketId: String,
  username: {
    type: String,
    required: true
  },
  position: {
    x: {
      type: Number,
      default: 0
    },
    y: {
      type: Number,
      default: 0
    }
  },
  lives: {
    type: Number,
    default: 3
  },
  powerups: [{
    type: {
      type: String,
      enum: ['extraLife', 'hint', 'doubleMove', 'trapDetection']
    },
    acquired: {
      type: Date,
      default: Date.now
    },
    used: Date
  }],
  gameStats: {
    puzzlesSolved: {
      type: Number,
      default: 0
    },
    powerupsUsed: {
      type: Number,
      default: 0
    },
    sabotagesUsed: {
      type: Number,
      default: 0
    },
    timeSpent: {
      type: Number,
      default: 0
    }
  },
  currentGame: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Game'
  }
});

module.exports = mongoose.model('Player', playerSchema);
