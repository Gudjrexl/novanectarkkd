const express = require('express');
const router = express.Router();
const KycAdpa = require('../schema/kycadpa');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const NovanectorProfile = require('../schema/ProfileSchema');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        let folder = 'Kycimage';
        if (file.fieldname === 'adharimg') folder = 'Kycimagea';
        if (file.fieldname === 'panimg') folder = 'Kycimagep';

        const absPath = path.join(__dirname, folder);
        if (!fs.existsSync(absPath)) fs.mkdirSync(absPath, { recursive: true });

        cb(null, absPath);
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});


const upload = multer({ storage: storage });

router.post('/kycadpan',async (req, res) => {
    try{
        const vycdata = new KycAdpa(req.body);
        await vycdata.save();
        res.status(200).json({message: "Data saved successfully"});

    }catch (error) {
        res.status(500).json({error: error.message});
    }
})



router.put('/kycadpan/adhar/:contactno',upload.single('adharimg'), async (req, res) => {
    try {
        const contactno = req.params.contactno;
     const adharimg = req.file ? req.file.filename : null;
     if (!adharimg) {
            return res.status(400).json({ error: 'Adhar image is required' });
        }
    const adhrdet = await KycAdpa.findOne({contactno: contactno});
        if (!adhrdet) {
            return res.status(404).json({ error: 'KYC data not found' });
        }

        if(adhrdet.adharimg) {
            const oldImagePath = path.join(__dirname, '../Kycimagea', adhrdet.adharimg);
            if (fs.existsSync(oldImagePath)) {
                fs.unlinkSync(oldImagePath);
            }
        }
        
        adhrdet.adharimg = adharimg;
        await adhrdet.save();
 await NovanectorProfile.updateOne(
            { contactno: contactno },
            { $set: { AadharCardVerify: "pending" } }
        );

        res.status(200).json({ message: 'KYC data updated successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
    
router.put('/kycadpan/pan/:contactno', upload.single('panimg'), async (req, res) => {
    try {
        const contactno = req.params.contactno;
        const panimg = req.file ? req.file.filename : null;

        if (!panimg) {
            return res.status(400).json({ error: 'PAN image is required' });
        }

        const kycRecord = await KycAdpa.findOne({ contactno: contactno });

        if (!kycRecord) {
            return res.status(404).json({ error: 'KYC data not found' });
        }

        if (kycRecord.panimg) {
            const oldPanPath = path.join(__dirname, '../Kycimagep', kycRecord.panimg);
            if (fs.existsSync(oldPanPath)) {
                fs.unlinkSync(oldPanPath);
            }
        }

        kycRecord.panimg = panimg;
        await kycRecord.save();

         await NovanectorProfile.updateOne(
            { contactno: contactno },
            { $set: { PanCardVerify: "pending" } }
        );

        res.status(200).json({ message: 'PAN image updated successfully', data: kycRecord });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
});

router.get('/kycpending', async (req, res) => {
    try {
        const pendingKyc = await NovanectorProfile.find({
            $or: [
                { AadharCardVerify: "pending" },
                { PanCardVerify: "pending" }
            ]
        });

        if (pendingKyc.length === 0) {
            return res.status(404).json({ message: 'No pending KYC records found' });
        }
 const formattedProfiles = pendingKyc.map(profile => ({
            imageurl: profile.ProfilePic,
            Username: profile.uname,
            contactno: profile.contactno
        }));
        res.status(200).json(formattedProfiles);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
});

router.get('/kycadpan/:contactno', async (req, res) => {
    try {
        const contactno = req.params.contactno;

        const kycData = await KycAdpa.findOne({ contactno: contactno });
        if (!kycData) {
            return res.status(404).json({ message: 'No KYC data found for the given contact number' });
        }
      const formattedData = {
    contactno: kycData.contactno,
    adharno: kycData.adharno,
    Panno: kycData.Panno,
    adharimg: kycData.adharimg,
    panimg: kycData.panimg
};

        res.status(200).json(formattedData);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: error.message });
        }
});

router.put('/kycadpanstatus/:contactno', async (req, res) => {
    try {
        const contactno = req.params.contactno;
        const { kycstatus } = req.body; // expecting: { kycstatus: "accepted" }

        const result = await NovanectorProfile.updateOne(
            { contactno: contactno },
            { 
                $set: { 
                    AadharCardVerify: kycstatus,
                    PanCardVerify: kycstatus
                } 
            }
        );

        res.status(200).json({ 
            message: 'KYC data updated successfully', 
            modifiedCount: result.modifiedCount 
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
});


module.exports = router;