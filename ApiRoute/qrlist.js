const express = require('express');
const router = express.Router();
const CheckCoin = require('../schema/checkcoin');

router.post('/addqrcode', async (req, res) => {
  const { scanQRCode } = req.body;

  if (!scanQRCode) {
    return res.status(400).json({ message: 'QR code is required.' });
  }

  try {
    const exists = await CheckCoin.findOne({ scanQRCode });
    if (exists) {
      return res.status(409).json({ message: 'QR code already exists.' });
    }

    const newCode = new CheckCoin({ scanQRCode });
    await newCode.save();

    return res.status(201).json({ message: 'QR code saved successfully.' });
  } catch (error) {
    console.error('Error saving QR code:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
