const userid = 'gudjrexl';
const password = '123456';

const express = require('express');
const router = express.Router();

router.post('/login', (req, res) => {
    const { userId, pass } = req.body;
    
    if (userId === userid && pass === password) {
        res.status(200).json({sucess: true });
    } else {
        res.status(401).json({ sucess: false });
    }
})
module.exports = router;
