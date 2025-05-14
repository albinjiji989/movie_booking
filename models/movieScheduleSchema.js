const mongoose = require('mongoose');

const scheduleSchema = new mongoose.Schema({
  theatreId: { type: String, required: true, ref: 'Theatre', index: true },
  screen: { type: String, required: true },
  movieId: { type: String, required: true, ref: 'Movie', index: true },
  date: { type: Date, required: true },
  timeSlot: { type: String, enum: ['Morning', 'Afternoon', 'Evening', 'Night'] },
  startTime: { type: String },
  endTime: { type: String },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' }
}, { timestamps: true });

module.exports = mongoose.model('Schedule', scheduleSchema);
