const mongoose = require('mongoose');

const showSchema = new mongoose.Schema({
  showId: { type: String, required: true, unique: true }, // e.g. `T001_S001_M001_Morning_2025-05-01`
  movieId: { type: String, required: true, ref: 'Movie' },
  theatreId: { type: String, required: true, ref: 'Theatre' },
  screenId: { type: String, required: true, ref: 'Screen' },
  startTime: { type: String, enum: ['morning', 'afternoon', 'evening', 'night'], required: true },
  date: { type: String, required: true }, // e.g. '2025-05-01'
  bookedSeats: [
    {
      seatId: { type: String, required: true } // e.g. A1, B5, etc.
    }
  ],
  status: {
    type: String,
    enum: ['active', 'completed', 'cancelled'],
    default: 'active'
  }
}, { timestamps: true });

module.exports = mongoose.model('Show', showSchema);
