const mongoose = require('mongoose');

const stateSchema = new mongoose.Schema({
  stateId: { type: String, unique: true, required: true, index: true },
  stateName: { type: String, required: true },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' }
}, { timestamps: true });

module.exports = mongoose.model('State', stateSchema);
