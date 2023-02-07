const pool = require('../utils/db');
const moment = require('moment');
// 增加狀態

async function getCategoryPage(req, res) {
    const { minDate, maxDate } = req.query;
    let dateVal =
        minDate || maxDate ? `AND (f.create_time BETWEEN '${minDate} 00:00:00' AND '${maxDate} 23:59:59')` : '';
    let [result] = await pool.execute(`SELECT  a.*,COUNT(f.application_category) value 
    FROM application_category a 
    LEFT JOIN application_form f ON a.name = f.application_category AND f.status_id NOT IN (1) ${dateVal} 
    GROUP BY a.name
    ORDER BY a.id ASC`);
    res.json(result);
}

async function getStatusPage(req, res) {
    const { minDate, maxDate } = req.query;
    let dateVal =
        minDate || maxDate ? `AND (f.create_time BETWEEN '${minDate} 00:00:00' AND '${maxDate} 23:59:59')` : '';
    let [result] = await pool.execute(`SELECT  s.*,COUNT(f.status_id) value 
    FROM status s 
    LEFT JOIN application_form f ON s.id = f.status_id AND f.status_id NOT IN (1) ${dateVal} 
    GROUP BY s.name
    ORDER BY s.id ASC`);
    res.json(result);
}

async function getappUnitPage(req, res) {
    const { minDate, maxDate } = req.query;
    let dateVal =
        minDate || maxDate ? `AND (f.create_time BETWEEN '${minDate} 00:00:00' AND '${maxDate} 23:59:59')` : '';
    let [result] = await pool.execute(`SELECT  u.*,COUNT(f.unit) value 
    FROM unit u
    LEFT JOIN application_form f ON u.name = f.unit AND f.status_id NOT IN (1) ${dateVal} 
    GROUP BY u.name
    ORDER BY u.id ASC`);
    res.json(result);
}

async function getappUserPage(req, res) {
    const { minDate, maxDate } = req.query;
    let dateVal =
        minDate || maxDate ? `AND (f.create_time BETWEEN '${minDate} 00:00:00' AND '${maxDate} 23:59:59')` : '';
    let [result] = await pool.execute(`SELECT  u.id,u.name,COUNT(f.user) value 
    FROM users u
    LEFT JOIN application_form f ON u.id = f.user_id AND f.status_id NOT IN (1)  ${dateVal} 
    GROUP BY u.id
    ORDER BY u.id ASC`);
    res.json(result);
}

async function gethandlerUnitPage(req, res) {
    const { minDate, maxDate } = req.query;
    let dateVal =
        minDate || maxDate ? `AND (f.create_time BETWEEN '${minDate} 00:00:00' AND '${maxDate} 23:59:59')` : '';
    let [result] = await pool.execute(`SELECT  u.*,COUNT(f.unit) value 
    FROM unit u
    LEFT JOIN application_form f ON u.name = f.unit AND f.status_id NOT IN (1) ${dateVal} 
    GROUP BY u.name
    ORDER BY u.id ASC`);
    res.json(result);
}

async function gethandlerUserPage(req, res) {
    const { minDate, maxDate } = req.query;
    let dateVal =
        minDate || maxDate ? `AND (f.create_time BETWEEN '${minDate} 00:00:00' AND '${maxDate} 23:59:59')` : '';
    let [result] = await pool.execute(`SELECT  u.id,u.name,COUNT(f.handler) value 
    FROM users u
    LEFT JOIN application_form f ON u.name = f.handler AND f.status_id NOT IN (1) AND f.user_id!='' ${dateVal}
    GROUP BY u.name
    ORDER BY u.id ASC`);
    res.json(result);
}
async function getNoHandlerUserPage(req, res) {
    const { minDate, maxDate } = req.query;
    let dateVal =
        minDate || maxDate ? `AND (f.create_time BETWEEN '${minDate} 00:00:00' AND '${maxDate} 23:59:59')` : '';
    let [result] = await pool.execute(`SELECT  COUNT(f.handler) value 
    FROM application_form f
    WHERE f.handler ='' AND f.status_id NOT IN (1) ${dateVal}`);
    res.json(result);
}

module.exports = {
    getCategoryPage,
    getStatusPage,
    getappUnitPage,
    getappUserPage,
    gethandlerUnitPage,
    gethandlerUserPage,
    getNoHandlerUserPage,
};
