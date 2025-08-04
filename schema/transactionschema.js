const mongoose = require('mongoose');
const transactionSchema = new mongoose.Schema({
  userid: String,
  username: String,
contactcno: {
    type: String
  },
  itemexp: {
    type: String, default: "paint"
  },
  typetransaction: {
    type: String,
    enum: ['credit', 'deduct'],
  },
  coins: {
    type: Number
  },
  date: { type: Date, default: Date.now } 

});

module.exports = mongoose.model('Transaction', transactionSchema);