const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    match: /^[a-zA-Z ]+$/  // Only letters and spaces allowed
  },
  username: {
    type: String,
    required: true,
    trim: true,
    unique: true,
    minLength: 3,
    maxLength: 20,
    index: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.(com|in)$/,
    index: true
  },
  password: {
    type: String,
    required: true,
    minlength: 8,
    match: /^(?=.*[A-Z])(?=.*\d)(?=.*[a-z])(?=.*[!@#$%^&*()_+]).{8,}$/
  },
  role: {
    type: String,
    enum: ['User', 'admin'],
    default: 'User',
    index: true
  },
  status: {
    type: String,
    enum: ['Active', 'Inactive'],
    default: 'Active',
    index: true
  },
  userdetailsid: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'UserDetails',
    index: true
  }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
