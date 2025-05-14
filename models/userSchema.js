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
    index: true  // Added index
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.(com|in)$/, // Only .com or .in
    index: true  // Added index
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
    index: true  // Added index (small optimization for role-based queries)
  },
  status: {
    type: String,
    enum: ['Active', 'Inactive'],
    default: 'Active',
    index: true  // Added index (for filtering active/inactive users quickly)
  },
  userdetailsid: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'UserDetails',
    index: true  // Added index
  }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
