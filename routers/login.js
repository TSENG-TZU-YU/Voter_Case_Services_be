// 啟用 express
const express = require('express');
const router = express.Router();
const pool = require('../utils/db');
const argon2 = require('argon2');
const moment = require('moment');

//登入
// http://localhost:3001/api/login
router.post('/', async (req, res) => {
    try {
        let rb = req.body;
        let [users] = await pool.execute('SELECT * FROM users WHERE applicant_unit=? && staff_code=? ', [
            rb.company,
            rb.no,
        ]);
        if (users.length == 0) {
            return res.status(401).json({ message: '員編或密碼錯誤' });
        }
        let user = users[0];
        let verifyResult = await argon2.verify(user.password, rb.password);
        if (!verifyResult) {
            return res.status(401).json({ message: '員編或密碼錯誤' });
        }
        let saveUser = {
            id: user.id,
            name: user.name,
            applicant_unit: user.applicant_unit,
            staff_code: user.staff_code,
            job: user.job,
            permissions_id: user.permissions_id,
            manage: user.manage,
            handler: user.handler,
            user: user.user,
            director: user.director,
        };

        req.session.member = saveUser;

        res.json(user);
    } catch (err) {
        console.log(err);
    }
});
//登入驗證
// http://localhost:3001/api/login/auth
router.get('/auth', async (req, res) => {
    try {
        if (!req.session.member) {
            return res.status(401).json({ message: '尚未登入' });
        }

        // 更新sessiona
        let [users] = await pool.execute('SELECT * FROM users WHERE staff_code=? ', [req.session.member.staff_code]);

        let user = users[0];
        let saveUser = {
            id: user.id,
            name: user.name,
            applicant_unit: user.applicant_unit,
            staff_code: user.staff_code,
            job: user.job,
            permissions_id: user.permissions_id,
            manage: user.manage,
            handler: user.handler,
            user: user.user,
            director: user.director,
        };

        req.session.member = saveUser;
        // console.log('2', req.session);

        res.json(user);
    } catch (err) {
        console.log(err);
    }
});

//撈取單位
// http://localhost:3001/api/login/unit
router.get('/unit', async (req, res) => {
    try {
        let [unit] = await pool.execute('SELECT * FROM unit ');

        res.json(unit);
    } catch (err) {
        console.log(err);
    }
});

//稽核登入
router.post('/audit', async (req, res) => {
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

// 匯出
module.exports = router;
