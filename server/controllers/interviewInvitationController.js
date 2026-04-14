const interviewInvitationModel = require('../models/interviewInvitationModel');
const notificationModel = require('../models/notificationModel');

class InterviewInvitationController {
  // 创建面试邀请
  async createInterviewInvitation(req, res) {
    try {
      const { deliveryId, userId, interviewerId, round, type, scheduledTime, meetingUrl, location } = req.body;

      if (!deliveryId || !userId || !type || !scheduledTime) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const invitationData = {
        deliveryId,
        userId,
        interviewerId,
        round,
        type,
        scheduledTime,
        meetingUrl,
        location
      };

      const invitation = await interviewInvitationModel.createInterviewInvitation(invitationData);

      // 创建面试邀请通知
      await notificationModel.createNotification({
        userId,
        type: 'interview_invitation',
        title: '面试邀请',
        content: `您收到了${type === 'online' ? '线上' : '线下'}面试邀请，请及时确认`,
        relatedId: invitation._id
      });

      res.status(201).json({ success: true, data: invitation });
    } catch (error) {
      console.error('Error creating interview invitation:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // 获取用户的面试邀请
  async getUserInterviewInvitations(req, res) {
    try {
      const { userId } = req.params;

      if (!userId) {
        return res.status(400).json({ error: 'Missing userId' });
      }

      const invitations = await interviewInvitationModel.findInterviewInvitationsByUserId(userId);
      res.status(200).json({ success: true, data: invitations });
    } catch (error) {
      console.error('Error getting user interview invitations:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // 获取面试邀请详情
  async getInterviewInvitationById(req, res) {
    try {
      const { invitationId } = req.params;

      if (!invitationId) {
        return res.status(400).json({ error: 'Missing invitationId' });
      }

      const invitation = await interviewInvitationModel.findInterviewInvitationById(invitationId);
      if (!invitation) {
        return res.status(404).json({ error: 'Interview invitation not found' });
      }

      res.status(200).json({ success: true, data: invitation });
    } catch (error) {
      console.error('Error getting interview invitation by id:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // 更新面试邀请状态
  async updateInterviewInvitationStatus(req, res) {
    try {
      const { invitationId } = req.params;
      const { status, result, evaluation, userFeedback } = req.body;

      if (!invitationId) {
        return res.status(400).json({ error: 'Missing invitationId' });
      }

      const updateData = {};
      if (status) updateData.status = status;
      if (result) updateData.result = result;
      if (evaluation) updateData.evaluation = evaluation;
      if (userFeedback) updateData.userFeedback = userFeedback;

      const updatedInvitation = await interviewInvitationModel.updateInterviewInvitation(invitationId, updateData);
      if (!updatedInvitation) {
        return res.status(404).json({ error: 'Interview invitation not found' });
      }

      // 创建面试结果通知
      if (result) {
        await notificationModel.createNotification({
          userId: updatedInvitation.userId,
          type: 'interview_result',
          title: '面试结果',
          content: result === 'pass' ? '恭喜您，面试通过！' : '很遗憾，面试未通过',
          relatedId: invitationId
        });
      }

      res.status(200).json({ success: true, data: updatedInvitation });
    } catch (error) {
      console.error('Error updating interview invitation status:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // 用户确认面试邀请
  async confirmInterviewInvitation(req, res) {
    try {
      const { invitationId } = req.params;
      const { userFeedback } = req.body;

      if (!invitationId || !userFeedback) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const updatedInvitation = await interviewInvitationModel.updateInterviewInvitation(invitationId, {
        userFeedback
      });

      if (!updatedInvitation) {
        return res.status(404).json({ error: 'Interview invitation not found' });
      }

      res.status(200).json({ success: true, data: updatedInvitation });
    } catch (error) {
      console.error('Error confirming interview invitation:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}

module.exports = new InterviewInvitationController();