'use strict';

const notificationService = require('./notification.service');

async function getNotifications(req, res, next) {
  try {
    const notifications = await notificationService.getUserNotifications(req.user.id);
    res.json({ success: true, data: { notifications } });
  } catch (err) {
    next(err);
  }
}

async function markRead(req, res, next) {
  try {
    const notification = await notificationService.markAsRead(req.user.id, req.params.id);
    res.json({ success: true, data: { notification } });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getNotifications,
  markRead
};
