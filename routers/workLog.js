// 啟用 express
const express = require('express');
const router = express.Router();
const pool = require('../utils/db');
const moment = require('moment');

// 工作日誌
// http://localhost:3001/api/workLog
router.get('/', async (req, res) => {
    // const { minDate, maxDate, search } = req.query;.replace(/-/g, '/');
    let nowDate = moment().format('YYYY-MM-DD HH:mm:ss');

    try {
        let [result] = await pool.execute(`SELECT * FROM workLog ORDER BY staff_code ASC`);
        let [user] = await pool.execute(`SELECT * FROM users ORDER BY staff_code ASC`);

        for (let i = 0; i < result.length; i++) {
            result[i].time = String(result[i].time).replace(/-/g, '/');
        }

        res.json({ result, user });
    } catch (err) {
        console.log(err);
    }
});

// 匯出
module.exports = router;
