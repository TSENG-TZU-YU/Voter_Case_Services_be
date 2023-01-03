// 啟用 express
const express = require('express');
const router = express.Router();
const pool = require('../utils/db');

// 處理人
// http://localhost:3001/api/application_get/handler
router.post('/handler', async (req, res) => {
    let v = req.body;
    if (v.unit === '') {
        v.unit = req.session.member.applicant_unit;
    } else {
        v.unit = v.unit;
    }
    let [result] = await pool.execute(`SELECT * FROM users WHERE applicant_unit=? && handler=?`, [v.unit, 1]);
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

// 單位
// http://localhost:3001/api/application_get/unit
router.get('/unit', async (req, res) => {
    let [result] = await pool.execute(`SELECT * FROM unit`);
    res.json(result);
});

// 縣市
// http://localhost:3001/api/application_get/county
router.get('/county', async (req, res) => {
    let [result] = await pool.execute(`SELECT * FROM county`);
    res.json(result);
});

// 區
// http://localhost:3001/api/application_get/area
router.post('/area', async (req, res) => {
    let v = req.body;
    let [county] = await pool.execute(`SELECT * FROM county`);
    let [nemData] = county.filter((d) => {
        return d.name === v.area;
    });
    try {
        let [result] = await pool.execute(`SELECT * FROM area WHERE county_id=?`, [nemData.id]);

        res.json(result);
    } catch (err) {
        console.log(err);
    }
});

// 里
// http://localhost:3001/api/application_get/rimin
router.post('/rimin', async (req, res) => {
    let v = req.body;
    let [county] = await pool.execute(`SELECT * FROM area`);
    let [nemData] = county.filter((d) => {
        return d.name === v.rimin;
    });
    try {
        let [result] = await pool.execute(`SELECT * FROM litigant_rimin WHERE area_id=?`, [nemData.id]);

        res.json(result);
    } catch (err) {
        console.log(err);
    }
});

// 匯出
module.exports = router;
