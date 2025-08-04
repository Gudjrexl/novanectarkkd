const mongoose = require("mongoose");

const OfferSchema = new mongoose.Schema({
  offername: { type: String, required: true, },
  offerdescription: { type: String, required: true },
  offerprice: { type: Number, required: true },
  Offerimg: { type: String, required: true },
});

const Offer = mongoose.model("Offer", OfferSchema);
module.exports = Offer;