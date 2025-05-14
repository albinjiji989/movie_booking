const mongoose = require('mongoose');

const passwordResetSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  resetToken: { type: String, required: true },
  resetPasswordExpires: { type: Date, required: true }
}, { timestamps: true });

module.exports = mongoose.model('PasswordReset', passwordResetSchema);
