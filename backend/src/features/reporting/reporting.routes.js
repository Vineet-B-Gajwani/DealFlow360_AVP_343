'use strict';

const { Router } = require('express');
const controller = require('./reporting.controller');
const authenticate = require('../../middleware/authenticate');
const authorize = require('../../middleware/authorize');

const router = Router();

router.use(authenticate);
router.use(authorize('ADMIN', 'SALES_MANAGER'));

router.get('/summary', controller.getSummaryReport);

module.exports = router;
