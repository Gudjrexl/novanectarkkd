const express = require('express');
const router = express.Router();
const Category = require('../schema/Category');
const multer = require('multer');
const path = require('path');
const fs = require('fs');



const storage = multer.diskStorage({
    destination: function(req,fl,cb){
        const directory = path.join(__dirname, "..", "Categoryimage");
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

const Catogryimg = multer({storage});

router.post("/category", Catogryimg.single("ctimg"), async(req,res)=>{
    try {
        if (!req.file) return res.status(400).json({ error: "No file uploaded" });

        const { name } = req.body;
        const ctimg = `/Categoryimage/${req.file.filename}`;

        const newCategory = new Category({
            name,
            ctimg
        });

        await newCategory.save();
        res.status(201).json({ success: true });
    } catch (error) {
        console.error("Server error:", error);
        res.status(500).json({ success: false, error: error.message });
    }
} );

router.get("/category", async (req, res) => {
    try {
        const categories = await Category.find();
        res.status(200).json(categories);
    } catch (error) {
        console.error("Error fetching categories:", error);
        res.status(500).json({ success: false, error: error.message });
    }
});

router.delete("/category/:name", async (req, res) => {
    try {
        const { name } = req.params;
        const category = await Category.findOneAndDelete({ name });
        if (!category) {
            return res.status(404).json({ success: false, message: "Category not found" });
        }
       
            res.status(200).json({ success: true });
    } catch (error) {
        console.error("Error deleting category:", error);
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;

