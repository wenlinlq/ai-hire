// 导入数据库连接模块，用于获取数据库实例
const { getDB } = require("../db/db");
// 导入 MongoDB 的 ObjectId 类型，用于处理文档的 _id 字段
const { ObjectId } = require("mongodb");

// 定义岗位模型类，封装所有岗位相关的数据库操作
class PositionModel {
  // 构造函数，在创建实例时自动执行
  constructor() {
    // 延迟获取数据库连接，在需要时通过 getCollection 方法获取
  }

  // 获取数据库集合的方法
  getCollection() {
    if (!this.collection) {
      this.collection = getDB().collection("positions");
    }
    return this.collection;
  }

  // 初始化数据库索引的方法
  async initIndexes() {
    try {
      const collection = this.getCollection();
      // 创建团队ID普通索引，用于按团队查询岗位时提高性能
      await collection.createIndex({ teamId: 1 });
      // 创建状态普通索引，用于按状态查询岗位时提高性能
      await collection.createIndex({ status: 1 });
      // 创建截止时间普通索引，用于按截止时间查询岗位时提高性能
      await collection.createIndex({ deadline: 1 });
      // 创建标题全文索引，用于支持岗位搜索
      await collection.createIndex({ title: "text" });
      // 控制台输出索引初始化成功的消息
      console.log("Position indexes initialized successfully");
    } catch (error) {
      // 如果索引创建失败，输出错误信息
      console.error("Error initializing position indexes:", error);
    }
  }

  // 创建新岗位的方法
  async createPosition(positionData) {
    try {
      const collection = this.getCollection();

      // 构建岗位文档对象
      const position = {
        // 所属团队ID - 使用默认值作为后备
        teamId:
          this.getValidObjectId(positionData.teamId) ||
          new ObjectId("660a0b6c4f1a2b3c4d5e6f71"),
        // 岗位名称
        title: positionData.title,
        // 岗位类型
        type: positionData.type,
        // 所属部门
        department: positionData.department,
        // 招聘人数
        quota: positionData.quota,
        // 薪资
        salary: positionData.salary || "",
        // 面试方式
        interviewType: positionData.interviewType || "online",
        // AI试题
        aiQuestionBankId: positionData.aiQuestionBankId
          ? this.getValidObjectId(positionData.aiQuestionBankId)
          : null,
        // AI预面试
        aiPreInterview: positionData.aiPreInterview || false,
        // AI预面试最低分
        aiPreInterviewScore: positionData.aiPreInterviewScore || 60,
        // AI简历筛选
        aiResumeFilter: positionData.aiResumeFilter || false,
        // AI简历筛选最低分
        aiResumeFilterScore: positionData.aiResumeFilterScore || 60,
        // AI简历筛选技能要求
        aiResumeFilterSkills: positionData.aiResumeFilterSkills || [],
        // 岗位要求
        requirements: {
          skills: positionData.requirements?.skills || [],
          experience: positionData.requirements?.experience || "",
          education: positionData.requirements?.education || "",
          description: positionData.requirements?.description || "",
        },
        // 工作职责列表
        responsibilities: positionData.responsibilities || [],
        // 福利待遇列表
        benefits: positionData.benefits || [],
        // 岗位状态
        status: positionData.status || "open",
        // 报名截止时间
        deadline: new Date(positionData.deadline),
        // 浏览次数
        viewCount: positionData.viewCount || 0,
        // 投递人数
        applyCount: positionData.applyCount || 0,
        // 创建人ID - 使用默认值作为后备
        createdBy:
          this.getValidObjectId(positionData.createdBy) ||
          new ObjectId("660a0b6c4f1a2b3c4d5e6f70"),
        // 创建时间
        createdAt: new Date(),
        // 更新时间
        updatedAt: new Date(),
      };

      // 向数据库插入岗位文档
      const result = await collection.insertOne(position);
      // 返回完整的岗位对象，包含 MongoDB 自动生成的 _id
      return {
        ...position,
        _id: result.insertedId,
      };
    } catch (error) {
      // 如果创建失败，输出错误信息
      console.error("Error creating position:", error);
      // 抛出错误，让上层调用者处理
      throw error;
    }
  }

  // 验证并返回有效的ObjectId
  getValidObjectId(id) {
    try {
      if (!id) return null;
      return new ObjectId(id);
    } catch (error) {
      console.error("Invalid ObjectId:", error);
      return null;
    }
  }

  // 根据岗位 ID 查找岗位
  async findPositionById(positionId) {
    try {
      const collection = this.getCollection();
      // 使用 findOne 方法查询，将字符串 ID 转换为 ObjectId 类型
      // 返回匹配的岗位文档，如果没有找到则返回 null
      return await collection.findOne({ _id: new ObjectId(positionId) });
    } catch (error) {
      // 查询失败时输出错误信息
      console.error("Error finding position by ID:", error);
      // 抛出错误
      throw error;
    }
  }

  // 更新岗位信息
  async updatePosition(positionId, updateData) {
    try {
      const collection = this.getCollection();
      // 自动更新 updatedAt 字段为当前时间
      updateData.updatedAt = new Date();

      // 如果更新数据中包含团队 ID，需要将字符串 ID 转换为 ObjectId
      if (updateData.teamId) {
        updateData.teamId = new ObjectId(updateData.teamId);
      }

      // 如果更新数据中包含创建人 ID，需要将字符串 ID 转换为 ObjectId
      if (updateData.createdBy) {
        updateData.createdBy = new ObjectId(updateData.createdBy);
      }

      // 如果更新数据中包含截止时间，需要转换为 Date 对象
      if (updateData.deadline) {
        updateData.deadline = new Date(updateData.deadline);
      }

      // 执行更新操作
      const result = await collection.updateOne(
        // 查询条件：根据 _id 查找要更新的岗位
        { _id: new ObjectId(positionId) },
        // 更新操作：使用 $set 操作符只更新指定的字段
        { $set: updateData },
      );

      // 返回是否更新成功（modifiedCount > 0 表示至少更新了一条记录）
      return result.modifiedCount > 0;
    } catch (error) {
      // 更新失败时输出错误信息
      console.error("Error updating position:", error);
      // 抛出错误
      throw error;
    }
  }

  // 永久删除岗位（硬删除）
  async deletePosition(positionId) {
    try {
      const collection = this.getCollection();
      // 使用 deleteOne 方法永久删除指定岗位
      const result = await collection.deleteOne({
        _id: new ObjectId(positionId),
      });
      // 返回是否删除成功（deletedCount > 0 表示成功删除了一条记录）
      return result.deletedCount > 0;
    } catch (error) {
      // 删除失败时输出错误信息
      console.error("Error deleting position:", error);
      // 抛出错误
      throw error;
    }
  }

  // 根据团队查找所有符合条件的岗位
  async findPositionsByTeam(teamId) {
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
      // 使用 find 方法查询所有具有指定团队的岗位
      // toArray() 将查询结果转换为数组
      return await collection.find({ teamId: objectId }).toArray();
    } catch (error) {
      // 查询失败时输出错误信息
      console.error("Error finding positions by team:", error);
      // 抛出错误
      throw error;
    }
  }

  // 根据状态查找所有符合条件的岗位
  async findPositionsByStatus(status) {
    try {
      const collection = this.getCollection();
      // 使用 find 方法查询所有具有指定状态的岗位
      // toArray() 将查询结果转换为数组
      return await collection.find({ status }).toArray();
    } catch (error) {
      // 查询失败时输出错误信息
      console.error("Error finding positions by status:", error);
      // 抛出错误
      throw error;
    }
  }

  // 查找所有岗位（不限制条件）
  async findAllPositions() {
    try {
      const collection = this.getCollection();
      // 使用 find 方法查询所有岗位，按浏览量降序排序，toArray() 转换为数组
      return await collection.find().sort({ viewCount: -1 }).toArray();
    } catch (error) {
      // 查询失败时输出错误信息
      console.error("Error finding all positions:", error);
      // 抛出错误
      throw error;
    }
  }

  // 分页查找岗位
  async findPositionsWithPagination(page = 1, limit = 10, filter = {}) {
    try {
      const collection = this.getCollection();
      // 处理过滤条件中的 ObjectId 转换
      if (filter.teamId) {
        filter.teamId = new ObjectId(filter.teamId);
      }
      if (filter.createdBy) {
        filter.createdBy = new ObjectId(filter.createdBy);
      }
      // 计算跳过的文档数量：（当前页 - 1）* 每页数量
      const skip = (page - 1) * limit;
      // 统计符合过滤条件的总文档数
      const total = await collection.countDocuments(filter);
      // 执行分页查询：先过滤，再跳过指定数量，最后限制返回数量
      const positions = await collection
        .find(filter) // 应用过滤条件
        .skip(skip) // 跳过前面 skip 条记录
        .limit(limit) // 只返回 limit 条记录
        .toArray(); // 转换为数组

      // 返回分页结果对象
      return {
        positions, // 当前页的岗位列表
        total, // 总记录数
        page, // 当前页码
        limit, // 每页记录数
        totalPages: Math.ceil(total / limit), // 总页数（向上取整）
      };
    } catch (error) {
      // 查询失败时输出错误信息
      console.error("Error finding positions with pagination:", error);
      // 抛出错误
      throw error;
    }
  }

  // 搜索岗位（使用全文索引）
  async searchPositions(keyword) {
    try {
      const collection = this.getCollection();
      // 使用全文搜索查询包含关键词的岗位
      return await collection.find({ $text: { $search: keyword } }).toArray();
    } catch (error) {
      // 搜索失败时输出错误信息
      console.error("Error searching positions:", error);
      // 抛出错误
      throw error;
    }
  }

  // 增加岗位浏览次数
  async incrementViewCount(positionId) {
    try {
      const collection = this.getCollection();
      // 使用 $inc 操作符增加浏览次数
      const result = await collection.updateOne(
        { _id: new ObjectId(positionId) },
        { $inc: { viewCount: 1 } },
      );
      return result.modifiedCount > 0;
    } catch (error) {
      // 操作失败时输出错误信息
      console.error("Error incrementing view count:", error);
      // 抛出错误
      throw error;
    }
  }

  // 增加岗位投递人数
  async incrementApplyCount(positionId) {
    try {
      const collection = this.getCollection();
      // 使用 $inc 操作符增加投递人数
      const result = await collection.updateOne(
        { _id: new ObjectId(positionId) },
        { $inc: { applyCount: 1 } },
      );
      return result.modifiedCount > 0;
    } catch (error) {
      // 操作失败时输出错误信息
      console.error("Error incrementing apply count:", error);
      // 抛出错误
      throw error;
    }
  }
}

// 导出 PositionModel 的单例实例
// 使用 new PositionModel() 创建实例，确保整个应用共享同一个数据库连接
module.exports = new PositionModel();
