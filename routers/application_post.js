// 啟用 express
const express = require('express');
const router = express.Router();
const pool = require('../utils/db');
const moment = require('moment');

// 處理人
// http://localhost:3001/api/application_post
router.post('/', async (req, res) => {
    try {
        let r = req.body;
        let arr = req.body.need;
        // if(r.number.==)
        let [checkData] = await pool.execute('SELECT * FROM application_form  WHERE case_number = ? && user_id=?', [
            r.number,
            r.id,
        ]);

        // 轉換類型名稱
        let [category] = await pool.execute('SELECT * FROM application_category');
        let [newState] = category.filter((d) => {
            return d.number === r.category;
        });

        if (checkData.length === 0) {
            let [application] = await pool.execute(
                `INSERT INTO application_form (case_number,user,user_id,handler,application_category,project_name,cycle,status_id, create_time) VALUES (?,?,?,?,?,?,?,?,?)`,
                [r.number, r.user, r.id, r.handler, newState.name, r.name, r.cycle, r.status, r.create_time]
            );
            for (let data of arr) {
                let [application_detail] = await pool.execute(
                    `INSERT INTO application_form_detail (case_number_id,requirement_name,directions ) VALUES (?,?,?)`,
                    [r.number, data.title, data.text]
                );
            }
        }
    } catch (err) {
        console.log(err);
    }
});

router.post('/file', async (req, res) => {
    const arr = Object.values(req?.files || {});
    let v = req.body;
    let nowDate = moment().format('YYYYMM');

    for (let i = 0; i < arr.length; i++) {
        //TODO:上傳路徑
        let uploadPath = __dirname + `/../${nowDate}/${v.number}/` + v.fileNo + [i] + arr[i].name;
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
                    [v.number, arr[i].name, v.fileNo + [i], 0, v.create_time]
                );
            } catch (err) {
                console.log(err);
            }
        }
    }

    res.send('ok2');
});

// 匯出
module.exports = router;
