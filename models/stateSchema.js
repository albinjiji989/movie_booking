const mongoose = require('mongoose');

const stateSchema = new mongoose.Schema({
  stateId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  stateName: {
  type: String,
  required: true,
  trim: true,
  unique: true
}
,
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  }
}, { timestamps: true });

module.exports = mongoose.model('State', stateSchema);
