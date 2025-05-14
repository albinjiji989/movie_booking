// utils/finders.js
const State = require('../models/State');
const District = require('../models/District');

const findStateByAnyId = async (id) => {
  return await State.findOne({
    $or: [
      { _id: id },
      { stateId: id }
    ]
  });
};

const findDistrictByAnyId = async (id) => {
  return await District.findOne({
    $or: [
      { _id: id },
      { districtId: id }
    ]
  });
};

module.exports = {
  findStateByAnyId,
  findDistrictByAnyId
};


