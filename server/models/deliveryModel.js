const { ObjectId } = require("mongodb");
const { getDB } = require("../db/db");

class DeliveryModel {
  constructor() {
    this.collectionName = "deliveries";
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

      // 创建 userId + jobId 复合索引
      await collection.createIndex(
        { userId: 1, jobId: 1 },
        { name: "idx_user_job" }
      );

      // 创建 status 普通索引
      await collection.createIndex({ status: 1 }, { name: "idx_status" });

      console.log("Delivery indexes initialized successfully");
    } catch (error) {
      console.error("Error initializing delivery indexes:", error);
    }
  }

  // 创建新投递记录
  async createDelivery(deliveryData) {
    try {
      const collection = this.getCollection();

      // 构建投递文档对象
      const delivery = {
        userId: new ObjectId(deliveryData.userId),
        jobId: new ObjectId(deliveryData.jobId),
        resumeId: new ObjectId(deliveryData.resumeId),
        hasAiPreInterview: deliveryData.hasAiPreInterview || false,
        status: deliveryData.status || "pending_ai",
        aiScore: deliveryData.aiScore || null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // 向数据库插入投递文档
      const result = await collection.insertOne(delivery);
      return {
        ...delivery,
        _id: result.insertedId,
      };
    } catch (error) {
      console.error("Error creating delivery:", error);
      throw error;
    }
  }

  // 根据ID查找投递记录
  async findDeliveryById(deliveryId) {
    try {
      const collection = this.getCollection();
      const delivery = await collection.findOne({
        _id: new ObjectId(deliveryId),
      });
      return delivery;
    } catch (error) {
      console.error("Error finding delivery by id:", error);
      throw error;
    }
  }

  // 根据用户ID查找投递记录
  async findDeliveriesByUserId(userId) {
    try {
      const collection = this.getCollection();
      const deliveries = await collection
        .find({
          userId: new ObjectId(userId),
        })
        .toArray();
      return deliveries;
    } catch (error) {
      console.error("Error finding deliveries by user id:", error);
      throw error;
    }
  }

  // 根据职位ID查找投递记录
  async findDeliveriesByJobId(jobId) {
    try {
      const collection = this.getCollection();
      const deliveries = await collection
        .find({
          jobId: new ObjectId(jobId),
        })
        .toArray();
      return deliveries;
    } catch (error) {
      console.error("Error finding deliveries by job id:", error);
      throw error;
    }
  }

  // 根据状态查找投递记录
  async findDeliveriesByStatus(status) {
    try {
      const collection = this.getCollection();
      const deliveries = await collection
        .find({
          status: status,
        })
        .toArray();
      return deliveries;
    } catch (error) {
      console.error("Error finding deliveries by status:", error);
      throw error;
    }
  }

  // 更新投递记录
  async updateDelivery(deliveryId, updateData) {
    try {
      const collection = this.getCollection();

      const update = {
        $set: {
          ...updateData,
          updatedAt: new Date(),
        },
      };

      if (updateData.userId) {
        update.$set.userId = new ObjectId(updateData.userId);
      }
      if (updateData.jobId) {
        update.$set.jobId = new ObjectId(updateData.jobId);
      }
      if (updateData.resumeId) {
        update.$set.resumeId = new ObjectId(updateData.resumeId);
      }

      const result = await collection.updateOne(
        { _id: new ObjectId(deliveryId) },
        update
      );

      if (result.matchedCount > 0) {
        return await this.findDeliveryById(deliveryId);
      }
      return null;
    } catch (error) {
      console.error("Error updating delivery:", error);
      throw error;
    }
  }

  // 删除投递记录
  async deleteDelivery(deliveryId) {
    try {
      const collection = this.getCollection();
      const result = await collection.deleteOne({
        _id: new ObjectId(deliveryId),
      });
      return result.deletedCount > 0;
    } catch (error) {
      console.error("Error deleting delivery:", error);
      throw error;
    }
  }
}

module.exports = new DeliveryModel();