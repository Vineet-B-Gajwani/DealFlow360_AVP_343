'use strict';

const { Router } = require('express');
const controller = require('./invoice.controller');
const authenticate = require('../../middleware/authenticate');
const { requireCustomer } = require('../../middleware/requireCustomer');

const router = Router();

router.use(authenticate, requireCustomer);

router.get('/', controller.getMyInvoices);
router.get('/:id', controller.getInvoiceById);

module.exports = router;
