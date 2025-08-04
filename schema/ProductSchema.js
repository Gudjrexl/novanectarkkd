const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema({
  prodid: Number,
  Prodtname: { type: String, required: true, unique: true },
  Prodtdescription: { type: String, required: true },
  Prodtprice: { type: Number, required: true },
  Prodtcategory: { type: String, required: true },
  ProdtstockQuantity: { type: Number, default: 0 },
  Productimg: { type: String, required: true },
  ProductCoin: { type: Number, required: true, default: 0 }, 
});

const Product = mongoose.model("Product", ProductSchema);
module.exports = Product;