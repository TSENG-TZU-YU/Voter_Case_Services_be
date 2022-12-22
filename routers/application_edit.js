// 啟用 express
const express = require('express');
const router = express.Router();
const pool = require('../utils/db');
const moment = require('moment');
const { default: axios } = require('axios');
const fs = require('fs');

// 送出表單
// http://localhost:3001/api/application_edit/submit
router.patch('/submit/:num', async (req, res) => {
    try {
        const numId = req.params.num;
        let r = req.body;

        let [application] = await pool.execute(
            `UPDATE application_form SET  handler=?,application_category=?,project_name=?,cycle=?,status_id=? ,create_time=?WHERE case_number=? && user_id=? `,
            [r.handler, r.application_category, r.project_name, r.cycle, r.status, v.create_time, numId, r.id]
        );
        // console.log('r', r);
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
            `UPDATE application_form SET  handler=?,application_category=?,project_name=?,cycle=?,create_time=? WHERE case_number=? && user_id=? && status_id=?`,
            [r.handler, r.application_category, r.project_name, r.cycle, v.create_time, numId, r.id, r.status]
        );
    } catch (err) {
        console.log(err);
    }
});

// 上傳檔案
// http://localhost:3001/api/application_edit/file
router.post('/file/:num', async (req, res) => {
    const numId = req.params.num;
    let v = req.body;
    let nowDate = moment().format('YYYYMM');
    const arr = Object.values(req?.files || {});

    //刪除資料庫檔案
    let [deletFile] = await pool.execute(
        `DELETE FROM upload_files_detail
    WHERE case_number_id=?`,
        [numId]
    );

    //刪除後端檔案
    if (v.dbTime.length > 1) {
        let filePath = __dirname + `/../${v.dbTime}/${numId}`;
        files = fs.readdirSync(filePath);
        console.log(' files', files[2]);
        //TODO:迴圈 讀取原本的檔案NO 有相同的在 rename 檔案no
        // let files = [];
        // if (fs.existsSync(filePath)) {
        //     files = fs.readdirSync(filePath);
        //     files.forEach((file, index) => {
        //         let curPath = filePath + '/' + file;
        //         if (fs.statSync(curPath).isDirectory()) {
        //             delDir(curPath); //遞迴刪除目錄下的資料夾
        //         } else {
        //             fs.unlinkSync(curPath); //刪除檔案
        //         }
        //     });
        //     fs.rmdirSync(filePath); //刪除目錄
        // }
    }

    for (let i = 0; i < arr.length; i++) {
        // 轉換類型名稱
        let [category] = await pool.execute('SELECT * FROM application_category');
        let [newState] = category.filter((d) => {
            return d.name === v.No;
        });
        //TODO:上傳路徑
        let uploadPath = __dirname + `/../${nowDate}/${v.number}/` + newState.number + v.fileNo + [i];
        arr[i].mv(uploadPath, (err) => {
            if (err) {
                return res.send(err);
            }
        });

        // 限制是否已有檔案
        let [checkData] = await pool.execute('SELECT * FROM upload_files_detail  WHERE file_no = ? && create_time=?', [
            newState.number + v.fileNo + [i],
            v.create_time,
        ]);
        if (checkData.length === 0) {
            try {
                let [files] = await pool.execute(
                    'INSERT INTO upload_files_detail (case_number_id,name,file_no,valid,create_time) VALUES (?,?,?,?,?)',
                    [numId, arr[i].name, newState.number + v.fileNo + [i], 0, v.create_time]
                );
                console.log('numId', numId);
            } catch (err) {
                console.log(err);
            }
        }
    }

    res.send('ok2');
});

// 匯出
module.exports = router;
