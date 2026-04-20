const aiPreInterviewModel = require("../models/aiPreInterviewModel");
const deliveryModel = require("../models/deliveryModel");
const notificationModel = require("../models/notificationModel");
const aliyunBailianService = require("../services/aliyunBailianService");

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

      // 提取问题和回答
      const interviewQuestions = questions.map((q) => q.question);
      const interviewAnswers = questions.map((q) => q.userAnswer);

      // 获取职位信息
      const positionModel = require("../models/positionModel");
      let position = null;
      let minScore = 60; // 默认最低分
      let jobTitle = "未知岗位";

      if (req.body.jobId) {
        position = await positionModel.findPositionById(req.body.jobId);
        if (position) {
          jobTitle = position.title;
          if (position.aiPreInterviewScore) {
            minScore = position.aiPreInterviewScore;
          }
        }
      }

      // 调用阿里云百炼服务分析面试问答
      const analysis = await aliyunBailianService.analyzeInterviewQnA(
        interviewQuestions,
        interviewAnswers,
        jobTitle,
      );

      // 更新面试状态、评分和反馈
      const updatedInterview = await aiPreInterviewModel.updateAiPreInterview(
        interviewId,
        {
          status: "completed",
          score: analysis.overall, // 使用AI分析的总体评分
          questions,
          feedback: {
            strengths: analysis.strengths,
            improvements: analysis.improvements,
            suggestions: analysis.suggestions,
          },
          completedAt: new Date(),
        },
      );

      if (!updatedInterview) {
        return res.status(404).json({ error: "AI pre interview not found" });
      }

      // 根据最低分判断面试结果
      const deliveryStatus =
        analysis.overall >= minScore ? "已通过预面试" : "ai_failed";
      await deliveryModel.updateDelivery(updatedInterview.deliveryId, {
        status: deliveryStatus,
        aiScore: analysis.overall,
      });

      // 更新对应的应用状态
      if (analysis.overall >= minScore) {
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
                  aiScore: analysis.overall,
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
      if (analysis.overall >= minScore) {
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

      // 返回更新后的面试记录，包含AI分析结果
      res.status(200).json({
        ...updatedInterview,
        analysis: analysis,
      });
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

  // 删除AI预面试记录
  async deleteAiPreInterview(req, res) {
    try {
      const { interviewId } = req.params;

      if (!interviewId) {
        return res.status(400).json({ error: "Missing interviewId" });
      }

      const deleted =
        await aiPreInterviewModel.deleteAiPreInterview(interviewId);

      if (!deleted) {
        return res.status(404).json({ error: "AI pre interview not found" });
      }

      res
        .status(200)
        .json({ message: "AI pre interview deleted successfully" });
    } catch (error) {
      console.error("Error deleting AI pre interview:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  // 解析简历
  async parseResume(req, res) {
    try {
      const { resumeContent } = req.body;

      if (!resumeContent) {
        return res.status(400).json({ error: "Missing resume content" });
      }

      const parsedResume =
        await aliyunBailianService.parseResume(resumeContent);
      res.status(200).json({ data: parsedResume });
    } catch (error) {
      console.error("Error parsing resume:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  // 优化简历
  async optimizeResume(req, res) {
    try {
      const { resumeContent, prompt } = req.body;

      if (!resumeContent) {
        return res.status(400).json({ error: "Missing resume content" });
      }

      const optimizedResume = await aliyunBailianService.optimizeResume(
        resumeContent,
        prompt,
      );
      res.status(200).json({ data: optimizedResume });
    } catch (error) {
      console.error("Error optimizing resume:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  // 一键优化简历
  async oneClickOptimizeResume(req, res) {
    try {
      const { resumeContent } = req.body;

      if (!resumeContent) {
        return res.status(400).json({ error: "Missing resume content" });
      }

      // 一键优化不需要用户提示词，使用默认优化策略
      const optimizedResume =
        await aliyunBailianService.optimizeResume(resumeContent);
      res.status(200).json({ data: optimizedResume });
    } catch (error) {
      console.error("Error with one-click resume optimization:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  // 生成面试问题
  async generateInterviewQuestion(req, res) {
    try {
      const { type, subType } = req.body;

      if (!type || !subType) {
        return res.status(400).json({ error: "Missing type or subType" });
      }

      const question = await aliyunBailianService.generateInterviewQuestion(
        type,
        subType,
      );
      res.status(200).json({ data: { question } });
    } catch (error) {
      console.error("Error generating interview question:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
}

module.exports = new AiPreInterviewController();
