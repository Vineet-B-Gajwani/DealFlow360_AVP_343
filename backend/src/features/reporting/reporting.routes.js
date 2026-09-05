'use strict';

const { Router } = require('express');
const controller = require('./reporting.controller');
const authenticate = require('../../middleware/authenticate');
const { requireCustomer } = require('../../middleware/requireCustomer');

const router = Router();

router.use(authenticate, requireCustomer);

router.get('/dashboard', controller.getDashboard);

module.exports = router;
