const mongoose = require('mongoose');

const checkCoinSchema = new mongoose.Schema({
  scanQRCode: {
    type: String,
    required: true,
  }
});

module.exports = mongoose.model('CheckCoin', checkCoinSchema);
