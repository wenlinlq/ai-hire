const express = require("express");
const router = express.Router();
const applicationController = require("../../controllers/applicationController");
const { verifyToken } = require("../../middlewares/authMiddleware");
const multer = require("multer");
const path = require("path");

// 配置multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "../../uploads"));
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage: storage });

// 获取所有报名记录
router.get("/", verifyToken, applicationController.getAllApplications);

// 创建报名记录
router.post("/", verifyToken, applicationController.createApplication);

// 获取单个报名记录
router.get("/:id", verifyToken, applicationController.getApplicationById);

// 获取岗位的所有报名记录
router.get(
  "/position/:positionId",
  verifyToken,
  applicationController.getApplicationsByPosition,
);

// 获取学生的所有报名记录
router.get(
  "/student/:studentId",
  verifyToken,
  applicationController.getApplicationsByStudent,
);

// 更新报名记录
router.put("/:id", verifyToken, applicationController.updateApplication);

// 删除报名记录
router.delete("/:id", verifyToken, applicationController.deleteApplication);

// 根据状态获取报名记录
router.get(
  "/status/:status",
  verifyToken,
  applicationController.getApplicationsByStatus,
);

// 按AI评分排序获取报名记录
router.get(
  "/ai-score/ranking",
  verifyToken,
  applicationController.getApplicationsByAiScore,
);

// 导入候选人
router.post(
  "/import",
  verifyToken,
  upload.single("resume"),
  applicationController.importCandidate,
);

// 根据团队ID获取报名记录
router.get(
  "/team/:teamId",
  verifyToken,
  applicationController.getApplicationsByTeam,
);

module.exports = router;
