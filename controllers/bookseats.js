// bookSeats.js
const mongoose = require('mongoose');
const Schedule = require('../models/movieScheduleSchema');
const Screen = require('../models/screenSchema');
const Booking = require('../models/bookingSchema');

exports.bookSeats = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    const { scheduleId, seats } = req.body;
    const userId = req.user.id; // Assume from JWT

    const schedule = await Schedule.findById(scheduleId).session(session);
    if (!schedule) throw new Error('Schedule not found');

    const screen = await Screen.findOne({ screenId: schedule.screen }).session(session);
    if (!screen) throw new Error('Screen not found');

    // Get booked seats from DB
    const bookings = await Booking.find({ scheduleId, bookingStatus: 'confirmed' }).session(session);
    const alreadyBookedSeatIds = bookings.flatMap(b => b.seats.map(seat => seat.seatId));

    const requestedSeatIds = seats.map(seat => seat.seatId);
    const conflict = requestedSeatIds.filter(id => alreadyBookedSeatIds.includes(id));

    if (conflict.length > 0) {
      throw new Error(`Seats already booked: ${conflict.join(', ')}`);
    }

    // Calculate total
    let totalAmount = 0;
    seats.forEach(seat => {
      const type = seat.type.toLowerCase();
      const price = screen.seatPricing[type] || 150;
      totalAmount += price;
    });

    // Save booking
    const booking = new Booking({
      userId,
      scheduleId,
      seats,
      totalAmount,
      bookingStatus: 'confirmed',
      paymentStatus: 'success'
    });

    await booking.save({ session });

    await session.commitTransaction();
    res.status(201).json({ message: 'Booking confirmed', bookingId: booking._id });

  } catch (err) {
    await session.abortTransaction();
    console.error('Booking error:', err.message);
    res.status(400).json({ message: err.message });
  } finally {
    session.endSession();
  }
};
