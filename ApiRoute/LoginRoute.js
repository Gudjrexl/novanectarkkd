const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const User = require('../schema/Usersign');

router.post('/login', async (req, res) => {
    const { uniqueid, password } = req.body;

    if (!uniqueid || !password) {
        return res.status(400).json({ message: "All fields are required" });
    }

    try {
        // Find by email or phone
        const user = await User.findOne({
            $or: [{ email: uniqueid }, { phone: uniqueid }]
        });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Compare password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid password" });
        }

        // Send login success with user data
        res.json({
            message: "Login successful",
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone
            }
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
});

module.exports = router;
