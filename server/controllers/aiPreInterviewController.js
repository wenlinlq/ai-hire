const aiPreInterviewModel = require('../models/aiPreInterviewModel');
const deliveryModel = require('../models/deliveryModel');
const notificationModel = require('../models/notificationModel');

class AiPreInterviewController {
  // 开始AI预面试
  async startAiPreInterview(req, res) {
    try {
      const { interviewId } = req.params;

      if (!interviewId) {
        return res.status(400).json({ error: 'Missing interviewId' });
      }

      const updatedInterview = await aiPreInterviewModel.updateAiPreInterview(interviewId, {
        status: 'in_progress',
        startedAt: new Date()
      });

      if (!updatedInterview) {
        return res.status(404).json({ error: 'AI pre interview not found' });
      }

      res.status(200).json({ success: true, data: updatedInterview });
    } catch (error) {
      console.error('Error starting AI pre interview:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // 完成AI预面试
  async completeAiPreInterview(req, res) {
    try {
      const { interviewId } = req.params;
      const { score, questions } = req.body;

      if (!interviewId || score === undefined || !questions) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      // 更新AI预面试记录
      const updatedInterview = await aiPreInterviewModel.updateAiPreInterview(interviewId, {
        status: 'completed',
        score,
        questions,
        completedAt: new Date()
      });

      if (!updatedInterview) {
        return res.status(404).json({ error: 'AI pre interview not found' });
      }

      // 获取职位信息，包括AI预面试最低分
      const positionModel = require('../models/positionModel');
      let position = null;
      let minScore = 80; // 默认最低分
      if (updatedInterview.jobId) {
        position = await positionModel.findPositionById(updatedInterview.jobId);
        if (position && position.aiPreInterviewScore) {
          minScore = position.aiPreInterviewScore;
        }
      }

      // 根据最低分判断面试结果
      const deliveryStatus = score >= minScore ? 'ai_passed' : 'ai_failed';
      await deliveryModel.updateDelivery(updatedInterview.deliveryId, {
        status: deliveryStatus,
        aiScore: score
      });

      // 创建AI面试结果通知
      let notificationContent = '';
      if (score >= minScore) {
        notificationContent = '恭喜您，AI面试通过！已加入该职位候选人列表，等待后续通知。';
      } else {
        notificationContent = '很遗憾，AI面试未通过。';
      }

      await notificationModel.createNotification({
        userId: updatedInterview.userId,
        type: 'ai_result',
        title: 'AI面试结果',
        content: notificationContent,
        relatedId: updatedInterview.deliveryId
      });

      res.status(200).json({ success: true, data: updatedInterview });
    } catch (error) {
      console.error('Error completing AI pre interview:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // 获取用户的AI预面试记录
  async getUserAiPreInterviews(req, res) {
    try {
      const { userId } = req.params;

      if (!userId) {
        return res.status(400).json({ error: 'Missing userId' });
      }

      const interviews = await aiPreInterviewModel.findAiPreInterviewsByUserId(userId);
      res.status(200).json({ success: true, data: interviews });
    } catch (error) {
      console.error('Error getting user AI pre interviews:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // 获取AI预面试详情
  async getAiPreInterviewById(req, res) {
    try {
      const { interviewId } = req.params;

      if (!interviewId) {
        return res.status(400).json({ error: 'Missing interviewId' });
      }

      const interview = await aiPreInterviewModel.findAiPreInterviewById(interviewId);
      if (!interview) {
        return res.status(404).json({ error: 'AI pre interview not found' });
      }

      // 引入职位、团队和面试题库模型
      const positionModel = require('../models/positionModel');
      const teamModel = require('../models/teamModel');
      const questionBankModel = require('../models/questionBankModel');

      // 获取职位信息
      let position = null;
      if (interview.jobId) {
        position = await positionModel.findPositionById(interview.jobId);
      }

      // 获取团队信息
      let team = null;
      if (position && position.teamId) {
        team = await teamModel.findTeamById(position.teamId);
      }

      // 获取面试题库问题
      let questions = interview.questions || [];
      if (position && position.aiQuestionBankId) {
        const questionBank = await questionBankModel.findQuestionBankById(position.aiQuestionBankId);
        if (questionBank && questionBank.questions) {
          questions = questionBank.questions;
        }
      }

      // 构建完整的面试数据
      const interviewWithDetails = {
        ...interview,
        questions: questions,
        position: position || null,
        team: team || null
      };

      res.status(200).json({ success: true, data: interviewWithDetails });
    } catch (error) {
      console.error('Error getting AI pre interview by id:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // 根据投递ID获取AI预面试记录
  async getAiPreInterviewByDeliveryId(req, res) {
    try {
      const { deliveryId } = req.params;

      if (!deliveryId) {
        return res.status(400).json({ error: 'Missing deliveryId' });
      }

      const interview = await aiPreInterviewModel.findAiPreInterviewByDeliveryId(deliveryId);
      res.status(200).json({ success: true, data: interview });
    } catch (error) {
      console.error('Error getting AI pre interview by delivery id:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}

module.exports = new AiPreInterviewController();