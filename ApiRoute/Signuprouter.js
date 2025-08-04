const express = require('express');
const router = express.Router();
const User = require('../schema/Usersign');
const bcrypt = require('bcrypt');


// POST: Register user
router.post('/signup', async (req, res) => {
  const { name, phone, email, password, confirmpassword } = req.body;

  // Basic validation
  if (!name || !phone || !email || !password || !confirmpassword) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  if (password !== confirmpassword) {
    return res.status(400).json({ error: 'Passwords do not match' });
  }

  try {
    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ email }, { phone }] });
    if (existingUser) {
      return res.status(409).json({ error: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
const cardNumber = Math.floor(1000000000000000 + Math.random() * 9000000000000000).toString(); 
    // Save user
    const newUser = new User({
      useid: phone + Math.floor(Math.random() * 1000).toString(),
      name,
      phone,
      email,
      password: hashedPassword,
      coins: 0, 
      cardNumber: cardNumber, 
    });

    await newUser.save();

    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    console.error('Error saving user:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
