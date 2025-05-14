const express = require('express');
const { body, validationResult } = require('express-validator');
const State = require('../models/stateSchema');
const District = require('../models/districtSchema');
const Theatre = require('../models/theatreSchema');
const Screen = require('../models/screenSchema');
const Movie = require('../models/movieSchema');
const Schedule = require('../models/movieScheduleSchema');
const Booking = require('../models/bookingSchema');
const User = require('../models/userSchema');
const UserDetails = require('../models/userDetailsSchema');
const screenController = require('../controllers/screenController');
const middleware = require('../middlewares/middleware');
const adminAnalyticsController = require('../controllers/adminAnalyticsController');


const router = express.Router();

// Add State
router.post('/state', [
  body('stateId').isString().withMessage('State ID is required'),
  body('stateName').isString().withMessage('State name is required'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const { stateId, stateName, status } = req.body;
    const newState = new State({ stateId, stateName, status });
    await newState.save();
    res.status(201).json({ message: 'State created successfully', state: newState });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get All States
router.get('/states', async (req, res) => {
  try {
    const states = await State.find();
    res.status(200).json({ states });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update State
router.put('/state/:id', [
  body('stateName').optional().isString().withMessage('State name is required'),
  body('status').optional().isIn(['active', 'inactive']).withMessage('Invalid status')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const updatedState = await State.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedState) return res.status(404).json({ message: 'State not found' });
    res.status(200).json({ message: 'State updated successfully', state: updatedState });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete State
// router.delete('/state/:id', async (req, res) => {
//   try {
//     const deletedState = await State.findByIdAndDelete(req.params.id);
//     if (!deletedState) return res.status(404).json({ message: 'State not found' });
//     res.status(200).json({ message: 'State deleted successfully' });
//   } catch (err) {
//     res.status(500).json({ message: 'Server error' });
//   }
// });
// Update State (inactive instead of delete)
router.delete('/state/:id', async (req, res) => {
    try {
      const updatedState = await State.findByIdAndUpdate(req.params.id, { status: 'inactive' }, { new: true });
      if (!updatedState) return res.status(404).json({ message: 'State not found' });
      res.status(200).json({ message: 'State marked as inactive', state: updatedState });
    } catch (err) {
      res.status(500).json({ message: 'Server error' });
    }
  });
  



















// Add District
router.post('/district', [
  body('districtId').isString().withMessage('District ID is required'),
  body('districtName').isString().withMessage('District name is required'),
  body('stateId').isString().withMessage('State ID is required')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const { districtId, districtName, stateId, status } = req.body;
    const state = await State.findOne({ stateId });
    if (!state) return res.status(404).json({ message: 'State not found' });

    const newDistrict = new District({ districtId, districtName, stateId, status });
    await newDistrict.save();
    res.status(201).json({ message: 'District created successfully', district: newDistrict });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get All Districts by State
router.get('/districts/:stateId', async (req, res) => {
  try {
    const districts = await District.find({ stateId: req.params.stateId });
    res.status(200).json({ districts });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update District
router.put('/district/:id', [
  body('districtName').optional().isString().withMessage('District name is required'),
  body('status').optional().isIn(['active', 'inactive']).withMessage('Invalid status')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const updatedDistrict = await District.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedDistrict) return res.status(404).json({ message: 'District not found' });
    res.status(200).json({ message: 'District updated successfully', district: updatedDistrict });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete District
// router.delete('/district/:id', async (req, res) => {
//   try {
//     const deletedDistrict = await District.findByIdAndDelete(req.params.id);
//     if (!deletedDistrict) return res.status(404).json({ message: 'District not found' });
//     res.status(200).json({ message: 'District deleted successfully' });
//   } catch (err) {
//     res.status(500).json({ message: 'Server error' });
//   }
// });
// Update District (inactive instead of delete)
router.delete('/district/:id', async (req, res) => {
    try {
      const updatedDistrict = await District.findByIdAndUpdate(req.params.id, { status: 'inactive' }, { new: true });
      if (!updatedDistrict) return res.status(404).json({ message: 'District not found' });
      res.status(200).json({ message: 'District marked as inactive', district: updatedDistrict });
    } catch (err) {
      res.status(500).json({ message: 'Server error' });
    }
  });
  








// Add Theatre
router.post('/theatre', [
  body('theatreId').isString().withMessage('Theatre ID is required'),
  body('name').isString().withMessage('Theatre name is required'),
  body('districtId').isString().withMessage('District ID is required'),
  body('address').optional().isString().withMessage('Address is required'),
  body('screens').optional().isArray().withMessage('Screens should be an array'),
  body('seatPricing').optional().isObject().withMessage('Pricing should be an object with silver, gold, platinum')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const { theatreId, name, address, districtId, screens, seatPricing, status } = req.body;
    const district = await District.findOne({ districtId });
    if (!district) return res.status(404).json({ message: 'District not found' });

    const newTheatre = new Theatre({ theatreId, name, address, districtId, screens, seatPricing, status });
    await newTheatre.save();
    res.status(201).json({ message: 'Theatre created successfully', theatre: newTheatre });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get All Theatres by District
router.get('/theatres/:districtId', async (req, res) => {
  try {
    const theatres = await Theatre.find({ districtId: req.params.districtId });
    res.status(200).json({ theatres });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update Theatre
router.put('/theatre/:id', [
  body('name').optional().isString().withMessage('Theatre name is required'),
  body('address').optional().isString().withMessage('Address is required'),
  body('screens').optional().isArray().withMessage('Screens should be an array'),
  body('seatPricing').optional().isObject().withMessage('Pricing should be an object with silver, gold, platinum'),
  body('status').optional().isIn(['active', 'inactive']).withMessage('Invalid status')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const updatedTheatre = await Theatre.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedTheatre) return res.status(404).json({ message: 'Theatre not found' });
    res.status(200).json({ message: 'Theatre updated successfully', theatre: updatedTheatre });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete Theatre
// router.delete('/theatre/:id', async (req, res) => {
//   try {
//     const deletedTheatre = await Theatre.findByIdAndDelete(req.params.id);
//     if (!deletedTheatre) return res.status(404).json({ message: 'Theatre not found' });
//     res.status(200).json({ message: 'Theatre deleted successfully' });
//   } catch (err) {
//     res.status(500).json({ message: 'Server error' });
//   }
// });
// Update Theatre (inactive instead of delete)
router.delete('/theatre/:id', async (req, res) => {
    try {
      const updatedTheatre = await Theatre.findByIdAndUpdate(req.params.id, { status: 'inactive' }, { new: true });
      if (!updatedTheatre) return res.status(404).json({ message: 'Theatre not found' });
      res.status(200).json({ message: 'Theatre marked as inactive', theatre: updatedTheatre });
    } catch (err) {
      res.status(500).json({ message: 'Server error' });
    }
  });
  












// Add Screen





// ✅ Admin adds a screen (auto-generates seatingLayout)
router.post('/add-screen', [
  body('screenId').isString().withMessage('Screen ID is required'),
  body('theatreId').isString().withMessage('Theatre ID is required'),
  body('screenName').isString().withMessage('Screen name is required'),
  body('layoutRanges').isObject().withMessage('Layout ranges are required'),
  body('seatsPerRow').isInt({ min: 1 }).withMessage('Seats per row must be a number')
], screenController.addScreen);

// ✅ Get all screens for a theatre
// router.get('/screens/:theatreId', screenController.getScreensByTheatre);

// // ✅ Update screen details (optional fields)
// router.put('/screen/:id', [
//   body('screenName').optional().isString().withMessage('Screen name must be a string'),
//   body('layoutRanges').optional().isObject().withMessage('Layout ranges must be an object'),
//   body('seatsPerRow').optional().isInt({ min: 1 }).withMessage('Seats per row must be a number'),
//   body('status').optional().isIn(['active', 'inactive']).withMessage('Invalid status')
// ], screenController.updateScreen);


// router.post('/add-screen', screenController.addScreen);

// router.post('/screen', [
//   body('screenId').isString().withMessage('Screen ID is required'),
//   body('theatreId').isString().withMessage('Theatre ID is required'),
//   body('screenName').isString().withMessage('Screen name is required'),
//   body('seatingLayout').isArray().withMessage('Seating layout is required')
// ], async (req, res) => {
//   const errors = validationResult(req);
//   if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

//   try {
//     const { screenId, theatreId, screenName, seatingLayout, status } = req.body;
//     const theatre = await Theatre.findOne({ theatreId });
//     if (!theatre) return res.status(404).json({ message: 'Theatre not found' });

//     const newScreen = new Screen({ screenId, theatreId, screenName, seatingLayout, status });
//     await newScreen.save();
//     res.status(201).json({ message: 'Screen created successfully', screen: newScreen });
//   } catch (err) {
//     res.status(500).json({ message: 'Server error' });
//   }
// });

// // Get All Screens by Theatre
// router.get('/screens/:theatreId', async (req, res) => {
//   try {
//     const screens = await Screen.find({ theatreId: req.params.theatreId });
//     res.status(200).json({ screens });
//   } catch (err) {
//     res.status(500).json({ message: 'Server error' });
//   }
// });

// // Update Screen
// router.put('/screen/:id', [
//   body('screenName').optional().isString().withMessage('Screen name is required'),
//   body('seatingLayout').optional().isArray().withMessage('Seating layout should be an array'),
//   body('status').optional().isIn(['active', 'inactive']).withMessage('Invalid status')
// ], async (req, res) => {
//   const errors = validationResult(req);
//   if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

//   try {
//     const updatedScreen = await Screen.findByIdAndUpdate(req.params.id, req.body, { new: true });
//     if (!updatedScreen) return res.status(404).json({ message: 'Screen not found' });
//     res.status(200).json({ message: 'Screen updated successfully', screen: updatedScreen });
//   } catch (err) {
//     res.status(500).json({ message: 'Server error' });
//   }
// });

// Delete Screen
// router.delete('/screen/:id', async (req, res) => {
//   try {
//     const deletedScreen = await Screen.findByIdAndDelete(req.params.id);
//     if (!deletedScreen) return res.status(404).json({ message: 'Screen not found' });
//     res.status(200).json({ message: 'Screen deleted successfully' });
//   } catch (err) {
//     res.status(500).json({ message: 'Server error' });
//   }
// });
// Update Screen (inactive instead of delete)
router.delete('/screen/:id', async (req, res) => {
    try {
      const updatedScreen = await Screen.findByIdAndUpdate(req.params.id, { status: 'inactive' }, { new: true });
      if (!updatedScreen) return res.status(404).json({ message: 'Screen not found' });
      res.status(200).json({ message: 'Screen marked as inactive', screen: updatedScreen });
    } catch (err) {
      res.status(500).json({ message: 'Server error' });
    }
  });
  









// Add Movie
router.post('/movie', [
  body('movieId').isString().withMessage('Movie ID is required'),
  body('title').isString().trim().withMessage('Title is required'),
  body('genre').optional().isString().trim().withMessage('Genre must be a string'),
  body('language').optional().isString().trim().withMessage('Language must be a string'),
  body('duration').optional().isString().trim().withMessage('Duration must be a string'),
  body('poster').optional().isString().trim().withMessage('Poster URL must be a string'),
  body('description').optional().isString().trim().withMessage('Description must be a string'),
  body('status').optional().isIn(['active', 'inactive']).withMessage('Invalid status')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const { movieId, title, genre, language, duration, poster, description, status } = req.body;
    const newMovie = new Movie({ movieId, title, genre, language, duration, poster, description, status });
    await newMovie.save();
    res.status(201).json({ message: 'Movie created successfully', movie: newMovie });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: 'Movie ID already exists' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// Get All Movies
router.get('/movies', async (req, res) => {
  try {
    const movies = await Movie.find();
    res.status(200).json({ movies });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update Movie
router.put('/movie/:id', [
  body('title').optional().isString().withMessage('Title is required'),
  body('genre').optional().isString().withMessage('Genre is required'),
  body('language').optional().isString().withMessage('Language is required'),
  body('duration').optional().isString().withMessage('Duration is required'),
  body('poster').optional().isString().withMessage('Poster URL is required'),
  body('description').optional().isString().withMessage('Description is required'),
  body('status').optional().isIn(['active', 'inactive']).withMessage('Invalid status')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const updatedMovie = await Movie.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedMovie) return res.status(404).json({ message: 'Movie not found' });
    res.status(200).json({ message: 'Movie updated successfully', movie: updatedMovie });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete Movie
// router.delete('/movie/:id', async (req, res) => {
//   try {
//     const deletedMovie = await Movie.findByIdAndDelete(req.params.id);
//     if (!deletedMovie) return res.status(404).json({ message: 'Movie not found' });
//     res.status(200).json({ message: 'Movie deleted successfully' });
//   } catch (err) {
//     res.status(500).json({ message: 'Server error' });
//   }
// });
// Update Movie (inactive instead of delete)
router.delete('/movie/:id', async (req, res) => {
    try {
      const updatedMovie = await Movie.findByIdAndUpdate(req.params.id, { status: 'inactive' }, { new: true });
      if (!updatedMovie) return res.status(404).json({ message: 'Movie not found' });
      res.status(200).json({ message: 'Movie marked as inactive', movie: updatedMovie });
    } catch (err) {
      res.status(500).json({ message: 'Server error' });
    }
  });













// Add Movie Schedule
router.post('/schedule', [
  body('theatreId').isString().withMessage('Theatre ID is required'),
  body('screenId').isString().withMessage('Screen ID is required'),
  body('movieId').isString().withMessage('Movie ID is required'),
  body('date').isISO8601().toDate().withMessage('Valid date is required'),
  body('timeSlot').isString().withMessage('Time slot is required'),
  body('startTime').isString().withMessage('Start time is required')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const { theatreId, screenId, movieId, date, timeSlot, startTime, status = 'active' } = req.body;

    // Check theatre and movie
    const theatre = await Theatre.findOne({ theatreId });
    const movie = await Movie.findOne({ movieId });
    if (!theatre || !movie) return res.status(404).json({ message: 'Theatre or Movie not found' });

    // Check if slot is already booked
    const existingSchedule = await Schedule.findOne({ theatreId, screen: screenId, date, timeSlot, status: 'active' });
    if (existingSchedule) {
      return res.status(409).json({ message: 'Screen already has a movie scheduled in this time slot' });
    }

    // Calculate endTime
    const parseDuration = (durationStr) => {
      const match = durationStr.match(/(\d+)h\s*(\d+)m/);
      if (!match) return { hours: 0, minutes: 0 };
      return { hours: parseInt(match[1]), minutes: parseInt(match[2]) };
    };

    const addTime = (start, duration) => {
      const [startHours, startMinutes] = start.split(':').map(Number);
      const totalMinutes = startHours * 60 + startMinutes + duration.hours * 60 + duration.minutes + 15;
      const endHours = Math.floor(totalMinutes / 60);
      const endMinutes = totalMinutes % 60;
      return `${String(endHours).padStart(2, '0')}:${String(endMinutes).padStart(2, '0')}`;
    };

    const movieDuration = parseDuration(movie.duration); // e.g. "2h 32m"
    const endTime = addTime(startTime, movieDuration);

    // Save schedule
    const newSchedule = new Schedule({
      theatreId,
      screen: screenId,
      movieId,
      date,
      timeSlot,
      startTime,
      endTime,
      status
    });

    await newSchedule.save();
    res.status(201).json({ message: 'Schedule created successfully', schedule: newSchedule });

  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});



// Get All Movie Schedules by Theatre
router.get('/schedules/:theatreId', async (req, res) => {
  try {
    const schedules = await Schedule.find({ theatreId: req.params.theatreId });
    res.status(200).json({ schedules });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update Movie Schedule
router.put('/schedule/:id', [
  body('timeSlot').optional().isString().withMessage('Time slot is required'),
  body('status').optional().isIn(['active', 'inactive']).withMessage('Invalid status')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const updatedSchedule = await Schedule.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedSchedule) return res.status(404).json({ message: 'Schedule not found' });
    res.status(200).json({ message: 'Schedule updated successfully', schedule: updatedSchedule });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete Movie Schedule
// router.delete('/schedule/:id', async (req, res) => {
//   try {
//     const deletedSchedule = await Schedule.findByIdAndDelete(req.params.id);
//     if (!deletedSchedule) return res.status(404).json({ message: 'Schedule not found' });
//     res.status(200).json({ message: 'Schedule deleted successfully' });
//   } catch (err) {
//     res.status(500).json({ message: 'Server error' });
//   }
// });
// Update Movie Schedule (inactive instead of delete)
router.delete('/schedule/:id', async (req, res) => {
    try {
      const updatedSchedule = await Schedule.findByIdAndUpdate(req.params.id, { status: 'inactive' }, { new: true });
      if (!updatedSchedule) return res.status(404).json({ message: 'Schedule not found' });
      res.status(200).json({ message: 'Schedule marked as inactive', schedule: updatedSchedule });
    } catch (err) {
      res.status(500).json({ message: 'Server error' });
    }
  });
  














// Get All Bookings
router.get('/bookings', async (req, res) => {
  try {
    const bookings = await Booking.find().populate('userId').populate('scheduleId');
    res.status(200).json({ bookings });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update Booking
router.put('/booking/:id', [
  body('bookingStatus').optional().isIn(['confirmed', 'cancelled', 'pending']).withMessage('Invalid status')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const updatedBooking = await Booking.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedBooking) return res.status(404).json({ message: 'Booking not found' });
    res.status(200).json({ message: 'Booking updated successfully', booking: updatedBooking });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete Booking
// router.delete('/booking/:id', async (req, res) => {
//   try {
//     const deletedBooking = await Booking.findByIdAndDelete(req.params.id);
//     if (!deletedBooking) return res.status(404).json({ message: 'Booking not found' });
//     res.status(200).json({ message: 'Booking deleted successfully' });
//   } catch (err) {
//     res.status(500).json({ message: 'Server error' });
//   }
// });
// Update Booking (inactive instead of delete)
router.delete('/booking/:id', async (req, res) => {
    try {
      const updatedBooking = await Booking.findByIdAndUpdate(req.params.id, { status: 'inactive' }, { new: true });
      if (!updatedBooking) return res.status(404).json({ message: 'Booking not found' });
      res.status(200).json({ message: 'Booking marked as inactive', booking: updatedBooking });
    } catch (err) {
      res.status(500).json({ message: 'Server error' });
    }
  });
  




  
  // Analytics routes
  router.get('/booking-trends', middleware.isAdmin, adminAnalyticsController.getBookingTrends);
  router.get('/peak-hours', middleware.isAdmin, adminAnalyticsController.getPeakHours);
  router.get('/abandoned-bookings', middleware.isAdmin, adminAnalyticsController.getAbandonedBookings);
  router.get('/popular-seats', middleware.isAdmin, adminAnalyticsController.getPopularSeats);
  
  module.exports = router;
  















module.exports = router;



