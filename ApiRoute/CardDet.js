const express = require('express');
const router = express.Router();
const User = require('../schema/Usersign');

router.get('/card', async (req, res) => {
  const phone = req.query.phone;

  if (!phone) {
    return res.status(400).json({ error: 'Phone number is required' });
  }

  try {
    const user = await User.findOne({ phone }).lean();

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      name: user.name,
      coins: user.coins,
      cardNumber: user.cardNumber
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
