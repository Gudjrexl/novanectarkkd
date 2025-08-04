const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const router = express.Router();
const offrpd = require("../schema/OfferSchema");

const storage = multer.diskStorage({
    destination: function(req,fl,cb){
        const directory = path.join(__dirname, "..", "offerimage");
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

const offerimg = multer({storage});

router.post("/offerlist", offerimg.single("oimage"), async(req,res)=>{
    try {
            if (!req.file) return res.status(400).json({ error: "No file uploaded" });

        const{offername, offerdescription, offerprice, } = req.body;
        const offerimg = req.file ? `/offerimg/${req.file.filename}` : null;
        const newProdt = new offrpd({
           
            offername,
            offerdescription,
            offerprice,
            Offerimg: offerimg
            
        });

        await newProdt.save();
        res.status(201).json({success:true});
    } catch (error) {
        res.status(500).json({success: false, error: error.message});
    }
})

router.get("/offerlist", async (req, res) => {
  try {
    const products = await offrpd.find();
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({
      success: false,
      
    });
  }
});

router.delete('/offerlist/:offername', async (req, res) => {
    try {
        const result = await offrpd.deleteOne({ offername: req.params.offername});

        if (result.deletedCount === 0) {
            return res.status(404).json({ message: 'Product not found' });
        }

        res.status(200).json({ message: 'Product deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

module.exports = router;