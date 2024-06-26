const mongoose = require('mongoose');

const NetworkDetailsSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  receiver: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  timestamp: { type: Date, default: Date.now },
  status: { type: String, enum: ['pending', 'accepted', 'denied'], default: 'pending' },
});

module.exports = mongoose.model('NetworkDetails', NetworkDetailsSchema);
