const mongoose = require('mongoose');

const lockedSeatSchema = new mongoose.Schema({
  scheduleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Schedule',
    required: true,
  },
  seatId: {
    type: String,
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  lockedAt: {
    type: Date,
    default: Date.now,
  },
  expiresAt: {
    type: Date,
    required: true,
  },
}, { timestamps: true });

// Ensure unique combination of scheduleId + seatId for each user
lockedSeatSchema.index({ scheduleId: 1, seatId: 1, userId: 1 }, { unique: true });

module.exports = mongoose.model('LockedSeat', lockedSeatSchema);
