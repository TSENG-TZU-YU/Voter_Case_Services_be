const { default: axios } = require('axios');
const express = require('express');
const app = express();
require('dotenv').config();
const port = process.env.SERVER_PORT || 3001;
const pool = require('./utils/db.js');
//文件上傳
const fileUpload = require('express-fileupload');
const path = require('path');
const cors = require('cors');
app.use(express.json());
const corsOptions = {
    credentials: true,
    origin: ['http://localhost:3000'],
    exposedHeaders: ['Content-Disposition'],
};
app.use(cors(corsOptions));

// const cookieParser = require('cookie-parser');
// app.use(cookieParser());

// app.get('/', (req, res) => {
//     res.cookie({ name: 'aaa' });
//     console.log(res.cookie);
// });

// 啟用 session
const expressSession = require('express-session');
// 把 session 存在硬碟中
var FileStore = require('session-file-store')(expressSession);
app.use(
    expressSession({
        store: new FileStore({
            // session 儲存的路徑
            path: path.join(__dirname, '.', 'sessions'),
        }),
        secret: process.env.SESSION_SECRET,
        // 如果 session 沒有改變的話，要不要重新儲存一次？
        resave: false,
        // 還沒初始化的，要不要存
        saveUninitialized: false,
    })
);

//啟用 express-fileupload
app.use(
    fileUpload({
        createParentPath: true,
        defParamCharset: 'utf8', // 添加utf8编码
    })
);

//-----------------------------------------------------
// app.use(
//     expressSession({
//       secret: process.env.SESSION_SECRET,
//       saveUninitialized: false,
//       resave: false,
//     })
//   );
//   app.get('/', (req, res) => {
//     res.cookie('lang', 'zh-TW');
//     res.send('home');
//   });

//   app.get('/login', (req, res) => {
//     req.session.message = {
//       title: 'sessionTest',
//     };
//     res.send('login');
//   });
//   app.get('/session', (req, res) => {
//     const response = JSON.stringify(req.session.message);
//     console.log('response', response);
//     res.json(response);
//   });


//登入
let login = require('./routers/login');
app.use('/api/login', login);

//登出
let logout = require('./routers/logout');
app.use('/api/logout', logout);

//get使用者申請表
let application_get = require('./routers/application_get');
app.use('/api/application_get', application_get);

//post使用者申請表
let application_post = require('./routers/application_post');
app.use('/api/application_post', application_post);

//檔案
let files = require('./routers/files');
app.use('/api/files', files);

//-----------------------------------------------------
// Routers middleware
const applicationData = require('./routers/application');
app.use('/api/1.0/applicationData', applicationData);

// 啟動 server，並且開始 listen 一個 port
app.listen(port, () => {
    console.log(`server start at ${port}`);
});
// app.listen(4000);
