const mongoose = require("mongoose");

const gameStatsSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  gamesPlayed: { type: Number, default: 0 },
  correctAnswers: { type: Number, default: 0 },
  incorrectAnswers: { type: Number, default: 0 },
  totalTime: { type: Number, default: 0 } // en segundos
});

module.exports = mongoose.model("GameStats", gameStatsSchema);