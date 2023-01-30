// 啟用 express
const express = require('express');
const router = express.Router();
const pool = require('../utils/db');

// 稽核
// http://localhost:3001/api/audit
router.get('/', async (req, res) => {
    const { minDate, maxDate, search } = req.query;
    try {
        // 篩選
        let dateVal = minDate || maxDate ? `(time BETWEEN '${minDate} 00:00:00' AND '${maxDate} 23:59:59')` : '';
        let searchVal = search ? `AND (user LIKE '%${search}%' OR record LIKE '%${search}%')` : '';
        let [result] = await pool.execute(`SELECT * FROM audit_record WHERE ${dateVal} ${searchVal} ORDER BY time ASC`);
        res.json(result);
    } catch (err) {
        console.log(err);
    }
});

// 匯出
module.exports = router;
