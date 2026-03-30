// 导入数据库连接模块，用于获取数据库实例
const { getDB } = require("../db/db");
// 导入 MongoDB 的 ObjectId 类型，用于处理文档的 _id 字段
const { ObjectId } = require("mongodb");
// 导入 bcrypt 加密库，用于密码哈希加密和验证
const bcrypt = require("bcrypt");

// 定义用户模型类，封装所有用户相关的数据库操作
class UserModel {
  // 构造函数，在创建实例时自动执行
  constructor() {
    // 延迟获取数据库连接，在需要时通过 getCollection 方法获取
  }

  // 获取数据库集合的方法
  getCollection() {
    if (!this.collection) {
      this.collection = getDB().collection("users");
    }
    return this.collection;
  }

  // 初始化数据库索引的方法
  async initIndexes() {
    try {
      const collection = this.getCollection();
      // 创建用户名唯一索引，确保用户名不会重复
      // { username: 1 } 表示升序索引，unique: true 表示唯一约束
      await collection.createIndex({ username: 1 }, { unique: true });
      // 创建邮箱唯一索引，确保邮箱地址不会重复
      await collection.createIndex({ email: 1 }, { unique: true });
      // 创建角色普通索引，用于按角色查询用户时提高性能
      await collection.createIndex({ role: 1 });
      // 控制台输出索引初始化成功的消息
      console.log("User indexes initialized successfully");
    } catch (error) {
      // 如果索引创建失败，输出错误信息
      console.error("Error initializing user indexes:", error);
    }
  }

  // 创建新用户的方法
  async createUser(userData) {
    try {
      const collection = this.getCollection();
      // 使用 bcrypt 加密用户密码，10 是盐值（salt rounds），加密强度适中
      const hashedPassword = await bcrypt.hash(userData.password, 10);

      // 构建用户文档对象
      const user = {
        // 用户名
        username: userData.username,
        // 加密后的密码
        password: hashedPassword,
        // 邮箱地址
        email: userData.email,
        // 手机号码，如果没有提供则默认为空字符串
        phone: userData.phone || "",
        // 用户角色（如：admin, user, manager 等）
        role: userData.role,
        // 所属团队ID，如果没有提供则默认为空字符串
        team: userData.team || "",
        // 头像 URL，如果没有提供则默认为空字符串
        avatar: userData.avatar || "",
        // 用户状态（active：激活，inactive：未激活，banned：封禁）
        status: userData.status || "active",
        // 最后登录时间，初始为 null
        lastLogin: null,
        // 创建时间
        createdAt: new Date(),
        // 更新时间
        updatedAt: new Date(),
      };

      // 向数据库插入用户文档
      const result = await collection.insertOne(user);
      // 返回完整的用户对象，包含 MongoDB 自动生成的 _id
      return {
        ...user,
        _id: result.insertedId,
      };
    } catch (error) {
      // 如果创建失败，输出错误信息
      console.error("Error creating user:", error);
      // 抛出错误，让上层调用者处理
      throw error;
    }
  }

  // 根据用户 ID 查找用户
  async findUserById(userId) {
    try {
      const collection = this.getCollection();
      // 使用 findOne 方法查询，将字符串 ID 转换为 ObjectId 类型
      // 返回匹配的用户文档，如果没有找到则返回 null
      return await collection.findOne({ _id: new ObjectId(userId) });
    } catch (error) {
      // 查询失败时输出错误信息
      console.error("Error finding user by ID:", error);
      // 抛出错误
      throw error;
    }
  }

  // 根据用户名查找用户
  async findUserByUsername(username) {
    try {
      const collection = this.getCollection();
      // 使用 findOne 方法，通过用户名精确查询
      return await collection.findOne({ username });
    } catch (error) {
      // 查询失败时输出错误信息
      console.error("Error finding user by username:", error);
      // 抛出错误
      throw error;
    }
  }

  // 根据邮箱查找用户
  async findUserByEmail(email) {
    try {
      const collection = this.getCollection();
      // 使用 findOne 方法，通过邮箱地址精确查询
      return await collection.findOne({ email });
    } catch (error) {
      // 查询失败时输出错误信息
      console.error("Error finding user by email:", error);
      // 抛出错误
      throw error;
    }
  }

  // 验证用户密码是否正确
  async verifyPassword(user, password) {
    try {
      // 使用 bcrypt.compare 比较明文密码和数据库中加密的密码
      // 返回布尔值：true 表示密码正确，false 表示密码错误
      return await bcrypt.compare(password, user.password);
    } catch (error) {
      // 验证失败时输出错误信息
      console.error("Error verifying password:", error);
      // 抛出错误
      throw error;
    }
  }

  // 更新用户信息
  async updateUser(userId, updateData) {
    try {
      const collection = this.getCollection();
      // 自动更新 updatedAt 字段为当前时间
      updateData.updatedAt = new Date();

      // 如果更新数据中包含密码字段
      if (updateData.password) {
        // 需要重新加密新密码
        updateData.password = await bcrypt.hash(updateData.password, 10);
      }

      // 执行更新操作
      const result = await collection.updateOne(
        // 查询条件：根据 _id 查找要更新的用户
        { _id: new ObjectId(userId) },
        // 更新操作：使用 $set 操作符只更新指定的字段
        { $set: updateData },
      );

      // 返回是否更新成功（modifiedCount > 0 表示至少更新了一条记录）
      return result.modifiedCount > 0;
    } catch (error) {
      // 更新失败时输出错误信息
      console.error("Error updating user:", error);
      // 抛出错误
      throw error;
    }
  }

  // 更新用户的最后登录时间
  async updateLastLogin(userId) {
    try {
      const collection = this.getCollection();
      // 使用 updateOne 方法更新指定用户的最后登录时间
      await collection.updateOne(
        // 查询条件：根据 _id 查找用户
        { _id: new ObjectId(userId) },
        // 使用 $set 操作符同时更新 lastLogin 和 updatedAt 字段
        { $set: { lastLogin: new Date(), updatedAt: new Date() } },
      );
    } catch (error) {
      // 更新失败时输出错误信息
      console.error("Error updating last login:", error);
      // 抛出错误
      throw error;
    }
  }

  // 永久删除用户（硬删除）
  async deleteUser(userId) {
    try {
      const collection = this.getCollection();
      // 使用 deleteOne 方法永久删除指定用户
      const result = await collection.deleteOne({
        _id: new ObjectId(userId),
      });
      // 返回是否删除成功（deletedCount > 0 表示成功删除了一条记录）
      return result.deletedCount > 0;
    } catch (error) {
      // 删除失败时输出错误信息
      console.error("Error deleting user:", error);
      // 抛出错误
      throw error;
    }
  }

  // 根据角色查找所有符合条件的用户
  async findUsersByRole(role) {
    try {
      const collection = this.getCollection();
      // 使用 find 方法查询所有具有指定角色的用户
      // toArray() 将查询结果转换为数组
      return await collection.find({ role }).toArray();
    } catch (error) {
      // 查询失败时输出错误信息
      console.error("Error finding users by role:", error);
      // 抛出错误
      throw error;
    }
  }

  // 查找所有用户（不限制条件）
  async findAllUsers() {
    try {
      const collection = this.getCollection();
      // 使用 find 方法查询所有用户，toArray() 转换为数组
      return await collection.find().toArray();
    } catch (error) {
      // 查询失败时输出错误信息
      console.error("Error finding all users:", error);
      // 抛出错误
      throw error;
    }
  }

  // 分页查找用户
  async findUsersWithPagination(page = 1, limit = 10, filter = {}) {
    try {
      const collection = this.getCollection();
      // 计算跳过的文档数量：（当前页 - 1）* 每页数量
      const skip = (page - 1) * limit;
      // 统计符合过滤条件的总文档数
      const total = await collection.countDocuments(filter);
      // 执行分页查询：先过滤，再跳过指定数量，最后限制返回数量
      const users = await collection
        .find(filter) // 应用过滤条件
        .skip(skip) // 跳过前面 skip 条记录
        .limit(limit) // 只返回 limit 条记录
        .toArray(); // 转换为数组

      // 返回分页结果对象
      return {
        users, // 当前页的用户列表
        total, // 总记录数
        page, // 当前页码
        limit, // 每页记录数
        totalPages: Math.ceil(total / limit), // 总页数（向上取整）
      };
    } catch (error) {
      // 查询失败时输出错误信息
      console.error("Error finding users with pagination:", error);
      // 抛出错误
      throw error;
    }
  }
}

// 导出 UserModel 的单例实例
// 使用 new UserModel() 创建实例，确保整个应用共享同一个数据库连接
module.exports = new UserModel();
