// controllers/bookingController.js
const mongoose = require('mongoose');
const Schedule = require('../models/movieScheduleSchema');
const Screen = require('../models/screenSchema');
const Booking = require('../models/bookingSchema');
const Movie = require('../models/movieSchema');
const Theatre = require('../models/theatreSchema');
const LockedSeat = require('../models/lockedSeatSchema');

const LOCK_DURATION = 5 * 60 * 1000; // 5 minutes


exports.getAvailableSchedules = async (req, res) => {
  const { movieId, theatreId, date } = req.query;

  try {
    const schedules = await Schedule.find({
      movieId,
      theatreId,
      date: new Date(date),
      status: 'active'
    })
      .populate('movieId')
      .populate('theatreId');

    if (schedules.length === 0) {
      return res.status(404).json({ message: 'No available schedules found for the selected movie and theatre on this date.' });
    }

    res.status(200).json({ schedules });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.bookSeats = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { scheduleId, seats } = req.body;
    const userId = req.user.id;

    const schedule = await Schedule.findById(scheduleId).session(session);
    if (!schedule) throw new Error('Schedule not found');

    const screen = await Screen.findOne({ screenId: schedule.screen }).session(session);
    if (!screen) throw new Error('Screen not found');

    const theatre = await Theatre.findOne({ theatreId: schedule.theatreId }).session(session);
    if (!theatre) throw new Error('Theatre not found');

    const bookings = await Booking.find({ scheduleId, bookingStatus: 'confirmed' }).session(session);
    const alreadyBookedSeatIds = bookings.flatMap(b => b.seats.map(seat => seat.seatId));

    const requestedSeatIds = seats.map(seat => seat.seatId);
    const conflict = requestedSeatIds.filter(id => alreadyBookedSeatIds.includes(id));
    if (conflict.length > 0) {
      throw new Error(`Some seats are already booked: ${conflict.join(', ')}`);
    }

    let totalAmount = 0;
    const bookedSeats = [];

    seats.forEach(({ seatId }) => {
      const seatInLayout = screen.seatingLayout.find(seat => seat.seatId === seatId);
      if (!seatInLayout) throw new Error(`Seat ${seatId} not found`);

      const price = theatre.seatPricing[seatInLayout.type.toLowerCase()] || 150;
      totalAmount += price;

      bookedSeats.push({
        seatId: seatInLayout.seatId,
        row: seatInLayout.row,
        number: seatInLayout.number,
        type: seatInLayout.type,
        price
      });
    });

    const newBooking = new Booking({
      userId,
      scheduleId,
      seats: bookedSeats,
      totalAmount,
      bookingStatus: 'confirmed',
      paymentStatus: 'success',
      bookedAt: new Date()
    });

    await newBooking.save({ session });
    await session.commitTransaction();

    res.status(201).json({
      message: 'Booking confirmed',
      booking: {
        movie: schedule.movieTitle,
        screen: screen.screenName,
        theatreId: schedule.theatreId,
        showTime: schedule.timeSlot,
        date: schedule.date,
        seats: bookedSeats,
        totalAmount,
        bookingId: newBooking._id
      }
    });

  } catch (err) {
    await session.abortTransaction();
    res.status(400).json({ message: err.message });
  } finally {
    session.endSession();
  }
};

exports.lockSeats = async (req, res) => {
  const { scheduleId, seatIds } = req.body;
  const userId = req.user.id;

  const expireTime = new Date(Date.now() + LOCK_DURATION);

  try {
    const schedule = await Schedule.findById(scheduleId);
    if (!schedule) return res.status(404).json({ message: 'Schedule not found' });

    const screen = await Screen.findOne({ screenId: schedule.screen });
    if (!screen) return res.status(404).json({ message: 'Screen not found' });

    const existingLocks = await LockedSeat.find({
      scheduleId,
      seatId: { $in: seatIds },
      expiresAt: { $gt: new Date() },
      userId: { $ne: userId } // allow re-lock by same user
    });

    if (existingLocks.length > 0) {
      return res.status(400).json({ message: 'Some seats are already locked by other users' });
    }

    // Lock documents
    const lockDocs = seatIds.map(seatId => ({
      scheduleId,
      seatId,
      userId,
      expiresAt: expireTime,
    }));

    await LockedSeat.insertMany(lockDocs);

    // Update status in seatingLayout to 'locked'
    screen.seatingLayout.forEach(seat => {
      if (seatIds.includes(seat.seatId)) {
        seat.status = 'locked';
      }
    });

    await screen.save();

    res.status(200).json({ message: 'Seats locked successfully', expireTime });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to lock seats', error: err.message });
  }
};

exports.getAvailableSeats = async (req, res) => {
  try {
    const { scheduleId } = req.params;

    const schedule = await Schedule.findById(scheduleId);
    if (!schedule) return res.status(404).json({ message: 'Schedule not found' });

    const screen = await Screen.findOne({ screenId: schedule.screen });
    if (!screen) return res.status(404).json({ message: 'Screen not found' });

    const bookings = await Booking.find({ scheduleId, bookingStatus: 'confirmed' });
    const lockedSeats = await LockedSeat.find({
      scheduleId,
      expiresAt: { $gt: new Date() },
    });

    const bookedSeatIds = bookings.flatMap(b => b.seats.map(seat => seat.seatId));
    const lockedSeatIds = lockedSeats.map(seat => seat.seatId);

    const unavailableSeatIds = new Set([...bookedSeatIds, ...lockedSeatIds]);

    const availableSeats = screen.seatingLayout.filter(
      seat => !unavailableSeatIds.has(seat.seatId)
    );

    res.json({ availableSeats });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching available seats' });
  }
};
