const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  userid:String,
  name: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
    unique: true,
  },
  coins: {type:Number, default: 0},
  cardNumber: String,
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
});

const User = mongoose.model('User', userSchema);
module.exports = User;
