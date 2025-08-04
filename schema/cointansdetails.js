const mongoose = require('mongoose');
const coindetails = new mongoose.Schema({
    coinusername: String,
    coincode: String,
    coindate: String,
})
module.exports = mongoose.model('CoinDetails', coindetails);