// 导入 Express 框架
var express = require("express");
// 创建一个路由对象，用于定义收藏相关的路由
var router = express.Router();
// 导入收藏控制器，包含所有收藏相关的业务逻辑处理函数
const favoriteController = require("../../controllers/favoriteController");
// 导入认证中间件，用于验证token
const { verifyToken } = require("../../middlewares/authMiddleware");

// ========== 收藏管理路由（RESTful API） ==========

// 添加收藏路由
// POST 请求到 /api/favorites/
// 调用 favoriteController.addFavorite 添加新收藏
router.post("/", verifyToken, favoriteController.addFavorite);

// 取消收藏路由
// DELETE 请求到 /api/favorites/
// 调用 favoriteController.removeFavorite 删除收藏
router.delete("/", verifyToken, favoriteController.removeFavorite);

// 检查是否收藏路由
// GET 请求到 /api/favorites/check
// 调用 favoriteController.checkFavorite 检查收藏状态
router.get("/check", verifyToken, favoriteController.checkFavorite);

// 获取用户收藏列表路由
// GET 请求到 /api/favorites/user
// 调用 favoriteController.getUserFavorites 获取用户的收藏列表
router.get("/user", verifyToken, favoriteController.getUserFavorites);

// 获取用户收藏岗位详情列表路由
// GET 请求到 /api/favorites
// 调用 favoriteController.getFavoriteDetails 获取用户收藏的岗位详情
router.get("/", verifyToken, favoriteController.getFavoriteDetails);

// 导出路由模块，供主应用使用
module.exports = router;
