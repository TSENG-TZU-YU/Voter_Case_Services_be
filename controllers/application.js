const pool = require('../utils/db');
const moment = require('moment');
// 增加狀態
async function addHandleState(caseNum, handler, state, remark, estTime, createTime) {
    let [postResult] = await pool.execute(
        'INSERT INTO select_states_detail (case_number, handler, select_state, remark, estimated_time, create_time, up_files_time,receive_files_time, user_id) VALUES (?,?,?,?,?,?,?,?,?)',
        [caseNum, handler, state, remark, estTime, createTime, null, null, 0]
    );
}

// /api/1.0/applicationData?category = 1
async function getAllApp(req, res) {
    const { category, state, unit, minDate, maxDate, order, HUnit } = req.query;
    // let userId = req.session.member.id;
    // let handleName = req.session.member.name;
    // let Manage = req.session.member.manage;
    let User = req.session.member.user;
    // let Handler = req.session.member.handler;
    // let Director = req.session.member.director;

    // console.log('ucc',userId);

    // 篩選
    let categoryVal = category ? `AND (a.application_category = '${category}')` : '';
    let stateVal = state ? `AND (a.status_id = ${state})` : '';
    let unitVal = unit ? `AND (u.applicant_unit = '${unit}')` : '';
    let unitHVal = HUnit ? `AND (a.unit = '${HUnit}')` : '';
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
    // user permissions=1
    if (User === 1) {
        [result] = await pool.execute(
            `SELECT a.*, s.name, u.applicant_unit, COUNT(d.case_number_id) sum, SUM(d.checked) cou 
      FROM application_form a 
      JOIN status s ON a.status_id = s.id
      JOIN users u ON a.user_id = u.id
      JOIN application_form_detail d ON a.case_number = d.case_number_id
      WHERE (a.status_id NOT IN (1)) ${categoryVal} ${stateVal} ${unitVal} ${dateVal}  ${unitHVal}
      GROUP BY d.case_number_id,s.name, u.applicant_unit
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
    [userResult] = await pool.execute(`SELECT * FROM users WHERE user = ?`, [1]);

    res.json({
        result,
        unitResult,
        statusResult,
        categoryResult,
        handlerResult,
        userResult,
    });
}

// 總管理filter all data
// /api/1.0/applicationData/getAssistantAllApp?category = 1
async function getAssistantAllApp(req, res) {
    const { category, state, unit, minDate, maxDate, handler, user, userUnit, handlerUnit, appUnit } = req.query;
    // console.log('c', category, state, unit, minDate, maxDate, typeof handler, user);
    let userId = req.session.member.id;
    let handleName = req.session.member.name;
    const permissions = req.session.member.permissions_id;
    let manage = req.session.member.manage;
    let User = req.session.member.user;

    // console.log('ucc', appUnit);

    // 篩選
    let categoryVal = category ? `AND (a.application_category = '${category}')` : '';
    let stateVal = state ? `AND (a.status_id = ${state})` : '';
    let unitVal = unit ? `AND (a.unit = '${unit}')` : '';
    let appUnitVal = appUnit ? `AND (u.applicant_unit = '${appUnit}')` : '';
    let dateVal =
        minDate || maxDate ? `AND (a.create_time BETWEEN '${minDate} 00:00:00' AND '${maxDate} 23:59:59')` : '';
    // let finishVal = finish
    //     ? parseInt(finish) !== 12
    //         ? `AND (a.status_id NOT IN (1,3,9,10,12))`
    //         : `AND (a.status_id = 12 )`
    //     : '';
    let handlerVal = handler
        ? handler !== '尚無處理人'
            ? `AND (a.handler = '${handler}')`
            : `AND (a.handler = '')`
        : '';
    let userVal = user ? `AND (a.user_id = '${user}')` : '';

    let result = '';
    // handler permissions=4
    if (manage === 1) {
        [result] = await pool.execute(
            `SELECT a.*, s.name, u.applicant_unit, COUNT(d.case_number_id) sum, SUM(d.checked) cou 
        FROM application_form a 
        JOIN status s ON a.status_id = s.id
        JOIN users u ON a.user_id = u.id
        JOIN application_form_detail d ON a.case_number = d.case_number_id
        WHERE (a.status_id NOT IN (1)) ${categoryVal} ${stateVal} ${unitVal} ${dateVal} ${handlerVal} ${userVal} ${appUnitVal}
        GROUP BY d.case_number_id, s.name, u.applicant_unit, a.id
        ORDER BY a.create_time DESC
         `
        );
    }

    // total
    let [dataTotal] = await pool.execute(`SELECT * FROM application_form WHERE status_id NOT IN (1)`);
    // 全部申請案件
    let allTotal = dataTotal.length;
    // 篩選總數
    let total = result.length;
    // console.log('t', result);

    // select

    // TODO:簡化
    // all申請狀態
    let [statusResult] = await pool.execute(`SELECT * FROM status`);

    // count申請狀態
    let statusTtl = [];
    for (let i = 0; i < result.length; i++) {
        statusTtl.push(result[i].status_id);
    }
    let stCount = {};
    for (let a of statusTtl) {
        stCount[a] = stCount[a] + 1 || 1;
    }
    let counts = Object.entries(stCount).map(([state, count]) => ({ [`${state}`]: count }));

    // console.log(statusResult);

    // all申請類別
    let [categoryResult] = await pool.execute(`SELECT * FROM application_category`);

    // count申請類別
    let categoryTtl = [];
    for (let i = 0; i < result.length; i++) {
        categoryTtl.push(result[i].application_category);
    }

    let cateCount = {};
    for (let a of categoryTtl) {
        cateCount[a] = cateCount[a] + 1 || 1;
    }
    let categoryCounts = Object.entries(cateCount).map(([state, count]) => ({ [`${state}`]: count }));

    // all申請單位
    let [unitResult] = await pool.execute(`SELECT * FROM unit`);

    // count處理人單位
    let unitTtl = [];
    for (let i = 0; i < result.length; i++) {
        unitTtl.push(result[i].unit);
    }

    let uCount = {};
    for (let a of unitTtl) {
        uCount[a] = uCount[a] + 1 || 1;
    }
    let unitCounts = Object.entries(uCount).map(([state, count]) => ({ [`${state}`]: count }));
    // console.log('ct', unitCounts);

    // count申請人單位
    let unitAppTtl = [];
    for (let i = 0; i < result.length; i++) {
        unitAppTtl.push(result[i].unit);
    }

    let auCount = {};
    for (let a of unitAppTtl) {
        auCount[a] = auCount[a] + 1 || 1;
    }
    let unitAppCounts = Object.entries(auCount).map(([state, count]) => ({ [`${state}`]: count }));
    // console.log('ct', unitAppCounts);

    // count處理人
    let handlerTtl = [];
    for (let i = 0; i < result.length; i++) {
        handlerTtl.push(result[i].handler);
    }

    let aCount = {};
    for (let a of handlerTtl) {
        aCount[a] = aCount[a] + 1 || 1;
    }
    let handlerCounts = Object.entries(aCount).map(([state, count]) => ({ [`${state}`]: count }));

    // all處理人
    let [handlerResult] = await pool.execute(`SELECT id,name FROM users WHERE handler = 1`);
    let selHandlerResult = '';
    if (handlerUnit !== '') {
        [selHandlerResult] = await pool.execute(`SELECT id,name FROM users WHERE handler = ? AND applicant_unit = ?`, [
            1,
            handlerUnit,
        ]);
    }

    // all user
    let [AllUserResult] = await pool.execute(`SELECT * FROM users`);

    // all申請人
    let userResult = '';
    if (userUnit !== '') {
        [userResult] = await pool.execute(`SELECT * FROM users WHERE user = ? AND applicant_unit = ?`, [1, userUnit]);
    }

    // count申請類別
    let userTtl = [];
    for (let i = 0; i < result.length; i++) {
        userTtl.push(result[i].user);
    }

    let userCount = {};
    for (let a of userTtl) {
        userCount[a] = userCount[a] + 1 || 1;
    }
    let userCounts = Object.entries(userCount).map(([state, count]) => ({ [`${state}`]: count }));
    // console.log('ct', userCount);
    // console.log('res', handlerResult);

    res.json({
        pagination: {
            allTotal,
            total,
            counts,
            categoryCounts,
            unitCounts,
            handlerCounts,
            userCounts,
            unitAppCounts,
        },
        result,
        unitResult,
        statusResult,
        categoryResult,
        handlerResult,
        userResult,
        AllUserResult,
        selHandlerResult,
    });
}

// 案件審核歷程
async function getCaseHistory(req, res) {
    const caseNum = req.params.case;
    // console.log(caseNum);

    let [result] = await pool.execute(
        `SELECT d.*, s.name AS status 
  FROM select_states_detail d
  JOIN status s ON d.select_state = s.id
  WHERE case_number = ?
  ORDER BY create_time DESC
   `,
        [caseNum]
    );

    res.json({
        result,
    });
}

// /api/1.0/applicationData/12345
async function getUserIdApp(req, res) {
    const { caseId } = req.body;
    const numId = req.params.num;
    const handler = req.session.member.name;

    // console.log(numId, handler, permissions, caseId);

    let [result] = await pool.execute(
        `SELECT a.*, s.name, u.applicant_unit
    FROM application_form a
    JOIN status s ON a.status_id = s.id
    JOIN users u ON a.user_id = u.id 
    WHERE a.case_number = ? AND a.id = ?`,
        [numId, caseId]
    );

    //需求資料
    let [needResult] = await pool.execute(
        `SELECT * 
    FROM application_form_detail 
    WHERE case_number_id = ?`,
        [numId]
    );
    let [needSum] = await pool.execute(
        `SELECT SUM(checked) AS checked
  FROM application_form_detail 
  WHERE case_number_id = ?`,
        [numId]
    );
    //審核結果
    let [handleResult] = await pool.execute(
        `SELECT d.* ,s.name AS status  
    FROM select_states_detail d
    JOIN status s ON d.select_state = s.id
    WHERE case_number = ? 
    ORDER BY create_time DESC`,
        [numId]
    );

    //可選擇狀態
    let [selectResult] = await pool.execute(`SELECT * 
    FROM status 
    WHERE id NOT IN (1,4,9)`);
    // 可選擇handler
    // console.log('se', selectResult);
    let [handlerResult] = await pool.execute(`SELECT id,name FROM users WHERE handler = ? AND name NOT IN (?)`, [
        1,
        handler,
    ]);

    // file
    let [getFile] = await pool.execute(
        `SELECT a.*,b.create_time FROM upload_files_detail a JOIN application_form b ON a.case_number_id=b.case_number WHERE case_number_id = ? && a.valid=? && b.valid=?`,
        [numId, 0, 0]
    );

    // 查看是否有處理情形
    let [remarkResult] = await pool.execute(`SELECT * FROM handler_remark WHERE case_number IN (?)`, [numId]);

    // 案件處理情形checked
    let [selCheckResult] = await pool.execute(`SELECT * FROM select_states_checked WHERE case_number IN (?)`, [numId]);

    // 目前狀態
    let [nowStateResult] = await pool.execute(
        `SELECT s.name
    FROM application_form a
    JOIN status s ON a.status_id = s.id
    WHERE a.case_number = ? AND a.id = ?`,
        [numId, caseId]
    );
    // console.log('addCalendar', nowStateResult);

    res.json({
        result,
        needResult,
        needSum,
        handleResult,
        selectResult,
        handlerResult,
        getFile,
        remarkResult,
        selCheckResult,
        nowStateResult,
    });
}

// need checked
async function putNeedChecked(req, res) {
    const { needId } = req.params;
    // console.log('n',needId);
    let [result] = await pool.execute('UPDATE application_form_detail SET checked=? WHERE id = ?', [0, needId]);
    // console.log('put', result);
    res.json({ message: '取消成功' });
}
async function putUnNeedChecked(req, res) {
    const { needId } = req.params;
    let [result] = await pool.execute('UPDATE application_form_detail SET checked=? WHERE id = ?', [1, needId]);
    // console.log('put', result);
    res.json({ message: '勾選成功' });
}

// select checked
async function postSelChecked(req, res) {
    const { needId } = req.params;
    let ind = req.body.Ind;
    // console.log('n', needId);

    if (ind === 'rc') {
        let [result] = await pool.execute('UPDATE select_states_checked SET responded_client=? WHERE id = ?', [
            0,
            needId,
        ]);
    }
    if (ind === 'called') {
        let [result] = await pool.execute('UPDATE select_states_checked SET called=? WHERE id = ?', [0, needId]);
    }

    // console.log('put', result);
    res.json({ message: '取消成功' });
}
async function postSelUnChecked(req, res) {
    const { needId } = req.params;
    let ind = req.body.Ind;
    // console.log('n', ind);
    if (ind === 'rc') {
        let [result] = await pool.execute('UPDATE select_states_checked SET responded_client=? WHERE id = ?', [
            1,
            needId,
        ]);
    }
    if (ind === 'called') {
        let [result] = await pool.execute('UPDATE select_states_checked SET called=? WHERE id = ?', [1, needId]);
    }
    if (ind === 'succ') {
        let [result] = await pool.execute('UPDATE select_states_checked SET success = ?,fail = ? WHERE id = ?', [
            1,
            0,
            needId,
        ]);
    }
    if (ind === 'fail') {
        let [result] = await pool.execute('UPDATE select_states_checked SET success = ?,fail = ? WHERE id = ?', [
            0,
            1,
            needId,
        ]);
    }

    res.json({ message: '勾選成功' });
}

// 民眾回饋
async function postPopulaceMsg(req, res) {
    const { needId } = req.params;
    let content = req.body.populace;
    // console.log('n', content);

    let [result] = await pool.execute('UPDATE select_states_checked SET populace = ? WHERE id = ?', [content, needId]);

    res.json({ message: '修改成功' });
}

// post 審理結果
async function handlePost(req, res) {
    // console.log(req.body[0]);
    let v = req.body;
    let v0 = req.body[0];
    let nowDate = moment().format('YYYY-MM-DD HH:mm:ss');
    // console.log('object', nowD);
    // console.log('all', v.finishTime === '');
    // console.log('all0', nowDate);

    // 取得更新狀態id
    let [states] = await pool.execute('SELECT * FROM status');
    let [newState] = states.filter((d) => {
        return d.name === v.status;
    });

    // 加入審核狀態
    if (v.finishTime !== '') {
        let [result] = await pool.execute(
            'INSERT INTO select_states_detail (case_number, handler, select_state, remark, estimated_time, create_time, up_files_time,receive_files_time, user_id) VALUES (?,?,?,?,?,?,?,?,?)',
            [v.caseNumber, v.handler, newState.id, v.remark, v.finishTime, nowDate, null, null, 0]
        );
    } else {
        let [result] = await pool.execute(
            'INSERT INTO select_states_detail (case_number, handler, select_state, remark, estimated_time, create_time, up_files_time,receive_files_time, user_id) VALUES (?,?,?,?,?,?,?,?,?)',
            [v.caseNumber, v.handler, newState.id, v.remark, null, nowDate, null, null, 0]
        );
    }

    // console.log('new', newState.id, v.transfer, v.caseNumber, v0.id)
    // 更新申請表單狀態
    if (v.status !== '處理人轉件中') {
        let [updateResult] = await pool.execute(
            'UPDATE application_form SET status_id = ? WHERE case_number = ? AND id = ?',
            [newState.id, v.caseNumber, v0.id]
        );
    } else {
        let [updateResult] = await pool.execute(
            'UPDATE application_form SET status_id = ?, sender = ? WHERE case_number = ? AND id = ?',
            [newState.id, v.transfer, v.caseNumber, v0.id]
        );
    }

    // console.log('addCalendar', states);
    res.json({ message: '新增成功' });
}

// put 狀態 4 -> 5
// async function handleChangeState(req, res) {
//     const { caseNum } = req.params;
//     let handler = req.body.handler;
//     let id = req.body.id;

//     // console.log(caseNum, handler, id);

//     let [result] = await pool.execute('UPDATE application_form SET status_id=? WHERE case_number = ? AND id = ?', [
//         5,
//         caseNum,
//         id,
//     ]);

//     addHandleState(caseNum, handler, '評估中', '', '', nowDate);

//     console.log('put', result);
//     res.json({ message: '勾選成功' });
// }

// post 需求
async function handlePostNeed(req, res) {
    let user = req.session.member.name;
    let handler = req.body[0];
    let v = req.body[1];
    let id = req.body[2];
    let input = req.body[3];
    let caseNum = v[0].case_number_id;
    // console.log('1', req.body[3]);
    // console.log('2', req.body);
    // console.log('3',req.body[2])
    let nowDate = moment().format('YYYY-MM-DD HH:mm:ss');

    let [delResult] = await pool.execute('DELETE FROM application_form_detail WHERE case_number_id = ? ', [caseNum]);

    for (let i = 0; i < v.length; i++) {
        let [postResult] = await pool.execute(
            'INSERT INTO application_form_detail (case_number_id, directions, checked, valid) VALUES (?,?,?,?)',
            [v[i].case_number_id, v[i].directions, 0, 1]
        );
    }

    // 變更表單狀態

    if (input === 'finish') {
        let [updateResult] = await pool.execute(
            'UPDATE application_form SET status_id = ? WHERE case_number = ? AND id = ?',
            [5, caseNum, id]
        );

        addHandleState(caseNum, user, 5, '', null, nowDate, null, null, 0);
    }

    if (input === 'submit') {
        let [updateResult] = await pool.execute(
            'UPDATE application_form SET status_id = ? WHERE case_number = ? AND id = ?',
            [4, caseNum, id]
        );

        addHandleState(caseNum, user, 4, '', null, nowDate, null, null, 0);
    }

    // console.log('addCalendar', states);
    res.json({ message: '新增成功' });
}

// put 接收需求
// async function handleAcceptNeed(req, res) {
//     const caseNum = req.params.num;
//     const id = req.body.caseId;
//     // console.log(id);

//     let [result] = await pool.execute('UPDATE application_form SET status_id=? WHERE case_number = ? AND id = ?', [
//         6,
//         caseNum,
//         id,
//     ]);

//     // console.log('addCalendar', states);
//     res.json({ message: '接收成功' });
// }

// put 取消申請
async function handleCancleAcc(req, res) {
    const caseNum = req.params.num;
    let user = req.body.user;
    let id = req.body.id;
    let nowDate = moment().format('YYYY-MM-DD HH:mm:ss');
    // console.log(caseNum, user, id);

    let [result] = await pool.execute('UPDATE application_form SET status_id=? WHERE case_number = ? AND id = ?', [
        10,
        caseNum,
        id,
    ]);

    addHandleState(caseNum, user, 10, '', null, nowDate, null, null, 0);

    // console.log('addCalendar', states);
    res.json({ message: '接收成功' });
}

// put finish
async function handleFinish(req, res) {
    const caseNum = req.params.num;
    let id = req.body.caseId;
    let handler = req.session.member.name;
    // console.log(caseNum, id);
    let nowDate = moment().format('YYYY-MM-DD HH:mm:ss');
    let [result] = await pool.execute('UPDATE application_form SET status_id=? WHERE id = ?', [9, id]);

    addHandleState(caseNum, handler, 9, '', null, nowDate, null, null, 0);

    // console.log('addCalendar', states);
    res.json({ message: '接收成功' });
}

// put 確認接收轉件
async function handleAcceptCase(req, res) {
    // const caseNum = req.params.num;
    let handleName = req.session.member.name;
    let handleUnit = req.session.member.applicant_unit;
    let nowDate = moment().format('YYYY-MM-DD HH:mm:ss');
    let [v] = req.body;
    // console.log('v', v);

    let [newResult] = await pool.execute(
        'UPDATE application_form SET status_id=?, handler = ?, sender = ?, unit = ? WHERE case_number = ? AND id = ?',
        [4, handleName, '', handleUnit, v.case_number, v.id]
    );

    addHandleState(v.case_number, handleName, 4, `接收人: ${handleName}`, null, nowDate, null, null, 0);

    // console.log('addCalendar', states);
    res.json({ message: v.sender });
}

// put 拒絕接收轉件
async function handleRejectCase(req, res) {
    let [v] = req.body;
    // console.log('v', v);
    let nowDate = moment().format('YYYY-MM-DD HH:mm:ss');
    let [newResult] = await pool.execute(
        `UPDATE application_form SET status_id=?, handler = ?, sender = ? 
        WHERE case_number = ? AND  id = ? `,
        [4, v.handler, '', v.case_number, v.id]
    );

    addHandleState(v.case_number, v.handler, 4, '', null, nowDate, null, null, 0);

    // console.log('addCalendar', states);
    res.json({ message: '接收成功' });
}

// 沒有指定handler, 確認接收
async function handleReceiveCase(req, res) {
    let v = req.body;
    let caseNum = req.params.num;
    let newHandler = req.session.member.name;
    // console.log('v', v.caseId, caseNum, handler);
    let nowDate = moment().format('YYYY-MM-DD HH:mm:ss');
    let [result] = await pool.execute(
        `UPDATE application_form SET status_id = ? , handler = ?
        WHERE case_number = ? AND id = ?`,
        [4, newHandler, caseNum, v.caseId]
    );

    addHandleState(caseNum, newHandler, 4, '', null, nowDate, null, null, 0);
    // caseNum, handler, state, remark, estTime, createTime

    // console.log('addCalendar', states);
    res.json({ message: '接收成功' });
}

// user 確認完成
async function handleAcceptFinish(req, res) {
    // const caseNum = req.params.num;
    let [v] = req.body;
    let user = req.session.member.name;
    // console.log('v', v);
    let nowDate = moment().format('YYYY-MM-DD HH:mm:ss');
    let [result] = await pool.execute('UPDATE application_form SET status_id=? WHERE case_number = ? AND id = ?', [
        10,
        v.case_number,
        v.id,
    ]);

    addHandleState(v.case_number, user, 10, '', null, nowDate, null, null, 0);

    // console.log('addCalendar', states);
    res.json({ message: '已完成' });
}

// user 拒絕完成
async function handleRejectFinish(req, res) {
    let [v] = req.body;
    let user = req.session.member.name;
    let nowDate = moment().format('YYYY-MM-DD HH:mm:ss');
    // console.log('v', v);

    let [newResult] = await pool.execute(
        `UPDATE application_form SET status_id = ?
        WHERE case_number = ? AND  id = ? `,
        [5, v.case_number, v.id]
    );

    addHandleState(v.case_number, user, 5, '', null, nowDate, null, null, 0);

    // console.log('addCalendar', states);
    res.json({ message: '拒絕接收成功' });
}

// 案件處理情形
async function getHandleStatus(req, res) {
    const caseNum = req.params.case;
    // console.log('c', caseNum);

    let [result] = await pool.execute(
        `SELECT r.content ,r.create_time ,u.name
  FROM handler_remark r
  JOIN users u ON r.handler_id = u.id
  WHERE r.case_number = ?
  ORDER BY r.create_time DESC
   `,
        [caseNum]
    );

    let [stResult] = await pool.execute(`SELECT status_id FROM application_form WHERE case_number = ?`, [caseNum]);
    // console.log('d', stResult);

    res.json({ result, stResult });
}

// post 案件處理情形
async function postHandleStatus(req, res) {
    let handler = req.session.member.id;
    let v = req.body;
    let nowDate = moment().format('YYYY-MM-DD HH:mm:ss');
    // console.log('first', v, handler);
    let [result] = await pool.execute(
        'INSERT INTO handler_remark (case_number, content, handler_id, create_time) VALUES (?,?,?,?)',
        [v.num, v.submitMessage, handler, nowDate]
    );

    res.json({ message: 'msg新增成功' });
}

// file
async function handlePostFile(req, res) {
    const numId = req.params.num;
    const arr = Object.values(req?.files || {});
    let v = req.body;
    let nowDate = moment().format('YYYYMM');
    // 轉換類型名稱
    let [source] = await pool.execute('SELECT * FROM application_source');
    let [newState] = source.filter((d) => {
        return d.name === v.No;
    });

    for (let i = 0; i < arr.length; i++) {
        let uploadPath = __dirname + `/../${nowDate}/${numId}/` + newState.number + v.fileNo + [i];
        arr[i].mv(uploadPath, (err) => {
            if (err) {
                return res.send(err);
            }
        });

        // 限制是否已有檔案
        let [checkData] = await pool.execute('SELECT * FROM upload_files_detail  WHERE file_no = ? && create_time=?', [
            v.fileNo + [i],
            v.create_time,
        ]);
        if (checkData.length === 0) {
            try {
                let [files] = await pool.execute(
                    'INSERT INTO upload_files_detail (case_number_id,name,file_no,valid,create_time) VALUES (?,?,?,?,?)',
                    [numId, arr[i].name, newState.number + v.fileNo + [i], v.valid, v.create_time]
                );
            } catch (err) {
                console.log(err);
            }
        }
    }
    if (v.valid === '1') {
        await pool.execute(
            `UPDATE select_states_detail SET up_files_time=? WHERE case_number=? && select_state=?  ORDER BY create_time LIMIT 1`,
            [v.create_time, numId, '需補件']
        );
        await pool.execute(
            `INSERT INTO select_states_detail (case_number,handler,select_state,create_time) VALUES(?,?,?,?)`,
            [numId, v.handler, '已補件', v.create_time]
        );
    }

    res.send('ok2');
}

module.exports = {
    getAllApp,
    getUserIdApp,
    putNeedChecked,
    putUnNeedChecked,
    handlePost,
    handlePostNeed,
    getCaseHistory,
    handleCancleAcc,
    handlePostFile,
    handleAcceptCase,
    handleRejectCase,
    handleFinish,
    handleReceiveCase,
    handleAcceptFinish,
    handleRejectFinish,
    getAssistantAllApp,
    getHandleStatus,
    postHandleStatus,
    postSelChecked,
    postSelUnChecked,
    postPopulaceMsg,
};
