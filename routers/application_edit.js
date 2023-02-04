// 啟用 express
const express = require('express');
const router = express.Router();
const pool = require('../utils/db');
const moment = require('moment');
const fs = require('fs');
const argon2 = require('argon2');
const authMid = require('../middlewares/auth');

// 送出表單
// http://localhost:3001/api/application_edit/submit
router.patch('/submit/:num', authMid.checkLogin, async (req, res) => {
    try {
        const numId = req.params.num;
        let r = req.body;

        let [application] = await pool.execute(
            `UPDATE application_form SET  handler=?,application_source=?,application_category=?,status_id=?,create_time=?,relation=?,phoneCheck=?,litigant=?,litigant_phone=?,litigant_county_id=?,litigant_area_id=?,litigant_rimin=?,litigant_address=?,client_name=?,client_phone=?,client_county=?,client_area=?,client_rimin=?,client_address=?,remark=?,sender=?,unit=? WHERE case_number=? && id=? `,
            [
                r.handler,
                r.application_source,
                r.application_category,
                r.status_id,
                r.create_time,
                r.relation,
                r.phoneCheck,
                r.litigant,
                r.litigant_phone,
                r.litigant_county_id,
                r.litigant_area_id,
                r.litigant_rimin,
                r.litigant_address,
                r.client_name,
                r.client_phone,
                r.client_county,
                r.client_area,
                r.client_rimin,
                r.client_address,
                r.remark,
                '',
                r.unit,
                numId,
                r.id,
            ]
        );
        res.send('ok2');
    } catch (err) {
        console.log(err);
    }
});

// 儲存表單
// http://localhost:3001/api/application_edit/store
router.patch('/store/:num', authMid.checkLogin, async (req, res) => {
    try {
        const numId = req.params.num;
        let r = req.body;

        let [application] = await pool.execute(
            `UPDATE application_form SET handler=?,application_source=?,application_category=?,create_time=?,relation=?,litigant=?,litigant_phone=?,litigant_county_id=?,litigant_area_id=?,litigant_rimin=?,litigant_address=?,client_name=?,client_phone=?,client_county=?,client_area=?,client_rimin=?,client_address=?,remark=?,sender=?,unit=? WHERE case_number=? && id=? && status_id=?`,
            [
                r.handler,
                r.application_source,
                r.application_category,
                r.create_time,
                r.relation,
                r.litigant,
                r.litigant_phone,
                r.litigant_county_id,
                r.litigant_area_id,
                r.litigant_rimin,
                r.litigant_address,
                r.client_name,
                r.client_phone,
                r.client_county,
                r.client_area,
                r.client_rimin,
                r.client_address,
                r.remark,
                '',
                r.unit,
                numId,
                r.id,
                r.status_id,
            ]
        );
        res.send('ok2');
    } catch (err) {
        console.log(err);
    }
});

// 上傳檔案
// http://localhost:3001/api/application_edit/file
router.post('/file/:num', authMid.checkLogin, async (req, res) => {
    const numId = req.params.num;
    let v = req.body;
    let nowDate = moment().format('YYYYMM');
    const arr = Object.values(req?.files || {});
    // console.log('v', v.file === undefined);
    // console.log('v.dbTime.length', v.dbTime.length);
    // console.log('v.file', v.file);
    //刪除資料庫檔案
    if (v.dbTime.length > 1) {
        console.log('nid', v.dbTime.length);

        let [result] = await pool.execute(`SELECT * FROM upload_files_detail WHERE case_number_id=?`, [numId]);

        for (let i = 0; i < result.length; i++) {
            let re = result[i].file_no;
            // console.log('re', i, re);
            //第一個檔案被改成另一個檔案 v.file = undefined
            if (v.file !== 'undefined' && v.file !== undefined) {
                // console.log('tttt', typeof v.file); 陣列只有一筆時會變成字串
                // 用型態分辨
                if (typeof v.file === 'string') {
                    const isAsset = [v.file].some((item) => item === re);
                    if (isAsset === true) {
                        let [application] = await pool.execute(
                            `UPDATE upload_files_detail SET  create_time=? WHERE case_number_id=? `,
                            [v.create_time, numId]
                        );
                    } else {
                        let [deletFile] = await pool.execute(
                            `DELETE FROM upload_files_detail
                            WHERE case_number_id=? && file_no=?`,
                            [numId, result[i].file_no]
                        );
                    }
                } else {
                    const isAsset = v.file.some((item) => item === re);
                    if (isAsset === true) {
                        let [application] = await pool.execute(
                            `UPDATE upload_files_detail SET  create_time=? WHERE case_number_id=? `,
                            [v.create_time, numId]
                        );
                    } else {
                        let [deletFile] = await pool.execute(
                            `DELETE FROM upload_files_detail
                            WHERE case_number_id=? && file_no=?`,
                            [numId, result[i].file_no]
                        );
                    }
                }
            } else {
                console.log('d', 'del');
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
});

// 刪除表單
// http://localhost:3001/api/application_edit/deleteForm
router.post('/deleteForm/:num', authMid.checkLogin, async (req, res) => {
    try {
        const numId = req.params.num;
        let r = req.body;

        let [application] = await pool.execute(
            `DELETE FROM application_form   WHERE case_number=? && id=? && status_id=?`,
            [numId, r.id, r.status_id]
        );
        res.send('ok2');
    } catch (err) {
        console.log(err);
    }
});

// 更改密碼
// http://localhost:3001/api/application_edit/passWord
router.post('/passWord', authMid.checkLogin, async (req, res) => {
    try {
        let r = req.body;
        let hashPassword = await argon2.hash(r.password, 10);
        let [application] = await pool.execute(`UPDATE users SET password=? WHERE id=? && staff_code=?`, [
            hashPassword,
            req.session.member.id,
            req.session.member.staff_code,
        ]);
        res.send('ok2');
    } catch (err) {
        console.log(err);
    }
});

// 取得權限密碼
// http://localhost:3001/api/application_edit/getPermissionsPassWord
router.get('/getPermissionsPassWord', authMid.checkLogin, async (req, res) => {
    try {
        let [result] = await pool.execute(
            `SELECT id, name, applicant_unit unit, staff_code code, valid1, valid2
        FROM users
        WHERE isLock = ?
        ORDER BY applicant_unit ASC
         `,
            [4]
        );
        res.json({
            result,
        });
    } catch (err) {
        console.log(err);
    }
});

// 更改權限密碼
// http://localhost:3001/api/application_edit/permissionsPassWord
router.post('/permissionsPassWord', authMid.checkLogin, async (req, res) => {
    try {
        let v = req.body;
        // console.log('v', v.passThr[v.ind],v.ind);
        let hashPassword = await argon2.hash(v.passThr[v.ind].valid1, 10);
        let [application] = await pool.execute(`UPDATE users SET isLock=?, password=? WHERE id=? && staff_code=?`, [
            0,
            hashPassword,
            v.passThr[v.ind].id,
            v.passThr[v.ind].code,
        ]);
        res.send('ok2');
    } catch (err) {
        console.log(err);
    }
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
