// 啟用 express
const express = require('express');
const router = express.Router();
const pool = require('../utils/db');


// 案件來源
// http://localhost:3001/api/audit
router.get('/', async (req, res) => {
    let [result] = await pool.execute(`SELECT * FROM audit_record`);
    res.json(result);
});


// 匯出
module.exports = router;