const express = require("express");
const router = express.Router();
const resumeAnalysisController = require("../../controllers/resumeAnalysisController");
const { verifyToken } = require("../../middlewares/authMiddleware");

// 获取所有简历分析结果
router.get("/", verifyToken, resumeAnalysisController.getAllResumeAnalyses);

// 创建简历分析结果
router.post("/", verifyToken, resumeAnalysisController.createResumeAnalysis);

// 获取单个简历分析结果
router.get("/:id", verifyToken, resumeAnalysisController.getResumeAnalysisById);

// 更新简历分析结果
router.put("/:id", verifyToken, resumeAnalysisController.updateResumeAnalysis);

// 删除简历分析结果
router.delete("/:id", verifyToken, resumeAnalysisController.deleteResumeAnalysis);

// 获取简历的分析结果
router.get("/resume/:resumeId", verifyToken, resumeAnalysisController.getResumeAnalysisByResume);

// 获取规则相关的所有简历分析结果
router.get("/rule/:ruleId", verifyToken, resumeAnalysisController.getResumeAnalysesByRule);

// 根据推荐意见获取简历分析结果
router.get("/recommendation/:recommendation", verifyToken, resumeAnalysisController.getResumeAnalysesByRecommendation);

// 按综合总分排序获取简历分析结果
router.get("/total-score/ranking", verifyToken, resumeAnalysisController.getResumeAnalysesByTotalScore);

// 删除指定简历的分析结果
router.delete("/resume/:resumeId", verifyToken, resumeAnalysisController.deleteResumeAnalysisByResume);

module.exports = router;