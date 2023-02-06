const express = require('express');
const authMid = require('../middlewares/auth');
const router = express.Router();
const appController = require('../controllers/chart_page');

// checked
router.get('/CategoryPage', authMid.checkLogin, authMid.manage, appController.getCategoryPage);
router.get('/StatusPage', authMid.checkLogin, authMid.manage, appController.getStatusPage);
router.get('/appUnitPage', authMid.checkLogin, authMid.manage, appController.getappUnitPage);
router.get('/appUserPage', authMid.checkLogin, authMid.manage, appController.getappUserPage);
router.get('/handlerUnitPage', authMid.checkLogin, authMid.manage, appController.gethandlerUnitPage);
router.get('/handlerUserPage', authMid.checkLogin, authMid.manage, appController.gethandlerUserPage);

module.exports = router;
