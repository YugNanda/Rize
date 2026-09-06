const Notification = require('../models/Notification.model');
const { sendSuccess, sendError } = require('../utils/response');

// ─── Helper function to create notification programmatically ─────────────────
const notifyUser = async ({ userId, title, message, type = 'general', link = '', meta = {} }) => {
  try {
    if (!userId) return null;
    return await Notification.create({
      userId,
      title,
      message,
      type,
      link,
      meta,
    });
  } catch (err) {
    console.error('Notification creation failed:', err.message);
    return null;
  }
};

// ─── GET /api/notifications ────────────────────────────────────────────────
const getMyNotifications = async (req, res, next) => {
  try {
    const { page = 1, limit = 30 } = req.query;
    const skip = (page - 1) * limit;

    const [notifications, total, unreadCount] = await Promise.all([
      Notification.find({ userId: req.user.id })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Notification.countDocuments({ userId: req.user.id }),
      Notification.countDocuments({ userId: req.user.id, isRead: false }),
    ]);

    sendSuccess(res, 200, 'Notifications fetched.', {
      notifications,
      unreadCount,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    next(err);
  }
};

// ─── PATCH /api/notifications/:id/read ─────────────────────────────────────
const markAsRead = async (req, res, next) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { isRead: true },
      { new: true }
    );

    if (!notification) return sendError(res, 404, 'Notification not found.');

    const unreadCount = await Notification.countDocuments({ userId: req.user.id, isRead: false });

    sendSuccess(res, 200, 'Marked as read.', { notification, unreadCount });
  } catch (err) {
    next(err);
  }
};

// ─── PATCH /api/notifications/read-all ─────────────────────────────────────
const markAllAsRead = async (req, res, next) => {
  try {
    await Notification.updateMany({ userId: req.user.id, isRead: false }, { isRead: true });
    sendSuccess(res, 200, 'All notifications marked as read.', { unreadCount: 0 });
  } catch (err) {
    next(err);
  }
};

// ─── DELETE /api/notifications/:id ─────────────────────────────────────────
const deleteNotification = async (req, res, next) => {
  try {
    const notification = await Notification.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!notification) return sendError(res, 404, 'Notification not found.');

    const unreadCount = await Notification.countDocuments({ userId: req.user.id, isRead: false });

    sendSuccess(res, 200, 'Notification deleted.', { unreadCount });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  notifyUser,
  getMyNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
};
