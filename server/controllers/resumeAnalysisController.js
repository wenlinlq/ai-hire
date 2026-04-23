// controllers/resumeAnalysisController.js
const resumeModel = require("../models/resumeModel");
const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");
const path = require("path");

const ANALYSIS_SERVICE_URL =
  process.env.ANALYSIS_SERVICE_URL || "http://localhost:8000";

const resumeAnalysisController = {
  // 分析已存在的简历
  async analyzeResume(req, res) {
    try {
      const { resumeId } = req.params;

      // 1. 从数据库获取简历信息
      const resume = await resumeModel.getResumeById(resumeId);

      if (!resume) {
        return res.status(404).json({
          success: false,
          message: "简历不存在",
        });
      }

      // 2. 获取简历文件的完整路径
      const filePath = path.join(__dirname, "..", resume.fileUrl);

      if (!fs.existsSync(filePath)) {
        return res.status(404).json({
          success: false,
          message: "简历文件不存在",
        });
      }

      // 3. 调用 Python 分析服务
      const formData = new FormData();
      formData.append("file", fs.createReadStream(filePath));

      const analysisResponse = await axios.post(
        `${ANALYSIS_SERVICE_URL}/analyze`,
        formData,
        {
          headers: {
            ...formData.getHeaders(),
          },
          timeout: 120000,
        },
      );

      // 4. 保存分析结果到数据库
      const analysisResult = analysisResponse.data;

      if (analysisResult.success) {
        await resumeModel.saveAnalysisResult(resumeId, analysisResult);
      }

      // 5. 返回分析结果
      res.status(200).json({
        success: true,
        message: "简历分析成功",
        data: {
          resumeId: resumeId,
          extracted_data: analysisResult.extracted_data,
          analysis: analysisResult.analysis,
        },
      });
    } catch (error) {
      console.error("简历分析失败:", error.message);

      if (error.code === "ECONNREFUSED") {
        return res.status(503).json({
          success: false,
          message: "简历分析服务不可用，请稍后重试",
        });
      }

      res.status(500).json({
        success: false,
        message: "简历分析失败",
        error: error.message,
      });
    }
  },

  // 获取简历分析结果
  async getAnalysisResult(req, res) {
    try {
      const { resumeId } = req.params;

      const result = await resumeModel.getAnalysisResult(resumeId);

      if (!result) {
        return res.status(404).json({
          success: false,
          message: "简历不存在",
        });
      }

      res.status(200).json({
        success: true,
        data: {
          parsedData: result.parsedData,
          analysis: result.analysis,
          parsedAt: result.parsedAt,
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "获取分析结果失败",
        error: error.message,
      });
    }
  },
};

module.exports = resumeAnalysisController;
