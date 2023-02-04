const express = require('express');
const router = express.Router();
const appController = require('../controllers/application_handler');
const authMid = require('../middlewares/auth');

// 全部列表資料
router.get('/', appController.getAllAppHandler);

module.exports = router;
