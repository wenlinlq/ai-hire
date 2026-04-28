const express = require("express");
const router = express.Router();
const filterRuleController = require("../../controllers/filterRuleController");
const { verifyToken } = require("../../middlewares/authMiddleware");

// 获取所有筛选规则
router.get("/", verifyToken, filterRuleController.getAllFilterRules);

// 创建筛选规则
router.post("/", verifyToken, filterRuleController.createFilterRule);

// 获取单个筛选规则
router.get("/:id", verifyToken, filterRuleController.getFilterRuleById);

// 更新筛选规则
router.put("/:id", verifyToken, filterRuleController.updateFilterRule);

// 删除筛选规则
router.delete("/:id", verifyToken, filterRuleController.deleteFilterRule);

// 获取团队的所有筛选规则
router.get("/team/:teamId", verifyToken, filterRuleController.getFilterRulesByTeam);

// 获取岗位的筛选规则
router.get("/position/:positionId", verifyToken, filterRuleController.getFilterRuleByPosition);

// 获取团队的默认筛选规则
router.get("/team/:teamId/default", verifyToken, filterRuleController.getDefaultFilterRule);

// 根据状态获取筛选规则
router.get("/status/:status", verifyToken, filterRuleController.getFilterRulesByStatus);

// 启用/禁用筛选规则
router.patch("/:id/toggle", verifyToken, filterRuleController.toggleFilterRuleStatus);

module.exports = router;