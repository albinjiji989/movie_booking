const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true,
    index: true  // Indexed for fast user-related queries
  },
  scheduleId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Schedule', 
    required: true,
    index: true  // Indexed for fast schedule-related queries
  },
  seats: [
    {
      seatId: { 
        type: String, 
        required: true,
        ref: 'Screen',  // Reference to the Screen schema for the seat
        index: true  // Indexed for fast seat-related queries
      },
      row: { 
        type: String, 
        required: true 
      },  // Row of the seat (e.g., A, B, C)
      number: { 
        type: Number, 
        required: true 
      },  // Seat number (1, 2, 3, etc.)
      type: { 
        type: String, 
        required: true,
        enum: ['silver', 'gold', 'platinum'] 
      },  // Seat type (silver, gold, platinum)
    }
  ],
  totalAmount: { 
    type: Number, 
    required: true 
  },   // Total price for the booked seats
  bookingStatus: { 
    type: String, 
    enum: ['confirmed', 'cancelled', 'pending'], 
    default: 'confirmed' 
  },  // Status of the booking
  paymentStatus: { 
    type: String, 
    enum: ['success', 'failed', 'pending'], 
    default: 'pending' 
  },  // Payment status (success, failed, pending)
  transactionId: { 
    type: String, 
    unique: true, 
    sparse: true 
  },  // Unique transaction ID for tracking payment
  bookingDate: { 
    type: Date, 
    default: Date.now 
  },  // Timestamp for when the booking was made
}, { timestamps: true });

module.exports = mongoose.model('Booking', bookingSchema);
