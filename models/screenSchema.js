const mongoose = require('mongoose');
const generateSeatingLayout = require('../utils/seatingGenerator'); // Import the utility function

// Screen schema definition
const screenSchema = new mongoose.Schema({
  screenId: { 
    type: String, 
    required: true, 
    unique: true,
    index: true  // Indexing for better query performance
  },
  theatreId: { 
    type: String, 
    required: true, 
    ref: 'Theatre', 
    index: true  // Indexing for better query performance
  },
  screenName: { 
    type: String, 
    required: true 
  },
  seatingLayout: [
    {
      seatId: { 
        type: String, 
        required: true, 
        unique: true, 
        index: true  // Indexing for seat queries
      },  // Unique ID for each seat, like A1, B2, C5
      row: { 
        type: String, 
        required: true 
      },  // Row letter (A, B, C, etc.) - Admin can define
      number: { 
        type: Number, 
        required: true 
      },  // Seat number (1, 2, 3, etc.) - Admin defines
      type: { 
        type: String, 
        enum: ['silver', 'gold', 'platinum'], 
        required: true 
      },  // Seat type (Silver, Gold, Platinum)
      status: { 
        type: String, 
        enum: ['available', 'booked', 'reserved'], 
        default: 'available' 
      },  // Track seat availability
    }
  ],
  status: { 
    type: String, 
    enum: ['active', 'inactive'], 
    default: 'active' 
  }
}, { timestamps: true });

// Method to generate and set seating layout for the screen
screenSchema.methods.setSeatingLayout = function (layoutRanges, seatsPerRow) {
  const seatingLayout = generateSeatingLayout({ layoutRanges, seatsPerRow });
  this.seatingLayout = seatingLayout;
  return this.save();
};

module.exports = mongoose.model('Screen', screenSchema);
