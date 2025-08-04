const express = require('express');
const router = express.Router();
const Profile = require('../schema/ProfileSchema');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = 'profilepic';
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

router.post('/profiledata', async (req, res) => {
    try {
        const profileData = new Profile(req.body);
        await profileData.save();
        res.status(201).json({ message: 'Profile created successfully', profile: profileData });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});



router.patch('/profiledata/:contactno', async (req, res) => {
    try {
        const {contactno} = req.params;
        const updatedProfile = await Profile.findOneAndUpdate(
            { contactno: contactno },
            { $set: req.body },
            { new: true }
        );
        if (!updatedProfile) {
            return res.status(404).json({ message: 'Profile not found' });
        }
        res.status(200).json({ message: 'Profile updated successfully', profile: updatedProfile });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/profiledata/:contactno', async (req, res) => {
            const {contactno} = req.params;

    try {
        const profiles = await Profile.findOne({contactno: contactno});
        if (!profiles) {
            return res.status(404).json({ message: 'Profile not found' });
        }
        res.status(200).json(profiles);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});



router.put('/profiledata/:contactno', upload.single('image'), async (req, res) => {
    try {
        const contactno = req.params.contactno;
        const ProfilePic = req.file ? req.file.filename : null;

        if (!ProfilePic) {
            return res.status(400).json({ message: "No image uploaded" });
        }

        const user = await Profile.findOne({ contactno: contactno });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (user.ProfilePic) {
            const oldPath = path.join(__dirname, '../profilepic', user.ProfilePic);
            if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
        }

        user.ProfilePic = ProfilePic;

        await user.save();

        res.status(200).json({ message: "Image updated successfully" });
    } catch (err) {
        res.status(500).json({ message: "Server error", error: err.message });
    }
});

router.get('/profiledet', async (req, res) => {
    try {
        const profiledet = await Profile.find();
        const formattedProfiles = profiledet.map(profile => ({
            imageurl: profile.ProfilePic,
            Username: profile.uname,
            contactno: profile.contactno
        }));
        res.status(200).json(formattedProfiles);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
})
module.exports = router;