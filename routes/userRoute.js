const express = require('express');
const { body, validationResult } = require('express-validator');
const Schedule = require('../models/movieScheduleSchema'); // Schedule model
const Theatre = require('../models/theatreSchema'); // Theatre model
const Movie = require('../models/movieSchema'); // Movie model
const Seat = require('../models/screenSchema'); // Seat model
const Booking = require('../models/bookingSchema'); // Booking model

const router = express.Router();

const middleware = require('../middlewares/middleware');
const bookingController = require('../controllers/bookingController');

router.post('/book', middleware.isUser, bookingController.bookSeats);
router.get('/available-schedules', bookingController.getAvailableSchedules);




// router.post('/book', [
//     body('scheduleId').isString().withMessage('Schedule ID is required'),
//     body('theatreId').isString().withMessage('Theatre ID is required'),
//     body('screenId').isString().withMessage('Screen ID is required'),
//     body('movieId').isString().withMessage('Movie ID is required'),
//     body('seats').isArray().withMessage('Seats are required').bail(),
//     body('seats.*.seatId').isString().withMessage('Each seat must have a valid seat ID'),
//     body('amountPaid').isNumeric().withMessage('Amount paid should be a number'),
//     body('paymentStatus').isString().withMessage('Payment status is required'),
//     body('bookingStatus').isString().withMessage('Booking status is required')
//   ], async (req, res) => {
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  
//     try {
//       const { scheduleId, theatreId, screenId, movieId, seats, amountPaid, paymentStatus, bookingStatus } = req.body;
  
//       // Fetch schedule details to verify if the schedule exists
//       const schedule = await Schedule.findOne({ scheduleId, theatreId, screenId, movieId });
//       if (!schedule) {
//         return res.status(404).json({ message: 'Schedule not found for the given parameters' });
//       }
  
//       // Check if seats are available
//       const seatIds = seats.map(seat => seat.seatId);
//       const availableSeats = await Seat.find({ seatId: { $in: seatIds }, status: 'available' });
//       if (availableSeats.length !== seatIds.length) {
//         return res.status(400).json({ message: 'Some selected seats are unavailable' });
//       }
  
//       // Create booking entry for the user
//       const booking = new Booking({
//         scheduleId,
//         theatreId,
//         screenId,
//         movieId,
//         seats,
//         bookingDate: new Date(),
//         bookingTime: new Date(), // current time when booking happens
//         amountPaid,
//         paymentStatus: paymentStatus || 'success',
//         bookingStatus: bookingStatus || 'confirmed'
//       });
  
//       // Save the booking
//       await booking.save();
  
//       // Mark the booked seats as 'booked'
//       await Seat.updateMany(
//         { seatId: { $in: seatIds } },
//         { $set: { status: 'booked' } }
//       );
  
//       res.status(201).json({ message: 'Booking successful', booking });
//     } catch (err) {
//       res.status(500).json({ message: 'Server error', error: err.message });
//     }
//   });


// // Movie Booking Route
// router.post('/book', [
//     body('scheduleId').isString().withMessage('Schedule ID is required'),
//     body('theatreId').isString().withMessage('Theatre ID is required'),
//     body('screenId').isString().withMessage('Screen ID is required'),
//     body('movieId').isString().withMessage('Movie ID is required'),
//     body('seats').isArray().withMessage('Seats are required').bail(),
//     body('seats.*.seatId').isString().withMessage('Each seat must have a valid seat ID'),
//     body('amountPaid').isNumeric().withMessage('Amount paid should be a number'),
//     body('paymentStatus').isString().withMessage('Payment status is required'),
//     body('bookingStatus').isString().withMessage('Booking status is required')
//   ], async (req, res) => {
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  
//     try {
//       const { scheduleId, theatreId, screenId, movieId, seats, amountPaid, paymentStatus, bookingStatus } = req.body;
  
//       // Fetch schedule details to verify if the schedule exists
//       const schedule = await Schedule.findOne({ scheduleId, theatreId, screenId, movieId });
//       if (!schedule) {
//         return res.status(404).json({ message: 'Schedule not found for the given parameters' });
//       }
  
//       // Check if seats are available
//       const seatIds = seats.map(seat => seat.seatId);
//       const availableSeats = await Seat.find({ seatId: { $in: seatIds }, status: 'available' });
//       if (availableSeats.length !== seatIds.length) {
//         return res.status(400).json({ message: 'Some selected seats are unavailable' });
//       }
  
//       // Create booking entry for the user
//       const booking = new Booking({
//         scheduleId,
//         theatreId,
//         screenId,
//         movieId,
//         seats,
//         bookingDate: new Date(),
//         bookingTime: new Date(), // current time when booking happens
//         amountPaid,
//         paymentStatus: paymentStatus || 'success',
//         bookingStatus: bookingStatus || 'confirmed'
//       });
  
//       // Save the booking
//       await booking.save();
  
//       // Mark the booked seats as 'booked'
//       await Seat.updateMany(
//         { seatId: { $in: seatIds } },
//         { $set: { status: 'booked' } }
//       );
  
//       res.status(201).json({ message: 'Booking successful', booking });
//     } catch (err) {
//       res.status(500).json({ message: 'Server error', error: err.message });
//     }
//   });
  







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
