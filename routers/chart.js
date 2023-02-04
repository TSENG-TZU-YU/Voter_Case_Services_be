const express = require('express');
const router = express.Router();
const pool = require('../utils/db');
const moment = require('moment');
const authMid = require('../middlewares/auth');

// CategoryPage
// http://localhost:3001/api/chart/CategoryPage
router.get('/CategoryPage',authMid.checkLogin, async (req, res) => {
    const { minDate, maxDate } = req.query;
    let dateVal =
        minDate || maxDate ? `AND (f.create_time BETWEEN '${minDate} 00:00:00' AND '${maxDate} 23:59:59')` : '';
    let [result] = await pool.execute(`SELECT  a.*,COUNT(f.application_category) value 
    FROM application_category a 
    LEFT JOIN application_form f ON a.name = f.application_category AND f.status_id NOT IN (1) ${dateVal} 
    GROUP BY a.name
    ORDER BY a.id ASC`);
    res.json(result);
});

// StatusPage
// http://localhost:3001/api/chart/StatusPage
router.get('/StatusPage',authMid.checkLogin, async (req, res) => {
    const { minDate, maxDate } = req.query;
    let dateVal =
        minDate || maxDate ? `AND (f.create_time BETWEEN '${minDate} 00:00:00' AND '${maxDate} 23:59:59')` : '';
    let [result] = await pool.execute(`SELECT  s.*,COUNT(f.status_id) value 
    FROM status s 
    LEFT JOIN application_form f ON s.id = f.status_id AND f.status_id NOT IN (1) ${dateVal} 
    GROUP BY s.name
    ORDER BY s.id ASC`);
    res.json(result);
});

// appUnitPage
// http://localhost:3001/api/chart/appUnitPage
router.get('/appUnitPage',authMid.checkLogin, async (req, res) => {
    const { minDate, maxDate } = req.query;
    let dateVal =
        minDate || maxDate ? `AND (f.create_time BETWEEN '${minDate} 00:00:00' AND '${maxDate} 23:59:59')` : '';
    let [result] = await pool.execute(`SELECT  u.*,COUNT(f.unit) value 
    FROM unit u
    LEFT JOIN application_form f ON u.name = f.unit AND f.status_id NOT IN (1) ${dateVal} 
    GROUP BY u.name
    ORDER BY u.id ASC`);
    res.json(result);
});

// appUserPage
// http://localhost:3001/api/chart/appUserPage
router.get('/appUserPage',authMid.checkLogin, async (req, res) => {
    const { minDate, maxDate } = req.query;
    let dateVal =
        minDate || maxDate ? `AND (f.create_time BETWEEN '${minDate} 00:00:00' AND '${maxDate} 23:59:59')` : '';
    let [result] = await pool.execute(`SELECT  u.id,u.name,COUNT(f.user) value 
    FROM users u
    LEFT JOIN application_form f ON u.id = f.user_id AND f.status_id NOT IN (1)  ${dateVal} 
    GROUP BY u.id
    ORDER BY u.id ASC`);
    res.json(result);
});

// handlerUnitPage
// http://localhost:3001/api/chart/handlerUnitPage
router.get('/handlerUnitPage',authMid.checkLogin, async (req, res) => {
    const { minDate, maxDate } = req.query;
    let dateVal =
        minDate || maxDate ? `AND (f.create_time BETWEEN '${minDate} 00:00:00' AND '${maxDate} 23:59:59')` : '';
    let [result] = await pool.execute(`SELECT  u.*,COUNT(f.unit) value 
    FROM unit u
    LEFT JOIN application_form f ON u.name = f.unit AND f.status_id NOT IN (1) ${dateVal} 
    GROUP BY u.name
    ORDER BY u.id ASC`);
    res.json(result);
});

// handlerUserPage
// http://localhost:3001/api/chart/handlerUserPage
router.get('/handlerUserPage',authMid.checkLogin, async (req, res) => {
    const { minDate, maxDate } = req.query;
    let dateVal =
        minDate || maxDate ? `AND (f.create_time BETWEEN '${minDate} 00:00:00' AND '${maxDate} 23:59:59')` : '';
    let [result] = await pool.execute(`SELECT  u.id,u.name,COUNT(f.handler) value 
    FROM users u
    LEFT JOIN application_form f ON u.name = f.handler AND f.status_id NOT IN (1) AND f.user_id!='' ${dateVal}
    GROUP BY u.name
    ORDER BY u.id ASC`);
    res.json(result);
});

module.exports = router;
