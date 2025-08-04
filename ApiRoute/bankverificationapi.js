const express = require('express');
const router = express.Router();
const BankDetails = require('../schema/BankSchema');
const NovanectorProfile = require('../schema/ProfileSchema');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = 'passbookuploads';
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir); 
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueName = Date.now() + '-' + file.originalname;
        cb(null, uniqueName);
    }

});

const upload = multer({ storage: storage });


router.post('/bankverification', async (req, res) => {
    try {
        const {
            BankHolderName,
            BankName,
            BankAccount,
            ifsc,
            passbookimg,
            contactno
        } = req.body;


       

        const bankData = new BankDetails({
            BankHolderName,
            BankName,
            BankAccount,
            ifsc,
            passbookimg,
            contactno
        });
        await bankData.save();

        const existingProfile = await NovanectorProfile.findOne({ contactno: contactno });
         if (!existingProfile) {
            return res.status(404).json({ error: "User not found in NovanectorProfile. Cannot update bank details." });
        }
 existingProfile.BankHolderName = BankHolderName;
        existingProfile.BankName = BankName;
        existingProfile.BankAccount = BankAccount;
        existingProfile.ifsc = ifsc;
        await existingProfile.save();

        res.status(201).json({
            message: 'Bank details created and profile updated successfully',

        });

    } catch (error) {
        console.error("POST /bankverification error:", error);
        res.status(400).json({ error: 'Error saving bank details', details: error.message });
    }
});

router.put('/bankverification/:contactno', upload.single('imageFile'), async (req, res) => {
    try {
        const contactno = req.params.contactno;

        if (!req.file) {
            return res.status(400).json({ error: 'No image file uploaded' });
        }

        const imagePath = req.file.path;

        const existingBank = await BankDetails.findOne({ contactno: contactno });

        if (!existingBank || !existingProfile) {
            return res.status(404).json({ error: 'User not found. Cannot update image.' });
        }

        await BankDetails.updateOne(
            { contactno: contactno },
            { passbookimg: imagePath }
        );


        res.status(200).json({ message: 'Passbook image updated successfully' });

    } catch (error) {
        console.error('PUT /bankverification error:', error);
        res.status(500).json({ error: 'Server error during file upload' });
    }
});

module.exports = router;