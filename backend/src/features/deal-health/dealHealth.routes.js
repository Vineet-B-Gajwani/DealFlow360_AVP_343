'use strict';

const { Router } = require('express');
const controller = require('./dealHealth.controller');
const authenticate = require('../../middleware/authenticate');
const authorize = require('../../middleware/authorize');

const router = Router();

router.use(authenticate);
router.use(authorize('ADMIN', 'SALES_MANAGER'));

router.get('/alerts', controller.getActiveAlerts);
router.post('/scan', controller.triggerScan);
router.patch('/alerts/:id/status', controller.updateAlertStatus);

module.exports = router;
