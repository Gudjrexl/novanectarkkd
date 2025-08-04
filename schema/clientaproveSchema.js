const mongoose = require('mongoose');
const clientaprove = new mongoose.Schema({
    requestid : String,
    contactcno: String,
    profilepic: String,
    coinusername: String,
    reason: String,
    coindate: String,
    coins:Number,
    status: String
});

module.exports = mongoose.model('ClientAprove', clientaprove);