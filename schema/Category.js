const mongoose = require('mongoose');
const ctryschema = new mongoose.Schema({
    name: String,
    ctimg: String})

const Category = mongoose.model('Category', ctryschema);
module.exports = Category;