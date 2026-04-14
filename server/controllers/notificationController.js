const notificationModel = require("../models/notificationModel");

class NotificationController {
  // 获取用户的通知列表
  async getUserNotifications(req, res) {
    try {
      const { userId } = req.params;

      if (!userId) {
        return res.status(400).json({ error: "Missing userId" });
      }

      const notifications =
        await notificationModel.findNotificationsByUserId(userId);
      res.status(200).json({ success: true, data: notifications });
    } catch (error) {
      console.error("Error getting user notifications:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  // 获取用户的未读通知
  async getUnreadNotifications(req, res) {
    try {
      const { userId } = req.params;

      if (!userId) {
        return res.status(400).json({ error: "Missing userId" });
      }

      const notifications =
        await notificationModel.findNotificationsByUserIdAndReadStatus(
          userId,
          false,
        );
      res.status(200).json({ success: true, data: notifications });
    } catch (error) {
      console.error("Error getting unread notifications:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  // 标记通知为已读
  async markAsRead(req, res) {
    try {
      const { notificationId } = req.params;

      if (!notificationId) {
        return res.status(400).json({ error: "Missing notificationId" });
      }

      const success =
        await notificationModel.markNotificationAsRead(notificationId);
      if (!success) {
        return res.status(404).json({ error: "Notification not found" });
      }

      res
        .status(200)
        .json({ success: true, message: "Notification marked as read" });
    } catch (error) {
      console.error("Error marking notification as read:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  // 标记所有通知为已读
  async markAllAsRead(req, res) {
    try {
      const { userId } = req.params;

      if (!userId) {
        return res.status(400).json({ error: "Missing userId" });
      }

      const count = await notificationModel.markAllNotificationsAsRead(userId);
      res
        .status(200)
        .json({
          success: true,
          message: `Marked ${count} notifications as read`,
        });
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  // 删除通知
  async deleteNotification(req, res) {
    try {
      const { notificationId } = req.params;

      if (!notificationId) {
        return res.status(400).json({ error: "Missing notificationId" });
      }

      const success =
        await notificationModel.deleteNotification(notificationId);
      if (!success) {
        return res.status(404).json({ error: "Notification not found" });
      }

      res.status(200).json({ success: true, message: "Notification deleted" });
    } catch (error) {
      console.error("Error deleting notification:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  // 获取通知详情
  async getNotificationById(req, res) {
    try {
      const { notificationId } = req.params;

      if (!notificationId) {
        return res.status(400).json({ error: "Missing notificationId" });
      }

      const notification =
        await notificationModel.findNotificationById(notificationId);
      if (!notification) {
        return res.status(404).json({ error: "Notification not found" });
      }

      res.status(200).json({ success: true, data: notification });
    } catch (error) {
      console.error("Error getting notification by id:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
}

module.exports = new NotificationController();
