// 导入岗位模型
const positionModel = require("../models/positionModel");

// 定义岗位控制器对象，包含所有岗位相关的业务逻辑处理函数
const positionController = {
  // 创建岗位
  async createPosition(req, res) {
    try {
      // 从请求体中获取岗位数据
      const positionData = req.body;
      // 调用模型方法创建岗位
      const newPosition = await positionModel.createPosition(positionData);
      // 返回成功响应，状态码201（Created）
      res.status(201).json({
        success: true,
        message: "岗位创建成功",
        data: newPosition,
      });
    } catch (error) {
      // 捕获错误并返回错误响应
      res.status(500).json({
        success: false,
        message: "创建岗位失败",
        error: error.message,
      });
    }
  },

  // 获取所有岗位
  async getAllPositions(req, res) {
    try {
      // 调用模型方法获取所有岗位
      const positions = await positionModel.findAllPositions();
      // 返回成功响应
      res.status(200).json({
        success: true,
        message: "获取岗位列表成功",
        data: positions,
      });
    } catch (error) {
      // 捕获错误并返回错误响应
      res.status(500).json({
        success: false,
        message: "获取岗位列表失败",
        error: error.message,
      });
    }
  },

  // 分页获取岗位
  async getPositionsWithPagination(req, res) {
    try {
      // 从查询参数中获取分页信息和过滤条件
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const filter = req.query.filter ? JSON.parse(req.query.filter) : {};
      // 调用模型方法进行分页查询
      const result = await positionModel.findPositionsWithPagination(page, limit, filter);
      // 返回成功响应
      res.status(200).json({
        success: true,
        message: "分页获取岗位成功",
        data: result,
      });
    } catch (error) {
      // 捕获错误并返回错误响应
      res.status(500).json({
        success: false,
        message: "分页获取岗位失败",
        error: error.message,
      });
    }
  },

  // 根据团队获取岗位
  async getPositionsByTeam(req, res) {
    try {
      // 从路由参数中获取团队ID
      const teamId = req.params.teamId;
      // 调用模型方法获取指定团队的岗位
      const positions = await positionModel.findPositionsByTeam(teamId);
      // 返回成功响应
      res.status(200).json({
        success: true,
        message: "获取团队岗位成功",
        data: positions,
      });
    } catch (error) {
      // 捕获错误并返回错误响应
      res.status(500).json({
        success: false,
        message: "获取团队岗位失败",
        error: error.message,
      });
    }
  },

  // 根据状态获取岗位
  async getPositionsByStatus(req, res) {
    try {
      // 从路由参数中获取状态
      const status = req.params.status;
      // 调用模型方法获取指定状态的岗位
      const positions = await positionModel.findPositionsByStatus(status);
      // 返回成功响应
      res.status(200).json({
        success: true,
        message: "获取岗位成功",
        data: positions,
      });
    } catch (error) {
      // 捕获错误并返回错误响应
      res.status(500).json({
        success: false,
        message: "获取岗位失败",
        error: error.message,
      });
    }
  },

  // 获取岗位详情
  async getPositionById(req, res) {
    try {
      // 从路由参数中获取岗位ID
      const positionId = req.params.id;
      // 调用模型方法获取岗位详情
      const position = await positionModel.findPositionById(positionId);
      // 检查岗位是否存在
      if (!position) {
        return res.status(404).json({
          success: false,
          message: "岗位不存在",
        });
      }
      // 增加浏览次数
      await positionModel.incrementViewCount(positionId);
      // 返回成功响应
      res.status(200).json({
        success: true,
        message: "获取岗位详情成功",
        data: position,
      });
    } catch (error) {
      // 捕获错误并返回错误响应
      res.status(500).json({
        success: false,
        message: "获取岗位详情失败",
        error: error.message,
      });
    }
  },

  // 更新岗位
  async updatePosition(req, res) {
    try {
      // 从路由参数中获取岗位ID
      const positionId = req.params.id;
      // 从请求体中获取更新数据
      const updateData = req.body;
      // 调用模型方法更新岗位
      const updated = await positionModel.updatePosition(positionId, updateData);
      // 检查更新是否成功
      if (!updated) {
        return res.status(404).json({
          success: false,
          message: "岗位不存在或更新失败",
        });
      }
      // 获取更新后的岗位信息
      const updatedPosition = await positionModel.findPositionById(positionId);
      // 返回成功响应
      res.status(200).json({
        success: true,
        message: "岗位更新成功",
        data: updatedPosition,
      });
    } catch (error) {
      // 捕获错误并返回错误响应
      res.status(500).json({
        success: false,
        message: "更新岗位失败",
        error: error.message,
      });
    }
  },

  // 删除岗位
  async deletePosition(req, res) {
    try {
      // 从路由参数中获取岗位ID
      const positionId = req.params.id;
      // 调用模型方法删除岗位
      const deleted = await positionModel.deletePosition(positionId);
      // 检查删除是否成功
      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: "岗位不存在或删除失败",
        });
      }
      // 返回成功响应
      res.status(200).json({
        success: true,
        message: "岗位删除成功",
      });
    } catch (error) {
      // 捕获错误并返回错误响应
      res.status(500).json({
        success: false,
        message: "删除岗位失败",
        error: error.message,
      });
    }
  },

  // 搜索岗位
  async searchPositions(req, res) {
    try {
      // 从查询参数中获取搜索关键词
      const keyword = req.query.keyword;
      // 调用模型方法搜索岗位
      const positions = await positionModel.searchPositions(keyword);
      // 返回成功响应
      res.status(200).json({
        success: true,
        message: "搜索岗位成功",
        data: positions,
      });
    } catch (error) {
      // 捕获错误并返回错误响应
      res.status(500).json({
        success: false,
        message: "搜索岗位失败",
        error: error.message,
      });
    }
  },

  // 增加岗位投递人数
  async incrementApplyCount(req, res) {
    try {
      // 从路由参数中获取岗位ID
      const positionId = req.params.id;
      // 调用模型方法增加投递人数
      const updated = await positionModel.incrementApplyCount(positionId);
      // 检查更新是否成功
      if (!updated) {
        return res.status(404).json({
          success: false,
          message: "岗位不存在",
        });
      }
      // 返回成功响应
      res.status(200).json({
        success: true,
        message: "投递人数更新成功",
      });
    } catch (error) {
      // 捕获错误并返回错误响应
      res.status(500).json({
        success: false,
        message: "更新投递人数失败",
        error: error.message,
      });
    }
  },
};

// 导出岗位控制器
module.exports = positionController;
