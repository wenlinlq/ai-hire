const express = require('express');
const router = express.Router();
const aiPreInterviewController = require('../../controllers/aiPreInterviewController');

// 开始AI预面试
router.put('/:interviewId/start', aiPreInterviewController.startAiPreInterview);

// 完成AI预面试
router.put('/:interviewId/complete', aiPreInterviewController.completeAiPreInterview);

// 获取用户的AI预面试记录
router.get('/user/:userId', aiPreInterviewController.getUserAiPreInterviews);

// 获取AI预面试详情
router.get('/:interviewId', aiPreInterviewController.getAiPreInterviewById);

// 根据投递ID获取AI预面试记录
router.get('/delivery/:deliveryId', aiPreInterviewController.getAiPreInterviewByDeliveryId);

module.exports = router;