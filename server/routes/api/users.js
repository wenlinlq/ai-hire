// 导入 Express 框架
var express = require("express");
// 创建一个路由对象，用于定义用户相关的路由
var router = express.Router();
// 导入用户控制器，包含所有用户相关的业务逻辑处理函数
const userController = require("../../controllers/userController");
// 导入认证中间件，用于验证token
const { verifyToken } = require("../../middlewares/authMiddleware");

// ========== 认证相关路由 ==========

// 用户注册路由
// POST 请求到 /api/users/register
// 调用 userController.register 处理注册逻辑
router.post("/register", userController.register);

// 用户登录路由
// POST 请求到 /api/users/login
// 调用 userController.login 处理登录验证
router.post("/login", userController.login);

// ========== 用户管理路由（RESTful API） ==========

// 创建用户路由（管理员创建）
// POST 请求到 /api/users/
// 调用 userController.createUser 创建新用户
router.post("/", verifyToken, userController.createUser);

// 获取所有用户路由
// GET 请求到 /api/users/
// 调用 userController.getAllUsers 返回所有用户列表
router.get("/", verifyToken, userController.getAllUsers);

// 分页获取用户路由
// GET 请求到 /api/users/pagination
// 调用 userController.getUsersWithPagination 返回分页数据
// 注意：这个路由必须放在 /:id 之前，否则会被当作ID参数处理
router.get("/pagination", verifyToken, userController.getUsersWithPagination);

// 根据角色获取用户路由
// GET 请求到 /api/users/role/:role
// 例如：GET /api/users/role/admin
// 调用 userController.getUsersByRole 返回指定角色的用户
router.get("/role/:role", verifyToken, userController.getUsersByRole);

// 获取用户详情路由
// GET 请求到 /api/users/:id
// 例如：GET /api/users/123456
// 调用 userController.getUserById 返回指定ID的用户信息
router.get("/:id", verifyToken, userController.getUserById);

// 更新用户路由
// PUT 请求到 /api/users/:id
// 例如：PUT /api/users/123456
// 调用 userController.updateUser 更新指定用户的信息
router.put("/:id", verifyToken, userController.updateUser);

// 删除用户路由
// DELETE 请求到 /api/users/:id
// 例如：DELETE /api/users/123456
// 调用 userController.deleteUser 删除指定用户
router.delete("/:id", verifyToken, userController.deleteUser);

// 导出路由模块，供主应用使用
module.exports = router;
