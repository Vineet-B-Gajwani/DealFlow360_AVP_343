'use strict';

const { Notification } = require('./notification.model');
const { emitNotification } = require('./socket.service');

async function createNotification({ userId = null, recipientRole = null, type, title, message, link = null }) {
  const notification = await Notification.create({
    userId,
    recipientRole,
    type,
    title,
    message,
    link,
  });

  emitNotification(notification);

  return notification;
}

async function getUserNotifications(userId, role) {
  const notifications = await Notification.find({
    $or: [{ userId }, { recipientRole: role }, { userId: null, recipientRole: null }],
  })
    .sort({ createdAt: -1 })
    .limit(50);

  const unreadCount = await Notification.countDocuments({
    $or: [{ userId }, { recipientRole: role }],
    isRead: false,
  });

  return { notifications, unreadCount };
}

async function markAsRead(notificationId) {
  const notification = await Notification.findByIdAndUpdate(
    notificationId,
    { isRead: true },
    { new: true }
  );
  return notification;
}

module.exports = {
  createNotification,
  getUserNotifications,
  markAsRead,
};
