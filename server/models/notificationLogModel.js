const { ObjectId } = require("mongodb");
const { getDB } = require("../db/db");

class NotificationLogModel {
  constructor() {
    this.collectionName = "notification_logs";
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

      // 创建 teamId 索引
      await collection.createIndex(
        { teamId: 1 },
        { name: "idx_team" },
      );

      // 创建 recipientId 索引
      await collection.createIndex(
        { recipientId: 1 },
        { name: "idx_recipient" },
      );

      // 创建 status 索引
      await collection.createIndex(
        { status: 1 },
        { name: "idx_status" },
      );

      console.log("NotificationLog indexes initialized successfully");
    } catch (error) {
      console.error("Error initializing notification log indexes:", error);
    }
  }

  // 创建新通知发送记录
  async createLog(logData) {
    try {
      const collection = this.getCollection();

      // 构建日志文档对象
      const log = {
        teamId: new ObjectId(logData.teamId),
        templateId: new ObjectId(logData.templateId),
        type: logData.type,
        recipientId: new ObjectId(logData.recipientId),
        recipientName: logData.recipientName,
        recipientEmail: logData.recipientEmail,
        title: logData.title,
        content: logData.content,
        deliveryId: logData.deliveryId ? new ObjectId(logData.deliveryId) : null,
        interviewId: logData.interviewId ? new ObjectId(logData.interviewId) : null,
        status: logData.status || "pending",
        sentAt: logData.sentAt || null,
        readAt: logData.readAt || null,
        errorMsg: logData.errorMsg || "",
        createdAt: new Date(),
      };

      // 向数据库插入日志文档
      const result = await collection.insertOne(log);
      return {
        ...log,
        _id: result.insertedId,
      };
    } catch (error) {
      console.error("Error creating notification log:", error);
      throw error;
    }
  }

  // 根据ID查找日志
  async findLogById(logId) {
    try {
      const collection = this.getCollection();
      const log = await collection.findOne({
        _id: new ObjectId(logId),
      });
      return log;
    } catch (error) {
      console.error("Error finding log by id:", error);
      throw error;
    }
  }

  // 根据团队ID查找日志
  async findLogsByTeamId(teamId) {
    try {
      const collection = this.getCollection();
      const logs = await collection
        .find({
          teamId: new ObjectId(teamId),
        })
        .sort({ createdAt: -1 })
        .toArray();
      return logs;
    } catch (error) {
      console.error("Error finding logs by team id:", error);
      throw error;
    }
  }

  // 根据接收人ID查找日志
  async findLogsByRecipientId(recipientId) {
    try {
      const collection = this.getCollection();
      const logs = await collection
        .find({
          recipientId: new ObjectId(recipientId),
        })
        .sort({ createdAt: -1 })
        .toArray();
      return logs;
    } catch (error) {
      console.error("Error finding logs by recipient id:", error);
      throw error;
    }
  }

  // 根据状态查找日志
  async findLogsByStatus(status) {
    try {
      const collection = this.getCollection();
      const logs = await collection
        .find({
          status: status,
        })
        .sort({ createdAt: -1 })
        .toArray();
      return logs;
    } catch (error) {
      console.error("Error finding logs by status:", error);
      throw error;
    }
  }

  // 更新日志状态
  async updateLogStatus(logId, status, updateData = {}) {
    try {
      const collection = this.getCollection();
      const update = {
        $set: {
          status: status,
          ...updateData,
        },
      };
      const result = await collection.updateOne(
        { _id: new ObjectId(logId) },
        update,
      );
      return result.matchedCount > 0;
    } catch (error) {
      console.error("Error updating log status:", error);
      throw error;
    }
  }

  // 标记日志为已读
  async markLogAsRead(logId) {
    try {
      const collection = this.getCollection();
      const result = await collection.updateOne(
        { _id: new ObjectId(logId) },
        { $set: { status: "read", readAt: new Date() } },
      );
      return result.matchedCount > 0;
    } catch (error) {
      console.error("Error marking log as read:", error);
      throw error;
    }
  }
}

module.exports = new NotificationLogModel();