const express = require('express');
const authMid = require('../middlewares/auth');
const router = express.Router();
const appController = require('../controllers/application');

// checked
router.put('/checked/:needId', authMid.checkLogin, appController.putNeedChecked);
router.put('/unChecked/:needId', authMid.checkLogin, appController.putUnNeedChecked);

// sel checked
router.post('/selChecked/:needId', authMid.checkLogin, appController.postSelChecked);
router.post('/selUnChecked/:needId', authMid.checkLogin, appController.postSelUnChecked);
router.post('/populaceMsg/:needId', authMid.checkLogin, appController.postPopulaceMsg);

// post 審理結果
router.post('/postHandle', authMid.checkLogin, appController.handlePost);

// put 狀態 4 -> 5
// router.post('/changeState/:caseNum', appController.handleChangeState);

// post 修改需求
router.post('/postAddNeed', authMid.checkLogin, appController.handlePostNeed);
// router.post('/putAcceptNeed/:num', appController.handleAcceptNeed);

// 取消申請
router.post('/cancleAcc/:num', authMid.checkLogin, appController.handleCancleAcc);

// finish
router.post('/applicationFinish/:num', authMid.checkLogin, appController.handleFinish);

// user 確認是否完成
router.post('/acceptFinish', authMid.checkLogin, appController.handleAcceptFinish);
router.post('/rejectFinish', authMid.checkLogin, appController.handleRejectFinish);

// 轉件
router.post('/acceptCase', authMid.checkLogin, authMid.handler_manage, appController.handleAcceptCase);
router.post('/rejectCase', authMid.checkLogin, authMid.handler_manage, appController.handleRejectCase);

// 沒有指定handler, 確認接收
router.post('/handlerReceiveCase/:num', authMid.checkLogin, authMid.handler_manage, appController.handleReceiveCase);

// 審核歷程
router.get('/getCaseHistory/:case', authMid.checkLogin, authMid.handler_manage, appController.getCaseHistory);

// 案件處理情形
router.get('/getHandleStatus/:case', authMid.checkLogin, authMid.handler_manage, appController.getHandleStatus);
router.post('/postHandleStatus', authMid.checkLogin, authMid.handler_manage, appController.postHandleStatus);

// 稽核紀錄
router.post('/postRecord', authMid.checkLogin, appController.postRecord);

// 總管理filter all data
router.get('/getAssistantAllApp', authMid.checkLogin, authMid.manage, appController.getAssistantAllApp);

// 全部列表資料
router.get('/', authMid.checkLogin, authMid.user, appController.getAllApp);

router.post('/:num', authMid.checkLogin, appController.getUserIdApp);

// post file
router.post('/postHandleFile/:num', authMid.checkLogin, authMid.handler, appController.handlePostFile);

module.exports = router;
