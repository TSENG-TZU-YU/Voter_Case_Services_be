const express = require('express');
const router = express.Router();
const pool = require('../utils/db');
const moment = require('moment');

// SimpleBarChart
// http://localhost:3001/api/simpleBarChart
router.get('/', async (req, res) => {
    const { minDate, maxDate } = req.query;
    let dateVal = minDate || maxDate ? `AND (time BETWEEN '${minDate} 00:00:00' AND '${maxDate} 23:59:59')` : '';
    let [result] = await pool.execute(`SELECT  a.*,COUNT(f.application_category) category 
    FROM application_category a 
    LEFT JOIN application_form f ON a.name = f.application_category AND f.status_id NOT IN (1) 
    GROUP BY a.name
    ORDER BY a.id ASC`);
    res.json(result);
});

module.exports = router;
