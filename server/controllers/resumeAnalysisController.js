const resumeAnalysisModel = require("../models/resumeAnalysisModel");

const resumeAnalysisController = {
  // 初始化索引
  async initializeIndexes() {
    await resumeAnalysisModel.initializeIndexes();
  },

  // 创建简历分析结果
  async createResumeAnalysis(req, res) {
    try {
      const analysisData = req.body;

      // 验证必要参数
      if (!analysisData.resumeId) {
        return res.status(400).json({
          success: false,
          message: "缺少必要参数（resumeId 是必填项）",
        });
      }

      const analysis = await resumeAnalysisModel.createResumeAnalysis(analysisData);

      res.status(201).json({
        success: true,
        message: "简历分析结果创建成功",
        data: analysis,
      });
    } catch (error) {
      console.error("Error creating resume analysis:", error);
      res.status(500).json({
        success: false,
        message: "创建简历分析结果失败",
        error: error.message,
      });
    }
  },

  // 获取单个简历分析结果
  async getResumeAnalysisById(req, res) {
    try {
      const { id } = req.params;
      const analysis = await resumeAnalysisModel.findResumeAnalysisById(id);

      if (!analysis) {
        return res.status(404).json({
          success: false,
          message: "简历分析结果不存在",
        });
      }

      res.status(200).json({
        success: true,
        data: analysis,
      });
    } catch (error) {
      console.error("Error getting resume analysis:", error);
      res.status(500).json({
        success: false,
        message: "获取简历分析结果失败",
        error: error.message,
      });
    }
  },

  // 获取简历的分析结果
  async getResumeAnalysisByResume(req, res) {
    try {
      const { resumeId } = req.params;
      const analysis = await resumeAnalysisModel.findResumeAnalysisByResumeId(resumeId);

      res.status(200).json({
        success: true,
        data: analysis,
      });
    } catch (error) {
      console.error("Error getting resume analysis by resume:", error);
      res.status(500).json({
        success: false,
        message: "获取简历分析结果失败",
        error: error.message,
      });
    }
  },

  // 获取规则相关的所有简历分析结果
  async getResumeAnalysesByRule(req, res) {
    try {
      const { ruleId } = req.params;
      const analyses = await resumeAnalysisModel.findResumeAnalysesByRuleId(ruleId);

      res.status(200).json({
        success: true,
        data: analyses,
      });
    } catch (error) {
      console.error("Error getting resume analyses by rule:", error);
      res.status(500).json({
        success: false,
        message: "获取简历分析结果失败",
        error: error.message,
      });
    }
  },

  // 更新简历分析结果
  async updateResumeAnalysis(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const analysis = await resumeAnalysisModel.updateResumeAnalysis(id, updateData);

      if (!analysis) {
        return res.status(404).json({
          success: false,
          message: "简历分析结果不存在",
        });
      }

      res.status(200).json({
        success: true,
        message: "更新成功",
        data: analysis,
      });
    } catch (error) {
      console.error("Error updating resume analysis:", error);
      res.status(500).json({
        success: false,
        message: "更新简历分析结果失败",
        error: error.message,
      });
    }
  },

  // 删除简历分析结果
  async deleteResumeAnalysis(req, res) {
    try {
      const { id } = req.params;
      const deleted = await resumeAnalysisModel.deleteResumeAnalysis(id);

      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: "简历分析结果不存在",
        });
      }

      res.status(200).json({
        success: true,
        message: "删除成功",
      });
    } catch (error) {
      console.error("Error deleting resume analysis:", error);
      res.status(500).json({
        success: false,
        message: "删除简历分析结果失败",
        error: error.message,
      });
    }
  },

  // 获取所有简历分析结果
  async getAllResumeAnalyses(req, res) {
    try {
      const analyses = await resumeAnalysisModel.findAllResumeAnalyses();

      res.status(200).json({
        success: true,
        data: analyses,
      });
    } catch (error) {
      console.error("Error getting all resume analyses:", error);
      res.status(500).json({
        success: false,
        message: "获取简历分析结果失败",
        error: error.message,
      });
    }
  },

  // 根据推荐意见获取简历分析结果
  async getResumeAnalysesByRecommendation(req, res) {
    try {
      const { recommendation } = req.params;
      const analyses = await resumeAnalysisModel.findResumeAnalysesByRecommendation(recommendation);

      res.status(200).json({
        success: true,
        data: analyses,
      });
    } catch (error) {
      console.error("Error getting resume analyses by recommendation:", error);
      res.status(500).json({
        success: false,
        message: "获取简历分析结果失败",
        error: error.message,
      });
    }
  },

  // 按综合总分排序获取简历分析结果
  async getResumeAnalysesByTotalScore(req, res) {
    try {
      const { ruleId } = req.query;
      const analyses = await resumeAnalysisModel.findResumeAnalysesByTotalScoreDesc(ruleId);

      res.status(200).json({
        success: true,
        data: analyses,
      });
    } catch (error) {
      console.error("Error getting resume analyses by total score:", error);
      res.status(500).json({
        success: false,
        message: "获取简历分析结果失败",
        error: error.message,
      });
    }
  },

  // 删除指定简历的分析结果
  async deleteResumeAnalysisByResume(req, res) {
    try {
      const { resumeId } = req.params;
      const deleted = await resumeAnalysisModel.deleteResumeAnalysisByResumeId(resumeId);

      res.status(200).json({
        success: true,
        message: deleted ? "删除成功" : "未找到对应的分析结果",
      });
    } catch (error) {
      console.error("Error deleting resume analysis by resume:", error);
      res.status(500).json({
        success: false,
        message: "删除简历分析结果失败",
        error: error.message,
      });
    }
  },
};

module.exports = resumeAnalysisController;