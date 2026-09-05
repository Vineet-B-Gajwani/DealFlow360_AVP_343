'use strict';

const { Router } = require('express');
const controller = require('./payment.controller');
const authenticate = require('../../middleware/authenticate');
const { requireCustomer } = require('../../middleware/requireCustomer');

const router = Router();

router.use(authenticate, requireCustomer);

router.get('/invoice/:invoiceId', controller.getPayments);
router.post('/', controller.recordPayment);

module.exports = router;
