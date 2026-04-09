const applicationModel = require("../models/applicationModel");
const positionModel = require("../models/positionModel");
const multer = require("multer");
const path = require("path");
const iconv = require("iconv-lite");

// 配置multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "../uploads"));
  },
  filename: function (req, file, cb) {
    // 处理中文文件名编码
    try {
      // 尝试将文件名从UTF-8转换为GBK，再转换回UTF-8，确保正确处理
      const decodedName = iconv.decode(
        Buffer.from(file.originalname, "binary"),
        "utf8",
      );
      cb(null, decodedName);
    } catch (error) {
      // 如果转换失败，使用原始文件名
      cb(null, file.originalname);
    }
  },
});

const upload = multer({ storage: storage });

const applicationController = {
  // 初始化索引
  async initializeIndexes() {
    await applicationModel.initializeIndexes();
  },

  // 创建报名记录
  async createApplication(req, res) {
    try {
      const applicationData = req.body;

      // 验证必要参数
      if (
        !applicationData.positionId ||
        !applicationData.studentId ||
        !applicationData.resumeId
      ) {
        return res.status(400).json({
          success: false,
          message: "缺少必要参数",
        });
      }

      const application =
        await applicationModel.createApplication(applicationData);

      res.status(201).json({
        success: true,
        message: "报名成功",
        data: application,
      });
    } catch (error) {
      console.error("Error creating application:", error);

      // 处理唯一索引冲突
      if (error.code === 11000) {
        return res.status(400).json({
          success: false,
          message: "您已经报名过该岗位",
        });
      }

      res.status(500).json({
        success: false,
        message: "创建报名记录失败",
        error: error.message,
      });
    }
  },

  // 获取单个报名记录
  async getApplicationById(req, res) {
    try {
      const { id } = req.params;
      const application = await applicationModel.findApplicationById(id);

      if (!application) {
        return res.status(404).json({
          success: false,
          message: "报名记录不存在",
        });
      }

      res.status(200).json({
        success: true,
        data: application,
      });
    } catch (error) {
      console.error("Error getting application:", error);
      res.status(500).json({
        success: false,
        message: "获取报名记录失败",
        error: error.message,
      });
    }
  },

  // 获取岗位的所有报名记录
  async getApplicationsByPosition(req, res) {
    try {
      const { positionId } = req.params;
      const applications =
        await applicationModel.findApplicationsByPositionId(positionId);

      res.status(200).json({
        success: true,
        data: applications,
      });
    } catch (error) {
      console.error("Error getting applications by position:", error);
      res.status(500).json({
        success: false,
        message: "获取报名记录失败",
        error: error.message,
      });
    }
  },

  // 获取学生的所有报名记录
  async getApplicationsByStudent(req, res) {
    try {
      const { studentId } = req.params;
      const applications =
        await applicationModel.findApplicationsByStudentId(studentId);

      res.status(200).json({
        success: true,
        data: applications,
      });
    } catch (error) {
      console.error("Error getting applications by student:", error);
      res.status(500).json({
        success: false,
        message: "获取报名记录失败",
        error: error.message,
      });
    }
  },

  // 更新报名记录
  async updateApplication(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const application = await applicationModel.updateApplication(
        id,
        updateData,
      );

      if (!application) {
        return res.status(404).json({
          success: false,
          message: "报名记录不存在",
        });
      }

      res.status(200).json({
        success: true,
        message: "更新成功",
        data: application,
      });
    } catch (error) {
      console.error("Error updating application:", error);
      res.status(500).json({
        success: false,
        message: "更新报名记录失败",
        error: error.message,
      });
    }
  },

  // 删除报名记录
  async deleteApplication(req, res) {
    try {
      const { id } = req.params;
      const deleted = await applicationModel.deleteApplication(id);

      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: "报名记录不存在",
        });
      }

      res.status(200).json({
        success: true,
        message: "删除成功",
      });
    } catch (error) {
      console.error("Error deleting application:", error);
      res.status(500).json({
        success: false,
        message: "删除报名记录失败",
        error: error.message,
      });
    }
  },

  // 根据状态获取报名记录
  async getApplicationsByStatus(req, res) {
    try {
      const { status } = req.params;
      const applications =
        await applicationModel.findApplicationsByStatus(status);

      res.status(200).json({
        success: true,
        data: applications,
      });
    } catch (error) {
      console.error("Error getting applications by status:", error);
      res.status(500).json({
        success: false,
        message: "获取报名记录失败",
        error: error.message,
      });
    }
  },

  // 按AI评分排序获取报名记录
  async getApplicationsByAiScore(req, res) {
    try {
      const { positionId } = req.query;
      const applications =
        await applicationModel.findApplicationsByAiScoreDesc(positionId);

      res.status(200).json({
        success: true,
        data: applications,
      });
    } catch (error) {
      console.error("Error getting applications by ai score:", error);
      res.status(500).json({
        success: false,
        message: "获取报名记录失败",
        error: error.message,
      });
    }
  },

  // 获取所有报名记录
  async getAllApplications(req, res) {
    try {
      const applications = await applicationModel.findAllApplications();

      // 从数据库获取职位信息
      const jobs = await positionModel.findAllPositions();
      const jobMap = new Map();
      jobs.forEach((job) => {
        jobMap.set(job._id.toString(), job.title);
      });

      // 为每个报名记录添加职位名称
      const applicationsWithJobTitle = applications.map((application) => ({
        ...application,
        positionName:
          jobMap.get(application.positionId.toString()) ||
          application.positionId,
      }));

      res.status(200).json({
        success: true,
        data: applicationsWithJobTitle,
      });
    } catch (error) {
      console.error("Error getting all applications:", error);
      res.status(500).json({
        success: false,
        message: "获取报名记录失败",
        error: error.message,
      });
    }
  },

  // 导入候选人
  async importCandidate(req, res) {
    try {
      console.log("收到的请求数据:", req.body);
      console.log("收到的文件:", req.file);
      const { name, phone, email, grade, major, positionId, teamId } = req.body;

      // 验证必要参数
      if (!name || !phone || !email || !positionId) {
        console.log("缺少的参数:", { name, phone, email, positionId });
        return res.status(400).json({
          success: false,
          message: "缺少必要参数",
        });
      }

      // 创建候选人记录
      const applicationData = {
        positionId,
        studentId: email, // 使用邮箱作为学生ID
        resumeId: req.file ? req.file.filename : "", // 保存上传的简历文件名
        teamId: teamId || null, // 添加团队ID
        status: "pending",
        grade,
        major,
        name, // 添加姓名
        email, // 添加邮箱
      };

      const application =
        await applicationModel.createApplication(applicationData);

      res.status(201).json({
        success: true,
        message: "候选人导入成功",
        data: application,
      });
    } catch (error) {
      console.error("Error importing candidate:", error);

      // 处理唯一索引冲突
      if (error.code === 11000) {
        return res.status(400).json({
          success: false,
          message: "该候选人已经报名过该岗位",
        });
      }

      res.status(500).json({
        success: false,
        message: "导入候选人失败",
        error: error.message,
      });
    }
  },

  // 根据团队ID获取报名记录
  async getApplicationsByTeam(req, res) {
    try {
      const { teamId } = req.params;
      const applications =
        await applicationModel.findApplicationsByTeamId(teamId);

      // 从数据库获取职位信息
      const jobs = await positionModel.findAllPositions();
      const jobMap = new Map();
      jobs.forEach((job) => {
        jobMap.set(job._id.toString(), job.title);
      });

      // 为每个报名记录添加职位名称
      const applicationsWithJobTitle = applications.map((application) => ({
        ...application,
        positionName:
          jobMap.get(application.positionId.toString()) ||
          application.positionId,
      }));

      res.status(200).json({
        success: true,
        data: applicationsWithJobTitle,
      });
    } catch (error) {
      console.error("Error getting applications by team:", error);
      res.status(500).json({
        success: false,
        message: "获取报名记录失败",
        error: error.message,
      });
    }
  },
};

module.exports = applicationController;
