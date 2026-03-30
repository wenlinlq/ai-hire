// 导入团队模型，用于操作数据库
const teamModel = require("../models/teamModel");

// 定义团队控制器类，处理所有团队相关的HTTP请求
class TeamController {
  // 创建团队
  async createTeam(req, res) {
    try {
      // 从请求体中解构获取团队信息
      const {
        name,
        department,
        description,
        logo,
        leaderId,
        members,
        contact,
        status,
      } = req.body;

      // 验证必填字段：团队名称、部门、介绍和负责人ID不能为空
      if (!name || !department || !description || !leaderId) {
        // 返回400错误，缺少必填字段
        return res.status(400).json({
          success: false,
          message: "团队名称、部门、介绍和负责人ID为必填项",
        });
      }

      // 检查团队名称是否已存在
      const existingTeam = await teamModel.findTeamByName(name);
      if (existingTeam) {
        // 团队名称已存在，返回400错误
        return res.status(400).json({
          success: false,
          message: "团队名称已存在",
        });
      }

      // 调用模型创建团队
      const team = await teamModel.createTeam({
        name,
        department,
        description,
        logo,
        leaderId,
        members,
        contact,
        status,
      });

      // 返回201 Created状态码，表示资源创建成功
      res.status(201).json({
        success: true,
        message: "团队创建成功",
        data: team,
      });
    } catch (error) {
      // 捕获并记录服务器错误
      console.error("创建团队失败:", error);
      // 返回500服务器内部错误
      res.status(500).json({
        success: false,
        message: "服务器内部错误",
      });
    }
  }

  // 根据ID获取团队详情
  async getTeamById(req, res) {
    try {
      // 从URL参数中获取团队ID
      const { id } = req.params;

      // 调用模型查找团队
      const team = await teamModel.findTeamById(id);
      if (!team) {
        // 团队不存在，返回404 Not Found
        return res.status(404).json({
          success: false,
          message: "团队不存在",
        });
      }

      // 返回200 OK状态码和团队信息
      res.status(200).json({
        success: true,
        data: team,
      });
    } catch (error) {
      // 捕获并记录错误
      console.error("获取团队详情失败:", error);
      // 返回500服务器错误
      res.status(500).json({
        success: false,
        message: "服务器内部错误",
      });
    }
  }

  // 更新团队信息
  async updateTeam(req, res) {
    try {
      // 从URL参数获取团队ID
      const { id } = req.params;
      // 获取请求体中的更新数据
      const updateData = req.body;

      // 检查团队是否存在
      const existingTeam = await teamModel.findTeamById(id);
      if (!existingTeam) {
        // 团队不存在，返回404
        return res.status(404).json({
          success: false,
          message: "团队不存在",
        });
      }

      // 如果要更新团队名称，且新名称与原名称不同，需要检查是否已被占用
      if (updateData.name && updateData.name !== existingTeam.name) {
        // 检查新团队名称是否已存在
        const nameExists = await teamModel.findTeamByName(updateData.name);
        if (nameExists) {
          // 团队名称已被占用，返回400
          return res.status(400).json({
            success: false,
            message: "团队名称已存在",
          });
        }
      }

      // 调用模型更新团队信息
      const updated = await teamModel.updateTeam(id, updateData);
      if (!updated) {
        // 更新失败，返回400
        return res.status(400).json({
          success: false,
          message: "更新团队失败",
        });
      }

      // 获取更新后的团队信息
      const updatedTeam = await teamModel.findTeamById(id);

      // 返回200 OK和更新后的团队信息
      res.status(200).json({
        success: true,
        message: "团队更新成功",
        data: updatedTeam,
      });
    } catch (error) {
      // 捕获并记录错误
      console.error("更新团队失败:", error);
      // 返回500服务器错误
      res.status(500).json({
        success: false,
        message: "服务器内部错误",
      });
    }
  }

  // 删除团队
  async deleteTeam(req, res) {
    try {
      // 从URL参数获取团队ID
      const { id } = req.params;

      // 检查团队是否存在
      const existingTeam = await teamModel.findTeamById(id);
      if (!existingTeam) {
        // 团队不存在，返回404
        return res.status(404).json({
          success: false,
          message: "团队不存在",
        });
      }

      // 调用模型删除团队
      const deleted = await teamModel.deleteTeam(id);
      if (!deleted) {
        // 删除失败，返回400
        return res.status(400).json({
          success: false,
          message: "删除团队失败",
        });
      }

      // 返回200 OK，表示删除成功
      res.status(200).json({
        success: true,
        message: "团队删除成功",
      });
    } catch (error) {
      // 捕获并记录错误
      console.error("删除团队失败:", error);
      // 返回500服务器错误
      res.status(500).json({
        success: false,
        message: "服务器内部错误",
      });
    }
  }

  // 获取所有团队（不分页）
  async getAllTeams(req, res) {
    try {
      // 调用模型获取所有团队
      const teams = await teamModel.findAllTeams();

      // 返回200 OK和团队列表
      res.status(200).json({
        success: true,
        data: teams,
      });
    } catch (error) {
      // 捕获并记录错误
      console.error("获取所有团队失败:", error);
      // 返回500服务器错误
      res.status(500).json({
        success: false,
        message: "服务器内部错误",
      });
    }
  }

  // 分页获取团队列表
  async getTeamsWithPagination(req, res) {
    try {
      // 从查询参数获取页码，默认为1，使用parseInt转换为整数
      const page = parseInt(req.query.page) || 1;
      // 从查询参数获取每页数量，默认为10
      const limit = parseInt(req.query.limit) || 10;
      // 从查询参数获取部门筛选条件
      const department = req.query.department;
      // 从查询参数获取负责人ID筛选条件
      const leaderId = req.query.leaderId;

      // 构建过滤条件对象
      const filter = {};
      if (department) {
        // 如果有部门参数，添加到过滤条件中
        filter.department = department;
      }
      if (leaderId) {
        // 如果有负责人ID参数，添加到过滤条件中
        filter.leaderId = leaderId;
      }

      // 调用模型的分页查询方法
      const result = await teamModel.findTeamsWithPagination(
        page,
        limit,
        filter,
      );

      // 返回200 OK和分页数据
      res.status(200).json({
        success: true,
        data: {
          teams: result.teams, // 当前页的团队列表
          total: result.total, // 总记录数
          page: result.page, // 当前页码
          limit: result.limit, // 每页数量
          totalPages: result.totalPages, // 总页数
        },
      });
    } catch (error) {
      // 捕获并记录错误
      console.error("分页获取团队失败:", error);
      // 返回500服务器错误
      res.status(500).json({
        success: false,
        message: "服务器内部错误",
      });
    }
  }

  // 根据部门获取团队列表
  async getTeamsByDepartment(req, res) {
    try {
      // 从URL参数获取部门名称
      const { department } = req.params;

      // 调用模型根据部门查询团队
      const teams = await teamModel.findTeamsByDepartment(department);

      // 返回200 OK和团队列表
      res.status(200).json({
        success: true,
        data: teams,
      });
    } catch (error) {
      // 捕获并记录错误
      console.error("根据部门获取团队失败:", error);
      // 返回500服务器错误
      res.status(500).json({
        success: false,
        message: "服务器内部错误",
      });
    }
  }

  // 根据负责人获取团队列表
  async getTeamsByLeader(req, res) {
    try {
      // 从URL参数获取负责人ID
      const { leaderId } = req.params;

      // 调用模型根据负责人查询团队
      const teams = await teamModel.findTeamsByLeader(leaderId);

      // 返回200 OK和团队列表
      res.status(200).json({
        success: true,
        data: teams,
      });
    } catch (error) {
      // 捕获并记录错误
      console.error("根据负责人获取团队失败:", error);
      // 返回500服务器错误
      res.status(500).json({
        success: false,
        message: "服务器内部错误",
      });
    }
  }
}

// 导出TeamController的单例实例
// 使用new TeamController()确保整个应用共享同一个控制器实例
module.exports = new TeamController();
