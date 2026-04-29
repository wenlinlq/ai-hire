// 导入 Express 框架
var express = require("express");
// 创建一个路由对象，用于定义简历相关的路由
var router = express.Router();
// 导入简历控制器，包含所有简历相关的业务逻辑处理函数
const resumeController = require("../../controllers/resumeController");
// 导入认证中间件，用于验证token
const { verifyToken } = require("../../middlewares/authMiddleware");
// 导入 multer，用于处理文件上传
const multer = require("multer");
// 导入路径模块，用于处理文件路径
const path = require("path");
// 导入 iconv-lite，用于处理中文编码
const iconv = require("iconv-lite");

// 配置文件存储
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // 确保上传目录存在
    const uploadDir = path.join(__dirname, "../../../uploads");
    if (!require("fs").existsSync(uploadDir)) {
      require("fs").mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
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

// 创建multer实例
const upload = multer({ storage: storage });

// ========== 简历管理路由（RESTful API） ==========

// 上传简历路由
// POST 请求到 /api/resumes/upload
// 调用 resumeController.uploadResume 上传简历
router.post(
  "/upload",
  verifyToken,
  upload.single("resume"),
  resumeController.uploadResume,
);

// 导入AI预面试控制器，用于简历解析和优化
const aiPreInterviewController = require("../../controllers/aiPreInterviewController");

// 解析简历路由
// POST 请求到 /api/resumes/parse
// 调用 aiPreInterviewController.parseResume 解析简历
router.post(
  "/parse",
  verifyToken,
  upload.single("resume"),
  (req, res) => aiPreInterviewController.parseResume(req, res),
);

// 优化简历路由
// POST 请求到 /api/resumes/optimize
// 调用 aiPreInterviewController.optimizeResume 优化简历
router.post("/optimize", verifyToken, aiPreInterviewController.optimizeResume);

// 一键优化简历路由
// POST 请求到 /api/resumes/optimize/one-click
// 调用 aiPreInterviewController.oneClickOptimizeResume 一键优化简历
router.post(
  "/optimize/one-click",
  verifyToken,
  aiPreInterviewController.oneClickOptimizeResume,
);

// 获取学生的所有简历路由
// GET 请求到 /api/resumes/
// 调用 resumeController.getStudentResumes 获取学生的所有简历
router.get("/", verifyToken, resumeController.getStudentResumes);

// 获取学生的当前简历路由
// GET 请求到 /api/resumes/current
// 调用 resumeController.getCurrentResume 获取学生的当前简历
router.get("/current", verifyToken, resumeController.getCurrentResume);

// 设置当前简历路由
// PUT 请求到 /api/resumes/:resumeId/current
// 调用 resumeController.setCurrentResume 设置当前简历
router.put(
  "/:resumeId/current",
  verifyToken,
  resumeController.setCurrentResume,
);

// 更新简历信息路由
// PUT 请求到 /api/resumes/:resumeId
// 调用 resumeController.updateResume 更新简历信息
router.put("/:resumeId", verifyToken, resumeController.updateResume);

// 删除简历路由
// DELETE 请求到 /api/resumes/:resumeId
// 调用 resumeController.deleteResume 删除简历
router.delete("/:resumeId", verifyToken, resumeController.deleteResume);

// 导出路由模块，供主应用使用
module.exports = router;
