// 啟用 express
const express = require('express');
const router = express.Router();
const pool = require('../utils/db');
const moment = require('moment');
const authMid = require('../middlewares/auth');

// 工作日誌
// http://localhost:3001/api/workLog
router.get('/', authMid.checkLogin, authMid.manage, async (req, res) => {
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
router.post('/viewWorkLog', authMid.checkLogin, authMid.manage, async (req, res) => {
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
router.post('/', authMid.checkLogin, authMid.handler, async (req, res) => {
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
router.post('/submit', authMid.checkLogin, authMid.handler, async (req, res) => {
    let rb = req.body;
    let arr = req.body.AllData;
    try {
        for (let data of arr) {
            let [users] = await pool.execute(
                `UPDATE worklog SET Job_description=? WHERE staff_code=? && unit=? && time=?`,
                [data.Job_description, data.staff_code, data.unit, data.time]
            );
        }
    } catch (err) {
        console.log(err);
    }
});
// 查看日誌
router.post('/detail', authMid.checkLogin, authMid.handler, async (req, res) => {
    let rb = req.body;
    try {
        let [result] = await pool.execute(
            `SELECT * FROM  worklog  WHERE time=? && staff_code=? && id=? ORDER BY time DESC`,
            [rb.create_time, rb.staff_code, rb.id]
        );
        res.json(result);
    } catch (err) {
        console.log(err);
    }
});

// 匯出
module.exports = router;
