const express = require('express');
const Router = express.Router();
const User = require('../schema/Usersign');
const pd = require("../schema/ProductSchema");
const NovaNectorProfile = require('../schema/ProfileSchema');
const clientaprove = require('../schema/clientaproveSchema');
const Category = require('../schema/Category');
const Offer = require('../schema/OfferSchema');
const promotion = require('../schema/advertiseSchema');
Router.get('/Homedata', async(req, res) => {
    try {
        const totalUser = await User.countDocuments();
        const totalProduct = await pd.countDocuments();
        const kycRequest = await NovaNectorProfile.countDocuments({ $or: [
            { PanCardVerify: "pending" },
            { AadharCardVerify: "pending" }
        ]});
        const withdrawalRequest = await clientaprove.countDocuments({ status: "pending" });
        const category = await Category.countDocuments();
        const offer = await Offer.countDocuments();
        const promotionCount = await promotion.countDocuments();

        res.status(200).json({
            totalUser: totalUser,
            totalProduct: totalProduct,
            kycRequest: kycRequest,
            withdrawalRequest: withdrawalRequest,
            category: category,
            promotionCount: promotionCount,
            offer: offer
        });

       
    }catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
  


})
module.exports = Router;