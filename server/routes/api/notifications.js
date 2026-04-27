const express = require("express");
const router = express.Router();
const notificationController = require("../../controllers/notificationController");

// 获取用户的通知列表
router.get("/user/:userId", notificationController.getUserNotifications);

// 获取用户的未读通知
router.get(
  "/user/:userId/unread",
  notificationController.getUnreadNotifications,
);

// 标记通知为已读
router.put("/:notificationId/read", notificationController.markAsRead);

// 标记所有通知为已读
router.put("/user/:userId/read-all", notificationController.markAllAsRead);

// 删除通知
router.delete("/:notificationId", notificationController.deleteNotification);

// 获取通知详情
router.get("/:notificationId", notificationController.getNotificationById);

// 发送通知
router.post("/send", notificationController.sendNotification);

module.exports = router;
