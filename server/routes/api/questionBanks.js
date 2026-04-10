const express = require("express");
const router = express.Router();
const questionBankController = require("../../controllers/questionBankController");
const authMiddleware = require("../../middlewares/authMiddleware");

// 获取所有面试题库
router.get("/", questionBankController.getAllQuestionBanks);

// 根据ID获取面试题库
router.get("/:id", questionBankController.getQuestionBankById);

// 创建面试题库（需要认证）
router.post(
  "/",
  authMiddleware.verifyToken,
  questionBankController.createQuestionBank,
);

// 更新面试题库（需要认证）
router.put(
  "/:id",
  authMiddleware.verifyToken,
  questionBankController.updateQuestionBank,
);

// 删除面试题库（需要认证）
router.delete(
  "/:id",
  authMiddleware.verifyToken,
  questionBankController.deleteQuestionBank,
);

// 根据团队ID获取面试题库
router.get("/team/:teamId", questionBankController.getQuestionBanksByTeamId);

// 根据分类获取面试题库
router.get(
  "/category/:category",
  questionBankController.getQuestionBanksByCategory,
);

// 搜索面试题库
router.get("/search", questionBankController.searchQuestionBanks);

module.exports = router;
