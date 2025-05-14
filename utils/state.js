const mongoose = require('mongoose');
const State = require('../models/stateSchema');

const findStateByAnyId = async (id) => {
  if (mongoose.Types.ObjectId.isValid(id)) {
    const byMongoId = await State.findById(id);
    if (byMongoId) return byMongoId;
  }
  return await State.findOne({ stateId: id });
};

module.exports = { findStateByAnyId };
