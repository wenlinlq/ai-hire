// 导入Express路由
const express = require('express');
const router = express.Router();

// 导入控制器
const aiChatController = require('../../controllers/aiChatController');

// 导入认证中间件
const { verifyToken } = require('../../middlewares/authMiddleware');

// 智能问答路由（非流式）
router.post('/ask', verifyToken, aiChatController.askQuestion);

// 智能问答路由（SSE 流式）
router.post('/ask-stream', verifyToken, aiChatController.askQuestionStream);

module.exports = router;
