// 导入数据库连接模块，用于获取数据库实例
const { getDB } = require("../db/db");
// 导入 MongoDB 的 ObjectId 类型，用于处理文档的 _id 字段
const { ObjectId } = require("mongodb");

// 定义收藏模型类，封装所有收藏相关的数据库操作
class FavoriteModel {
  // 构造函数，在创建实例时自动执行
  constructor() {
    // 延迟获取数据库连接，在需要时通过 getCollection 方法获取
  }

  // 获取数据库集合的方法
  getCollection() {
    if (!this.collection) {
      this.collection = getDB().collection("favorites");
    }
    return this.collection;
  }

  // 初始化数据库索引的方法
  async initIndexes() {
    try {
      const collection = this.getCollection();
      // 创建复合唯一索引，确保同一个用户不能重复收藏同一个职位
      await collection.createIndex(
        { userId: 1, positionId: 1 },
        { unique: true },
      );
      // 控制台输出索引初始化成功的消息
      console.log("Favorite indexes initialized successfully");
    } catch (error) {
      // 如果索引创建失败，输出错误信息
      console.error("Error initializing favorite indexes:", error);
    }
  }

  // 创建新收藏记录的方法
  async createFavorite(favoriteData) {
    try {
      const collection = this.getCollection();

      // 构建收藏文档对象
      const favorite = {
        // 用户ID
        userId: new ObjectId(favoriteData.userId),
        // 职位ID
        positionId: new ObjectId(favoriteData.positionId),
        // 收藏时间
        createdAt: new Date(),
      };

      // 向数据库插入收藏文档
      const result = await collection.insertOne(favorite);
      // 返回完整的收藏对象，包含 MongoDB 自动生成的 _id
      return {
        ...favorite,
        _id: result.insertedId,
      };
    } catch (error) {
      // 如果创建失败，输出错误信息
      console.error("Error creating favorite:", error);
      // 抛出错误，让上层调用者处理
      throw error;
    }
  }

  // 删除收藏记录的方法
  async deleteFavorite(userId, positionId) {
    try {
      const collection = this.getCollection();

      // 执行删除操作
      const result = await collection.deleteOne({
        userId: new ObjectId(userId),
        positionId: new ObjectId(positionId),
      });

      // 返回是否删除成功（deletedCount > 0 表示成功删除了一条记录）
      return result.deletedCount > 0;
    } catch (error) {
      // 如果删除失败，输出错误信息
      console.error("Error deleting favorite:", error);
      // 抛出错误，让上层调用者处理
      throw error;
    }
  }

  // 检查用户是否已收藏职位的方法
  async checkFavorite(userId, positionId) {
    try {
      const collection = this.getCollection();

      // 查询收藏记录
      const favorite = await collection.findOne({
        userId: new ObjectId(userId),
        positionId: new ObjectId(positionId),
      });

      // 返回是否存在收藏记录
      return !!favorite;
    } catch (error) {
      // 如果查询失败，输出错误信息
      console.error("Error checking favorite:", error);
      // 抛出错误，让上层调用者处理
      throw error;
    }
  }

  // 获取用户的所有收藏职位ID的方法
  async getUserFavorites(userId) {
    try {
      const collection = this.getCollection();

      // 查询用户的所有收藏记录
      const favorites = await collection
        .find({
          userId: new ObjectId(userId),
        })
        .toArray();

      // 返回职位ID数组
      return favorites.map((favorite) => favorite.positionId.toString());
    } catch (error) {
      // 如果查询失败，输出错误信息
      console.error("Error getting user favorites:", error);
      // 抛出错误，让上层调用者处理
      throw error;
    }
  }

  // 获取用户的收藏岗位详情列表（包含岗位信息）
  async getUserFavoriteDetails(userId) {
    try {
      const collection = this.getCollection();
      const { getDB } = require("../db/db");

      // 查询用户的所有收藏记录
      const favorites = await collection
        .find({
          userId: new ObjectId(userId),
        })
        .toArray();

      // 获取所有收藏的职位ID
      const positionIds = favorites.map((fav) => fav.positionId);

      if (positionIds.length === 0) {
        return [];
      }

      // 从 positions 集合中获取对应的职位详情
      const positionsCollection = getDB().collection("positions");
      const positions = await positionsCollection
        .find({
          _id: { $in: positionIds },
        })
        .toArray();

      // 合并收藏记录和职位详情
      const result = favorites.map((fav) => {
        const position = positions.find(
          (pos) => pos._id.toString() === fav.positionId.toString(),
        );
        return {
          _id: fav._id,
          userId: fav.userId,
          positionId: fav.positionId,
          jobId: position,
          createdAt: fav.createdAt,
        };
      });

      return result;
    } catch (error) {
      console.error("Error getting user favorite details:", error);
      throw error;
    }
  }
}

// 导出收藏模型
module.exports = new FavoriteModel();
