// 啟用 express
const express = require('express');
const router = express.Router();
const pool = require('../utils/db');
const moment = require('moment');

// 日誌
// http://localhost:3001/api/workLog
router.post('/', async (req, res) => {
    let rb = req.body;
    const { minDate, maxDate, search } = req.query;
    let dateVal = minDate || maxDate ? `AND (time BETWEEN '${minDate} 00:00:00' AND '${maxDate} 23:59:59')` : '';
    try {
        let [result] = await pool.execute(`SELECT * FROM worklog WHERE staff_code=? ${dateVal} ORDER BY time DESC`, [
            rb.staff_code,
        ]);

        res.json(result);
    } catch (err) {
        console.log(err);
    }
});

// 新增日誌
router.post('/submit', async (req, res) => {
    let rb = req.body;
    let session = req.session.member;
    let nowDate = moment().format('YYYY-MM-DD HH:mm:ss');
    try {
        let [users] = await pool.execute(
            `INSERT INTO worklog (user,staff_code,unit,job_category,Job_description,create_time,time) VALUES (?,?,?,?,?,?,?)`,
            [session.name, session.staff_code, session.applicant_unit, rb.workCategory, rb.workLog, nowDate, rb.time]
        );
    } catch (err) {
        console.log(err);
    }
});
// 查看日誌
router.post('/detail', async (req, res) => {
    let rb = req.body;
    try {
        let [result] = await pool.execute(`SELECT * FROM  worklog  WHERE create_time=?`, [rb.create_time]);
        res.json(result);
    } catch (err) {
        console.log(err);
    }
});

// 匯出
module.exports = router;
