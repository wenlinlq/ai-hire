// 导入 Express 框架
var express = require("express");
// 创建一个路由对象，用于定义团队相关的路由
var router = express.Router();
// 导入团队控制器，包含所有团队相关的业务逻辑处理函数
const teamController = require("../../controllers/teamController");
// 导入认证中间件，用于验证token
const { verifyToken } = require("../../middlewares/authMiddleware");

// ========== 团队管理路由（RESTful API） ==========

// 创建团队路由
// POST 请求到 /api/teams/
// 调用 teamController.createTeam 创建新团队
router.post("/", verifyToken, teamController.createTeam);

// 获取所有团队路由
// GET 请求到 /api/teams/
// 调用 teamController.getAllTeams 返回所有团队列表
router.get("/", verifyToken, teamController.getAllTeams);

// 分页获取团队路由
// GET 请求到 /api/teams/pagination
// 调用 teamController.getTeamsWithPagination 返回分页数据
// 注意：这个路由必须放在 /:id 之前，否则会被当作ID参数处理
router.get("/pagination", verifyToken, teamController.getTeamsWithPagination);

// 根据部门获取团队路由
// GET 请求到 /api/teams/department/:department
// 例如：GET /api/teams/department/技术部
// 调用 teamController.getTeamsByDepartment 返回指定部门的团队
router.get("/department/:department", verifyToken, teamController.getTeamsByDepartment);

// 根据负责人获取团队路由
// GET 请求到 /api/teams/leader/:leaderId
// 例如：GET /api/teams/leader/123456
// 调用 teamController.getTeamsByLeader 返回指定负责人的团队
router.get("/leader/:leaderId", verifyToken, teamController.getTeamsByLeader);

// 获取团队详情路由
// GET 请求到 /api/teams/:id
// 例如：GET /api/teams/123456
// 调用 teamController.getTeamById 返回指定ID的团队信息
router.get("/:id", verifyToken, teamController.getTeamById);

// 更新团队路由
// PUT 请求到 /api/teams/:id
// 例如：PUT /api/teams/123456
// 调用 teamController.updateTeam 更新指定团队的信息
router.put("/:id", verifyToken, teamController.updateTeam);

// 删除团队路由
// DELETE 请求到 /api/teams/:id
// 例如：DELETE /api/teams/123456
// 调用 teamController.deleteTeam 删除指定团队
router.delete("/:id", verifyToken, teamController.deleteTeam);

// 导出路由模块，供主应用使用
module.exports = router;