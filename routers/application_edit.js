// 啟用 express
const express = require('express');
const router = express.Router();
const pool = require('../utils/db');
const moment = require('moment');
const fs = require('fs');

// 送出表單
// http://localhost:3001/api/application_edit/submit
router.patch('/submit/:num', async (req, res) => {
    try {
        const numId = req.params.num;
        let r = req.body;

        let [application] = await pool.execute(
            `UPDATE application_form SET  handler=?,application_category=?,project_name=?,cycle=?,status_id=?,create_time=? WHERE case_number=? && id=? `,
            [r.handler, r.application_category, r.project_name, r.cycle, r.status_id, r.create_time, numId, r.id]
        );
        res.send('ok2');
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
            `UPDATE application_form SET  handler=?,application_category=?,project_name=?,cycle=?,create_time=? WHERE case_number=? && id=? && status_id=?`,
            [r.handler, r.application_category, r.project_name, r.cycle, r.create_time, numId, r.id, r.status_id]
        );
        res.send('ok2');
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
    console.log('v.dbTime.length', v.dbTime.length);
    console.log('v.file', typeof v.file);
    //刪除資料庫檔案
    if (v.dbTime.length > 1) {
        let [result] = await pool.execute(`SELECT * FROM upload_files_detail WHERE case_number_id=?`, [numId]);

        for (let i = 1; i < result.length; i++) {
            let re = result[i].file_no;
            console.log('re', i, re);
            //第一個檔案被改成另一個檔案 v.file = undefined
            if (v.file !== 'undefined' && v.file !== undefined) {
                console.log('tttt', typeof v.file);
                // 用型態分辨
                if (typeof v.file === 'string') {
                    const isAsset = [v.file].some((item) => item === re);
                    if (isAsset === true) {
                        let [application] = await pool.execute(
                            `UPDATE upload_files_detail SET  create_time=? WHERE case_number_id=? `,
                            [v.create_time, numId]
                        );
                        console.log('true', result[i].file_no);
                    } else {
                        let [deletFile] = await pool.execute(
                            `DELETE FROM upload_files_detail
                            WHERE case_number_id=? && file_no=?`,
                            [numId, result[i].file_no]
                        );
                        console.log('false', result[i].file_no);
                    }

                    console.log('isAsset', isAsset);
                } else {
                    const isAsset = v.file.some((item) => item === re);
                    if (isAsset === true) {
                        let [application] = await pool.execute(
                            `UPDATE upload_files_detail SET  create_time=? WHERE case_number_id=? `,
                            [v.create_time, numId]
                        );
                        console.log('true', result[i].file_no);
                    } else {
                        let [deletFile] = await pool.execute(
                            `DELETE FROM upload_files_detail
                            WHERE case_number_id=? && file_no=?`,
                            [numId, result[i].file_no]
                        );
                        console.log('false', result[i].file_no);
                    }

                    console.log('isAsset', isAsset);
                }
            } else {
                let [deletFile1] = await pool.execute(
                    `DELETE FROM upload_files_detail
                    WHERE case_number_id=?`,
                    [numId]
                );
            }

            // if (v.file === undefined) {
            //     let [deletFile1] = await pool.execute(
            //         `DELETE FROM upload_files_detail
            //         WHERE case_number_id=?`,
            //         [numId]
            //     );
            // }

            // let j = 1;
            // console.log('後端跑第', i + 1, '次');
            // for (let front of v.file) {
            //     console.log('front', front);
            //     console.log('back', re);
            //     console.log(`用後端資料跑比對前端第${j}個`);
            //     j++;
            // }
            // for (let back of result) {
            //     let j = 0;

            //     const { file_no } = back;
            //     for (let front of v.file) {
            //         console.log('front', front);
            //         console.log('file_no', file_no);
            //         j++;
            //         console.log(`用後端資料跑比對前端第${j}個`);
            //     }
            // }

            // console.log('這邊是跑前端檔案迴圈第', i, '次');
            // console.log(re);
            // for (let value of re) {
            //     console.log('ReValue', value);
            //     console.log('上下兩邊要比');
            //     console.log('前端', v.file[i]);
            // }

            // console.log('i', i);
            // console.log('前端', v.file[i]);
            // console.log('資料庫', re);
        }
    }

    //刪除後端檔案
    // if (v.dbTime.length >= 1) {
    //     let filePath = __dirname + `/../${v.dbTime}/${numId}`;
    //     files = fs.readdirSync(filePath);
    //     console.log('v.file.length', v.file.length);
    //     for (let i = 0; i < files.length; i++) {
    //         console.log('後端', files[i]);
    //         console.log('前端', v.file[i]);
    //         const isAsset = v.file.some((item) => item === files);
    //         console.log('isAsset', isAsset);
    //         // if (v.file[i] === files[i]) {
    //         //     console.log('aaa', files[i]);
    //         // } else {
    //         //     console.log('bbb', v.file[i]);
    //         //     //TODO:迴圈 讀取原本的檔案NO 有相同的在 rename 檔案no
    //         //     let files = [];
    //         //     if (fs.existsSync(filePath)) {
    //         //         files = fs.readdirSync(filePath);
    //         //         files.forEach((file, index) => {
    //         //             let curPath = filePath + '/' + file;
    //         //             if (fs.statSync(curPath).isDirectory()) {
    //         //                 delDir(curPath); //遞迴刪除目錄下的資料夾
    //         //             } else {
    //         //                 fs.unlinkSync(curPath); //刪除檔案
    //         //             }
    //         //         });
    //         //     }
    //         // }
    //     }
    // }

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
            } catch (err) {
                console.log(err);
            }
        }
    }

    res.send('ok2');
});

// 匯出
module.exports = router;

//    //TODO:迴圈 讀取原本的檔案NO 有相同的在 rename 檔案no
//    let files = [];
//    if (fs.existsSync(filePath)) {
//        files = fs.readdirSync(filePath);
//        files.forEach((file, index) => {
//            let curPath = filePath + '/' + file;
//            if (fs.statSync(curPath).isDirectory()) {
//                delDir(curPath); //遞迴刪除目錄下的資料夾
//            } else {
//                fs.unlinkSync(curPath); //刪除檔案
//            }
//        });
//        fs.rmdirSync(filePath); //刪除目錄
//    }
