// 啟用 express
const express = require('express');
const router = express.Router();
const pool = require('../utils/db');
const fs = require('fs');
const authMid = require('../middlewares/auth');

// 抓取使用者上傳的檔案
// http://localhost:3001/api/files/getUserFile
router.get('/getUserFile/:num', authMid.checkLogin, authMid.all, async (req, res) => {
    const numId = req.params.num;

    let [getUserTotalFile] = await pool.execute(
        `SELECT * FROM upload_files_detail WHERE case_number_id=? && (valid=1||valid=0)  ORDER BY create_time DESC`,
        [numId]
    );

    res.json(getUserTotalFile);
});

// 抓取處理者上傳的檔案
// http://localhost:3001/api/files/getHandlerFile
router.get('/getHandlerFile/:num', authMid.checkLogin, authMid.all, async (req, res) => {
    const numId = req.params.num;

    let [getUserTotalFile] = await pool.execute(
        `SELECT * FROM upload_files_detail WHERE case_number_id=? && valid=2  ORDER BY create_time DESC`,
        [numId]
    );

    res.json(getUserTotalFile);
});

// 抓取處理者上傳的檔案
// http://localhost:3001/api/files/getHandlerFileNo
router.get('/getHandlerFileNo/:num', authMid.checkLogin, authMid.all, async (req, res) => {
    const numId = req.params.num;
    let [getUserTotalFile] = await pool.execute(
        `SELECT status_id,application_source,handler FROM application_form WHERE case_number=?  `,
        [numId]
    );

    res.json(getUserTotalFile);
});

// 上傳檔案更新狀態(已補件)
// http://localhost:3001/api/files/patchStatus
router.patch('/patchStatus/:num', authMid.checkLogin, authMid.handler, async (req, res) => {
    const numId = req.params.num;

    let [lastSt] = await pool.execute('SELECT last_status FROM application_form WHERE case_number = ? ', [numId]);

    let [states] = await pool.execute('SELECT * FROM status');
    let [newState] = states.filter((d) => {
        return d.name === lastSt[0].last_status;
    });
    let [getUserTotalFile] = await pool.execute(` UPDATE application_form SET status_id=? WHERE case_number = ? `, [
        newState.id,
        numId,
    ]);
    // console.log('n', newState);
    res.json(getUserTotalFile);
});

// 抓取申請者上傳的檔案(已補件)
// http://localhost:3001/api/files/getUpdateFile
// router.get('/getUpdateFile/:num', async (req, res) => {
//     const numId = req.params.num;

//     let [getUserTotalFile] = await pool.execute(
//         `SELECT a.*,b.case_number,b.remark,c.status_id FROM upload_files_detail a  JOIN select_states_detail b ON a.create_time=b.up_files_time JOIN application_form c ON a.case_number_id=c.case_number WHERE b.case_number=? && c.status_id=?&& a.valid=?  && b.select_state=? && (b.receive_files_time is null || b.receive_files_time='')  ORDER BY b.create_time DESC LIMIT 1 `,
//         [numId, 6, 1, '需補件']
//     );

//     res.json(getUserTotalFile);
// });

// 上傳檔案更新狀態(接收補件)
// http://localhost:3001/api/files/acceptFile
// router.patch('/acceptFile/:num', async (req, res) => {
//     const numId = req.params.num;
//     let v = req.body;

//     let [getUserTotalFile] = await pool.execute(
//         `UPDATE select_states_detail SET receive_files_time=? WHERE case_number =? && 	up_files_time=? && select_state=? && (receive_files_time is null || receive_files_time='') `,
//         [v.receiveTime, numId, v.create_time, '需補件']
//     );
//     await pool.execute(`UPDATE application_form SET status_id=? WHERE case_number = ? `, [6, numId]);

//     await pool.execute(
//         `INSERT INTO select_states_detail (case_number,handler,select_state,create_time) VALUES(?,?,?,?)`,
//         [numId, v.handler, '案件進行中', v.receiveTime]
//     );

//     res.json(getUserTotalFile);
// });

//下載檔案
//http://localhost:3001/api/files
router.post('/:num', authMid.checkLogin, authMid.all, async (req, res) => {
    const numId = req.params.num;
    let v = req.body;
    // res.download('uploads/築間.png');
    let file = __dirname + `/../${v.dbTime}/${numId}/${v.fileNo}`;
    res.download(file);
});

//刪除檔案
//http://localhost:3001/api/files/delete
router.post('/delete/:num', authMid.checkLogin, authMid.handler, async (req, res) => {
    const numId = req.params.num;
    let v = req.body;
    let filePath = __dirname + `/../${v.dbTime}/${numId}`;
    let files = [];
    if (fs.existsSync(filePath)) {
        files = fs.readdirSync(filePath);
        files.forEach((file, index) => {
            let curPath = filePath + '/' + file;
            if (fs.statSync(curPath).isDirectory()) {
                delDir(curPath); //遞迴刪除目錄下的資料夾
            } else {
                fs.unlinkSync(curPath); //刪除檔案
            }
        });
        fs.rmdirSync(filePath); //刪除目錄
    }
});

// 匯出
module.exports = router;
