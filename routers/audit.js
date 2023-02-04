// 啟用 express
const express = require('express');
const router = express.Router();
const pool = require('../utils/db');
const moment = require('moment');
const authMid = require('../middlewares/auth');

// 稽核
// http://localhost:3001/api/audit
router.get('/',authMid.checkLogin, async (req, res) => {
    const { minDate, maxDate, search } = req.query;
    try {
        // 篩選
        let dateVal = minDate || maxDate ? `(time BETWEEN '${minDate} 00:00:00' AND '${maxDate} 23:59:59')` : '';
        let searchVal = search ? `AND (user LIKE '%${search}%' OR record LIKE '%${search}%')` : '';
        let [result] = await pool.execute(
            `SELECT * FROM audit_record WHERE ${dateVal} ${searchVal} ORDER BY time DESC`
        );
        res.json(result);
    } catch (err) {
        console.log(err);
    }
});

//稽核登入
router.post('/login',authMid.checkLogin, async (req, res) => {
    let nowDate = moment().format('YYYY-MM-DD HH:mm:ss');
    let rb = req.body;
    try {
        let [users] = await pool.execute(`INSERT INTO audit_record (user,record,time) VALUES (?,?,?)`, [
            rb.no,
            '登入',
            nowDate,
        ]);
    } catch (err) {
        console.log(err);
    }
});

//稽核登入錯誤
router.post('/login/err',authMid.checkLogin, async (req, res) => {
    let nowDate = moment().format('YYYY-MM-DD HH:mm:ss');
    let rb = req.body;
    try {
        let [checkData] = await pool.execute(`SELECT * FROM users  WHERE staff_code = ? `, [rb.no]);
        if (checkData.length !== 0 && checkData[0].isLock < 4) {
            let [users] = await pool.execute(`INSERT INTO audit_record (user,record,time) VALUES (?,?,?)`, [
                rb.no,
                '登入密碼錯誤',
                nowDate,
            ]);
        }
        if (checkData.length !== 0 && checkData[0].isLock === 4) {
            let [users] = await pool.execute(`INSERT INTO audit_record (user,record,time) VALUES (?,?,?)`, [
                rb.no,
                '帳號已鎖住，請聯絡管理員處理',
                nowDate,
            ]);
        }
    } catch (err) {
        console.log(err);
    }
});

//稽核案件新增
router.post('/appSubmit',authMid.checkLogin, async (req, res) => {
    let rb = req.body;
    try {
        let [result] = await pool.execute(`INSERT INTO audit_record (user,record,time) VALUES (?,?,?)`, [
            rb.user,
            '新增選民服務案件' + rb.number,
            rb.create_time,
        ]);
        res.json(result);
    } catch (err) {
        console.log(err);
    }
});

// 匯出
module.exports = router;
