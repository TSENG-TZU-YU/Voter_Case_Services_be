const express = require('express');
const router = express.Router();
const appController = require('../controllers/application');
// const authMid = require('../middlewares/auth');

// checked
router.put('/checked/:needId', appController.putNeedChecked);
router.put('/unChecked/:needId', appController.putUnNeedChecked);

// post 審理結果
router.post('/postHandle', appController.handlePost);

// put 狀態 4 -> 5
// router.post('/changeState/:caseNum', appController.handleChangeState);

// post 修改需求
router.post('/postAddNeed', appController.handlePostNeed);
// router.post('/putAcceptNeed/:num', appController.handleAcceptNeed);

// 取消申請
router.post('/cancleAcc/:num', appController.handleCancleAcc);

// finish
router.post('/applicationFinish/:num', appController.handleFinish);

// user 確認是否完成
router.post('/acceptFinish', appController.handleAcceptFinish);
router.post('/rejectFinish', appController.handleRejectFinish);

// 轉件
router.post('/acceptCase', appController.handleAcceptCase);
router.post('/rejectCase', appController.handleRejectCase);

// 沒有指定handler, 確認接收
router.post('/handlerReceiveCase/:num', appController.handleReceiveCase);

// 審核歷程
router.get('/getCaseHistory/:case', appController.getCaseHistory);

// 總管理filter all data
router.get('/getAssistantAllApp', appController.getAssistantAllApp);

// 全部列表資料
router.get('/', appController.getAllApp);


router.post('/:num', appController.getUserIdApp);

// post file
router.post('/postHandleFile/:num', appController.handlePostFile);

module.exports = router;
