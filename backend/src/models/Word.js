const mongoose = require('mongoose');

const wordSchema = new mongoose.Schema({
  wordSetId: { type: mongoose.Schema.Types.ObjectId, ref: 'WordSet', required: true },
  word: { type: String, required: true },
  translation: { type: String, required: true },
  example: { type: String },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Word', wordSchema);
