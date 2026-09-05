'use strict';

const { Notification } = require('./notification.model');
const socket = require('./socket');

/**
 * Get all notifications for the authenticated user.
 */
async function getUserNotifications(userId) {
  return await Notification.find({ userId }).sort({ createdAt: -1 }).limit(50);
}

/**
 * Mark a notification as read.
 */
async function markAsRead(userId, notificationId) {
  const notification = await Notification.findOne({ _id: notificationId, userId });
  if (!notification) {
    const err = new Error('Notification not found');
    err.statusCode = 404;
    throw err;
  }

  notification.isRead = true;
  await notification.save();
  return notification;
}

/**
 * Create a new notification and emit via socket.
 * Typically called internally by other services.
 */
async function createNotification(payload) {
  const notification = await Notification.create(payload);
  
  // Emit in real-time
  try {
    const io = socket.getIO();
    io.to(payload.userId.toString()).emit('new_notification', notification);
  } catch (err) {
    console.error('Socket not initialized or failed to emit', err);
  }

  return notification;
}

module.exports = {
  getUserNotifications,
  markAsRead,
  createNotification
};
