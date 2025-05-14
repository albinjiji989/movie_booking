const mongoose = require('mongoose');
const State = require('../models/stateSchema');

const findState = async (identifier) => {
  // Try to match both ObjectId and string stateId
  if (mongoose.Types.ObjectId.isValid(identifier)) {
    // Try both ObjectId and stateId
    return await State.findOne({
      $or: [
        { _id: identifier },
        { stateId: identifier }
      ]
    });
  } else {
    // Only search by stateId
    return await State.findOne({ stateId: identifier });
  }
};

module.exports = { findState };