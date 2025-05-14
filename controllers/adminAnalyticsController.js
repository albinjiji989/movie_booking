const Booking = require('../models/bookingSchema');
const LockedSeat = require('../models/lockedSeatSchema');
const moment = require('moment');

// 1. Booking Trends: by date, theatre, movie
exports.getBookingTrends = async (req, res) => {
  try {
    const trends = await Booking.aggregate([
      {
        $group: {
          _id: {
            date: { $dateToString: { format: "%Y-%m-%d", date: "$bookedAt" } },
            movieId: "$scheduleId",
            theatreId: "$theatreId"
          },
          totalBookings: { $sum: 1 },
          totalRevenue: { $sum: "$totalAmount" }
        }
      },
      { $sort: { "_id.date": -1 } }
    ]);

    res.status(200).json({ trends });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching booking trends', error: err.message });
  }
};

// 2. Peak Hours: count by time slots
exports.getPeakHours = async (req, res) => {
  try {
    const result = await Booking.aggregate([
      {
        $group: {
          _id: "$showTime",
          bookings: { $sum: 1 }
        }
      },
      { $sort: { bookings: -1 } }
    ]);

    res.status(200).json({ peakHours: result });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching peak hours', error: err.message });
  }
};

// 3. Abandoned Bookings: locked but not booked
exports.getAbandonedBookings = async (req, res) => {
  try {
    const abandoned = await LockedSeat.find({ expiresAt: { $lte: new Date() } });
    res.status(200).json({ abandonedCount: abandoned.length, abandoned });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching abandoned bookings', error: err.message });
  }
};

// 4. Popular Seats: most frequently booked seatIds
exports.getPopularSeats = async (req, res) => {
  try {
    const result = await Booking.aggregate([
      { $unwind: "$seats" },
      {
        $group: {
          _id: "$seats.seatId",
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 20 }
    ]);

    res.status(200).json({ popularSeats: result });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching popular seats', error: err.message });
  }
};
