const express = require("express");
const router = express.Router();
const notificationTemplateController = require("../../controllers/notificationTemplateController");
const { verifyToken } = require("../../middlewares/authMiddleware");

// 获取团队的通知模板列表
router.get(
  "/team/:teamId",
  verifyToken,
  notificationTemplateController.getTeamTemplates,
);

// 获取系统默认模板
router.get(
  "/default",
  verifyToken,
  notificationTemplateController.getDefaultTemplates,
);

// 获取模板详情
router.get(
  "/:templateId",
  verifyToken,
  notificationTemplateController.getTemplateById,
);

// 获取特定类型的模板
router.get(
  "/team/:teamId/type/:type",
  verifyToken,
  notificationTemplateController.getTemplateByType,
);

// 创建新模板
router.post("/", verifyToken, notificationTemplateController.createTemplate);

// 更新模板
router.put(
  "/:templateId",
  verifyToken,
  notificationTemplateController.updateTemplate,
);

// 删除模板
router.delete(
  "/:templateId",
  verifyToken,
  notificationTemplateController.deleteTemplate,
);

module.exports = router;
