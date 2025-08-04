const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const router = express.Router();
const pd = require("../schema/ProductSchema");

const storage = multer.diskStorage({
    destination: function(req,fl,cb){
        const directory = path.join(__dirname, "..", "productimage");
        if(!fs.existsSync(directory)) fs.mkdirSync(directory);
        cb(null,directory);
    },
    filename: function(req,fl,cb){
        const unsufix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        const ext = path.extname(fl.originalname);
        cb(null, fl.fieldname + "-" + unsufix + ext);

    },    
}
)

const prodctimg = multer({storage});

router.post("/productdet", prodctimg.single("image"), async(req,res)=>{
    try {
            if (!req.file) return res.status(400).json({ error: "No file uploaded" });

        const{prodid,Prodtname,Prodtdescription,Prodtprice,Prodtcategory,ProdtstockQuantity,ProductCoin} = req.body;
        const Productimg = `/productimage/${req.file.filename}`;
        const newProdt = new pd({
            prodid,
            Prodtname,
            Prodtdescription,
            Prodtprice,Prodtcategory,
            ProdtstockQuantity,
            Productimg,
            ProductCoin
        });

        await newProdt.save();
        res.status(201).json({success:true});
    } catch (error) {
                console.error("Server error:", error); // <-- LOG the full error

        res.status(500).json({success: false, error: error.message});
    }
})

router.post("/productfilter", async (req, res) => {
    try {
        const { Prodtcategory, Prodtprice } = req.body;

        console.log("Filter request received:");
        console.log("Categories:", Prodtcategory);
        console.log("Max Price:", Prodtprice);

        const filterQuery = { $and: [] };

        if (Prodtcategory && Prodtcategory.length > 0) {
            const categoryRegexes = Prodtcategory.map(cat => new RegExp(`^${cat}$`, "i"));
            filterQuery.$and.push({ Prodtcategory: { $in: categoryRegexes } });
        }

        if (Prodtprice && Prodtprice.length > 0) {
            const maxPrice = Number(Prodtprice[0]); // Expecting a list like [3000]
            if (!isNaN(maxPrice)) {
                filterQuery.$and.push({ Prodtprice: { $gte: 0, $lte: maxPrice } });
            }
        }

        const finalQuery = filterQuery.$and.length > 0 ? filterQuery : {};

        const products = await pd.find(finalQuery);
        res.status(200).json(products);
    } catch (err) {
        console.error("Filter Error:", err);
        res.status(500).json({ error: err.message });
    }
});

router.get("/productdet", async (req, res) => {
  try {
    const products = await pd.find();
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({
      success: false,
      
    });
  }
});

router.delete('/productdet/:Prodtname', async (req, res) => {
    try {
        const result = await pd.deleteOne({ Prodtname: req.params.Prodtname});

        if (result.deletedCount === 0) {
            return res.status(404).json({ message: 'Product not found' });
        }

        res.status(200).json({ message: 'Product deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});


module.exports = router