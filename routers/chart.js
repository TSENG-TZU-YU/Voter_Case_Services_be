const express = require('express');
const router = express.Router();
const pool = require('../utils/db');
const moment = require('moment');

// SimpleBarChart
// http://localhost:3001/api/chart/simpleBarChart
router.get('/simpleBarChart', async (req, res) => {
    const { minDate, maxDate } = req.query;
    let dateVal =
        minDate || maxDate ? `AND (f.create_time BETWEEN '${minDate} 00:00:00' AND '${maxDate} 23:59:59')` : '';
    let [result] = await pool.execute(`SELECT  a.*,COUNT(f.application_category) category 
    FROM application_category a 
    LEFT JOIN application_form f ON a.name = f.application_category AND f.status_id NOT IN (1) ${dateVal} 
    GROUP BY a.name
    ORDER BY a.id ASC`);
    res.json(result);
});

// SimplePieChart
// http://localhost:3001/api/chart/SimplePieChart
router.get('/SimplePieChart', async (req, res) => {
    const { minDate, maxDate } = req.query;
    let dateVal =
        minDate || maxDate ? `AND (f.create_time BETWEEN '${minDate} 00:00:00' AND '${maxDate} 23:59:59')` : '';
    let [result] = await pool.execute(`SELECT  s.*,COUNT(f.status_id) st 
    FROM status s 
    LEFT JOIN application_form f ON s.id = f.status_id AND f.status_id NOT IN (1) 
    GROUP BY s.name
    ORDER BY s.id ASC`);
    res.json(result);
});

module.exports = router;
