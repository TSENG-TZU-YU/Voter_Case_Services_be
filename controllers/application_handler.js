const pool = require('../utils/db');

//http://localhost:3001/api/1.0/handler/applicationData
async function getAllAppHandler(req, res) {
    const { category, state, unit, minDate, maxDate, order, HUnit } = req.query;
    let userId = req.session.member.id;
    let handleName = req.session.member.name;
    let Manage = req.session.member.manage;
    let Handler = req.session.member.handler;
    let HandlerUnit = req.session.member.applicant_unit;

    // console.log('ucc', Manage);

    // 篩選
    let categoryVal = category ? `AND (a.application_category = '${category}')` : '';
    let stateVal = state ? `AND (a.status_id = ${state})` : '';
    let unitHVal = HUnit ? `AND (a.unit = '${HUnit}')` : '';
    let unitVal = unit ? `AND (u.applicant_unit = '${unit}')` : '';
    let dateVal =
        minDate || maxDate ? `AND (a.create_time BETWEEN '${minDate} 00:00:00' AND '${maxDate} 23:59:59')` : '';

    let orderType = null;
    switch (order) {
        case '1':
            orderType = 'a.case_number ASC';
            break;
        case '2':
            orderType = 'a.case_number DESC';
            break;
        case '3':
            orderType = 'a.create_time ASC';
            break;
        case '4':
            orderType = 'a.create_time DESC';
            break;
        default:
            orderType = 'a.create_time DESC';
    }

    let result = '';

    // handler permissions=3
    if (Handler === 1) {
        [result] = await pool.execute(
            `SELECT a.*, s.name, u.applicant_unit, COUNT(d.case_number_id) sum, SUM(d.checked) cou
        FROM application_form a
        JOIN status s ON a.status_id = s.id
        JOIN users u ON a.user_id = u.id
        JOIN application_form_detail d ON a.case_number = d.case_number_id
        WHERE (a.handler = ? OR a.handler = ? OR a.sender = ?) AND (status_id NOT IN (1)) AND(a.unit = ?) ${categoryVal} ${stateVal} ${unitVal} ${dateVal} ${unitHVal}
        GROUP BY d.case_number_id, s.name, u.applicant_unit, a.id
        ORDER BY ${orderType}
         `,
            [handleName, '', handleName, HandlerUnit]
        );
    }

    // TODO:未改
    // handler permissions=4
    if (Manage === 1) {
        [result] = await pool.execute(
            `SELECT a.*, s.name, u.applicant_unit, COUNT(d.case_number_id) sum, SUM(d.checked) cou 
        FROM application_form a 
        JOIN status s ON a.status_id = s.id
        JOIN users u ON a.user_id = u.id
        JOIN application_form_detail d ON a.case_number = d.case_number_id
        WHERE (status_id NOT IN (1)) ${categoryVal} ${stateVal} ${unitVal} ${dateVal} ${unitHVal}
        GROUP BY d.case_number_id, s.name, u.applicant_unit, a.id
        ORDER BY ${orderType}
         `
        );
    }

    // all申請單位
    [unitResult] = await pool.execute(`SELECT * FROM unit`);

    // all申請狀態
    [statusResult] = await pool.execute(`SELECT * FROM status`);

    // all申請類別
    [categoryResult] = await pool.execute(`SELECT * FROM application_category`);

    // all處理人
    [handlerResult] = await pool.execute(`SELECT * FROM handler`);

    // all申請人
    [userResult] = await pool.execute(`SELECT * FROM users WHERE permissions_id = ?`, [1]);

    // console.log('res', unitResult);

    res.json({
        result,
        unitResult,
        statusResult,
        categoryResult,
        handlerResult,
        userResult,
    });
}

module.exports = {
    getAllAppHandler,
};
