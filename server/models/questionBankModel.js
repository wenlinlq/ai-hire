// 导入数据库连接模块，用于获取数据库实例
const { getDB } = require("../db/db");
// 导入 MongoDB 的 ObjectId 类型，用于处理文档的 _id 字段
const { ObjectId } = require("mongodb");

// 定义面试题库模型类，封装所有面试题库相关的数据库操作
class QuestionBankModel {
  // 构造函数，在创建实例时自动执行
  constructor() {
    // 延迟获取数据库连接，在需要时通过 getCollection 方法获取
  }

  // 获取数据库集合的方法
  getCollection() {
    if (!this.collection) {
      this.collection = getDB().collection("questionBanks");
    }
    return this.collection;
  }

  // 初始化数据库索引的方法
  async initIndexes() {
    try {
      const collection = this.getCollection();
      // 创建团队ID索引，用于提高查询性能
      await collection.createIndex({ teamId: 1 });
      // 创建分类索引，用于提高查询性能
      await collection.createIndex({ category: 1 });
      // 创建标题全文索引，用于搜索功能
      await collection.createIndex({ title: "text" });
      // 控制台输出索引初始化成功的消息
      console.log("QuestionBank indexes initialized successfully");
    } catch (error) {
      // 如果索引创建失败，输出错误信息
      console.error("Error initializing questionBank indexes:", error);
    }
  }

  // 创建新的面试题库
  async createQuestionBank(questionBankData) {
    try {
      const collection = this.getCollection();

      // 构建面试题库文档对象
      const questionBank = {
        // 题库名称
        title: questionBankData.title,
        // 题型（如：essay）
        type: questionBankData.type,
        // 分类（如：前端、后端、产品等）
        category: questionBankData.category,
        // 所属团队ID
        teamId: new ObjectId(questionBankData.teamId),
        // 题目列表
        questions: questionBankData.questions || [],
        // 创建时间
        createdAt: new Date(),
        // 更新时间
        updatedAt: new Date(),
      };

      // 向数据库插入面试题库文档
      const result = await collection.insertOne(questionBank);
      // 返回完整的面试题库对象，包含 MongoDB 自动生成的 _id
      return {
        ...questionBank,
        _id: result.insertedId,
      };
    } catch (error) {
      // 如果创建失败，输出错误信息
      console.error("Error creating questionBank:", error);
      // 抛出错误，让上层调用者处理
      throw error;
    }
  }

  // 根据ID查找面试题库
  async findQuestionBankById(questionBankId) {
    try {
      const collection = this.getCollection();
      // 使用 findOne 方法查询，将字符串 ID 转换为 ObjectId 类型
      // 返回匹配的面试题库文档，如果没有找到则返回 null
      return await collection.findOne({ _id: new ObjectId(questionBankId) });
    } catch (error) {
      // 查询失败时输出错误信息
      console.error("Error finding questionBank by ID:", error);
      // 抛出错误
      throw error;
    }
  }

  // 获取所有面试题库
  async getAllQuestionBanks() {
    try {
      const collection = this.getCollection();
      // 使用 find 方法查询所有面试题库
      // toArray() 将查询结果转换为数组
      return await collection.find().toArray();
    } catch (error) {
      // 查询失败时输出错误信息
      console.error("Error finding all questionBanks:", error);
      // 抛出错误
      throw error;
    }
  }

  // 根据团队ID获取面试题库
  async getQuestionBanksByTeamId(teamId) {
    try {
      const collection = this.getCollection();
      // 使用 find 方法查询指定团队的所有面试题库
      // toArray() 将查询结果转换为数组
      return await collection.find({ teamId: new ObjectId(teamId) }).toArray();
    } catch (error) {
      // 查询失败时输出错误信息
      console.error("Error finding questionBanks by team ID:", error);
      // 抛出错误
      throw error;
    }
  }

  // 根据分类获取面试题库
  async getQuestionBanksByCategory(category) {
    try {
      const collection = this.getCollection();
      // 使用 find 方法查询指定分类的所有面试题库
      // toArray() 将查询结果转换为数组
      return await collection.find({ category }).toArray();
    } catch (error) {
      // 查询失败时输出错误信息
      console.error("Error finding questionBanks by category:", error);
      // 抛出错误
      throw error;
    }
  }

  // 搜索面试题库
  async searchQuestionBanks(keyword) {
    try {
      const collection = this.getCollection();
      // 使用 find 方法，通过全文索引搜索面试题库
      // toArray() 将查询结果转换为数组
      return await collection.find({ $text: { $search: keyword } }).toArray();
    } catch (error) {
      // 查询失败时输出错误信息
      console.error("Error searching questionBanks:", error);
      // 抛出错误
      throw error;
    }
  }

  // 更新面试题库
  async updateQuestionBank(questionBankId, updateData) {
    try {
      const collection = this.getCollection();
      // 自动更新 updatedAt 字段为当前时间
      updateData.updatedAt = new Date();

      // 处理teamId字段，转换为ObjectId
      if (updateData.teamId) {
        updateData.teamId = new ObjectId(updateData.teamId);
      }

      // 执行更新操作
      const result = await collection.updateOne(
        // 查询条件：根据 _id 查找要更新的面试题库
        { _id: new ObjectId(questionBankId) },
        // 更新操作：使用 $set 操作符只更新指定的字段
        { $set: updateData },
      );

      // 检查是否更新成功
      if (result.modifiedCount === 0) {
        return null; // 没有找到要更新的面试题库
      }

      // 返回更新后的面试题库
      return await this.findQuestionBankById(questionBankId);
    } catch (error) {
      // 更新失败时输出错误信息
      console.error("Error updating questionBank:", error);
      // 抛出错误
      throw error;
    }
  }

  // 删除面试题库
  async deleteQuestionBank(questionBankId) {
    try {
      const collection = this.getCollection();
      // 使用 deleteOne 方法删除指定的面试题库
      const result = await collection.deleteOne({
        _id: new ObjectId(questionBankId),
      });
      // 返回是否删除成功（deletedCount > 0 表示成功删除了一条记录）
      return result.deletedCount > 0;
    } catch (error) {
      // 删除失败时输出错误信息
      console.error("Error deleting questionBank:", error);
      // 抛出错误
      throw error;
    }
  }
}

// 导出 QuestionBankModel 的单例实例
// 使用 new QuestionBankModel() 创建实例，确保整个应用共享同一个数据库连接
module.exports = new QuestionBankModel();
