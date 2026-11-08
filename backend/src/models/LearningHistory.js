const mongoose = require('mongoose');

const learningHistorySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  wordId: { type: mongoose.Schema.Types.ObjectId, ref: 'Word', required: true },
  wordSetId: { type: mongoose.Schema.Types.ObjectId, ref: 'WordSet', required: true },
  
  // Spaced repetition intervals (SM-2 algorithm)
  interval: { type: Number, default: 1 }, // days until next review
  easeFactor: { type: Number, default: 2.5 },
  repetitions: { type: Number, default: 0 },
  
  // Statistics
  correct: { type: Number, default: 0 },
  incorrect: { type: Number, default: 0 },
  lastReview: { type: Date },
  nextReview: { type: Date, default: Date.now },
  
  // Status
  status: { type: String, enum: ['new', 'learning', 'learned'], default: 'new' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('LearningHistory', learningHistorySchema);
