const filterRuleModel = require("../models/filterRuleModel");

const filterRuleController = {
  // 初始化索引
  async initializeIndexes() {
    await filterRuleModel.initializeIndexes();
  },

  // 创建筛选规则
  async createFilterRule(req, res) {
    try {
      const ruleData = req.body;

      // 验证必要参数
      if (!ruleData.teamId || !ruleData.name) {
        return res.status(400).json({
          success: false,
          message: "缺少必要参数（teamId 和 name 是必填项）",
        });
      }

      const rule = await filterRuleModel.createFilterRule(ruleData);

      res.status(201).json({
        success: true,
        message: "筛选规则创建成功",
        data: rule,
      });
    } catch (error) {
      console.error("Error creating filter rule:", error);
      res.status(500).json({
        success: false,
        message: "创建筛选规则失败",
        error: error.message,
      });
    }
  },

  // 获取单个筛选规则
  async getFilterRuleById(req, res) {
    try {
      const { id } = req.params;
      const rule = await filterRuleModel.findFilterRuleById(id);

      if (!rule) {
        return res.status(404).json({
          success: false,
          message: "筛选规则不存在",
        });
      }

      res.status(200).json({
        success: true,
        data: rule,
      });
    } catch (error) {
      console.error("Error getting filter rule:", error);
      res.status(500).json({
        success: false,
        message: "获取筛选规则失败",
        error: error.message,
      });
    }
  },

  // 获取团队的所有筛选规则
  async getFilterRulesByTeam(req, res) {
    try {
      const { teamId } = req.params;
      const rules = await filterRuleModel.findFilterRulesByTeamId(teamId);

      res.status(200).json({
        success: true,
        data: rules,
      });
    } catch (error) {
      console.error("Error getting filter rules by team:", error);
      res.status(500).json({
        success: false,
        message: "获取筛选规则失败",
        error: error.message,
      });
    }
  },

  // 获取岗位的筛选规则
  async getFilterRuleByPosition(req, res) {
    try {
      const { positionId } = req.params;
      const rule = await filterRuleModel.findFilterRuleByPositionId(positionId);

      res.status(200).json({
        success: true,
        data: rule,
      });
    } catch (error) {
      console.error("Error getting filter rule by position:", error);
      res.status(500).json({
        success: false,
        message: "获取筛选规则失败",
        error: error.message,
      });
    }
  },

  // 获取团队的默认筛选规则
  async getDefaultFilterRule(req, res) {
    try {
      const { teamId } = req.params;
      const rule = await filterRuleModel.findDefaultRuleByTeamId(teamId);

      res.status(200).json({
        success: true,
        data: rule,
      });
    } catch (error) {
      console.error("Error getting default filter rule:", error);
      res.status(500).json({
        success: false,
        message: "获取筛选规则失败",
        error: error.message,
      });
    }
  },

  // 更新筛选规则
  async updateFilterRule(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const rule = await filterRuleModel.updateFilterRule(id, updateData);

      if (!rule) {
        return res.status(404).json({
          success: false,
          message: "筛选规则不存在",
        });
      }

      res.status(200).json({
        success: true,
        message: "更新成功",
        data: rule,
      });
    } catch (error) {
      console.error("Error updating filter rule:", error);
      res.status(500).json({
        success: false,
        message: "更新筛选规则失败",
        error: error.message,
      });
    }
  },

  // 删除筛选规则
  async deleteFilterRule(req, res) {
    try {
      const { id } = req.params;
      const deleted = await filterRuleModel.deleteFilterRule(id);

      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: "筛选规则不存在",
        });
      }

      res.status(200).json({
        success: true,
        message: "删除成功",
      });
    } catch (error) {
      console.error("Error deleting filter rule:", error);
      res.status(500).json({
        success: false,
        message: "删除筛选规则失败",
        error: error.message,
      });
    }
  },

  // 获取所有筛选规则
  async getAllFilterRules(req, res) {
    try {
      const rules = await filterRuleModel.findAllFilterRules();

      res.status(200).json({
        success: true,
        data: rules,
      });
    } catch (error) {
      console.error("Error getting all filter rules:", error);
      res.status(500).json({
        success: false,
        message: "获取筛选规则失败",
        error: error.message,
      });
    }
  },

  // 根据状态获取筛选规则
  async getFilterRulesByStatus(req, res) {
    try {
      const { status } = req.params;
      const rules = await filterRuleModel.findFilterRulesByStatus(status);

      res.status(200).json({
        success: true,
        data: rules,
      });
    } catch (error) {
      console.error("Error getting filter rules by status:", error);
      res.status(500).json({
        success: false,
        message: "获取筛选规则失败",
        error: error.message,
      });
    }
  },

  // 启用/禁用筛选规则
  async toggleFilterRuleStatus(req, res) {
    try {
      const { id } = req.params;
      const rule = await filterRuleModel.toggleFilterRuleStatus(id);

      if (!rule) {
        return res.status(404).json({
          success: false,
          message: "筛选规则不存在",
        });
      }

      res.status(200).json({
        success: true,
        message: rule.status === "active" ? "规则已启用" : "规则已禁用",
        data: rule,
      });
    } catch (error) {
      console.error("Error toggling filter rule status:", error);
      res.status(500).json({
        success: false,
        message: "切换规则状态失败",
        error: error.message,
      });
    }
  },
};

module.exports = filterRuleController;