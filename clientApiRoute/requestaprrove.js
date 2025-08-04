const express = require('express');
const router = express.Router();
const User = require('../schema/Usersign'); 
const transactionSchema = require('../schema/transactionschema'); 
const checkCoinSchema = require('../schema/checkcoin');
const clientaprove = require('../schema/clientaproveSchema');
const app = express();
app.use(express.json());

router.get('/requestapprove', async (req, res) => {
    try {
        const requests = await clientaprove.find({ status: 'pending' });
        const formattedRequests = requests.map(request => ({
            requestid: request.requestid,
            contactcno: request.contactcno,
            profilepic: request.profilepic, 
            coinusername: request.coinusername,
            reason: request.reason,
            coindate: request.coindate,
            coins: request.coins,
            status: request.status
            }));

       
        res.status(200).json(formattedRequests);
    } catch (error) {
        console.error('Error fetching requests:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

router.put('/approve', async (req, res) => {
    const { requestId,contactcno,coins, status } = req.body;

    if (!requestId) {
        return res.status(400).json({ message: 'Request ID is required' });
    }

    try {
const request = await clientaprove.findOne({ requestid: requestId });

        if (!request) {
            return res.status(404).json({ message: 'Request not found' });
        }

        request.status = status;
        if (status === 'approved') {
        
        await request.save();
        const user = await User.findOne({ phone: contactcno });
         user.coins -= coins;
    await user.save();
    await new transactionSchema({
        userid: user.userid,
        username: user.name,
      contactcno: contactcno,
      coins: coins,
      typetransaction: 'deduct',
      itemexp: 'paint'
    }).save();

        res.status(200).json({ message: 'Request approved successfully' });}


        if (status === 'rejected') {
            request.status = 'rejected';
            await request.save();
            res.status(200).json({ message: 'Request rejected successfully' });
        }
    } catch (error) {
        console.error('Error approving request:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

module.exports = router;