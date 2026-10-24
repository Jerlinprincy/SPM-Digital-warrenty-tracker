const Notification = require('../models/Notification');
const { generateReminders } = require('../services/notificationService');

// @desc    Get user notifications with unread count
// @route   GET /api/notifications
// @access  Private
const getNotifications = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const notifications = await Notification.find({ userId })
      .sort({ createdAt: -1 })
      .limit(50);

    const unreadCount = await Notification.countDocuments({
      userId,
      isRead: false,
    });

    res.status(200).json({
      success: true,
      unreadCount,
      count: notifications.length,
      notifications,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark a single notification as read
// @route   PATCH /api/notifications/:id/read
// @access  Private
const markAsRead = async (req, res, next) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found or access unauthorized.',
      });
    }

    res.status(200).json({
      success: true,
      notification,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark all user notifications as read
// @route   PATCH /api/notifications/read-all
// @access  Private
const markAllAsRead = async (req, res, next) => {
  try {
    await Notification.updateMany(
      { userId: req.user._id, isRead: false },
      { isRead: true }
    );

    res.status(200).json({
      success: true,
      message: 'All notifications marked as read.',
    });
  } catch (error) {
    next(error);
  }
};

const { sendTestEmail, isEmailConfigured } = require('../services/emailService');

// @desc    Trigger reminder generation manually (for testing or instant sync)
// @route   POST /api/notifications/trigger-check
// @access  Private
const triggerCheck = async (req, res, next) => {
  try {
    const result = await generateReminders();
    res.status(200).json({
      success: true,
      message: 'Reminders scan executed successfully.',
      result,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Send an instant test warranty reminder email to logged in user
// @route   POST /api/notifications/test-email
// @access  Private
const testEmail = async (req, res, next) => {
  try {
    const userEmail = req.user.email;
    const userName = req.user.name;

    if (!userEmail) {
      return res.status(400).json({
        success: false,
        message: 'Current user does not have a registered email address.',
      });
    }

    const result = await sendTestEmail(userEmail, userName);

    if (result.success) {
      return res.status(200).json({
        success: true,
        message: `Test warranty reminder email sent to ${userEmail}!`,
        messageId: result.messageId,
      });
    } else {
      return res.status(400).json({
        success: false,
        message: `Email could not be delivered: ${result.reason || result.error}`,
        isConfigured: isEmailConfigured(),
        tip: 'Ensure SMTP_USER and SMTP_PASS (or Gmail App Password) are set in backend/.env',
      });
    }
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getNotifications,
  markAsRead,
  markAllAsRead,
  triggerCheck,
  testEmail,
};
