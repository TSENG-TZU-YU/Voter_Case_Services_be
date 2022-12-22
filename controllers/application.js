const pool = require('../utils/db');
const moment = require('moment');
let nowDate = moment().format('YYYY-MM-DD HH:mm:ss');
// 增加狀態
async function addHandleState(caseNum, handler, state, remark, estTime, createTime) {
    let [postResult] = await pool.execute(
        'INSERT INTO select_states_detail (case_number, handler, select_state, remark, estimated_time, create_time) VALUES (?,?,?,?,?,?)',
        [caseNum, handler, state, remark, estTime, createTime]
    );
}

// /api/1.0/applicationData?state=1 & maxPrice=100 & minPrice=50 & maxPerson=20 & minPerson=10 & maxDate=20221010 & minPrice=20220910 & order=1 & search & page
async function getAllApp(req, res) {
    let userId = req.session.member.id;
    let handleName = req.session.member.name;
    const permissions = req.session.member.permissions_id;
    // console.log('ucc', permissions);

    let result = '';
    // user permissions=1
    if (permissions === 1) {
        [result] = await pool.execute(
            `SELECT a.*, s.name, u.applicant_unit, COUNT(d.case_number_id) sum, SUM(d.checked) cou 
      FROM application_form a 
      JOIN status s ON a.status_id = s.id
      JOIN users u ON a.user_id = u.id
      JOIN application_form_detail d ON a.case_number = d.case_number_id
      WHERE a.user_id = ? AND a.valid = ?
      GROUP BY d.case_number_id,s.name, u.applicant_unit
      ORDER BY a.create_time DESC
       `,
            [userId, 0]
        );
    }

    // handler permissions=3
    if (permissions === 3) {
        [result] = await pool.execute(
            `SELECT a.*, s.name, u.applicant_unit, COUNT(d.case_number_id) sum, SUM(d.checked) cou 
        FROM application_form a 
        JOIN status s ON a.status_id = s.id
        JOIN users u ON a.user_id = u.id
        JOIN application_form_detail d ON a.case_number = d.case_number_id
        WHERE a.handler = ? OR a.handler = ? OR a.sender = ?
        GROUP BY d.case_number_id, s.name, u.applicant_unit, a.id
        ORDER BY a.create_time DESC
         `,
            [handleName, '', handleName]
        );
    }
    // console.log('res', result);
    // progress
    // let [progressResult] = await pool.execute(
    //     `SELECT a.case_number, COUNT(d.case_number_id) sum, SUM(d.checked) cou
    // FROM application_form a
    // JOIN application_form_detail d ON a.case_number = d.case_number_id
    // WHERE d.valid = ? AND a.user_id = ?
    // GROUP BY a.case_number,d.case_number_id
    //  `,
    //     [1, userId]
    // );

    res.json({
        // pagination: {
        //   total,
        //   perPage,
        //   page,
        //   lastPage,
        // },
        result,
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
        // pagination: {
        //   total,
        //   perPage,
        //   page,
        //   lastPage,
        // },
        result,
    });
}

// /api/1.0/applicationData/12345
async function getUserIdApp(req, res) {
    const { caseId } = req.body;
    const numId = req.params.num;
    const handler = req.session.member.name;
    const permissions = req.session.member.permissions_id;

    // console.log(numId, handler, permissions, caseId);

    // let result = '';
    //表單資料  p=3
    // if (permissions === 3) {
    [result] = await pool.execute(
        `SELECT a.*, s.name, u.applicant_unit
    FROM application_form a
    JOIN status s ON a.status_id = s.id
    JOIN users u ON a.user_id = u.id
    WHERE a.case_number = ? AND a.id = ?`,
        [numId, caseId]
    );
    // }

    // if (permissions === 1) {
    //     [result] = await pool.execute(
    //         `SELECT a.*, s.name, u.applicant_unit
    // FROM application_form a
    // JOIN status s ON a.status_id = s.id
    // JOIN users u ON a.user_id = u.id
    // WHERE a.case_number = ? AND a.id = ? `,
    //         [numId, caseId]
    //     );
    // }

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
    WHERE id NOT IN (1,2,4,10,11,12)`);
    // 可選擇handler
    // console.log('se', selectResult);
    let [handlerResult] = await pool.execute(`SELECT * FROM handler WHERE name NOT IN (?)`, [handler]);

    // file
    let [getFile] = await pool.execute(
        `SELECT a.*,b.create_time FROM upload_files_detail a JOIN application_form b ON a.case_number_id=b.case_number WHERE case_number_id = ? && a.valid=? && b.valid=?`,
        [numId, 0, 0]
    );

    res.json({
        result,
        needResult,
        needSum,
        handleResult,
        selectResult,
        handlerResult,
        getFile,
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

// post 審理結果
async function handlePost(req, res) {
    // console.log(req.body[0]);
    let v = req.body;
    let v0 = req.body[0];

    // console.log('all', v.transfer);
    // console.log('all0', v0);

    // 取得更新狀態id
    let [states] = await pool.execute('SELECT * FROM status');
    let [newState] = states.filter((d) => {
        return d.name === v.status;
    });

    // 加入審核狀態
    let [result] = await pool.execute(
        'INSERT INTO select_states_detail (case_number, handler, select_state, remark, estimated_time,create_time) VALUES (?,?,?,?,?,?)',
        [v.caseNumber, v.handler, newState.id, v.remark, v.finishTime, nowDate]
    );

    // console.log('new', newState)
    // 更新申請表單狀態
    if (v.status !== '轉件中') {
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

    let [delResult] = await pool.execute('DELETE FROM application_form_detail WHERE case_number_id = ? ', [caseNum]);

    for (let i = 0; i < v.length; i++) {
        let [postResult] = await pool.execute(
            'INSERT INTO application_form_detail (case_number_id, requirement_name, directions, checked, valid) VALUES (?,?,?,?,?)',
            [v[i].case_number_id, v[i].requirement_name, v[i].directions, 0, 1]
        );
    }

    // 變更表單狀態

    if (input === 'finish') {
        let [updateResult] = await pool.execute(
            'UPDATE application_form SET status_id = ? WHERE case_number = ? AND id = ?',
            [5, caseNum, id]
        );

        addHandleState(caseNum, user, 5, '', '', nowDate);
    }

    if (input === 'submit') {
        let [updateResult] = await pool.execute(
            'UPDATE application_form SET status_id = ? WHERE case_number = ? AND id = ?',
            [2, caseNum, id]
        );

        addHandleState(caseNum, user, 2, '', '', nowDate);
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

    // console.log(caseNum, user, id);

    let [result] = await pool.execute('UPDATE application_form SET status_id=? WHERE case_number = ? AND id = ?', [
        10,
        caseNum,
        id,
    ]);

    addHandleState(caseNum, user, 10, '', '', nowDate);

    // console.log('addCalendar', states);
    res.json({ message: '接收成功' });
}

// put finish
async function handleFinish(req, res) {
    const caseNum = req.params.num;
    let id = req.body.caseId;
    let handler = req.session.member.name;
    // console.log(caseNum, id);

    let [result] = await pool.execute('UPDATE application_form SET status_id=? WHERE id = ?', [11, id]);

    addHandleState(caseNum, handler, 11, '', '', nowDate);

    // console.log('addCalendar', states);
    res.json({ message: '接收成功' });
}

// put 確認接收轉件
async function handleAcceptCase(req, res) {
    // const caseNum = req.params.num;
    let handleName = req.session.member.name;
    let [v] = req.body;
    // console.log('v', v);

    let [newResult] = await pool.execute(
        'UPDATE application_form SET status_id=?, handler = ?, sender = ? WHERE case_number = ? AND id = ?',
        [4, handleName, '', v.case_number, v.id]
    );

    addHandleState(v.case_number, handleName, 4, `接收人: ${handleName}`, '', nowDate);

    // console.log('addCalendar', states);
    res.json({ message: v.sender });
}

// put 拒絕接收轉件
async function handleRejectCase(req, res) {
    let [v] = req.body;
    // console.log('v', v);

    let [newResult] = await pool.execute(
        `UPDATE application_form SET status_id=?, handler = ?, sender = ? 
        WHERE case_number = ? AND  id = ? `,
        [4, v.handler, '', v.case_number, v.id]
    );

    addHandleState(v.case_number, v.handler, 4, '', '', nowDate);

    // console.log('addCalendar', states);
    res.json({ message: '接收成功' });
}

// 沒有指定handler, 確認接收
async function handleReceiveCase(req, res) {
    let v = req.body;
    let caseNum = req.params.num;
    let newHandler = req.session.member.name;
    // console.log('v', v.caseId, caseNum, handler);

    let [result] = await pool.execute(
        `UPDATE application_form SET status_id = ? , handler = ?
        WHERE case_number = ? AND id = ?`,
        [4, newHandler, caseNum, v.caseId]
    );

    addHandleState(caseNum, newHandler, 4, '', '', nowDate);
    // caseNum, handler, state, remark, estTime, createTime

    // console.log('addCalendar', states);
    res.json({ message: '接收成功' });
}

// user 確認完成
async function handleAcceptFinish(req, res) {
    // const caseNum = req.params.num;
    let [v] = req.body;
    // console.log('v', v);

    let [result] = await pool.execute('UPDATE application_form SET status_id=? WHERE case_number = ? AND id = ?', [
        12,
        v.case_number,
        v.id,
    ]);

    addHandleState(v.case_number, v.handler, 12, '', '', nowDate);

    // console.log('addCalendar', states);
    res.json({ message: '已完成' });
}

// user 拒絕完成
async function handleRejectFinish(req, res) {
    let [v] = req.body;
    // console.log('v', v);

    let [newResult] = await pool.execute(
        `UPDATE application_form SET status_id = ?
        WHERE case_number = ? AND  id = ? `,
        [5, v.case_number, v.id]
    );

    addHandleState(v.case_number, v.handler, 5, '', '', nowDate);

    // console.log('addCalendar', states);
    res.json({ message: '拒絕接收成功' });
}

// file
async function handlePostFile(req, res) {
    const numId = req.params.num;
    const arr = Object.values(req?.files || {});
    let v = req.body;
    let nowDate = moment().format('YYYYMM');
    // 轉換類型名稱
    let [category] = await pool.execute('SELECT * FROM application_category');
    let [newState] = category.filter((d) => {
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
    // if (v.valid === '1') {
    //     await pool.execute(
    //         `UPDATE select_states_detail SET up_files_time=? WHERE case_number=? && select_state=?  ORDER BY create_time LIMIT 1`,
    //         [v.create_time, numId, '需補件']
    //     );
    //     await pool.execute(
    //         `INSERT INTO select_states_detail (case_number,handler,select_state,create_time) VALUES(?,?,?,?)`,
    //         [numId, v.handler, '已補件', v.create_time]
    //     );
    // }

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
    // handleAcceptNeed,
    // handleChangeState,
    handleCancleAcc,
    handlePostFile,
    handleAcceptCase,
    handleRejectCase,
    handleFinish,
    handleReceiveCase,
    handleAcceptFinish,
    handleRejectFinish,
};
