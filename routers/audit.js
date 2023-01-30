// 啟用 express
const express = require('express');
const router = express.Router();
const pool = require('../utils/db');

// 案件來源
// http://localhost:3001/api/audit
router.get('/', async (req, res) => {
    const { search } = req.query;
    console.log('object', req.query);
    let searchVal = search ? `AND (user LIKE '%${search}%' OR record LIKE '%${search}%')` : '';
    let [result] = await pool.execute(`SELECT * FROM audit_record ${searchVal}`);
    res.json(result);
});

// 匯出
module.exports = router;
