// 啟用 express
const express = require('express');
const router = express.Router();
const pool = require('../utils/db');
const moment = require('moment');

// 工作日誌
// http://localhost:3001/api/workLog
router.get('/', async (req, res) => {
    const { unit } = req.query;
    let unitVal = unit ? `WHERE applicant_unit = '${unit}'` : '';

    try {
        let [result] = await pool.execute(`SELECT * FROM worklog ORDER BY staff_code ASC`);
        let [user] = await pool.execute(`SELECT * FROM users ${unitVal} ORDER BY staff_code ASC`);

        for (let i = 0; i < result.length; i++) {
            result[i].time = String(result[i].time).replace(/-/g, '/');
        }

        // all申請單位
        [unitResult] = await pool.execute(`SELECT * FROM unit`);

        res.json({ result, user, unitResult });
    } catch (err) {
        console.log(err);
    }
});

// 查看詳細日誌內容
router.post('/viewWorkLog', async (req, res) => {
    let v = req.body;
    try {
        let [result] = await pool.execute(`SELECT * FROM  worklog  WHERE time=? AND staff_code=?`, [v.time, v.code]);
        res.json(result);
    } catch (err) {
        console.log(err);
    }
});

// 日誌
// http://localhost:3001/api/workLog
router.post('/', async (req, res) => {
    let rb = req.body;
    const { minDate, maxDate } = req.query;
    let session = req.session.member;
    let dateVal = minDate || maxDate ? `AND (time BETWEEN '${minDate} 00:00:00' AND '${maxDate} 23:59:59')` : '';
    let arr = req.body.sortAllDate;
    try {
        for (let data of arr) {
            let [checkData] = await pool.execute(`SELECT * FROM worklog  WHERE staff_code = ? && time=?`, [
                rb.staff_code,
                data,
            ]);
            if (checkData.length === 0) {
                let [date] = await pool.execute(`INSERT INTO worklog (user,staff_code,unit,time) VALUES (?,?,?,?) `, [
                    session.name,
                    rb.staff_code,
                    session.applicant_unit,
                    data,
                ]);
            }
        }
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
    try {
        let [users] = await pool.execute(
            `UPDATE worklog SET  Job_description=? WHERE staff_code=? && unit=? && time=?`,
            [rb.workLog, session.staff_code, session.applicant_unit, rb.time]
        );
    } catch (err) {
        console.log(err);
    }
});
// 查看日誌
router.post('/detail', async (req, res) => {
    let rb = req.body;
    try {
        let [result] = await pool.execute(`SELECT * FROM  worklog  WHERE time=? && staff_code=?`, [
            rb.create_time,
            rb.staff_code,
        ]);
        res.json(result);
    } catch (err) {
        console.log(err);
    }
});

// 匯出
module.exports = router;
