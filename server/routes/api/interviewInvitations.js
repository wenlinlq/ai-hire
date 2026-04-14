const express = require('express');
const router = express.Router();
const interviewInvitationController = require('../../controllers/interviewInvitationController');

// 创建面试邀请
router.post('/', interviewInvitationController.createInterviewInvitation);

// 获取用户的面试邀请
router.get('/user/:userId', interviewInvitationController.getUserInterviewInvitations);

// 获取面试邀请详情
router.get('/:invitationId', interviewInvitationController.getInterviewInvitationById);

// 更新面试邀请状态
router.put('/:invitationId/status', interviewInvitationController.updateInterviewInvitationStatus);

// 用户确认面试邀请
router.put('/:invitationId/confirm', interviewInvitationController.confirmInterviewInvitation);

module.exports = router;