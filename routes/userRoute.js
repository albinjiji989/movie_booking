const express = require('express');
const { body, validationResult } = require('express-validator');
const Schedule = require('../models/movieScheduleSchema'); // Schedule model
const Theatre = require('../models/theatreSchema'); // Theatre model
const Movie = require('../models/movieSchema'); // Movie model
const Seat = require('../models/screenSchema'); // Seat model
const Booking = require('../models/bookingSchema'); // Booking model

const router = express.Router();
const Screen = require('../models/screenSchema'); 

const middleware = require('../middlewares/middleware');
const bookingController = require('../controllers/bookingController');

// router.post('/book', middleware.isUser, bookingController.bookSeats);
// router.get('/available-schedules', bookingController.getAvailableSchedules);
const mongoose = require('mongoose');
const path = require('path'); 
const { Types } = mongoose;
const fs = require('fs');







// POST /user/movie/:movieId/schedules
router.post('/movie/:movieId/schedules', async (req, res) => {
  try {
    const { movieId } = req.params;
    const { date } = req.body;  // Receive date in request body

    if (!date) {
      return res.status(400).json({ message: 'Date is required.' });
    }

    let movie = null;

    // ✅ Check if it's a valid Mongo ObjectId
    if (mongoose.Types.ObjectId.isValid(movieId)) {
      movie = await Movie.findById(movieId);
    }

    // ✅ If not found by _id, try by custom movieId
    if (!movie) {
      movie = await Movie.findOne({ movieId });
    }

    if (!movie) {
      return res.status(404).json({ message: 'Movie not found.' });
    }

    // Parse the date to standardize it
    const selectedDate = new Date(date);
    const formattedDate = selectedDate.toISOString().split('T')[0];  // Format to YYYY-MM-DD

    // ✅ Fetch schedules for the movie on the given date
    const schedules = await Schedule.find({
      movieId: movie.movieId,
      date: formattedDate,  // Match the exact date
      status: 'active'
    }).lean();

    if (!schedules.length) {
      return res.status(404).json({ message: 'No available schedules found for this movie on the given date.' });
    }

    // ✅ Build theatre and screen maps
    const theatreMap = {};
    const screenMap = {};

    for (const sch of schedules) {
      if (!theatreMap[sch.theatreId]) {
        const theatre = await Theatre.findOne({ theatreId: sch.theatreId }).lean();
        theatreMap[sch.theatreId] = theatre?.name || 'Unknown Theatre';
      }

      if (!screenMap[sch.screen]) {
        const screen = await Screen.findOne({ screenId: sch.screen }).lean();
        screenMap[sch.screen] = screen?.screenName || sch.screen;
      }
    }

    // ✅ Build final schedule list
    const response = schedules.map(sch => ({
      scheduleId: sch._id,
      theatreId: sch.theatreId,
      theatreName: theatreMap[sch.theatreId],
      screen: sch.screen,
      screenName: screenMap[sch.screen],
      showtime: sch.startTime,
      endTime: sch.endTime,
      date: sch.date,
      timeSlot: sch.timeSlot,
    }));

    res.status(200).json({
      movie: movie.title,
      movieId: movie.movieId,
      schedules: response
    });

  } catch (err) {
    console.error('[Error Fetching Schedules]', err.message);
    res.status(500).json({ message: 'Internal Server Error', error: err.message });
  }
});


// POST /user/theatre/schedules
router.post('/theatre/schedules', async (req, res) => {
  try {
    const { theatreId, date } = req.body;

    if (!theatreId || !date) {
      return res.status(400).json({ message: 'Theatre ID and date are required.' });
    }

    const formattedDate = new Date(date).toISOString().split('T')[0];
    const givenDate = new Date(formattedDate);
    const isObjectId = mongoose.Types.ObjectId.isValid(theatreId);

    const query = {
      status: 'active',
      theatreId: isObjectId ? new mongoose.Types.ObjectId(theatreId) : theatreId,
      date: givenDate  // Only exact date match
    };

    const schedules = await Schedule.find(query).lean();

    if (!schedules.length) {
      return res.status(404).json({ message: 'No movies are scheduled in this theatre on this date.' });
    }

    const groupedMovies = {
      Morning: [],
      Afternoon: [],
      Evening: [],
      Night: []
    };

    for (const schedule of schedules) {
      const movie = await Movie.findOne({ movieId: schedule.movieId }).lean();
      const screen = await Screen.findOne({ screenId: schedule.screen }).lean();

      const movieData = {
        movieId: movie?.movieId || schedule.movieId,
        title: movie?.title || 'Unknown Title',
        genre: movie?.genre || 'Unknown Genre',
        date: schedule.date,
        screen: screen?.screenName || schedule.screen || 'Unknown Screen',
        startTime: schedule.startTime,
        endTime: schedule.endTime
      };

      if (schedule.timeSlot && groupedMovies[schedule.timeSlot]) {
        groupedMovies[schedule.timeSlot].push(movieData);
      }
    }

    const response = Object.entries(groupedMovies).reduce((acc, [slot, movies]) => {
      if (movies.length) acc.push({ timeSlot: slot, movies });
      return acc;
    }, []);

    res.status(200).json({ theatreId, date: formattedDate, schedules: response });

  } catch (err) {
    console.error('Error fetching schedules:', err.message);
    res.status(500).json({ message: 'Error fetching schedules', error: err.message });
  }
});




// POST /user/book
// router.post('/book', [
//   body('scheduleId').isString().withMessage('Schedule ID is required'),
//   body('seats').isArray().withMessage('Seats are required').bail(),
//   body('seats.*.seatId').isString().withMessage('Each seat must have a valid seat ID')
// ], async (req, res) => {
//   const errors = validationResult(req);
//   if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

//   try {
//     const { scheduleId, seats } = req.body;
//     const userId = req.user.id;

//     // Find the selected schedule
//     const schedule = await Schedule.findById(scheduleId).populate('movieId theatreId');
//     if (!schedule) return res.status(404).json({ message: 'Schedule not found' });

//     // Check if selected seats are available
//     const seatIds = seats.map(seat => seat.seatId);
//     const unavailableSeats = schedule.seatingLayout.filter(seat => seatIds.includes(seat.seatId) && seat.status !== 'available');

//     if (unavailableSeats.length > 0) {
//       return res.status(400).json({ message: 'Some of the selected seats are unavailable' });
//     }

//     // Calculate the total price
//     let totalAmount = 0;
//     seats.forEach(({ seatId }) => {
//       const seat = schedule.seatingLayout.find(s => s.seatId === seatId);
//       if (seat) {
//         const price = seat.type === 'silver' ? 100 : seat.type === 'gold' ? 150 : 200;
//         totalAmount += price;
//       }
//     });

//     // Create the booking
//     const booking = new Booking({
//       userId,
//       scheduleId,
//       seats,
//       totalAmount,
//       bookingStatus: 'confirmed',
//       paymentStatus: 'success',
//     });

//     await booking.save();

//     // Mark the seats as booked
//     await Schedule.updateMany(
//       { _id: scheduleId, 'seatingLayout.seatId': { $in: seatIds } },
//       { $set: { 'seatingLayout.$.status': 'booked' } }
//     );

//     res.status(201).json({
//       message: 'Booking successful',
//       bookingId: booking._id,
//       movieTitle: schedule.movieId.title,
//       theatreName: schedule.theatreId.name,
//       screenName: schedule.screen.screenName,
//       seats,
//       totalAmount,
//     });
//   } catch (err) {
//     res.status(500).json({ message: 'Error booking movie', error: err.message });
//   }
// });
router.post('/schedules', bookingController.getAvailableSchedules);

// Route to get available seats for a specific movie schedule
router.get('/seats/:scheduleId', bookingController.getAvailableSeats);

// Route to lock seats (for a specific schedule)
router.post('/lock-seats',middleware.isUser, bookingController.lockSeats);

// Route to book seats and confirm the booking
router.post('/book-seats',middleware.isUser, bookingController.bookSeats);

// Route to download the movie ticket PDF
router.post('/tickets/download', middleware.isUser, async (req, res) => {
  const { bookingId } = req.body;
  const userId = req.user.id; // pulled from JWT via middleware

  if (!bookingId) {
    return res.status(400).json({ message: 'bookingId is required' });
  }

  try {
    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.userId.toString() !== userId) {
      return res.status(403).json({ message: 'Access denied. This ticket does not belong to you.' });
    }

    const ticketFilePath = path.join(__dirname, `../tickets/booking_${bookingId}.pdf`);

    fs.access(ticketFilePath, fs.constants.F_OK, err => {
      if (err) {
        return res.status(404).json({ message: 'Ticket PDF not found' });
      }

      res.download(ticketFilePath, err => {
        if (err) {
          res.status(500).json({ message: 'Error downloading the ticket', error: err.message });
        }
      });
    });

  } catch (error) {
    console.error('🔥 Ticket Download Error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});



  //seat availabilty

  router.post('/markSeatsAvailable', async (req, res) => {
    const { scheduleId } = req.body;
  
    try {
      // Find the schedule by scheduleId
      const schedule = await Schedule.findOne({ scheduleId });
      if (!schedule) {
        return res.status(404).json({ message: 'Schedule not found' });
      }
  
      // Check if the movie is completed
      const currentTime = moment();
      const movieEndTime = moment(schedule.endTime);
  
      if (movieEndTime.isBefore(currentTime)) {
        // Mark the seats as available
        await Seat.updateMany(
          { scheduleId: scheduleId, status: 'booked' },
          { $set: { status: 'available' } }
        );
        res.status(200).json({ message: 'Seats marked as available' });
      } else {
        res.status(400).json({ message: 'Movie is not yet completed' });
      }
    } catch (err) {
      res.status(500).json({ message: 'Server error', error: err.message });
    }
  });
  

  module.exports = router;
