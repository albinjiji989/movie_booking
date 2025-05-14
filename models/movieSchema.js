const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema({
  movieId: { type: String, unique: true, required: true, index: true },
  title: { type: String },
  genre: { type: String },
  language: { type: String },
  duration: { type: String },
  poster: { type: String },
  description: { type: String },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' }
}, { timestamps: true });

module.exports = mongoose.model('Movie', movieSchema);
