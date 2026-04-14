const { ObjectId } = require("mongodb");
const { getDB } = require("../db/db");

class AiPreInterviewModel {
  constructor() {
    this.collectionName = "ai_pre_interviews";
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

      // 创建 userId 普通索引
      await collection.createIndex({ userId: 1 }, { name: "idx_user" });

      // 创建 status + expiresAt 复合索引
      await collection.createIndex(
        { status: 1, expiresAt: 1 },
        { name: "idx_status_expires" }
      );

      // 创建 deliveryId 唯一索引
      await collection.createIndex(
        { deliveryId: 1 },
        { unique: true, name: "unique_delivery" }
      );

      console.log("AI Pre Interview indexes initialized successfully");
    } catch (error) {
      console.error("Error initializing AI pre interview indexes:", error);
    }
  }

  // 创建新AI预面试记录
  async createAiPreInterview(interviewData) {
    try {
      const collection = this.getCollection();

      // 构建面试文档对象
      const interview = {
        deliveryId: new ObjectId(interviewData.deliveryId),
        userId: new ObjectId(interviewData.userId),
        jobId: new ObjectId(interviewData.jobId),
        status: interviewData.status || "pending",
        score: interviewData.score || null,
        questions: interviewData.questions || [],
        startedAt: interviewData.startedAt || null,
        completedAt: interviewData.completedAt || null,
        expiresAt: interviewData.expiresAt || null,
        createdAt: new Date(),
      };

      // 向数据库插入面试文档
      const result = await collection.insertOne(interview);
      return {
        ...interview,
        _id: result.insertedId,
      };
    } catch (error) {
      console.error("Error creating AI pre interview:", error);
      throw error;
    }
  }

  // 根据ID查找AI预面试记录
  async findAiPreInterviewById(interviewId) {
    try {
      const collection = this.getCollection();
      const interview = await collection.findOne({
        _id: new ObjectId(interviewId),
      });
      return interview;
    } catch (error) {
      console.error("Error finding AI pre interview by id:", error);
      throw error;
    }
  }

  // 根据投递ID查找AI预面试记录
  async findAiPreInterviewByDeliveryId(deliveryId) {
    try {
      const collection = this.getCollection();
      const interview = await collection.findOne({
        deliveryId: new ObjectId(deliveryId),
      });
      return interview;
    } catch (error) {
      console.error("Error finding AI pre interview by delivery id:", error);
      throw error;
    }
  }

  // 根据用户ID查找AI预面试记录
  async findAiPreInterviewsByUserId(userId) {
    try {
      const collection = this.getCollection();
      const interviews = await collection
        .find({
          userId: new ObjectId(userId),
        })
        .toArray();
      return interviews;
    } catch (error) {
      console.error("Error finding AI pre interviews by user id:", error);
      throw error;
    }
  }

  // 根据状态查找AI预面试记录
  async findAiPreInterviewsByStatus(status) {
    try {
      const collection = this.getCollection();
      const interviews = await collection
        .find({
          status: status,
        })
        .toArray();
      return interviews;
    } catch (error) {
      console.error("Error finding AI pre interviews by status:", error);
      throw error;
    }
  }

  // 更新AI预面试记录
  async updateAiPreInterview(interviewId, updateData) {
    try {
      const collection = this.getCollection();

      const update = {
        $set: {
          ...updateData,
        },
      };

      if (updateData.deliveryId) {
        update.$set.deliveryId = new ObjectId(updateData.deliveryId);
      }
      if (updateData.userId) {
        update.$set.userId = new ObjectId(updateData.userId);
      }
      if (updateData.jobId) {
        update.$set.jobId = new ObjectId(updateData.jobId);
      }

      const result = await collection.updateOne(
        { _id: new ObjectId(interviewId) },
        update
      );

      if (result.matchedCount > 0) {
        return await this.findAiPreInterviewById(interviewId);
      }
      return null;
    } catch (error) {
      console.error("Error updating AI pre interview:", error);
      throw error;
    }
  }

  // 删除AI预面试记录
  async deleteAiPreInterview(interviewId) {
    try {
      const collection = this.getCollection();
      const result = await collection.deleteOne({
        _id: new ObjectId(interviewId),
      });
      return result.deletedCount > 0;
    } catch (error) {
      console.error("Error deleting AI pre interview:", error);
      throw error;
    }
  }
}

module.exports = new AiPreInterviewModel();