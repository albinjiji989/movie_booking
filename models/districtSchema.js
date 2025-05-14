const mongoose = require('mongoose');

const districtSchema = new mongoose.Schema({
  districtId: { 
    type: String, 
    required: true, 
    unique: true, 
    index: true, 
    trim: true
  },
  districtName: { 
    type: String, 
    required: true, 
    trim: true
  },
  stateId: { 
    type: String, 
    required: true, 
    ref: 'State', 
    index: true
  },
  status: { 
    type: String, 
    enum: ['active', 'inactive'], 
    default: 'active' 
  }
}, { timestamps: true });

// Create a compound index to ensure `districtName` is unique within the same `stateId`
districtSchema.index({ districtName: 1, stateId: 1 }, { unique: true });

module.exports = mongoose.model('District', districtSchema);
