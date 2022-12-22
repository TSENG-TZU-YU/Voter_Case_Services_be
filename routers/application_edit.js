// 啟用 express
const express = require('express');
const router = express.Router();
const pool = require('../utils/db');
const moment = require('moment');

// 送出表單
// http://localhost:3001/api/application_edit/submit
router.patch('/submit/:num', async (req, res) => {
    try {
        const numId = req.params.num;
        let r = req.body;

        let [application] = await pool.execute(
            `UPDATE application_form SET  handler=?,application_category=?,project_name=?,cycle=?,status_id=? WHERE case_number=? && user_id=? `,
            [r.handler, r.application_category, r.name, r.cycle, r.status, numId, r.id]
        );
        console.log('r', r);
    } catch (err) {
        console.log(err);
    }
});

// 儲存表單
// http://localhost:3001/api/application_edit/store
router.patch('/store/:num', async (req, res) => {
    try {
        const numId = req.params.num;
        let r = req.body;
        let [application] = await pool.execute(
            `UPDATE application_form SET  handler=?,application_category=?,project_name=?,cycle=? WHERE case_number=? && user_id=? && status_id=?`,
            [r.handler, r.application_category, r.name, r.cycle, numId, r.id, r.status]
        );
    } catch (err) {
        console.log(err);
    }
});

// router.post('/file', async (req, res) => {
//     const arr = Object.values(req?.files || {});
//     let v = req.body;
//     let nowDate = moment().format('YYYYMM');

//     for (let i = 0; i < arr.length; i++) {
//         //TODO:上傳路徑
//         let uploadPath = __dirname + `/../${nowDate}/${v.number}/` + v.fileNo + [i];
//         arr[i].mv(uploadPath, (err) => {
//             if (err) {
//                 return res.send(err);
//             }
//         });

//         // 限制是否已有檔案
//         let [checkData] = await pool.execute('SELECT * FROM upload_files_detail  WHERE file_no = ? && create_time=?', [
//             v.fileNo + [i],
//             v.create_time,
//         ]);
//         if (checkData.length === 0) {
//             try {
//                 let [files] = await pool.execute(
//                     'INSERT INTO upload_files_detail (case_number_id,name,file_no,valid,create_time) VALUES (?,?,?,?,?)',
//                     [v.number, arr[i].name, v.fileNo + [i], 0, v.create_time]
//                 );
//             } catch (err) {
//                 console.log(err);
//             }
//         }
//     }

//     res.send('ok2');
// });

// 匯出
module.exports = router;
