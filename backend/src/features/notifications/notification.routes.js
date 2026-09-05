'use strict';

const { Router } = require('express');
const controller = require('./notification.controller');
const authenticate = require('../../middleware/authenticate');

const router = Router();

router.use(authenticate);

router.get('/', controller.getNotifications);
router.patch('/:id/read', controller.markAsRead);

module.exports = router;
