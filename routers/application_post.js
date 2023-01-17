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
        let [source] = await pool.execute('SELECT * FROM application_source');
        let [newState] = source.filter((d) => {
            return d.number === r.source;
        });

        // 轉換類型名稱
        // let [category] = await pool.execute('SELECT * FROM application_source');
        // let [newState1] = category.filter((d) => {
        //     return d.number === r.category;
        // });

        let v = req.body;
        if (v.unit === '') {
            v.unit = req.session.member.applicant_unit;
        } else {
            v.unit = v.unit;
        }

        if (checkData.length === 0) {
            let [application] = await pool.execute(
                `INSERT INTO application_form (case_number,user,user_id,handler,application_source,application_category,status_id,relation,litigant,litigant_phone,litigant_county_id,litigant_area_id,litigant_rimin,litigant_address, client_name,client_phone,client_county,client_area,client_rimin,client_address,remark,sender,unit, create_time,last_status) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
                [
                    r.number,
                    r.user,
                    r.id,
                    r.handler,
                    newState.name,
                    r.category,
                    r.status,
                    r.relation,
                    r.litigant,
                    r.litigantPhone,
                    r.litigantCounty,
                    r.litigantArea,
                    r.litigantRimin,
                    r.litigantAddress,
                    r.client,
                    r.clientPhone,
                    r.clientCounty,
                    r.clientArea,
                    r.clientRimin,
                    r.clientAddress,
                    r.remark,
                    '',
                    r.unit,
                    r.create_time,
                    '處理人評估中',
                ]
            );
            for (let data of arr) {
                let [application_detail] = await pool.execute(
                    `INSERT INTO application_form_detail (case_number_id,directions,checked,valid ) VALUES (?,?,?,?)`,
                    [r.number, data.text, 0, 0]
                );
            }
            let [select_state] = await pool.execute(
                `INSERT INTO select_states_checked (case_number,responded_client,called,success,fail,populace ) VALUES (?,?,?,?,?,?)`,
                [r.number, 0, 0, 1, 0, '']
            );
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
        let uploadPath = __dirname + `/../${nowDate}/${v.number}/` + v.fileNo + [i];
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
