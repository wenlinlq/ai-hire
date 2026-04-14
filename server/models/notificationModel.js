const { ObjectId } = require("mongodb");
const { getDB } = require("../db/db");

class NotificationModel {
  constructor() {
    this.collectionName = "notifications";
  }

  // 获取集合
  getCollection() {
    if (!this.collection) {
      this.collection = getDB().collection(this.collectionName);
    }
    return this.collection;
  }

  // 初始化集合索引
  async initializeIndexes() {
    try {
      const collection = this.getCollection();

      // 创建 userId + isRead 复合索引
      await collection.createIndex(
        { userId: 1, isRead: 1 },
        { name: "idx_user_unread" },
      );

      console.log("Notification indexes initialized successfully");
    } catch (error) {
      console.error("Error initializing notification indexes:", error);
    }
  }

  // 创建新通知记录
  async createNotification(notificationData) {
    try {
      const collection = this.getCollection();

      // 构建通知文档对象
      const notification = {
        userId: new ObjectId(notificationData.userId),
        type: notificationData.type,
        title: notificationData.title,
        content: notificationData.content,
        relatedId: notificationData.relatedId
          ? new ObjectId(notificationData.relatedId)
          : null,
        isRead: notificationData.isRead || false,
        teamName: notificationData.teamName || "",
        createdAt: new Date(),
      };

      // 向数据库插入通知文档
      const result = await collection.insertOne(notification);
      return {
        ...notification,
        _id: result.insertedId,
      };
    } catch (error) {
      console.error("Error creating notification:", error);
      throw error;
    }
  }

  // 根据ID查找通知记录
  async findNotificationById(notificationId) {
    try {
      const collection = this.getCollection();
      const notification = await collection.findOne({
        _id: new ObjectId(notificationId),
      });
      return notification;
    } catch (error) {
      console.error("Error finding notification by id:", error);
      throw error;
    }
  }

  // 根据用户ID查找通知记录
  async findNotificationsByUserId(userId) {
    try {
      const collection = this.getCollection();
      const notifications = await collection
        .find({
          userId: new ObjectId(userId),
        })
        .sort({ createdAt: -1 })
        .toArray();
      return notifications;
    } catch (error) {
      console.error("Error finding notifications by user id:", error);
      throw error;
    }
  }

  // 根据用户ID和已读状态查找通知记录
  async findNotificationsByUserIdAndReadStatus(userId, isRead) {
    try {
      const collection = this.getCollection();
      const notifications = await collection
        .find({
          userId: new ObjectId(userId),
          isRead: isRead,
        })
        .sort({ createdAt: -1 })
        .toArray();
      return notifications;
    } catch (error) {
      console.error(
        "Error finding notifications by user id and read status:",
        error,
      );
      throw error;
    }
  }

  // 标记通知为已读
  async markNotificationAsRead(notificationId) {
    try {
      const collection = this.getCollection();
      const result = await collection.updateOne(
        { _id: new ObjectId(notificationId) },
        { $set: { isRead: true } },
      );
      return result.matchedCount > 0;
    } catch (error) {
      console.error("Error marking notification as read:", error);
      throw error;
    }
  }

  // 标记用户所有通知为已读
  async markAllNotificationsAsRead(userId) {
    try {
      const collection = this.getCollection();
      const result = await collection.updateMany(
        { userId: new ObjectId(userId) },
        { $set: { isRead: true } },
      );
      return result.modifiedCount;
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      throw error;
    }
  }

  // 删除通知记录
  async deleteNotification(notificationId) {
    try {
      const collection = this.getCollection();
      const result = await collection.deleteOne({
        _id: new ObjectId(notificationId),
      });
      return result.deletedCount > 0;
    } catch (error) {
      console.error("Error deleting notification:", error);
      throw error;
    }
  }
}

module.exports = new NotificationModel();
