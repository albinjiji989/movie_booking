const Schedule = require('../models/movieScheduleSchema');
const Screen = require('../models/screenSchema');
const Booking = require('../models/bookingSchema');
const SeatLock = require('../models/seatLockSchema'); // Import the seat lock model
const moment = require('moment');

exports.getAvailableSeats = async (req, res) => {
  try {
    const { scheduleId } = req.params;

    const schedule = await Schedule.findById(scheduleId);
    if (!schedule) return res.status(404).json({ message: 'Schedule not found' });

    const screen = await Screen.findOne({ screenId: schedule.screen });
    if (!screen) return res.status(404).json({ message: 'Screen not found' });

    // Find already booked seats
    const bookings = await Booking.find({ scheduleId, bookingStatus: 'confirmed' });
    const bookedSeatIds = bookings.flatMap(b => b.seats.map(seat => seat.seatId));

    // Find temporarily locked seats
    const fiveMinutesAgo = moment().subtract(5, 'minutes').toDate();
    const lockedSeats = await SeatLock.find({
      scheduleId,
      lockedAt: { $gte: fiveMinutesAgo } // only seats locked within last 5 min
    });
    const lockedSeatIds = lockedSeats.map(lock => lock.seatId);

    const unavailableSeatIds = new Set([...bookedSeatIds, ...lockedSeatIds]);

    // Filter out unavailable seats
    const availableSeats = screen.seatingLayout.filter(
      seat => !unavailableSeatIds.has(seat.seatId)
    );

    res.json({ availableSeats });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching available seats' });
  }
};



