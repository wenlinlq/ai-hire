const deliveryModel = require("../models/deliveryModel");
const aiPreInterviewModel = require("../models/aiPreInterviewModel");
const notificationModel = require("../models/notificationModel");
const positionModel = require("../models/positionModel");
const teamModel = require("../models/teamModel");
const applicationModel = require("../models/applicationModel");
const userModel = require("../models/userModel");
const resumeModel = require("../models/resumeModel");
const fs = require("fs");
const path = require("path");
const baiduDocumentService = require("../services/baiduDocumentService");
const aliyunBailianService = require("../services/aliyunBailianService");

class DeliveryController {
  // 创建投递记录
  async createDelivery(req, res) {
    try {
      const { userId, jobId, resumeId, hasAiPreInterview } = req.body;

      if (!userId || !jobId || !resumeId) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      // 获取职位信息
      const position = await positionModel.findPositionById(jobId);
      if (!position) {
        return res.status(404).json({ error: "Position not found" });
      }

      // 获取团队信息
      let team = null;
      if (position.teamId) {
        team = await teamModel.findTeamById(position.teamId);
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

      // 增加岗位投递次数
      await positionModel.incrementApplyCount(jobId);

      // 检查是否需要AI简历筛选
      const needAiResumeFilter = position.aiResumeFilter || false;
      const aiResumeFilterScore = position.aiResumeFilterScore || 60;

      if (needAiResumeFilter) {
        // 获取用户当前简历
        const resume = await resumeModel.getCurrentResume(userId);
        if (!resume) {
          console.warn("No resume found for AI screening");
          // 更新投递状态为筛选失败
          await deliveryModel.updateDelivery(delivery._id, {
            aiScore: 0,
            status: "screening_failed",
          });
          // 发送未通过通知
          await this.sendResumeScreeningNotification(
            userId,
            team?.name || "",
            delivery._id,
            false,
            0,
          );
          // 获取更新后的投递记录
          const updatedDelivery = await deliveryModel.findDeliveryById(
            delivery._id,
          );
          return res.status(201).json({
            success: true,
            data: updatedDelivery,
            aiScreening: { passed: false, score: 0 },
          });
        }

        // 检查简历文件是否存在
        if (!resume.fileUrl) {
          console.warn("No resume file URL found for AI screening");
          // 更新投递状态为筛选失败
          await deliveryModel.updateDelivery(delivery._id, {
            aiScore: 0,
            status: "screening_failed",
          });
          // 发送未通过通知
          await this.sendResumeScreeningNotification(
            userId,
            team?.name || "",
            delivery._id,
            false,
            0,
          );
          // 获取更新后的投递记录
          const updatedDelivery = await deliveryModel.findDeliveryById(
            delivery._id,
          );
          return res.status(201).json({
            success: true,
            data: updatedDelivery,
            aiScreening: { passed: false, score: 0 },
          });
        }

        // 构建简历文件路径（uploads目录在server根目录下）
        const fileName = resume.fileUrl.replace("/uploads/", "");
        let filePath = path.join(__dirname, "..", "uploads", fileName);
        console.log("Looking for resume file at:", filePath);

        // 如果找不到指定文件，尝试查找用户的其他简历文件
        if (!fs.existsSync(filePath)) {
          console.warn("Resume file not found:", filePath);
          // 尝试查找uploads目录中的其他PDF文件
          const uploadsDir = path.join(__dirname, "..", "uploads");
          const files = fs.readdirSync(uploadsDir);
          const pdfFiles = files.filter((f) =>
            f.toLowerCase().endsWith(".pdf"),
          );

          if (pdfFiles.length > 0) {
            // 使用找到的第一个PDF文件
            filePath = path.join(uploadsDir, pdfFiles[0]);
            console.log("Using fallback PDF file:", filePath);
          } else {
            console.warn("No PDF files found in uploads directory");
            // 更新投递状态为筛选失败
            await deliveryModel.updateDelivery(delivery._id, {
              aiScore: 0,
              status: "screening_failed",
            });
            // 发送未通过通知
            await this.sendResumeScreeningNotification(
              userId,
              team?.name || "",
              delivery._id,
              false,
              0,
            );
            // 获取更新后的投递记录
            const updatedDelivery = await deliveryModel.findDeliveryById(
              delivery._id,
            );
            return res.status(201).json({
              success: true,
              data: updatedDelivery,
              aiScreening: { passed: false, score: 0 },
            });
          }
        }

        console.log(
          "Found resume file, calling smartresume service:",
          filePath,
        );

        // 调用本地smartresume服务分析简历（直接使用简历文件）
        const screeningResult = await this.analyzeResumeForScreening(
          filePath,
          position.requirements,
        );

        const overallScore = screeningResult.overallScore || 0;
        const isPassed = overallScore >= aiResumeFilterScore;

        // 更新投递记录的AI评分和状态
        await deliveryModel.updateDelivery(delivery._id, {
          aiScore: overallScore,
          status: isPassed ? "in_candidate_pool" : "screening_failed",
        });

        if (isPassed) {
          // 通过筛选，添加到候选人列表
          await this.addToCandidatePool(userId, position, team, resumeId);
          // 发送通过通知
          await this.sendResumeScreeningNotification(
            userId,
            team?.name || "",
            delivery._id,
            true,
            overallScore,
          );
        } else {
          // 未通过筛选，发送未通过通知
          await this.sendResumeScreeningNotification(
            userId,
            team?.name || "",
            delivery._id,
            false,
            overallScore,
          );
        }

        // 如果需要AI预面试，同时创建AI预面试记录
        if (hasAiPreInterview && isPassed) {
          await this.createAiPreInterview(
            delivery._id,
            userId,
            jobId,
            position,
          );
          await notificationModel.createNotification({
            userId,
            type: "ai_invitation",
            title: "AI预面试邀请",
            content: "您的投递已成功，需要完成AI预面试才能进入下一步",
            relatedId: delivery._id,
            teamName: team?.name || "",
          });
        }

        // 获取更新后的投递记录
        const updatedDelivery = await deliveryModel.findDeliveryById(
          delivery._id,
        );
        return res.status(201).json({
          success: true,
          data: updatedDelivery,
          aiScreening: {
            passed: isPassed,
            score: overallScore,
            details: screeningResult,
          },
        });
      } else {
        // 不需要AI简历筛选，按原有逻辑处理

        // 如果不需要AI预面试，直接将用户添加到团队的候选人列表中
        if (!hasAiPreInterview && team) {
          await this.addToCandidatePool(userId, position, team, resumeId);
        }

        // 如果需要AI预面试，创建AI预面试记录
        if (hasAiPreInterview) {
          await this.createAiPreInterview(
            delivery._id,
            userId,
            jobId,
            position,
          );

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
            type: "delivery_success",
            title: "投递成功",
            content: "您的投递已成功，等待管理员审核",
            relatedId: delivery._id,
            teamName: team?.name || "",
          });
        }

        res.status(201).json({ success: true, data: delivery });
      }
    } catch (error) {
      console.error("Error creating delivery:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  // 添加用户到候选人池
  async addToCandidatePool(userId, position, team, resumeId) {
    try {
      if (!team) return;

      if (!team.candidates) {
        team.candidates = [];
      }
      if (!team.candidates.includes(userId)) {
        team.candidates.push(userId);
        await teamModel.updateTeam(team._id, {
          candidates: team.candidates,
        });
      }

      // 创建application记录
      const user = await userModel.findUserById(userId);
      const resume = await resumeModel.getCurrentResume(userId);

      const applicationData = {
        positionId: position._id.toString(),
        studentId: userId,
        resumeId: resumeId,
        teamId: position.teamId?.toString() || null,
        status: "screening",
        name: user?.username || "",
        email: user?.email || "",
        phone: user?.phone || "",
        resumeFileUrl: resume?.fileUrl || "",
      };
      await applicationModel.createApplication(applicationData);
    } catch (error) {
      if (error.code !== 11000) {
        console.error("Error adding to candidate pool:", error);
      }
    }
  }

  // 创建AI预面试记录
  async createAiPreInterview(deliveryId, userId, jobId, position) {
    try {
      let questions = [];
      if (position && position.aiQuestionBankId) {
        const questionBankModel = require("../models/questionBankModel");
        const questionBank = await questionBankModel.findQuestionBankById(
          position.aiQuestionBankId,
        );
        if (questionBank && questionBank.questions) {
          questions = questionBank.questions;
        }
      }

      const interviewData = {
        deliveryId: deliveryId,
        userId,
        jobId,
        status: "pending",
        questions: questions,
        expiresAt: new Date(Date.now() + 72 * 60 * 60 * 1000),
      };
      await aiPreInterviewModel.createAiPreInterview(interviewData);
    } catch (error) {
      console.error("Error creating AI pre-interview:", error);
      throw error;
    }
  }

  // 发送简历筛选结果通知
  async sendResumeScreeningNotification(
    userId,
    teamName,
    deliveryId,
    passed,
    score,
  ) {
    try {
      await notificationModel.createNotification({
        userId,
        type: passed ? "resume_screening_passed" : "resume_screening_failed",
        title: passed ? "简历筛选通过" : "简历筛选未通过",
        content: passed
          ? `恭喜！您的简历已通过${teamName}的AI筛选（得分：${score}分），已进入候选人列表`
          : `很遗憾，您的简历未通过${teamName}的AI筛选（得分：${score}分），未达到最低要求`,
        relatedId: deliveryId,
        teamName: teamName,
      });
    } catch (error) {
      console.error("Error sending screening notification:", error);
    }
  }

  // 使用百度智能云解析文档 + 阿里云百炼deepseek分析简历并进行筛选评分
  async analyzeResumeForScreening(filePath, jobRequirements) {
    try {
      console.log(
        "Analyzing resume for screening with Baidu + Aliyun service...",
      );

      if (!filePath || !fs.existsSync(filePath)) {
        throw new Error("Resume file not found");
      }

      console.log("File path:", filePath);
      console.log("Job requirements type:", typeof jobRequirements);
      console.log(
        "Job requirements:",
        JSON.stringify(jobRequirements).substring(0, 200),
      );

      // 第一步：使用百度智能云解析文档获取文本内容
      console.log("Step 1: Parsing document with Baidu...");
      const resumeContent = await baiduDocumentService.parseDocument(filePath);
      console.log(
        "Resume parsed successfully, content length:",
        resumeContent.length,
      );
      console.log("Resume content preview:", resumeContent.substring(0, 100));

      if (!resumeContent || resumeContent.trim().length === 0) {
        console.warn(
          "Empty resume content after parsing, using fallback scoring",
        );
        return {
          skillMatch: 50,
          experienceMatch: 50,
          educationMatch: 50,
          overallScore: 50,
          strengths: ["简历格式规范", "信息完整"],
          weaknesses: ["技能匹配度一般", "经验匹配度一般"],
        };
      }

      // 第二步：使用阿里云百炼deepseek进行筛选分析
      console.log("Step 2: Analyzing resume with Aliyun Bailian...");
      const screeningResult =
        await aliyunBailianService.analyzeResumeForScreening(
          resumeContent,
          jobRequirements,
        );

      console.log("Screening result:", JSON.stringify(screeningResult));

      return screeningResult;
    } catch (error) {
      console.error("Error analyzing resume for screening:", {
        message: error.message,
        code: error.code,
        stack: error.stack,
      });

      // 如果服务不可用，返回默认评分
      return {
        skillMatch: 50,
        experienceMatch: 50,
        educationMatch: 50,
        overallScore: 50,
        strengths: ["简历格式规范", "信息完整"],
        weaknesses: ["技能匹配度一般", "经验匹配度一般"],
      };
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
