// 导入收藏模型
const favoriteModel = require("../models/favoriteModel");

// 定义收藏控制器
const favoriteController = {
  // 添加收藏
  async addFavorite(req, res) {
    try {
      // 从请求体中获取用户ID和职位ID
      const { userId, positionId } = req.body;

      // 验证必要参数
      if (!userId || !positionId) {
        return res.status(400).json({
          success: false,
          message: "缺少必要参数",
        });
      }

      // 调用模型方法创建收藏记录
      const favorite = await favoriteModel.createFavorite({ userId, positionId });

      // 返回成功响应
      res.status(201).json({
        success: true,
        message: "添加收藏成功",
        data: favorite,
      });
    } catch (error) {
      // 处理唯一索引冲突（重复收藏）
      if (error.code === 11000) {
        return res.status(400).json({
          success: false,
          message: "已经收藏过该职位",
        });
      }

      // 捕获其他错误并返回错误响应
      res.status(500).json({
        success: false,
        message: "添加收藏失败",
        error: error.message,
      });
    }
  },

  // 取消收藏
  async removeFavorite(req, res) {
    try {
      // 从请求体中获取用户ID和职位ID
      const { userId, positionId } = req.body;

      // 验证必要参数
      if (!userId || !positionId) {
        return res.status(400).json({
          success: false,
          message: "缺少必要参数",
        });
      }

      // 调用模型方法删除收藏记录
      const deleted = await favoriteModel.deleteFavorite(userId, positionId);

      // 检查删除是否成功
      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: "收藏记录不存在",
        });
      }

      // 返回成功响应
      res.status(200).json({
        success: true,
        message: "取消收藏成功",
      });
    } catch (error) {
      // 捕获错误并返回错误响应
      res.status(500).json({
        success: false,
        message: "取消收藏失败",
        error: error.message,
      });
    }
  },

  // 检查是否收藏
  async checkFavorite(req, res) {
    try {
      // 从查询参数中获取用户ID和职位ID
      const { userId, positionId } = req.query;

      // 验证必要参数
      if (!userId || !positionId) {
        return res.status(400).json({
          success: false,
          message: "缺少必要参数",
        });
      }

      // 调用模型方法检查收藏状态
      const isFavorite = await favoriteModel.checkFavorite(userId, positionId);

      // 返回成功响应
      res.status(200).json({
        success: true,
        message: "检查收藏状态成功",
        data: { isFavorite },
      });
    } catch (error) {
      // 捕获错误并返回错误响应
      res.status(500).json({
        success: false,
        message: "检查收藏状态失败",
        error: error.message,
      });
    }
  },

  // 获取用户的收藏列表
  async getUserFavorites(req, res) {
    try {
      // 从查询参数中获取用户ID
      const { userId } = req.query;

      // 验证必要参数
      if (!userId) {
        return res.status(400).json({
          success: false,
          message: "缺少用户ID",
        });
      }

      // 调用模型方法获取用户的收藏列表
      const favoriteIds = await favoriteModel.getUserFavorites(userId);

      // 返回成功响应
      res.status(200).json({
        success: true,
        message: "获取收藏列表成功",
        data: favoriteIds,
      });
    } catch (error) {
      // 捕获错误并返回错误响应
      res.status(500).json({
        success: false,
        message: "获取收藏列表失败",
        error: error.message,
      });
    }
  },

  // 获取用户的收藏岗位详情列表
  async getFavoriteDetails(req, res) {
    try {
      // 从查询参数中获取用户ID
      const { userId } = req.query;

      // 验证必要参数
      if (!userId) {
        return res.status(400).json({
          success: false,
          message: "缺少用户ID",
        });
      }

      // 调用模型方法获取用户的收藏岗位详情列表
      const favoriteDetails = await favoriteModel.getUserFavoriteDetails(userId);

      // 返回成功响应
      res.status(200).json({
        success: true,
        message: "获取收藏岗位详情成功",
        data: favoriteDetails,
      });
    } catch (error) {
      // 捕获错误并返回错误响应
      res.status(500).json({
        success: false,
        message: "获取收藏岗位详情失败",
        error: error.message,
      });
    }
  },
};

// 导出收藏控制器
module.exports = favoriteController;
