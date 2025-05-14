const mongoose = require('mongoose');
const Schedule = require('../models/movieScheduleSchema');
const Screen = require('../models/screenSchema');
const Booking = require('../models/bookingSchema');
const Movie = require('../models/movieSchema');
const Theatre = require('../models/theatreSchema');
const LockedSeat = require('../models/lockedSeatSchema');
const pdfkit = require('pdfkit');  // PDF generation library
const fs = require('fs');  // File system to save the PDF locally
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);
const generateTicket = require('../utils/ticketGenerator');

const LOCK_DURATION = 5 * 60 * 1000; // 5 minutes

const User = require('../models/userSchema'); // adjust the path as per your model




exports.getAvailableSchedules = async (req, res) => {
  try {
    const { movieId, theatreId, date } = req.body;

    if (!movieId || !theatreId || !date) {
      return res.status(400).json({ message: 'movieId, theatreId, and date are required.' });
    }

    // Format date to YYYY-MM-DD for accurate comparison
    const formattedDate = new Date(date).toISOString().split('T')[0];

    // 🔍 Resolve Movie by either _id or movieId
    let movie = null;
    if (mongoose.Types.ObjectId.isValid(movieId)) {
      movie = await Movie.findById(movieId);
    }
    if (!movie) {
      movie = await Movie.findOne({ movieId });
    }
    if (!movie) {
      return res.status(404).json({ message: 'Movie not found' });
    }

    // 🔍 Resolve Theatre by either _id or theatreId
    let theatre = null;
    if (mongoose.Types.ObjectId.isValid(theatreId)) {
      theatre = await Theatre.findById(theatreId);
    }
    if (!theatre) {
      theatre = await Theatre.findOne({ theatreId });
    }
    if (!theatre) {
      return res.status(404).json({ message: 'Theatre not found' });
    }

    // ✅ Query schedules using resolved IDs and formatted date
    const schedules = await Schedule.find({
      movieId: movie.movieId,
      theatreId: theatre.theatreId,
      date: formattedDate,
      status: 'active'
    }).lean();

    if (!schedules.length) {
      return res.status(404).json({ message: 'No available schedules found for the selected movie and theatre on this date.' });
    }

    // 🎯 Map screen names for display
    const screenMap = {};
    for (const sch of schedules) {
      if (!screenMap[sch.screen]) {
        const screen = await Screen.findOne({ screenId: sch.screen }).lean();
        screenMap[sch.screen] = screen?.screenName || sch.screen;
      }
    }

    // 🧾 Build response
    const response = schedules.map(sch => ({
      scheduleId: sch._id,
      theatreId: sch.theatreId,
      theatreName: theatre.name,
      screen: sch.screen,
      screenName: screenMap[sch.screen],
      showtime: sch.startTime,
      endTime: sch.endTime,
      date: sch.date,
      timeSlot: sch.timeSlot
    }));

    res.status(200).json({
      movie: movie.title,
      movieId: movie.movieId,
      theatreId: theatre.theatreId,
      schedules: response
    });

  } catch (error) {
    console.error('Error in getAvailableSchedules:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};


// exports.lockSeats = async (req, res) => {
//   try {
//     const { scheduleId, seats, userId } = req.body;

//     // Check if the user already locked the seats
//     const existingLocks = await LockedSeat.find({ scheduleId, seatId: { $in: seats }, userId });
//     if (existingLocks.length > 0) {
//       return res.status(400).json({ message: 'Some seats are already locked for this user.' });
//     }

//     // Lock the seats for the user
//     const lockPromises = seats.map(seat => {
//       const lockedSeat = new LockedSeat({
//         scheduleId,
//         seatId: seat,  // Seat ID like 'A1', 'A2', etc.
//         userId,
//         expiresAt: new Date(Date.now() + 15 * 60 * 1000),  // Lock expires in 15 minutes
//       });

//       return lockedSeat.save();
//     });

//     await Promise.all(lockPromises);

//     res.status(200).json({ message: 'Seats locked successfully.' });

//   } catch (err) {
//     res.status(500).json({ message: 'Failed to lock seats', error: err.message });
//   }
// };

// // const calculateTotalAmount = (seats, seatPricing, screen) => {
// //     let totalAmount = 0;
// //     seats.forEach(seat => {
// //         const seatInLayout = screen.seatingLayout.find(s => s.seatId === seat);
// //         if (seatInLayout) {
// //             const price = seatPricing[seatInLayout.type.toLowerCase()] || 150;  // Default price if not found
// //             totalAmount += price;
// //         }
// //     });
// //     return totalAmount;
// // };

// exports.bookSeats = async (req, res) => {
//     try {
//         const { scheduleId, seats } = req.body;
//         const userId = req.user?.id || req.body.userId;

//         if (!scheduleId || !seats || !seats.length || !userId) {
//             return res.status(400).json({ message: 'Missing required fields' });
//         }

//         const schedule = await Schedule.findById(scheduleId);
//         if (!schedule) throw new Error('Schedule not found');

//         const screen = await Screen.findOne({ screenId: schedule.screen });
//         if (!screen) throw new Error('Screen not found');

//         const theatre = await Theatre.findOne({ theatreId: schedule.theatreId });
//         if (!theatre) throw new Error('Theatre not found');

//         const requestedSeatIds = seats.map(s => s.seatId);

//         // Check if any seats are already booked
//         const bookings = await Booking.find({ scheduleId, bookingStatus: 'confirmed' });
//         const bookedSeatIds = bookings.flatMap(b => b.seats.map(seat => seat.seatId));
//         const conflicts = requestedSeatIds.filter(id => bookedSeatIds.includes(id));
//         if (conflicts.length > 0) {
//             return res.status(400).json({ message: `Some seats are already booked: ${conflicts.join(', ')}` });
//         }

//         // Check if the seats are locked by this user
//         const lockedSeats = await LockedSeat.find({
//             scheduleId,
//             seatId: { $in: requestedSeatIds },
//             userId,
//             expiresAt: { $gt: new Date() }
//         });

//         if (lockedSeats.length !== requestedSeatIds.length) {
//             const unlocked = requestedSeatIds.filter(id =>
//                 !lockedSeats.some(ls => ls.seatId === id)
//             );
//             return res.status(400).json({
//                 message: `The following seats are not locked or have expired: ${unlocked.join(', ')}`
//             });
//         }

//         // Prepare bookedSeats and totalAmount
//         let totalAmount = 0;
//         const bookedSeats = requestedSeatIds.map(seatId => {
//             const layoutSeat = screen.seatingLayout.find(s => s.seatId === seatId);
//             const price = theatre.seatPricing[layoutSeat.type.toLowerCase()] || 150;
//             totalAmount += price;
//             return {
//                 seatId: layoutSeat.seatId,
//                 row: layoutSeat.row,
//                 number: layoutSeat.number,
//                 type: layoutSeat.type,
//                 price
//             };
//         });

//         const booking = new Booking({
//             userId,
//             scheduleId,
//             seats: bookedSeats,
//             totalAmount,
//             bookingStatus: 'confirmed',
//             paymentStatus: 'success',
//             bookedAt: new Date()
//         });

//         await booking.save();

//         // Generate PDF ticket
//         const doc = new pdfkit();
//         const ticketDir = './tickets';
//         const ticketPath = `${ticketDir}/booking_${booking._id}.pdf`;

//         if (!fs.existsSync(ticketDir)) fs.mkdirSync(ticketDir);

//         doc.pipe(fs.createWriteStream(ticketPath));
//         doc.fontSize(18).text('🎟 Movie Ticket Booking', { align: 'center' }).moveDown();
//         doc.fontSize(14).text(`User ID: ${userId}`);
//         doc.text(`Movie: ${schedule.movieTitle}`);
//         doc.text(`Theatre: ${theatre.name}`);
//         doc.text(`Screen: ${screen.screenName}`);
//         doc.text(`Seats: ${bookedSeats.map(s => s.seatId).join(', ')}`);
//         doc.text(`Seat Types: ${bookedSeats.map(s => s.type).join(', ')}`);
//         doc.text(`Total: ₹${totalAmount}`);
//         doc.text(`Booking ID: ${booking._id}`);
//         doc.end();

//         res.status(201).json({
//             message: 'Booking successful',
//             ticketUrl: `http://localhost:4321/tickets/booking_${booking._id}.pdf`,
//             bookingId: booking._id
//         });

//     } catch (err) {
//         console.error('🔥 Booking Error:', err.message);
//         res.status(500).json({ message: 'Internal Server Error' });
//     }
// };










exports.lockSeats = async (req, res) => {
  try {
    const { scheduleId, seats } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(403).json({ message: 'User not authenticated' });
    }
    if (!scheduleId || !Array.isArray(seats) || seats.length === 0) {
      return res.status(400).json({ message: 'scheduleId and seats are required' });
    }

    // Check if user already locked these seats
    const existingLocks = await LockedSeat.find({ scheduleId, seatId: { $in: seats }, userId });
    if (existingLocks.length > 0) {
      return res.status(400).json({ message: 'Some seats are already locked for this user.' });
    }

    // Lock seats with expiration 15 minutes from now
    const lockPromises = seats.map(seat => {
      return new LockedSeat({
        scheduleId,
        seatId: seat,
        userId,
        expiresAt: new Date(Date.now() + 15 * 60 * 1000),
      }).save();
    });

    await Promise.all(lockPromises);

    res.status(200).json({ message: 'Seats locked successfully.' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to lock seats', error: err.message });
  }
};



exports.bookSeats = async (req, res) => {
  try {
    const { scheduleId, seats } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(403).json({ message: 'User not authenticated' });
    }
    if (!scheduleId || !Array.isArray(seats) || seats.length === 0) {
      return res.status(400).json({ message: 'scheduleId and seats are required' });
    }

    const schedule = await Schedule.findById(scheduleId);
    if (!schedule) return res.status(404).json({ message: 'Schedule not found' });

    const screen = await Screen.findOne({ screenId: schedule.screen });
    if (!screen) return res.status(404).json({ message: 'Screen not found' });

    const theatre = await Theatre.findOne({ theatreId: schedule.theatreId });
    if (!theatre) return res.status(404).json({ message: 'Theatre not found' });

    const requestedSeatIds = seats.map(s => s.seatId);

    // Check if seats already booked
    const bookings = await Booking.find({ scheduleId, bookingStatus: 'confirmed' });
    const bookedSeatIds = bookings.flatMap(b => b.seats.map(seat => seat.seatId));
    const conflicts = requestedSeatIds.filter(id => bookedSeatIds.includes(id));
    if (conflicts.length > 0) {
      return res.status(400).json({ message: `Seats already booked: ${conflicts.join(', ')}` });
    }

    // Verify locked seats by user
    const lockedSeats = await LockedSeat.find({
      scheduleId,
      seatId: { $in: requestedSeatIds },
      userId,
      expiresAt: { $gt: new Date() }
    });

    if (lockedSeats.length !== requestedSeatIds.length) {
      const unlockedSeats = requestedSeatIds.filter(id => !lockedSeats.some(ls => ls.seatId === id));
      return res.status(400).json({ message: `Seats not locked or expired: ${unlockedSeats.join(', ')}` });
    }

    // Calculate total amount and prepare seat details
    let totalAmount = 0;
    const bookedSeats = requestedSeatIds.map(seatId => {
      const seatInfo = screen.seatingLayout.find(s => s.seatId === seatId);
      const price = theatre.seatPricing[seatInfo.type.toLowerCase()] || 150;
      totalAmount += price;
      return {
        seatId: seatInfo.seatId,
        row: seatInfo.row,
        number: seatInfo.number,
        type: seatInfo.type,
        price
      };
    });

    const booking = new Booking({
      userId,
      scheduleId,
      seats: bookedSeats,
      totalAmount,
      bookingStatus: 'confirmed',
      paymentStatus: 'success',
      bookedAt: new Date()
    });

    await booking.save();

    // Generate PDF ticket
    const doc = new pdfkit();
    const ticketDir = './tickets';
    const ticketPath = `${ticketDir}/booking_${booking._id}.pdf`;
    if (!fs.existsSync(ticketDir)) fs.mkdirSync(ticketDir);

    doc.pipe(fs.createWriteStream(ticketPath));
    doc.fontSize(18).text('🎟 Movie Ticket Booking', { align: 'center' }).moveDown();
    doc.fontSize(14).text(`User ID: ${userId}`);
    doc.text(`Movie: ${schedule.movieTitle}`);
    doc.text(`Theatre: ${theatre.name}`);
    doc.text(`Screen: ${screen.screenName}`);
    doc.text(`Seats: ${bookedSeats.map(s => s.seatId).join(', ')}`);
    doc.text(`Seat Types: ${bookedSeats.map(s => s.type).join(', ')}`);
    doc.text(`Total: ₹${totalAmount}`);
    doc.text(`Booking ID: ${booking._id}`);
    doc.end();

    res.status(201).json({
      message: 'Booking successful',
      ticketUrl: `http://localhost:4321/tickets/booking_${booking._id}.pdf`,
      bookingId: booking._id
    });
  } catch (err) {
    console.error('🔥 Booking Error:', err.message);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};




// Get available seats for a specific schedule
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
