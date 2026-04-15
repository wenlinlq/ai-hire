const deliveryModel = require("../models/deliveryModel");
const aiPreInterviewModel = require("../models/aiPreInterviewModel");
const notificationModel = require("../models/notificationModel");
const positionModel = require("../models/positionModel");
const teamModel = require("../models/teamModel");
const applicationModel = require("../models/applicationModel");
const userModel = require("../models/userModel");
const resumeModel = require("../models/resumeModel");

class DeliveryController {
  // 创建投递记录
  async createDelivery(req, res) {
    try {
      const { userId, jobId, resumeId, hasAiPreInterview } = req.body;

      if (!userId || !jobId || !resumeId) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      // 构建投递数据
      const deliveryData = {
        userId,
        jobId,
        resumeId,
        hasAiPreInterview: hasAiPreInterview || false,
        status: hasAiPreInterview ? "pending_ai" : "in_candidate_pool",
      };

      // 创建投递记录
      const delivery = await deliveryModel.createDelivery(deliveryData);

      // 获取职位信息，用于获取团队ID
      const position = await positionModel.findPositionById(jobId);
      let team = null;
      if (position && position.teamId) {
        // 获取团队信息
        team = await teamModel.findTeamById(position.teamId);
        if (team) {
          // 将用户添加到团队的候选人列表中（如果还不在列表中）
          if (!team.candidates) {
            team.candidates = [];
          }
          if (!team.candidates.includes(userId)) {
            team.candidates.push(userId);
            // 更新团队信息
            await teamModel.updateTeam(team._id, {
              candidates: team.candidates,
            });
          }

          // 创建application记录，用于管理后台的候选人管理
          try {
            // 获取用户信息
            const user = await userModel.findUserById(userId);
            // 获取简历信息
            const resume = await resumeModel.getCurrentResume(userId);

            const applicationData = {
              positionId: jobId,
              studentId: userId, // 使用userId作为studentId
              resumeId: resumeId,
              teamId: position.teamId,
              status: hasAiPreInterview ? "pending" : "screening",
              // 从用户信息中获取姓名、邮箱、手机号
              name: user?.username || "",
              email: user?.email || "",
              phone: user?.phone || "",
              // 从简历信息中获取简历文件URL
              resumeFileUrl: resume?.fileUrl || "",
            };
            await applicationModel.createApplication(applicationData);
          } catch (error) {
            // 处理唯一索引冲突（用户已经报名过该岗位）
            if (error.code !== 11000) {
              console.error("Error creating application:", error);
            }
          }
        }
      }

      // 如果需要AI预面试，创建AI预面试记录
      if (hasAiPreInterview) {
        // 获取岗位信息，包括AI面试题库ID
        const positionModel = require('../models/positionModel');
        const position = await positionModel.findPositionById(jobId);
        
        let questions = [];
        // 如果岗位有AI面试题库，获取题库中的问题
        if (position && position.aiQuestionBankId) {
          const questionBankModel = require('../models/questionBankModel');
          const questionBank = await questionBankModel.findQuestionBankById(position.aiQuestionBankId);
          if (questionBank && questionBank.questions) {
            questions = questionBank.questions;
          }
        }
        
        const interviewData = {
          deliveryId: delivery._id,
          userId,
          jobId,
          status: "pending",
          questions: questions,
          expiresAt: new Date(Date.now() + 72 * 60 * 60 * 1000), // 72小时过期
        };
        await aiPreInterviewModel.createAiPreInterview(interviewData);

        // 创建AI面试邀请通知
        await notificationModel.createNotification({
          userId,
          type: "ai_invitation",
          title: "AI预面试邀请",
          content: "您的投递已成功，需要完成AI预面试才能进入下一步",
          relatedId: delivery._id,
          teamName: team?.name || "",
        });
      } else {
        // 创建投递成功通知
        await notificationModel.createNotification({
          userId,
          type: "screening_failed",
          title: "投递成功",
          content: "您的投递已成功，等待管理员审核",
          relatedId: delivery._id,
          teamName: team?.name || "",
        });
      }

      res.status(201).json({ success: true, data: delivery });
    } catch (error) {
      console.error("Error creating delivery:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  // 获取用户的投递记录
  async getUserDeliveries(req, res) {
    try {
      const { userId } = req.params;

      if (!userId) {
        return res.status(400).json({ error: "Missing userId" });
      }

      const deliveries = await deliveryModel.findDeliveriesByUserId(userId);
      res.status(200).json({ success: true, data: deliveries });
    } catch (error) {
      console.error("Error getting user deliveries:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  // 获取投递记录详情
  async getDeliveryById(req, res) {
    try {
      const { deliveryId } = req.params;

      if (!deliveryId) {
        return res.status(400).json({ error: "Missing deliveryId" });
      }

      const delivery = await deliveryModel.findDeliveryById(deliveryId);
      if (!delivery) {
        return res.status(404).json({ error: "Delivery not found" });
      }

      res.status(200).json({ success: true, data: delivery });
    } catch (error) {
      console.error("Error getting delivery by id:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  // 更新投递记录状态
  async updateDeliveryStatus(req, res) {
    try {
      const { deliveryId } = req.params;
      const { status, aiScore } = req.body;

      if (!deliveryId || !status) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      const updateData = { status };
      if (aiScore !== undefined) {
        updateData.aiScore = aiScore;
      }

      const updatedDelivery = await deliveryModel.updateDelivery(
        deliveryId,
        updateData,
      );
      if (!updatedDelivery) {
        return res.status(404).json({ error: "Delivery not found" });
      }

      // 获取职位和团队信息，用于添加团队名称到通知
      let teamName = "";
      if (updatedDelivery.jobId) {
        const position = await positionModel.findPositionById(
          updatedDelivery.jobId,
        );
        if (position && position.teamId) {
          const team = await teamModel.findTeamById(position.teamId);
          teamName = team?.name || "";
        }
      }

      // 创建状态更新通知
      let notificationType = "ai_result";
      let title = "AI面试结果";
      let content =
        aiScore >= 80 ? "恭喜您，AI面试通过！" : "很遗憾，AI面试未通过";

      if (status === "screening_failed") {
        notificationType = "screening_failed";
        title = "初筛结果";
        content = "很遗憾，您的简历未通过初筛";
      }

      await notificationModel.createNotification({
        userId: updatedDelivery.userId,
        type: notificationType,
        title,
        content,
        relatedId: deliveryId,
        teamName: teamName,
      });

      res.status(200).json({ success: true, data: updatedDelivery });
    } catch (error) {
      console.error("Error updating delivery status:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
}

module.exports = new DeliveryController();
