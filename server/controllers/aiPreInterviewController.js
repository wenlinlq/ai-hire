const aiPreInterviewModel = require("../models/aiPreInterviewModel");
const deliveryModel = require("../models/deliveryModel");
const notificationModel = require("../models/notificationModel");

class AiPreInterviewController {
  // 开始AI预面试
  async startAiPreInterview(req, res) {
    try {
      const { interviewId } = req.params;

      if (!interviewId) {
        return res.status(400).json({ error: "Missing interviewId" });
      }

      const updatedInterview = await aiPreInterviewModel.updateAiPreInterview(
        interviewId,
        {
          status: "in_progress",
          startedAt: new Date(),
        },
      );

      if (!updatedInterview) {
        return res.status(404).json({ error: "AI pre interview not found" });
      }

      res.status(200).json(updatedInterview);
    } catch (error) {
      console.error("Error starting AI pre interview:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
  // 完成AI预面试
  async completeAiPreInterview(req, res) {
    try {
      const { interviewId } = req.params;
      const { score, questions } = req.body;

      if (!interviewId || score === undefined || !questions) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      // 更新面试状态和评分
      const updatedInterview = await aiPreInterviewModel.updateAiPreInterview(
        interviewId,
        {
          status: "completed",
          score,
          questions,
          completedAt: new Date(),
        },
      );

      if (!updatedInterview) {
        return res.status(404).json({ error: "AI pre interview not found" });
      }

      // 获取职位信息
      const positionModel = require("../models/positionModel");
      let position = null;
      let minScore = 60; // 默认最低分

      if (updatedInterview.jobId) {
        position = await positionModel.findPositionById(updatedInterview.jobId);
        if (position && position.aiPreInterviewScore) {
          minScore = position.aiPreInterviewScore;
        }
      }

      // 根据最低分判断面试结果
      const deliveryStatus = score >= minScore ? "已通过预面试" : "ai_failed";
      await deliveryModel.updateDelivery(updatedInterview.deliveryId, {
        status: deliveryStatus,
        aiScore: score,
      });

      // 更新对应的应用状态
      if (score >= minScore) {
        const applicationModel = require("../models/applicationModel");
        // 查找与该投递记录对应的应用记录（通过 userId 和 jobId 匹配）
        const deliveries = await deliveryModel.findDeliveriesByUserId(
          updatedInterview.userId,
        );
        for (const delivery of deliveries) {
          if (delivery.jobId.toString() === updatedInterview.jobId.toString()) {
            // 查找对应的应用记录
            const applications =
              await applicationModel.findApplicationsByPositionId(
                delivery.jobId,
              );
            for (const application of applications) {
              if (
                application.studentId === updatedInterview.userId.toString()
              ) {
                // 更新应用状态为"已通过预面试"
                await applicationModel.updateApplication(application._id, {
                  status: "已通过预面试",
                  aiScore: score,
                });
                break;
              }
            }
            break;
          }
        }
      }

      // 准备通知内容
      let notificationContent = "";
      if (score >= minScore) {
        notificationContent =
          "恭喜您，AI面试通过！已加入该职位候选人列表，等待后续通知。";
      } else {
        notificationContent = "很遗憾，AI面试未通过。";
      }

      // 发送通知
      await notificationModel.createNotification({
        userId: updatedInterview.userId,
        type: "ai_result",
        title: "AI面试结果",
        content: notificationContent,
        relatedId: updatedInterview.deliveryId,
      });

      res.status(200).json(updatedInterview);
    } catch (error) {
      console.error("Error completing AI pre interview:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  // 根据投递ID获取AI预面试记录
  async getAiPreInterviewByDeliveryId(req, res) {
    try {
      const { deliveryId } = req.params;

      if (!deliveryId) {
        return res.status(400).json({ error: "Missing deliveryId" });
      }

      const interview =
        await aiPreInterviewModel.findAiPreInterviewByDeliveryId(deliveryId);

      if (!interview) {
        return res.status(404).json({ error: "AI pre interview not found" });
      }

      res.status(200).json(interview);
    } catch (error) {
      console.error("Error getting AI pre interview by delivery id:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  // 获取用户的AI预面试记录
  async getUserAiPreInterviews(req, res) {
    try {
      const { userId } = req.params;

      if (!userId) {
        return res.status(400).json({ error: "Missing userId" });
      }

      const interviews =
        await aiPreInterviewModel.findAiPreInterviewsByUserId(userId);
      res.status(200).json({ data: interviews });
    } catch (error) {
      console.error("Error getting user AI pre interviews:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  // 获取AI预面试详情
  async getAiPreInterviewById(req, res) {
    try {
      const { interviewId } = req.params;

      if (!interviewId) {
        return res.status(400).json({ error: "Missing interviewId" });
      }

      const interview =
        await aiPreInterviewModel.findAiPreInterviewById(interviewId);

      if (!interview) {
        return res.status(404).json({ error: "AI pre interview not found" });
      }

      // 获取职位信息
      if (interview.jobId) {
        const positionModel = require("../models/positionModel");
        const position = await positionModel.findPositionById(interview.jobId);
        if (position) {
          interview.position = position;
          // 获取团队信息
          if (position.teamId) {
            const teamModel = require("../models/teamModel");
            const team = await teamModel.findTeamById(position.teamId);
            if (team) {
              interview.team = team;
            }
          }
        }
      }
      res.status(200).json({ data: interview });
    } catch (error) {
      console.error("Error getting AI pre interview by id:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
}

module.exports = new AiPreInterviewController();
