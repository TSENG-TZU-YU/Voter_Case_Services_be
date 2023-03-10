// 啟用 express
const express = require('express');
const router = express.Router();
const pool = require('../utils/db');
const authMid = require('../middlewares/auth');

//登出
// http://localhost:3001/api/logout
router.get('/', authMid.checkLogin, authMid.all, async (req, res) => {
    try {
        req.session.member = null;
        res.json({ message: '已登出' });
    } catch (err) {
        console.log(err);
    }
});

// 匯出
module.exports = router;
