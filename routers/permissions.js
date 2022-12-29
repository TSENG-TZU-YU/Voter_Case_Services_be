const express = require('express');
const router = express.Router();
const pool = require('../utils/db');

//單位  http://localhost:3001/api/permissions/category
router.get('/category', async (req, res) => {
    try {
        let [result] = await pool.execute('SELECT * FROM unit');
        res.json(result);
    } catch (err) {
        console.log(err);
    }
});

//使用者  http://localhost:3001/api/permissions/user
router.get('/user', async (req, res) => {
    try {
        let [result] = await pool.execute('SELECT * FROM users');
        res.json(result);
    } catch (err) {
        console.log(err);
    }
});

//權限  http://localhost:3001/api/permissions/allPermissionsData
router.get('/allPermissionsData', async (req, res) => {
    try {
        let [result] = await pool.execute('SELECT * FROM users WHERE director=? || handler=?', [1, 1]);
        res.json(result);
    } catch (err) {
        console.log(err);
    }
});

//送出修改 http://localhost:3001/api/permissions
router.patch('/', async (req, res) => {
    try {
        let [result] = await pool.execute('SELECT * FROM users');
        res.json(result);
    } catch (err) {
        console.log(err);
    }
});

// 匯出
module.exports = router;
