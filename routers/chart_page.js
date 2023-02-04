const express = require('express');
const authMid = require('../middlewares/auth');
const router = express.Router();
const appController = require('../controllers/chart_page');

// checked
router.get('/CategoryPage', authMid.checkLogin, appController.getCategoryPage);
router.get('/StatusPage', authMid.checkLogin, appController.getStatusPage);
router.get('/appUnitPage', authMid.checkLogin, appController.getappUnitPage);
router.get('/appUserPage', authMid.checkLogin, appController.getappUserPage);
router.get('/handlerUnitPage', authMid.checkLogin, appController.gethandlerUnitPage);
router.get('/handlerUserPage', authMid.checkLogin, appController.gethandlerUserPage);

module.exports = router;
