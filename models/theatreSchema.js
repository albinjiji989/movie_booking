const mongoose = require('mongoose');

const theatreSchema = new mongoose.Schema({
  theatreId: { type: String, unique: true, required: true, index: true },  
  name: { type: String, required: true },
  address: { type: String },
  districtId: { type: String, required: true, ref: 'District', index: true },  
  screens: [{ type: String }],
  seatPricing: {
    silver: Number,
    gold: Number,
    platinum: Number
  },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' }
}, { timestamps: true });

module.exports = mongoose.model('Theatre', theatreSchema);
