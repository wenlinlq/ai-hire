// 导入数据库连接模块，用于获取数据库实例
const { getDB } = require("../db/db");
// 导入 MongoDB 的 ObjectId 类型，用于处理文档的 _id 字段
const { ObjectId } = require("mongodb");
// 新增：用于调用 Python 分析服务
const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");
const path = require("path");

// Python 分析服务配置
const ANALYSIS_SERVICE_URL =
  process.env.ANALYSIS_SERVICE_URL || "http://localhost:8000";

// 定义简历模型类，封装所有简历相关的数据库操作
class ResumeModel {
  // 构造函数，在创建实例时自动执行
  constructor() {
    // 延迟获取数据库连接，在需要时通过 getCollection 方法获取
  }

  // 获取数据库集合的方法
  getCollection() {
    if (!this.collection) {
      this.collection = getDB().collection("resumes");
    }
    return this.collection;
  }

  // 初始化数据库索引的方法
  async initIndexes() {
    try {
      const collection = this.getCollection();
      // 创建 studentId 普通索引
      await collection.createIndex({ studentId: 1 });
      // 创建 isActive 普通索引
      await collection.createIndex({ isActive: 1 });
      // 控制台输出索引初始化成功的消息
      console.log("Resume indexes initialized successfully");
    } catch (error) {
      // 如果索引创建失败，输出错误信息
      console.error("Error initializing resume indexes:", error);
    }
  }

  // 创建新简历记录的方法
  async createResume(resumeData) {
    try {
      const collection = this.getCollection();

      // 构建简历文档对象
      const resume = {
        // 学生ID
        studentId: new ObjectId(resumeData.studentId),
        // 简历文件URL
        fileUrl: resumeData.fileUrl || "",
        // 文件类型
        fileType: resumeData.fileType || "",
        // 简历原始文本
        content: resumeData.content || "",
        // AI解析结果
        parsedData: resumeData.parsedData || {
          name: "",
          phone: "",
          email: "",
          education: {},
          skills: [],
          projects: [],
          experience: [],
        },
        // AI分析结果（新增）
        analysis: resumeData.analysis || null,
        // 解析时间
        parsedAt: resumeData.parsedAt || null,
        // 是否为当前简历
        isActive:
          resumeData.isActive !== undefined ? resumeData.isActive : true,
        // 上传时间
        createdAt: new Date(),
        // 更新时间
        updatedAt: new Date(),
      };

      // 如果设置为当前简历，将其他简历设置为非当前
      if (resume.isActive) {
        await collection.updateMany(
          { studentId: resume.studentId, isActive: true },
          { $set: { isActive: false, updatedAt: new Date() } },
        );
      }

      // 向数据库插入简历文档
      const result = await collection.insertOne(resume);
      // 返回完整的简历对象，包含 MongoDB 自动生成的 _id
      return {
        ...resume,
        _id: result.insertedId,
      };
    } catch (error) {
      // 如果创建失败，输出错误信息
      console.error("Error creating resume:", error);
      // 抛出错误，让上层调用者处理
      throw error;
    }
  }

  // 获取学生的所有简历
  async getStudentResumes(studentId) {
    try {
      const collection = this.getCollection();

      // 查询学生的所有简历，按创建时间倒序排列
      const resumes = await collection
        .find({
          studentId: new ObjectId(studentId),
        })
        .sort({ createdAt: -1 })
        .toArray();

      return resumes;
    } catch (error) {
      // 如果查询失败，输出错误信息
      console.error("Error getting student resumes:", error);
      // 抛出错误，让上层调用者处理
      throw error;
    }
  }

  // 获取学生的当前简历
  async getCurrentResume(studentId) {
    try {
      const collection = this.getCollection();

      // 查询学生的当前简历
      const resume = await collection.findOne({
        studentId: new ObjectId(studentId),
        isActive: true,
      });

      return resume;
    } catch (error) {
      // 如果查询失败，输出错误信息
      console.error("Error getting current resume:", error);
      // 抛出错误，让上层调用者处理
      throw error;
    }
  }

  // 根据 ID 获取简历（新增）
  async getResumeById(resumeId) {
    try {
      const collection = this.getCollection();

      const resume = await collection.findOne({
        _id: new ObjectId(resumeId),
      });

      return resume;
    } catch (error) {
      console.error("Error getting resume by id:", error);
      throw error;
    }
  }

  // 保存分析结果（新增）
  async saveAnalysisResult(resumeId, analysisResult) {
    try {
      const collection = this.getCollection();

      const result = await collection.updateOne(
        { _id: new ObjectId(resumeId) },
        {
          $set: {
            parsedData:
              analysisResult.extracted_data ||
              analysisResult.data?.extracted_data,
            analysis: analysisResult.analysis || analysisResult.data?.analysis,
            parsedAt: new Date(),
            updatedAt: new Date(),
          },
        },
      );

      return result.modifiedCount > 0;
    } catch (error) {
      console.error("Error saving analysis result:", error);
      throw error;
    }
  }

  // 获取简历分析结果（新增）
  async getAnalysisResult(resumeId) {
    try {
      const collection = this.getCollection();

      const resume = await collection.findOne(
        { _id: new ObjectId(resumeId) },
        { projection: { parsedData: 1, analysis: 1, parsedAt: 1 } },
      );

      return resume;
    } catch (error) {
      console.error("Error getting analysis result:", error);
      throw error;
    }
  }

  // 更新简历信息
  async updateResume(resumeId, updateData) {
    try {
      const collection = this.getCollection();

      // 构建更新对象
      const update = {
        $set: {
          ...updateData,
          updatedAt: new Date(),
        },
      };

      // 如果设置为当前简历，将其他简历设置为非当前
      if (updateData.isActive) {
        const resume = await collection.findOne({
          _id: new ObjectId(resumeId),
        });
        if (resume) {
          await collection.updateMany(
            { studentId: resume.studentId, isActive: true },
            { $set: { isActive: false, updatedAt: new Date() } },
          );
        }
      }

      // 执行更新操作
      const result = await collection.updateOne(
        { _id: new ObjectId(resumeId) },
        update,
      );

      // 返回是否更新成功
      return result.modifiedCount > 0;
    } catch (error) {
      // 如果更新失败，输出错误信息
      console.error("Error updating resume:", error);
      // 抛出错误，让上层调用者处理
      throw error;
    }
  }

  // 删除简历
  async deleteResume(resumeId) {
    try {
      const collection = this.getCollection();

      // 先获取简历信息，用于后续处理
      const resume = await collection.findOne({ _id: new ObjectId(resumeId) });
      if (!resume) {
        return false;
      }

      // 执行删除操作
      const result = await collection.deleteOne({
        _id: new ObjectId(resumeId),
      });

      // 如果删除的是当前简历，将最新的简历设置为当前
      if (resume.isActive && result.deletedCount > 0) {
        const latestResume = await collection.findOne(
          { studentId: resume.studentId },
          { sort: { createdAt: -1 } },
        );
        if (latestResume) {
          await collection.updateOne(
            { _id: latestResume._id },
            { $set: { isActive: true, updatedAt: new Date() } },
          );
        }
      }

      // 返回是否删除成功
      return result.deletedCount > 0;
    } catch (error) {
      // 如果删除失败，输出错误信息
      console.error("Error deleting resume:", error);
      // 抛出错误，让上层调用者处理
      throw error;
    }
  }

  // 设置当前简历
  async setCurrentResume(resumeId) {
    try {
      const collection = this.getCollection();

      // 先获取简历信息
      const resume = await collection.findOne({ _id: new ObjectId(resumeId) });
      if (!resume) {
        return false;
      }

      // 将所有简历设置为非当前
      await collection.updateMany(
        { studentId: resume.studentId, isActive: true },
        { $set: { isActive: false, updatedAt: new Date() } },
      );

      // 将指定简历设置为当前
      const result = await collection.updateOne(
        { _id: new ObjectId(resumeId) },
        { $set: { isActive: true, updatedAt: new Date() } },
      );

      // 返回是否设置成功
      return result.modifiedCount > 0;
    } catch (error) {
      // 如果设置失败，输出错误信息
      console.error("Error setting current resume:", error);
      // 抛出错误，让上层调用者处理
      throw error;
    }
  }
}

// 导出简历模型
const resumeModel = new ResumeModel();

// 简历控制器
const resumeController = {
  // 上传简历
  async uploadResume(req, res) {
    try {
      const userId = req.user?.id;
      const file = req.file;

      if (!file) {
        return res.status(400).json({
          success: false,
          message: "请选择要上传的简历文件",
        });
      }

      // 构建文件路径
      const fileUrl = `/uploads/${file.filename}`;

      // 构建简历数据
      const resumeData = {
        studentId: userId,
        fileUrl: fileUrl,
        fileType: file.mimetype.split("/")[1],
        isActive: true,
      };

      // 创建简历记录
      const resume = await resumeModel.createResume(resumeData);

      res.status(200).json({
        success: true,
        message: "简历上传成功",
        data: resume,
      });
    } catch (error) {
      console.error("上传简历失败:", error);
      res.status(500).json({
        success: false,
        message: "上传简历失败",
        error: error.message,
      });
    }
  },

  // 获取学生的所有简历
  async getStudentResumes(req, res) {
    try {
      const userId = req.user?.id;

      const resumes = await resumeModel.getStudentResumes(userId);

      res.status(200).json({
        success: true,
        data: resumes,
      });
    } catch (error) {
      console.error("获取简历列表失败:", error);
      res.status(500).json({
        success: false,
        message: "获取简历列表失败",
        error: error.message,
      });
    }
  },

  // 获取学生的当前简历
  async getCurrentResume(req, res) {
    try {
      const userId = req.user?.id;

      const resume = await resumeModel.getCurrentResume(userId);

      res.status(200).json({
        success: true,
        data: resume,
      });
    } catch (error) {
      console.error("获取当前简历失败:", error);
      res.status(500).json({
        success: false,
        message: "获取当前简历失败",
        error: error.message,
      });
    }
  },

  // 设置当前简历
  async setCurrentResume(req, res) {
    try {
      const { resumeId } = req.params;

      const result = await resumeModel.setCurrentResume(resumeId);

      if (result) {
        res.status(200).json({
          success: true,
          message: "设置当前简历成功",
        });
      } else {
        res.status(404).json({
          success: false,
          message: "简历不存在",
        });
      }
    } catch (error) {
      console.error("设置当前简历失败:", error);
      res.status(500).json({
        success: false,
        message: "设置当前简历失败",
        error: error.message,
      });
    }
  },

  // 更新简历信息
  async updateResume(req, res) {
    try {
      const { resumeId } = req.params;
      const updateData = req.body;

      const result = await resumeModel.updateResume(resumeId, updateData);

      if (result) {
        res.status(200).json({
          success: true,
          message: "更新简历成功",
        });
      } else {
        res.status(404).json({
          success: false,
          message: "简历不存在",
        });
      }
    } catch (error) {
      console.error("更新简历失败:", error);
      res.status(500).json({
        success: false,
        message: "更新简历失败",
        error: error.message,
      });
    }
  },

  // 删除简历
  async deleteResume(req, res) {
    try {
      const { resumeId } = req.params;

      const result = await resumeModel.deleteResume(resumeId);

      if (result) {
        res.status(200).json({
          success: true,
          message: "删除简历成功",
        });
      } else {
        res.status(404).json({
          success: false,
          message: "简历不存在",
        });
      }
    } catch (error) {
      console.error("删除简历失败:", error);
      res.status(500).json({
        success: false,
        message: "删除简历失败",
        error: error.message,
      });
    }
  },
};

module.exports = resumeController;
