'use strict';

const { Router } = require('express');
const controller = require('./dealHealth.controller');
const authenticate = require('../../middleware/authenticate');
const authorize = require('../../middleware/authorize');

const router = Router();

router.use(authenticate);

// Restrict all deal-health endpoints to ADMIN & SALES_MANAGER
router.use(authorize('ADMIN', 'SALES_MANAGER'));

// Get alerts — ADMIN, SALES_MANAGER
router.get('/alerts', controller.getActiveAlerts);

// Trigger scan — ADMIN, SALES_MANAGER
router.post('/scan', controller.triggerScan);

// Update alert status / dismiss — ADMIN, SALES_MANAGER
router.patch('/alerts/:id/status', controller.updateAlertStatus);

module.exports = router;
