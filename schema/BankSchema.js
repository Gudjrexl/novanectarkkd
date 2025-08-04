const mongoose = require("mongoose");

const BankSchema = new mongoose.Schema({
    BankHolderName: String,
    BankName: String,
    BankAccount: String,
    ifsc: String,
    passbookimg: String,
    contactno: String
});

module.exports = mongoose.model("BankDetails", BankSchema);
