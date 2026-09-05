'use strict';

const { Router } = require('express');
const controller = require('./notification.controller');
const authenticate = require('../../middleware/authenticate');
const { requireCustomer } = require('../../middleware/requireCustomer');

const router = Router();

router.use(authenticate, requireCustomer);

router.get('/', controller.getNotifications);
router.patch('/:id/read', controller.markRead);

module.exports = router;
