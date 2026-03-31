const express = require("express");
const router = express.Router();
const applicationController = require("../../controllers/applicationController");
const { verifyToken } = require("../../middlewares/authMiddleware");

// 获取所有报名记录
router.get("/", verifyToken, applicationController.getAllApplications);

// 创建报名记录
router.post("/", verifyToken, applicationController.createApplication);

// 获取单个报名记录
router.get("/:id", verifyToken, applicationController.getApplicationById);

// 获取岗位的所有报名记录
router.get("/position/:positionId", verifyToken, applicationController.getApplicationsByPosition);

// 获取学生的所有报名记录
router.get("/student/:studentId", verifyToken, applicationController.getApplicationsByStudent);

// 更新报名记录
router.put("/:id", verifyToken, applicationController.updateApplication);

// 删除报名记录
router.delete("/:id", verifyToken, applicationController.deleteApplication);

// 根据状态获取报名记录
router.get("/status/:status", verifyToken, applicationController.getApplicationsByStatus);

// 按AI评分排序获取报名记录
router.get("/ai-score/ranking", verifyToken, applicationController.getApplicationsByAiScore);

module.exports = router;
