const mongoose = require("mongoose");

const tokenModel = new mongoose.Schema({
  userid: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  token: { 
    type: String, 
    required: true 
  },
  expiry_at: { 
    type: Date, 
    required: true, 
    index: true 
  }
}, {
  timestamps: true
});

tokenModel.index({ expiry_at: 1 }, { expireAfterSeconds: 0 });

const Token = mongoose.model("Token", tokenModel);
module.exports = Token;
