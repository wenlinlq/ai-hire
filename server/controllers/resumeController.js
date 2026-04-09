// 导入简历模型
const resumeModel = require("../models/resumeModel");
// 导入文件系统模块，用于处理文件操作
const fs = require("fs");
// 导入路径模块，用于处理文件路径
const path = require("path");

// 定义简历控制器
const resumeController = {
  // 上传简历
  async uploadResume(req, res) {
    try {
      // 从请求中获取用户ID
      const userId = req.user.id;

      // 检查是否有文件上传
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "请选择要上传的文件",
        });
      }

      // 获取文件信息
      const file = req.file;
      const fileType = path
        .extname(file.originalname)
        .toLowerCase()
        .substring(1);

      // 验证文件类型
      const allowedTypes = ["pdf", "doc", "docx", "jpg", "jpeg", "png"];
      if (!allowedTypes.includes(fileType)) {
        // 删除上传的文件
        fs.unlinkSync(file.path);
        return res.status(400).json({
          success: false,
          message: "不支持的文件类型",
        });
      }

      // 构建文件URL（实际项目中应该使用云存储或CDN）
      const fileUrl = `/uploads/${file.filename}`;

      // 构建简历数据
      const resumeData = {
        studentId: userId,
        fileUrl: fileUrl,
        fileType: fileType,
        isActive: true,
      };

      // 调用模型方法创建简历记录
      const resume = await resumeModel.createResume(resumeData);

      // 返回成功响应
      res.status(201).json({
        success: true,
        message: "简历上传成功",
        data: resume,
      });
    } catch (error) {
      // 捕获错误并返回错误响应
      res.status(500).json({
        success: false,
        message: "简历上传失败",
        error: error.message,
      });
    }
  },

  // 获取学生的所有简历
  async getStudentResumes(req, res) {
    try {
      // 从请求中获取用户ID
      const userId = req.user.id;

      // 调用模型方法获取学生的所有简历
      const resumes = await resumeModel.getStudentResumes(userId);

      // 返回成功响应
      res.status(200).json({
        success: true,
        message: "获取简历列表成功",
        data: resumes,
      });
    } catch (error) {
      // 捕获错误并返回错误响应
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
      // 从请求中获取用户ID
      const userId = req.user.id;

      // 调用模型方法获取学生的当前简历
      const resume = await resumeModel.getCurrentResume(userId);

      // 返回成功响应
      res.status(200).json({
        success: true,
        message: "获取当前简历成功",
        data: resume,
      });
    } catch (error) {
      // 捕获错误并返回错误响应
      res.status(500).json({
        success: false,
        message: "获取当前简历失败",
        error: error.message,
      });
    }
  },

  // 删除简历
  async deleteResume(req, res) {
    try {
      // 从请求参数中获取简历ID
      const { resumeId } = req.params;

      // 调用模型方法删除简历
      const deleted = await resumeModel.deleteResume(resumeId);

      // 检查删除是否成功
      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: "简历不存在",
        });
      }

      // 返回成功响应
      res.status(200).json({
        success: true,
        message: "简历删除成功",
      });
    } catch (error) {
      // 捕获错误并返回错误响应
      res.status(500).json({
        success: false,
        message: "简历删除失败",
        error: error.message,
      });
    }
  },

  // 设置当前简历
  async setCurrentResume(req, res) {
    try {
      // 从请求参数中获取简历ID
      const { resumeId } = req.params;

      // 调用模型方法设置当前简历
      const updated = await resumeModel.setCurrentResume(resumeId);

      // 检查设置是否成功
      if (!updated) {
        return res.status(404).json({
          success: false,
          message: "简历不存在",
        });
      }

      // 返回成功响应
      res.status(200).json({
        success: true,
        message: "设置当前简历成功",
      });
    } catch (error) {
      // 捕获错误并返回错误响应
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
      // 从请求参数中获取简历ID
      const { resumeId } = req.params;
      // 从请求体中获取更新数据
      const updateData = req.body;

      // 调用模型方法更新简历
      const updated = await resumeModel.updateResume(resumeId, updateData);

      // 检查更新是否成功
      if (!updated) {
        return res.status(404).json({
          success: false,
          message: "简历不存在",
        });
      }

      // 返回成功响应
      res.status(200).json({
        success: true,
        message: "简历更新成功",
      });
    } catch (error) {
      // 捕获错误并返回错误响应
      res.status(500).json({
        success: false,
        message: "简历更新失败",
        error: error.message,
      });
    }
  },
};

// 导出简历控制器
module.exports = resumeController;
