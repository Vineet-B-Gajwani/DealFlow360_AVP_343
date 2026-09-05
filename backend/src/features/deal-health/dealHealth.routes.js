'use strict';

const { Router } = require('express');
const controller = require('./dealHealth.controller');
const authenticate = require('../../middleware/authenticate');
const { requireCustomer } = require('../../middleware/requireCustomer');

const router = Router();

router.use(authenticate, requireCustomer);

router.get('/alerts', controller.getAlerts);
router.post('/scan', controller.runScan); // Endpoint to trigger scan manually for demo

module.exports = router;
