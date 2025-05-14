const mongoose = require('mongoose');

const userDetailsSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  phone: {
    type: String,
    required: true,
    match: /^[6-9]\d{9}$/,
    index: true
  },
  gender: {
    type: String,
    required: true,
    enum: ['male', 'female', 'other']
  },
  dob: {
    type: Date,
    required: true,
    validate: {
      validator: function (value) {
        const today = new Date();
        const age = today.getFullYear() - new Date(value).getFullYear();
        return age >= 13 && age <= 100;
      },
      message: 'User must be between 13 and 100 years old.'
    }
  },
  securityQuestion: {
    type: String,
    required: true,
    minlength: 10
  },
  securityQuestionAnswer: {
    type: String,
    required: true,
    minlength: 3
  },
  lastLogin: {
    type: Date
  },
  loginHistory: [{
    loginAt: {
      type: Date
    }
  }],
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  }
}, { timestamps: true });

module.exports = mongoose.model('UserDetails', userDetailsSchema);
