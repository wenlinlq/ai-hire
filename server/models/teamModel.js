// 导入数据库连接模块，用于获取数据库实例
const { getDB } = require("../db/db");
// 导入 MongoDB 的 ObjectId 类型，用于处理文档的 _id 字段
const { ObjectId } = require("mongodb");

// 定义团队模型类，封装所有团队相关的数据库操作
class TeamModel {
  // 构造函数，在创建实例时自动执行
  constructor() {
    // 延迟获取数据库连接，在需要时通过 getCollection 方法获取
  }

  // 获取数据库集合的方法
  getCollection() {
    if (!this.collection) {
      this.collection = getDB().collection("teams");
    }
    return this.collection;
  }

  // 初始化数据库索引的方法
  async initIndexes() {
    try {
      const collection = this.getCollection();
      // 创建团队名称唯一索引，确保团队名称不会重复
      await collection.createIndex({ name: 1 }, { unique: true });
      // 创建部门普通索引，用于按部门查询团队时提高性能
      await collection.createIndex({ department: 1 });
      // 创建负责人ID普通索引，用于按负责人查询团队时提高性能
      await collection.createIndex({ leaderId: 1 });
      // 控制台输出索引初始化成功的消息
      console.log("Team indexes initialized successfully");
    } catch (error) {
      // 如果索引创建失败，输出错误信息
      console.error("Error initializing team indexes:", error);
    }
  }

  // 创建新团队的方法
  async createTeam(teamData) {
    try {
      const collection = this.getCollection();

      // 构建团队文档对象
      const team = {
        // 团队名称
        name: teamData.name,
        // 所属部门
        department: teamData.department,
        // 团队介绍
        description: teamData.description,
        // 团队Logo URL
        logo: teamData.logo || "",
        // 负责人ID
        leaderId: new ObjectId(teamData.leaderId),
        // 成员ID列表
        members: teamData.members
          ? teamData.members.map((id) => new ObjectId(id))
          : [],
        // 联系方式
        contact: {
          email: teamData.contact?.email || "",
          phone: teamData.contact?.phone || "",
          location: teamData.contact?.location || "",
        },
        // 团队状态
        status: teamData.status || "active",
        // 创建时间
        createdAt: new Date(),
        // 更新时间
        updatedAt: new Date(),
      };

      // 向数据库插入团队文档
      const result = await collection.insertOne(team);
      // 返回完整的团队对象，包含 MongoDB 自动生成的 _id
      return {
        ...team,
        _id: result.insertedId,
      };
    } catch (error) {
      // 如果创建失败，输出错误信息
      console.error("Error creating team:", error);
      // 抛出错误，让上层调用者处理
      throw error;
    }
  }

  // 根据团队 ID 查找团队
  async findTeamById(teamId) {
    try {
      const collection = this.getCollection();
      // 使用 findOne 方法查询，将字符串 ID 转换为 ObjectId 类型
      // 返回匹配的团队文档，如果没有找到则返回 null
      return await collection.findOne({ _id: new ObjectId(teamId) });
    } catch (error) {
      // 查询失败时输出错误信息
      console.error("Error finding team by ID:", error);
      // 抛出错误
      throw error;
    }
  }

  // 根据团队名称查找团队
  async findTeamByName(name) {
    try {
      const collection = this.getCollection();
      // 使用 findOne 方法，通过团队名称精确查询
      return await collection.findOne({ name });
    } catch (error) {
      // 查询失败时输出错误信息
      console.error("Error finding team by name:", error);
      // 抛出错误
      throw error;
    }
  }

  // 更新团队信息
  async updateTeam(teamId, updateData) {
    try {
      const collection = this.getCollection();
      // 自动更新 updatedAt 字段为当前时间
      updateData.updatedAt = new Date();

      // 如果更新数据中包含成员列表，需要将字符串 ID 转换为 ObjectId
      if (updateData.members) {
        updateData.members = updateData.members.map((id) => new ObjectId(id));
      }

      // 如果更新数据中包含负责人 ID，需要将字符串 ID 转换为 ObjectId
      if (updateData.leaderId) {
        updateData.leaderId = new ObjectId(updateData.leaderId);
      }

      // 执行更新操作
      const result = await collection.updateOne(
        // 查询条件：根据 _id 查找要更新的团队
        { _id: new ObjectId(teamId) },
        // 更新操作：使用 $set 操作符只更新指定的字段
        { $set: updateData },
      );

      // 返回是否更新成功（modifiedCount > 0 表示至少更新了一条记录）
      return result.modifiedCount > 0;
    } catch (error) {
      // 更新失败时输出错误信息
      console.error("Error updating team:", error);
      // 抛出错误
      throw error;
    }
  }

  // 永久删除团队（硬删除）
  async deleteTeam(teamId) {
    try {
      const collection = this.getCollection();
      // 使用 deleteOne 方法永久删除指定团队
      const result = await collection.deleteOne({
        _id: new ObjectId(teamId),
      });
      // 返回是否删除成功（deletedCount > 0 表示成功删除了一条记录）
      return result.deletedCount > 0;
    } catch (error) {
      // 删除失败时输出错误信息
      console.error("Error deleting team:", error);
      // 抛出错误
      throw error;
    }
  }

  // 根据部门查找所有符合条件的团队
  async findTeamsByDepartment(department) {
    try {
      const collection = this.getCollection();
      // 使用 find 方法查询所有具有指定部门的团队
      // toArray() 将查询结果转换为数组
      return await collection.find({ department }).toArray();
    } catch (error) {
      // 查询失败时输出错误信息
      console.error("Error finding teams by department:", error);
      // 抛出错误
      throw error;
    }
  }

  // 根据负责人查找所有符合条件的团队
  async findTeamsByLeader(leaderId) {
    try {
      const collection = this.getCollection();
      // 使用 find 方法查询所有具有指定负责人的团队
      // toArray() 将查询结果转换为数组
      return await collection
        .find({ leaderId: new ObjectId(leaderId) })
        .toArray();
    } catch (error) {
      // 查询失败时输出错误信息
      console.error("Error finding teams by leader:", error);
      // 抛出错误
      throw error;
    }
  }

  // 查找所有团队（不限制条件）
  async findAllTeams() {
    try {
      const collection = this.getCollection();
      // 使用 find 方法查询所有团队，toArray() 转换为数组
      return await collection.find().toArray();
    } catch (error) {
      // 查询失败时输出错误信息
      console.error("Error finding all teams:", error);
      // 抛出错误
      throw error;
    }
  }

  // 分页查找团队
  async findTeamsWithPagination(page = 1, limit = 10, filter = {}) {
    try {
      const collection = this.getCollection();
      // 计算跳过的文档数量：（当前页 - 1）* 每页数量
      const skip = (page - 1) * limit;
      // 统计符合过滤条件的总文档数
      const total = await collection.countDocuments(filter);
      // 执行分页查询：先过滤，再跳过指定数量，最后限制返回数量
      const teams = await collection
        .find(filter) // 应用过滤条件
        .skip(skip) // 跳过前面 skip 条记录
        .limit(limit) // 只返回 limit 条记录
        .toArray(); // 转换为数组

      // 返回分页结果对象
      return {
        teams, // 当前页的团队列表
        total, // 总记录数
        page, // 当前页码
        limit, // 每页记录数
        totalPages: Math.ceil(total / limit), // 总页数（向上取整）
      };
    } catch (error) {
      // 查询失败时输出错误信息
      console.error("Error finding teams with pagination:", error);
      // 抛出错误
      throw error;
    }
  }
}

// 导出 TeamModel 的单例实例
// 使用 new TeamModel() 创建实例，确保整个应用共享同一个数据库连接
module.exports = new TeamModel();
