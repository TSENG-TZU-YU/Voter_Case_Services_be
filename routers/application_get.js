// 啟用 express
const express = require('express');
const router = express.Router();
const pool = require('../utils/db');
const authMid = require('../middlewares/auth');

// 處理人
// http://localhost:3001/api/application_get/handler
router.post('/handler', authMid.checkLogin, authMid.handler, async (req, res) => {
    try {
        let v = req.body;
        if (v.unit === '') {
            v.unit = req.session.member.applicant_unit;
        } else {
            v.unit = v.unit;
        }
        let [result] = await pool.execute(`SELECT * FROM users WHERE applicant_unit=? && handler=?`, [v.unit, 1]);
        res.json(result);
    } catch (err) {
        console.log('單位錯誤', err);
    }
});

// 案件來源
// http://localhost:3001/api/application_get/source
router.get('/source', authMid.checkLogin, authMid.handler, async (req, res) => {
    let [result] = await pool.execute(`SELECT * FROM application_source`);
    res.json(result);
});
// 案件類別
// http://localhost:3001/api/application_get/category
router.get('/category', authMid.checkLogin, async (req, res) => {
    let [result] = await pool.execute(`SELECT * FROM application_category`);
    res.json(result);
});
// 週期
// http://localhost:3001/api/application_get/cycle
// router.get('/cycle', async (req, res) => {
//     let [result] = await pool.execute(`SELECT * FROM cycle`);
//     res.json(result);
// });

// 單位
// http://localhost:3001/api/application_get/unit
router.get('/unit', authMid.checkLogin, authMid.handler, async (req, res) => {
    try {
        let [result] = await pool.execute(`SELECT * FROM unit`);
        res.json(result);
    } catch (err) {
        console.log(err);
    }
});

// 縣市
// http://localhost:3001/api/application_get/county
router.get('/county', authMid.checkLogin, authMid.handler, async (req, res) => {
    let [result] = await pool.execute(`SELECT * FROM county`);
    res.json(result);
});

// 區
// http://localhost:3001/api/application_get/area
router.post('/area', authMid.checkLogin, authMid.handler, async (req, res) => {
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
router.post('/rimin', authMid.checkLogin, authMid.handler, async (req, res) => {
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
