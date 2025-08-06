const express = require('express');
const router = express.Router();
const User = require('../schema/Usersign'); 
const { Parser } = require('json2csv');
const path = require("path");
const fs = require("fs"); 
const NovaNectorProfile = require("../schema/ProfileSchema")
const transactionSchema = require('../schema/transactionschema'); 
const coinDetails = require('../schema/cointansdetails');
const clientaprove = require('../schema/clientaproveSchema');
const app = express();
app.use(express.json());

router.get('/download', async (req, res) => {
  try {
    const transactions = await transactionSchema.find().sort({ date: -1 });

    if (!transactions || transactions.length === 0) {
      return res.status(404).json({ message: 'No transactions found to download' });
    }

    const fields = ['userid', 'username', 'contactcno', 'itemexp', 'typetransaction', 'coins', 'date'];
    const json2csvParser = new Parser({ fields });
    const csv = json2csvParser.parse(transactions);

    const fileName = `transactions_${Date.now()}.csv`;
    const filePath = path.join(__dirname, '..', 'temp', fileName);

    fs.mkdirSync(path.dirname(filePath), { recursive: true });

    fs.writeFileSync(filePath, csv);

    res.download(filePath, fileName, (err) => {
      if (err) {
        console.error('Error sending file:', err);
      }

      fs.unlink(filePath, () => {});
    });
  } catch (error) {
    console.error('Error downloading transactions:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.post('/deduct', async (req, res) => {
  const { contactcno, coins, reason } = req.body;

  if (!contactcno || !coins) {
    return res.status(400).json({ message: 'Missing contactcno or coin' });
  }

  try {
    const user = await User.findOne({ phone: contactcno });
    const profile = await NovaNectorProfile.findOne({ phone: contactcno });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.coins < coins) {
      return res.status(400).json({ message: 'Insufficient coins' });
    }

    const withreq = new clientaprove({
      requestid: Date.now().toString() + Math.floor(Math.random() * 1000).toString(),
      contactcno: contactcno,
      profilepic: profile?.profilepic || "", 
      coinusername: user.name,
      reason: reason,
      coindate: new Date().toISOString().split('T')[0],
      coins: coins,
      status: 'pending',
    });

    await withreq.save();

    return res.status(200).json({
      requestid: withreq.requestid,
      coinusername: user.name,
      coindate: withreq.coindate,
      coins: coins
    });
  } catch (error) {
    console.error('Coin deduction error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});


router.post('/credit', async (req, res) => {
  const { contactcno, coins, scanQRCodes } = req.body;

  if (!contactcno || !coins || !scanQRCodes) {
    return res.status(400).json({ message: 'Missing contactcno or coins or scanQRCodes' });
  }

  try {
  const detailscoinuser = await coinDetails.findOne({ coincode: scanQRCodes });
    if (detailscoinuser) {
      return res.status(400).json({
        coinusername: detailscoinuser.coinusername,
        coindate: detailscoinuser.coindate,
        creditcoininacount: false
      });

      
    }

    else{
const user = await User.findOne({ phone: contactcno });
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      user.coins += coins;
      await user.save();

      await new transactionSchema({
userid: user.userid,
        username: user.name,
        contactcno,
        coins,
        typetransaction: 'credit',
        itemexp: scanQRCodes,
      }).save();

      await new coinDetails({
        coinusername: user.name,
        coincode: scanQRCodes,
        coindate: new Date().toISOString().split('T')[0],
      }).save();


      return res.status(200).json({
        coinusername: user.name,
        coindate: new Date().toISOString().split('T')[0],
        creditcoininacount: true
      });
    }
   
    

  } catch (error) {
    console.error('Coin credit error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});


router.get('/transactions/:contactcno', async (req, res) => {
  try {
    const transactions = await transactionSchema.find({ contactcno: req.params.contactcno }).sort({ date: -1 });
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: 'Failed to retrieve transactions' });
  }
});

router.get("/transaction", async (req, res) => {
  try {
    const transactions = await transactionSchema.find().sort({ date: -1 }).limit(20);
  if (transactions.length === 0) {
      return res.status(404).json({ message: 'No transactions found' });
    }
    res.status(200).json(transactions);
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
})

module.exports = router;