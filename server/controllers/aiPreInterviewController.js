const aiPreInterviewModel = require("../models/aiPreInterviewModel");
const deliveryModel = require("../models/deliveryModel");
const notificationModel = require("../models/notificationModel");
const aliyunBailianService = require("../services/aliyunBailianService");
const baiduDocumentService = require("../services/baiduDocumentService");
const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");
const path = require("path");
const resumeModel = require("../models/resumeModel"); // 需要引入简历模型

// 环境配置
const NODE_ENV = process.env.NODE_ENV || "development";
const USE_SMARTRESUME =
  NODE_ENV === "development" || process.env.USE_SMARTRESUME === "true";

// Python 分析服务配置（SmartResume）
const ANALYSIS_SERVICE_URL =
  process.env.ANALYSIS_SERVICE_URL || "http://localhost:8000";

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

      // 如果通过了AI预面试，将用户添加到团队的候选人列表中
      if (analysis.overall >= minScore) {
        // 获取职位信息，用于获取团队ID
        const position = await positionModel.findPositionById(
          updatedInterview.jobId,
        );
        if (position && position.teamId) {
          const teamModel = require("../models/teamModel");
          const team = await teamModel.findTeamById(position.teamId);

          if (team) {
            // 将用户添加到团队的候选人列表中（如果还不在列表中）
            if (!team.candidates) {
              team.candidates = [];
            }
            if (!team.candidates.includes(updatedInterview.userId)) {
              team.candidates.push(updatedInterview.userId);
              // 更新团队信息
              await teamModel.updateTeam(team._id, {
                candidates: team.candidates,
              });
            }

            // 创建application记录，用于管理后台的候选人管理
            try {
              const userModel = require("../models/userModel");
              const resumeModel = require("../models/resumeModel");
              const applicationModel = require("../models/applicationModel");

              // 获取用户信息
              const user = await userModel.findUserById(
                updatedInterview.userId,
              );
              // 获取简历信息
              const resume = await resumeModel.getCurrentResume(
                updatedInterview.userId,
              );

              const applicationData = {
                positionId: updatedInterview.jobId,
                studentId: updatedInterview.userId,
                resumeId: updatedInterview.resumeId,
                teamId: position.teamId,
                status: "已通过预面试",
                aiScore: analysis.overall,
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
      const userId = req.user?.id;
      const { resumeId, resumeContent } = req.body;
      const file = req.file;

      let result;

      // 根据环境选择解析方式
      if (USE_SMARTRESUME) {
        // 开发环境：使用 SmartResume
        result = await this.parseResumeWithSmartResume(
          userId,
          resumeId,
          resumeContent,
          file,
        );
      } else {
        // 线上环境：使用百度文档解析API + 阿里云百炼大模型API
        result = await this.parseResumeWithCloudServices(
          userId,
          resumeId,
          resumeContent,
          file,
        );
      }

      // 如果有 resumeId，保存分析结果到数据库
      if (result.success && resumeId) {
        await resumeModel.saveAnalysisResult(resumeId, result);
      }

      // 返回分析结果
      res.status(200).json({
        success: true,
        data: {
          extracted_data: result.extracted_data,
          analysis: result.analysis,
        },
      });
    } catch (error) {
      console.error("Error parsing resume:", error.message);

      if (error.code === "ECONNREFUSED" && USE_SMARTRESUME) {
        return res.status(503).json({
          success: false,
          error:
            "简历分析服务不可用，请确保 Python 服务已启动 (http://localhost:8000)",
        });
      }

      console.error("Error parsing resume - full stack:", error);
      res.status(500).json({
        success: false,
        error: error.message || "简历解析失败",
        stack: error.stack,
      });
    }
  }

  // 使用 SmartResume 解析简历（开发环境）
  async parseResumeWithSmartResume(userId, resumeId, resumeContent, file) {
    let result;

    // 情况1：通过 resumeId 分析已上传的简历文件
    if (resumeId) {
      // 获取简历信息
      const resume = await resumeModel.getResumeById(resumeId);

      if (!resume) {
        throw new Error("简历不存在");
      }

      // 检查权限
      if (resume.studentId && resume.studentId.toString() !== userId) {
        throw new Error("无权访问此简历");
      }

      // 获取文件路径
      const filePath = path.join(__dirname, "../..", resume.fileUrl);

      if (!fs.existsSync(filePath)) {
        throw new Error("简历文件不存在");
      }

      // 调用 Python 分析服务
      const formData = new FormData();
      formData.append("file", fs.createReadStream(filePath));

      const response = await axios.post(
        `${ANALYSIS_SERVICE_URL}/analyze`,
        formData,
        {
          headers: { ...formData.getHeaders() },
          timeout: 300000,
        },
      );

      result = response.data;

      // 适配 smartresume 返回的数据格式
      result = this.formatSmartResumeResult(result);
    }

    // 情况2：直接传入简历文本内容
    else if (resumeContent) {
      // 创建临时文件
      const tempDir = path.join(__dirname, "../../temp");
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
      }

      const tempFilePath = path.join(tempDir, `resume_${Date.now()}.txt`);
      fs.writeFileSync(tempFilePath, resumeContent, "utf-8");

      // 调用 Python 分析服务
      const formData = new FormData();
      formData.append("file", fs.createReadStream(tempFilePath));

      const response = await axios.post(
        `${ANALYSIS_SERVICE_URL}/analyze`,
        formData,
        {
          headers: { ...formData.getHeaders() },
          timeout: 300000,
        },
      );

      // 适配 smartresume 返回的数据格式
      result = this.formatSmartResumeResult(response.data);

      // 清理临时文件
      fs.unlinkSync(tempFilePath);
    }

    // 情况3：直接上传文件
    else if (file) {
      console.log(
        "[DEBUG] parseResume - 收到上传文件:",
        file.originalname,
        file.path,
      );
      // 调用 Python 分析服务
      const formData = new FormData();
      formData.append("file", fs.createReadStream(file.path));

      console.log(
        "[DEBUG] parseResume - 正在调用 Python 分析服务:",
        `${ANALYSIS_SERVICE_URL}/analyze`,
      );
      const response = await axios.post(
        `${ANALYSIS_SERVICE_URL}/analyze`,
        formData,
        {
          headers: { ...formData.getHeaders() },
          timeout: 300000,
        },
      );
      console.log(
        "[DEBUG] parseResume - Python 服务响应成功，状态码:",
        response.status,
      );
      console.log("[DEBUG] parseResume - 响应数据类型:", typeof response.data);
      console.log(
        "[DEBUG] parseResume - 响应数据长度:",
        JSON.stringify(response.data).length,
      );
      // 如果是字符串，显示前500字符
      if (typeof response.data === "string") {
        console.log(
          "[DEBUG] parseResume - 响应数据前500字符:",
          response.data.substring(0, Math.min(500, response.data.length)),
        );
      } else {
        console.log(
          "[DEBUG] parseResume - 响应数据摘要:",
          JSON.stringify(response.data).substring(0, 500),
        );
      }

      // 适配 smartresume 返回的数据格式
      result = this.formatSmartResumeResult(response.data);
      console.log("[DEBUG] parseResume - 格式化结果成功:", result.success);
    }

    // 情况4：既没有 resumeId、resumeContent 也没有 file
    else {
      throw new Error("请提供简历ID、简历内容或上传简历文件");
    }

    return result;
  }

  // 使用百度文档解析API + 阿里云百炼大模型API解析简历（线上环境）
  async parseResumeWithCloudServices(userId, resumeId, resumeContent, file) {
    let result;
    let filePath = null;

    // 情况1：通过 resumeId 分析已上传的简历文件
    if (resumeId) {
      // 获取简历信息
      const resume = await resumeModel.getResumeById(resumeId);

      if (!resume) {
        throw new Error("简历不存在");
      }

      // 检查权限
      if (resume.studentId && resume.studentId.toString() !== userId) {
        throw new Error("无权访问此简历");
      }

      // 获取文件路径
      filePath = path.join(__dirname, "../..", resume.fileUrl);

      if (!fs.existsSync(filePath)) {
        throw new Error("简历文件不存在");
      }
    }

    // 情况2：直接传入简历文本内容
    else if (resumeContent) {
      // 创建临时文件
      const tempDir = path.join(__dirname, "../../temp");
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
      }

      filePath = path.join(tempDir, `resume_${Date.now()}.txt`);
      fs.writeFileSync(filePath, resumeContent, "utf-8");
    }

    // 情况3：直接上传文件
    else if (file) {
      filePath = file.path;
    }

    // 情况4：既没有 resumeId、resumeContent 也没有 file
    else {
      throw new Error("请提供简历ID、简历内容或上传简历文件");
    }

    // 第一步：使用百度智能云解析文档获取文本内容
    console.log("Step 1: Parsing document with Baidu...");
    const resumeTextContent =
      await baiduDocumentService.parseDocument(filePath);
    console.log(
      "Resume parsed successfully, content length:",
      resumeTextContent.length,
    );

    if (!resumeTextContent || resumeTextContent.trim().length === 0) {
      console.warn("Empty resume content after parsing, using fallback");
      return {
        success: true,
        extracted_data: {},
        analysis: {
          score: 50,
          strengths: ["简历格式规范"],
          improvements: ["简历内容为空或无法解析"],
        },
      };
    }

    // 第二步：使用阿里云百炼进行简历分析
    console.log("Step 2: Analyzing resume with Aliyun Bailian...");
    const analysisResult =
      await aliyunBailianService.parseResume(resumeTextContent);
    console.log(
      "Analysis result received:",
      JSON.stringify(analysisResult).substring(0, 200),
    );

    // 构建返回结果格式（百分制转十分制，保持与SmartResume一致）
    const percentScore = analysisResult.analysis?.score || 0;
    const tenPointScore = Math.round((percentScore / 10) * 100) / 100;

    result = {
      success: true,
      extracted_data: {
        name: analysisResult.name || "",
        phone: analysisResult.contact?.phone || "",
        email: analysisResult.contact?.email || "",
        basic_info: {
          name: analysisResult.name || "",
          phone: analysisResult.contact?.phone || "",
          email: analysisResult.contact?.email || "",
          school: analysisResult.education?.[0]?.school || "",
          major: analysisResult.education?.[0]?.major || "",
          graduation_year: analysisResult.education?.[0]?.graduationDate || "",
          education: analysisResult.education?.[0]?.degree || "",
          work_years: 0,
        },
        education: analysisResult.education || [],
        work_experience: analysisResult.workExperience || [],
        projects: analysisResult.projectExperience || [],
        skills: [
          ...(analysisResult.skills?.technical || []),
          ...(analysisResult.skills?.soft || []),
        ],
      },
      analysis: {
        score: tenPointScore,
        score_raw: percentScore,
        strengths: analysisResult.analysis?.strengths || [],
        weaknesses: analysisResult.analysis?.improvements || [],
        optimization_suggestions: analysisResult.analysis?.suggestions || [],
        overall_comment: analysisResult.analysis?.overallComment || "",
        interview_questions: analysisResult.analysis?.interviewQuestions || [],
      },
    };

    // 清理临时文件（如果是临时文件）
    if (resumeContent && filePath && fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    return result;
  }

  // 适配 smartresume 返回的数据格式
  formatSmartResumeResult(rawResult) {
    // 如果 rawResult 是字符串，尝试解析为 JSON
    if (typeof rawResult === "string") {
      try {
        // 移除可能的 Markdown 代码块标记
        const cleanedString = rawResult
          .replace(/^```json\s*/, "")
          .replace(/\s*```$/, "")
          .trim();
        rawResult = JSON.parse(cleanedString);
      } catch (error) {
        console.error(
          "[DEBUG] formatSmartResumeResult - 无法解析字符串为JSON:",
          error.message,
        );
        return {
          success: false,
          extracted_data: {},
          analysis: {},
        };
      }
    }

    if (!rawResult || typeof rawResult !== "object") {
      return {
        success: false,
        extracted_data: {},
        analysis: {},
      };
    }

    // 如果已经是 ai-hire 期望的格式，直接返回
    if (rawResult.success !== undefined && rawResult.extracted_data) {
      return rawResult;
    }

    // 新的 SmartResume 格式：
    // {
    //   extracted_data: {
    //     basicInfo: { name, phoneNumber, personalEmail, ... },
    //     workExperience: [...],
    //     education: [...],
    //     ...
    //   },
    //   analysis: null 或 {...}
    // }
    if (rawResult.extracted_data && rawResult.analysis !== undefined) {
      const smartData = rawResult.extracted_data;
      const smartAnalysis = rawResult.analysis || {};

      return {
        success: true,
        extracted_data: {
          name: smartData.basicInfo?.name || "",
          phone:
            smartData.basicInfo?.phoneNumber ||
            smartData.basicInfo?.phone ||
            "",
          email:
            smartData.basicInfo?.personalEmail ||
            smartData.basicInfo?.email ||
            "",
          basic_info: {
            name: smartData.basicInfo?.name || "",
            phone:
              smartData.basicInfo?.phoneNumber ||
              smartData.basicInfo?.phone ||
              "",
            email:
              smartData.basicInfo?.personalEmail ||
              smartData.basicInfo?.email ||
              "",
            school: smartData.education?.[0]?.school || "",
            major: smartData.education?.[0]?.major || "",
            graduation_year:
              smartData.education?.[0]?.period?.endDate ||
              smartData.education?.[0]?.graduationDate ||
              "",
            education: smartData.education?.[0]?.degreeLevel || "",
            work_years: 0,
          },
          education: smartData.education || [],
          work_experience: smartData.workExperience || [],
          projects: smartData.projects || [],
          skills: smartData.skills || [],
        },
        analysis: {
          score: smartAnalysis.score || 0,
          strengths: smartAnalysis.strengths || [],
          weaknesses: smartAnalysis.weaknesses || [],
          optimization_suggestions: smartAnalysis.suggestions || [],
          overall_comment:
            smartAnalysis.overall_comment || smartAnalysis.overallComment || "",
          interview_questions:
            smartAnalysis.interview_questions ||
            smartAnalysis.interviewQuestions ||
            [],
          recommended_positions: smartAnalysis.recommended_positions || [],
          skills: smartAnalysis.skills || {},
        },
      };
    }

    // 旧的 smartresume 返回格式：
    // {
    //   summary: { name, education, school, major, graduation_year, work_years },
    //   skills: { tech_stack, soft_skills, missing_skills },
    //   strengths: [{ title, description }],
    //   weaknesses: [{ category, description, severity }],
    //   optimization_suggestions: [{ issue, suggestion, example, priority }],
    //   score: 7.5,
    //   score_breakdown: { technical_skills, project_experience, resume_quality, potential },
    //   recommended_positions: [...],
    //   interview_questions: [...],
    //   overall_comment: "...",
    //   resume_defects: "...",
    //   action_plan: [...]
    // }

    // 构建 extracted_data（提取的原始信息）
    const extracted_data = {
      name: rawResult.summary?.name || rawResult.name || "",
      phone: rawResult.phone || rawResult.basicInfo?.phone || "",
      email: rawResult.email || rawResult.basicInfo?.email || "",
      basic_info: {
        name: rawResult.summary?.name || rawResult.name || "",
        phone: rawResult.phone || "",
        email: rawResult.email || "",
        school: rawResult.summary?.school || "",
        major: rawResult.summary?.major || "",
        graduation_year: rawResult.summary?.graduation_year || "",
        education: rawResult.summary?.education || "",
        work_years: rawResult.summary?.work_years || 0,
      },
      education: rawResult.education || [],
      work_experience:
        rawResult.work_experience || rawResult.workExperience || [],
      projects: rawResult.projects || [],
      skills: rawResult.skills || [],
    };

    // 构建 analysis（AI 分析结果）
    const analysis = {
      summary: rawResult.summary || {},
      skills: rawResult.skills || {},
      score: rawResult.score || 0,
      score_breakdown: rawResult.score_breakdown || {},
      strengths: rawResult.strengths || [],
      weaknesses: rawResult.weaknesses || [],
      optimization_suggestions: rawResult.optimization_suggestions || [],
      recommended_positions: rawResult.recommended_positions || [],
      interview_questions: rawResult.interview_questions || [],
      overall_comment: rawResult.overall_comment || "",
      resume_defects: rawResult.resume_defects || "",
      action_plan: rawResult.action_plan || [],
    };

    return {
      success: true,
      extracted_data,
      analysis,
    };
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

  // 生成面试问题（流式）
  async generateInterviewQuestionStream(req, res) {
    try {
      const { type, subType, questionNumber, askedQuestions } = req.body;

      if (!type || !subType) {
        return res.status(400).json({ error: "Missing type or subType" });
      }

      // 设置SSE响应头
      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");
      res.setHeader("Access-Control-Allow-Origin", "*");

      // 调用流式生成面试问题，传递问题编号和已问问题列表
      await aliyunBailianService.generateInterviewQuestionStream(
        res,
        type,
        subType,
        questionNumber,
        askedQuestions,
      );
    } catch (error) {
      console.error("Error generating streaming interview question:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  // 分析面试问答并生成评分和总结
  async analyzeInterviewAnswers(req, res) {
    try {
      const { type, subType, questions, answers } = req.body;

      if (!type || !subType || !questions || !answers) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      const analysis = await aliyunBailianService.analyzeInterviewQnAByType(
        questions,
        answers,
        type,
      );
      res.status(200).json({ data: analysis });
    } catch (error) {
      console.error("Error analyzing interview answers:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
}

module.exports = new AiPreInterviewController();
