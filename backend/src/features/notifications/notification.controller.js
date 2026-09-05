'use strict';

const notificationService = require('./notification.service');

async function getNotifications(req, res, next) {
  try {
    const result = await notificationService.getUserNotifications(
      req.user.id,
      req.user.role
    );
    res.json({
      success: true,
      data: result,
    });
  } catch (err) {
    next(err);
  }
}

async function markAsRead(req, res, next) {
  try {
    const notification = await notificationService.markAsRead(req.params.id);
    res.json({
      success: true,
      data: { notification },
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getNotifications,
  markAsRead,
};
