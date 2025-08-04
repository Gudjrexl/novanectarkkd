const mongoose = require('mongoose');
const kycadpaSchema = new mongoose.Schema({
    contactno: String,
    adharno: String,
    Panno: String,
    adharimg: String,
    panimg: String,

    })
    module.exports = mongoose.model('kycadpa', kycadpaSchema);