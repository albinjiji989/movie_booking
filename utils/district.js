const mongoose = require('mongoose');
const District = require('../models/districtSchema');

const findDistrict = async (id) => {
  if (mongoose.Types.ObjectId.isValid(id)) {
    const byMongoId = await District.findById(id);
    if (byMongoId) return byMongoId;
  }
  return await District.findOne({ districtId: id });
};

const isDistrictNameTakenInState = async (districtName, stateId, excludeId = null) => {
  const query = {
    districtName: new RegExp(`^${districtName}$`, 'i'),
    stateId
  };
  if (excludeId) query._id = { $ne: excludeId };
  return await District.findOne(query);
};

module.exports = {
  findDistrict,
  isDistrictNameTakenInState
};