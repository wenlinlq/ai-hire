const { ObjectId } = require("mongodb");
const { getDB } = require("../db/db");

class ApplicationModel {
  constructor() {
    this.collectionName = "applications";
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

      // 创建 positionId + studentId 复合唯一索引
      await collection.createIndex(
        { positionId: 1, studentId: 1 },
        { unique: true, name: "unique_position_student" },
      );

      // 创建 status 普通索引
      await collection.createIndex({ status: 1 }, { name: "idx_status" });

      // 创建 aiScore 普通索引
      await collection.createIndex({ aiScore: 1 }, { name: "idx_ai_score" });

      // 创建 teamId 普通索引
      await collection.createIndex({ teamId: 1 }, { name: "idx_team_id" });

      console.log("Application indexes initialized successfully");
    } catch (error) {
      console.error("Error initializing application indexes:", error);
    }
  }

  // 创建新报名记录
  async createApplication(applicationData) {
    try {
      const collection = this.getCollection();

      // 构建报名文档对象
      const application = {
        // 岗位ID
        positionId: new ObjectId(applicationData.positionId),
        // 学生ID
        studentId: applicationData.studentId,
        // 简历ID
        resumeId: applicationData.resumeId,
        // 团队ID
        teamId: applicationData.teamId
          ? new ObjectId(applicationData.teamId)
          : null,
        // 状态
        status: applicationData.status || "pending",
        // 年级
        grade: applicationData.grade || "",
        // 专业
        major: applicationData.major || "",
        // 姓名
        name: applicationData.name || "",
        // 邮箱
        email: applicationData.email || "",
        // 手机号
        phone: applicationData.phone || "",
        // 简历文件URL
        resumeFileUrl: applicationData.resumeFileUrl || "",
        // AI匹配度评分
        aiScore: applicationData.aiScore || null,
        // AI分析结果
        aiAnalysis: applicationData.aiAnalysis || {
          strengths: [],
          weaknesses: [],
          summary: "",
        },
        // HR人工评分
        hrScore: applicationData.hrScore || null,
        // HR评语
        hrComment: applicationData.hrComment || "",
        // 面试ID
        interviewId: applicationData.interviewId
          ? new ObjectId(applicationData.interviewId)
          : null,
        // 报名时间
        appliedAt: new Date(),
        // 更新时间
        updatedAt: new Date(),
      };

      // 向数据库插入报名文档
      const result = await collection.insertOne(application);
      // 返回完整的报名对象，包含 MongoDB 自动生成的 _id
      return {
        ...application,
        _id: result.insertedId,
      };
    } catch (error) {
      // 如果创建失败，输出错误信息
      console.error("Error creating application:", error);
      // 抛出错误，让上层调用者处理
      throw error;
    }
  }

  // 根据报名ID查找报名记录
  async findApplicationById(applicationId) {
    try {
      const collection = this.getCollection();
      // 根据 _id 查找报名记录
      const application = await collection.findOne({
        _id: new ObjectId(applicationId),
      });
      return application;
    } catch (error) {
      console.error("Error finding application by id:", error);
      throw error;
    }
  }

  // 根据岗位ID查找报名记录
  async findApplicationsByPositionId(positionId) {
    try {
      const collection = this.getCollection();
      // 根据 positionId 查找报名记录
      const applications = await collection
        .find({
          positionId: new ObjectId(positionId),
        })
        .toArray();
      return applications;
    } catch (error) {
      console.error("Error finding applications by position id:", error);
      throw error;
    }
  }

  // 根据学生ID查找报名记录
  async findApplicationsByStudentId(studentId) {
    try {
      const collection = this.getCollection();
      // 根据 studentId 查找报名记录
      const applications = await collection
        .find({
          studentId: new ObjectId(studentId),
        })
        .toArray();
      return applications;
    } catch (error) {
      console.error("Error finding applications by student id:", error);
      throw error;
    }
  }

  // 更新报名记录
  async updateApplication(applicationId, updateData) {
    try {
      const collection = this.getCollection();

      // 构建更新对象
      const update = {
        $set: {
          ...updateData,
          updatedAt: new Date(),
        },
      };

      // 如果更新数据中包含 ObjectId 类型的字段，需要转换
      if (updateData.positionId) {
        update.$set.positionId = new ObjectId(updateData.positionId);
      }
      if (updateData.studentId) {
        update.$set.studentId = new ObjectId(updateData.studentId);
      }
      if (updateData.resumeId) {
        update.$set.resumeId = new ObjectId(updateData.resumeId);
      }
      if (updateData.teamId) {
        update.$set.teamId = new ObjectId(updateData.teamId);
      }
      if (updateData.interviewId) {
        update.$set.interviewId = new ObjectId(updateData.interviewId);
      }

      // 执行更新操作
      const result = await collection.updateOne(
        { _id: new ObjectId(applicationId) },
        update,
      );

      // 返回更新后的报名记录
      if (result.matchedCount > 0) {
        return await this.findApplicationById(applicationId);
      }
      return null;
    } catch (error) {
      console.error("Error updating application:", error);
      throw error;
    }
  }

  // 删除报名记录
  async deleteApplication(applicationId) {
    try {
      const collection = this.getCollection();
      // 执行删除操作
      const result = await collection.deleteOne({
        _id: new ObjectId(applicationId),
      });
      return result.deletedCount > 0;
    } catch (error) {
      console.error("Error deleting application:", error);
      throw error;
    }
  }

  // 根据状态查找报名记录
  async findApplicationsByStatus(status) {
    try {
      const collection = this.getCollection();
      // 根据 status 查找报名记录
      const applications = await collection
        .find({
          status: status,
        })
        .toArray();
      return applications;
    } catch (error) {
      console.error("Error finding applications by status:", error);
      throw error;
    }
  }

  // 按AI评分排序查找报名记录
  async findApplicationsByAiScoreDesc(positionId) {
    try {
      const collection = this.getCollection();
      // 按 aiScore 降序排序查找报名记录
      const applications = await collection
        .find(positionId ? { positionId: new ObjectId(positionId) } : {})
        .sort({ aiScore: -1 })
        .toArray();
      return applications;
    } catch (error) {
      console.error("Error finding applications by ai score:", error);
      throw error;
    }
  }

  // 获取所有报名记录
  async findAllApplications() {
    try {
      const collection = this.getCollection();
      // 获取所有报名记录
      const applications = await collection.find({}).toArray();
      return applications;
    } catch (error) {
      console.error("Error finding all applications:", error);
      throw error;
    }
  }

  // 根据团队ID查找报名记录
  async findApplicationsByTeamId(teamId) {
    try {
      const collection = this.getCollection();
      // 验证teamId是否是有效的ObjectId
      let objectId;
      try {
        objectId = new ObjectId(teamId);
      } catch (error) {
        // 如果teamId不是有效的ObjectId，返回空数组
        console.warn(`Invalid teamId: ${teamId}`);
        return [];
      }
      // 根据 teamId 查找报名记录
      const applications = await collection
        .find({
          teamId: objectId,
        })
        .toArray();
      return applications;
    } catch (error) {
      console.error("Error finding applications by team id:", error);
      throw error;
    }
  }
}

module.exports = new ApplicationModel();
