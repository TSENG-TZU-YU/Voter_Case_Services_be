// 啟用 express
const express = require('express');
const router = express.Router();
const pool = require('../utils/db');

// 處理人
// http://localhost:3001/api/application_get/handler
router.get('/handler', async (req, res) => {
    let [result] = await pool.execute(`SELECT * FROM handler`);
    res.json(result);
});

// 申請表類別
// http://localhost:3001/api/application_get/category
router.get('/category', async (req, res) => {
    let [result] = await pool.execute(`SELECT * FROM application_category`);
    res.json(result);
});

// 週期
// http://localhost:3001/api/application_get/cycle
router.get('/cycle', async (req, res) => {
    let [result] = await pool.execute(`SELECT * FROM cycle`);
    res.json(result);
});

// 匯出
module.exports = router;
