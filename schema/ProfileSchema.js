const mongoose = require('mongoose');
const NovanectorProfile = new mongoose.Schema({
    uname: {
        type: String,
    },
    designation: {
        type: String,
    },
    ProfilePic: String,
    gmailid: {
        type: String,
         required: true
    },  
    dob: String,
    contactno: {
        type: String,
    },
    address: {
        type: String,
        required: true
    },
Pincode: Number,
State: String,
Country : String,
PanCardVerify: String,
AadharCardVerify: String,
BankAccount: String,
BankHolderName: String,
BankName: String,
ifsc: String,
});
module.exports = mongoose.model('NovaNectorProfile', NovanectorProfile);