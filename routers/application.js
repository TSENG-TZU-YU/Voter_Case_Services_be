const express = require('express');
const authMid = require('../middlewares/auth');
const router = express.Router();
const appController = require('../controllers/application');

// 需求確認
// router.put('/checked/:needId', authMid.checkLogin, appController.putNeedChecked);
// router.put('/unChecked/:needId', authMid.checkLogin, appController.putUnNeedChecked);

// sel checked
router.post('/selChecked/:needId', authMid.checkLogin, authMid.handler, appController.postSelChecked);
router.post('/selUnChecked/:needId', authMid.checkLogin, authMid.handler, appController.postSelUnChecked);
router.post('/populaceMsg/:needId', authMid.checkLogin, authMid.handler, appController.postPopulaceMsg);

// post 審理結果
router.post('/postHandle', authMid.checkLogin, authMid.handler, appController.handlePost);

// put 狀態 4 -> 5
// router.post('/changeState/:caseNum', appController.handleChangeState);

// post 修改需求
router.post('/postAddNeed', authMid.checkLogin, authMid.user, appController.handlePostNeed);
// router.post('/putAcceptNeed/:num', appController.handleAcceptNeed);

// 取消申請
// router.post('/cancleAcc/:num', authMid.checkLogin, appController.handleCancleAcc);

// finish
// router.post('/applicationFinish/:num', authMid.checkLogin, appController.handleFinish);

// user 確認是否完成
// router.post('/acceptFinish', authMid.checkLogin, appController.handleAcceptFinish);
// router.post('/rejectFinish', authMid.checkLogin, appController.handleRejectFinish);

// 轉件
router.post('/acceptCase', authMid.checkLogin, authMid.handler, appController.handleAcceptCase);
router.post('/rejectCase', authMid.checkLogin, authMid.handler, appController.handleRejectCase);

// 沒有指定handler, 確認接收
router.post('/handlerReceiveCase/:num', authMid.checkLogin, authMid.handler, appController.handleReceiveCase);

// 審核歷程
router.get('/getCaseHistory/:case', authMid.checkLogin, authMid.user, appController.getCaseHistory);

// 案件處理情形
router.get('/getHandleStatus/:case', authMid.checkLogin, authMid.user, appController.getHandleStatus);
router.post('/postHandleStatus', authMid.checkLogin, authMid.handler, appController.postHandleStatus);

// 稽核紀錄
router.post('/postRecord', authMid.checkLogin, authMid.handler_manage, appController.postRecord);

// 總管理filter all data
router.get('/getAssistantAllApp', authMid.checkLogin, authMid.manage, appController.getAssistantAllApp);

// 全部列表資料
router.get('/', authMid.checkLogin, authMid.user, appController.getAllApp);

router.post('/:num', authMid.checkLogin, authMid.user, appController.getUserIdApp);

// 報表列表資料
router.get('/getReport', authMid.checkLogin, authMid.manage, appController.getReport);

// post file
router.post('/postHandleFile/:num', authMid.checkLogin, authMid.handler, appController.handlePostFile);

module.exports = router;
