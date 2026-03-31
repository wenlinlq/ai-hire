// 导入 Express 框架
var express = require("express");
// 创建一个路由对象，用于定义岗位相关的路由
var router = express.Router();
// 导入岗位控制器，包含所有岗位相关的业务逻辑处理函数
const positionController = require("../../controllers/positionController");
// 导入认证中间件，用于验证token
const { verifyToken } = require("../../middlewares/authMiddleware");

// ========== 岗位管理路由（RESTful API） ==========

// 创建岗位路由
// POST 请求到 /api/positions/
// 调用 positionController.createPosition 创建新岗位
router.post("/", verifyToken, positionController.createPosition);

// 获取所有岗位路由
// GET 请求到 /api/positions/
// 调用 positionController.getAllPositions 返回所有岗位列表
router.get("/", verifyToken, positionController.getAllPositions);

// 分页获取岗位路由
// GET 请求到 /api/positions/pagination
// 调用 positionController.getPositionsWithPagination 返回分页数据
// 注意：这个路由必须放在 /:id 之前，否则会被当作ID参数处理
router.get("/pagination", verifyToken, positionController.getPositionsWithPagination);

// 根据团队获取岗位路由
// GET 请求到 /api/positions/team/:teamId
// 例如：GET /api/positions/team/123456
// 调用 positionController.getPositionsByTeam 返回指定团队的岗位
router.get("/team/:teamId", verifyToken, positionController.getPositionsByTeam);

// 根据状态获取岗位路由
// GET 请求到 /api/positions/status/:status
// 例如：GET /api/positions/status/open
// 调用 positionController.getPositionsByStatus 返回指定状态的岗位
router.get("/status/:status", verifyToken, positionController.getPositionsByStatus);

// 搜索岗位路由
// GET 请求到 /api/positions/search
// 例如：GET /api/positions/search?keyword=前端
// 调用 positionController.searchPositions 返回搜索结果
router.get("/search", verifyToken, positionController.searchPositions);

// 获取岗位详情路由
// GET 请求到 /api/positions/:id
// 例如：GET /api/positions/123456
// 调用 positionController.getPositionById 返回指定ID的岗位信息
router.get("/:id", verifyToken, positionController.getPositionById);

// 更新岗位路由
// PUT 请求到 /api/positions/:id
// 例如：PUT /api/positions/123456
// 调用 positionController.updatePosition 更新指定岗位的信息
router.put("/:id", verifyToken, positionController.updatePosition);

// 删除岗位路由
// DELETE 请求到 /api/positions/:id
// 例如：DELETE /api/positions/123456
// 调用 positionController.deletePosition 删除指定岗位
router.delete("/:id", verifyToken, positionController.deletePosition);

// 增加岗位投递人数路由
// PUT 请求到 /api/positions/:id/apply
// 例如：PUT /api/positions/123456/apply
// 调用 positionController.incrementApplyCount 增加岗位投递人数
router.put("/:id/apply", verifyToken, positionController.incrementApplyCount);

// 导出路由模块，供主应用使用
module.exports = router;
