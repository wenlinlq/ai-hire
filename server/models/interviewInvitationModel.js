const { ObjectId } = require("mongodb");
const { getDB } = require("../db/db");

class InterviewInvitationModel {
  constructor() {
    this.collectionName = "interview_invitations";
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

      // 创建 userId + status 复合索引
      await collection.createIndex(
        { userId: 1, status: 1 },
        { name: "idx_user_status" }
      );

      // 创建 deliveryId 普通索引
      await collection.createIndex({ deliveryId: 1 }, { name: "idx_delivery" });

      console.log("Interview Invitation indexes initialized successfully");
    } catch (error) {
      console.error("Error initializing interview invitation indexes:", error);
    }
  }

  // 创建新面试邀请记录
  async createInterviewInvitation(invitationData) {
    try {
      const collection = this.getCollection();

      // 构建面试邀请文档对象
      const invitation = {
        deliveryId: new ObjectId(invitationData.deliveryId),
        userId: new ObjectId(invitationData.userId),
        interviewerId: invitationData.interviewerId 
          ? new ObjectId(invitationData.interviewerId) 
          : null,
        round: invitationData.round || 1,
        type: invitationData.type || "online",
        scheduledTime: new Date(invitationData.scheduledTime),
        meetingUrl: invitationData.meetingUrl || "",
        location: invitationData.location || "",
        status: invitationData.status || "pending",
        result: invitationData.result || "pending",
        evaluation: invitationData.evaluation || {},
        userFeedback: invitationData.userFeedback || "pending",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // 向数据库插入面试邀请文档
      const result = await collection.insertOne(invitation);
      return {
        ...invitation,
        _id: result.insertedId,
      };
    } catch (error) {
      console.error("Error creating interview invitation:", error);
      throw error;
    }
  }

  // 根据ID查找面试邀请记录
  async findInterviewInvitationById(invitationId) {
    try {
      const collection = this.getCollection();
      const invitation = await collection.findOne({
        _id: new ObjectId(invitationId),
      });
      return invitation;
    } catch (error) {
      console.error("Error finding interview invitation by id:", error);
      throw error;
    }
  }

  // 根据投递ID查找面试邀请记录
  async findInterviewInvitationsByDeliveryId(deliveryId) {
    try {
      const collection = this.getCollection();
      const invitations = await collection
        .find({
          deliveryId: new ObjectId(deliveryId),
        })
        .toArray();
      return invitations;
    } catch (error) {
      console.error("Error finding interview invitations by delivery id:", error);
      throw error;
    }
  }

  // 根据用户ID查找面试邀请记录
  async findInterviewInvitationsByUserId(userId) {
    try {
      const collection = this.getCollection();
      const invitations = await collection
        .find({
          userId: new ObjectId(userId),
        })
        .toArray();
      return invitations;
    } catch (error) {
      console.error("Error finding interview invitations by user id:", error);
      throw error;
    }
  }

  // 根据状态查找面试邀请记录
  async findInterviewInvitationsByStatus(status) {
    try {
      const collection = this.getCollection();
      const invitations = await collection
        .find({
          status: status,
        })
        .toArray();
      return invitations;
    } catch (error) {
      console.error("Error finding interview invitations by status:", error);
      throw error;
    }
  }

  // 更新面试邀请记录
  async updateInterviewInvitation(invitationId, updateData) {
    try {
      const collection = this.getCollection();

      const update = {
        $set: {
          ...updateData,
          updatedAt: new Date(),
        },
      };

      if (updateData.deliveryId) {
        update.$set.deliveryId = new ObjectId(updateData.deliveryId);
      }
      if (updateData.userId) {
        update.$set.userId = new ObjectId(updateData.userId);
      }
      if (updateData.interviewerId) {
        update.$set.interviewerId = new ObjectId(updateData.interviewerId);
      }
      if (updateData.scheduledTime) {
        update.$set.scheduledTime = new Date(updateData.scheduledTime);
      }

      const result = await collection.updateOne(
        { _id: new ObjectId(invitationId) },
        update
      );

      if (result.matchedCount > 0) {
        return await this.findInterviewInvitationById(invitationId);
      }
      return null;
    } catch (error) {
      console.error("Error updating interview invitation:", error);
      throw error;
    }
  }

  // 删除面试邀请记录
  async deleteInterviewInvitation(invitationId) {
    try {
      const collection = this.getCollection();
      const result = await collection.deleteOne({
        _id: new ObjectId(invitationId),
      });
      return result.deletedCount > 0;
    } catch (error) {
      console.error("Error deleting interview invitation:", error);
      throw error;
    }
  }
}

module.exports = new InterviewInvitationModel();