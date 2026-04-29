const fs = require("fs");
const path = require("path");
const baiduDocumentService = require("./services/baiduDocumentService");
const aliyunBailianService = require("./services/aliyunBailianService");

// 模拟从数据库获取的真实职位数据结构
const realPositionData = {
  _id: "69f065575c666c4d41efe2d4",
  teamId: "660a0b6c4f1a2b3c4d5e6f71",
  title: "高级前端工程师",
  type: "fulltime",
  department: "技术部",
  quota: 3,
  salary: "25k-40k",
  interviewType: "online",
  aiQuestionBankId: null,
  aiPreInterview: true,
  aiPreInterviewScore: 60,
  aiResumeFilter: true,
  aiResumeFilterScore: 60,
  aiResumeFilterSkills: ["React", "TypeScript"], // 团队管理员设置的硬性技能
  requirements: {
    skills: ["JavaScript", "Vue", "React", "CSS", "HTML"],
    experience: "3-5年前端开发经验",
    education: "本科及以上学历", // 团队管理员设置的学历要求
    description: "负责公司核心前端项目的开发和维护，需要有良好的团队协作能力"
  },
  responsibilities: [
    "负责前端项目的架构设计和开发",
    "优化前端性能和用户体验",
    "与产品、设计团队协作"
  ],
  benefits: ["五险一金", "年终奖金", "带薪年假"],
  status: "open",
  deadline: new Date("2026-12-31"),
  viewCount: 150,
  applyCount: 25,
  createdBy: "660a0b6c4f1a2b3c4d5e6f70",
  createdAt: new Date("2026-04-01"),
  updatedAt: new Date("2026-04-15")
};

// 测试真实的职位数据筛选流程
async function testRealPositionScreening() {
  try {
    // 找到测试PDF文件
    const uploadsDir = path.join(__dirname, "uploads");
    const files = fs.readdirSync(uploadsDir);
    const pdfFiles = files.filter((f) => f.toLowerCase().endsWith(".pdf"));
    
    if (pdfFiles.length === 0) {
      console.error("No PDF files found in uploads directory");
      return;
    }

    const filePath = path.join(uploadsDir, pdfFiles[0]);
    console.log("Testing with file:", filePath);

    // 解析简历内容
    const resumeContent = await baiduDocumentService.parseDocument(filePath);
    console.log("Resume content length:", resumeContent.length);

    console.log("\n=== 使用完整职位对象进行筛选 ===");
    console.log("职位标题:", realPositionData.title);
    console.log("硬性技能要求:", realPositionData.aiResumeFilterSkills);
    console.log("学历要求:", realPositionData.requirements.education);
    console.log("经验要求:", realPositionData.requirements.experience);
    
    // 使用完整的职位对象调用筛选服务
    const screeningResult = await aliyunBailianService.analyzeResumeForScreening(
      resumeContent, 
      realPositionData
    );
    
    console.log("\n筛选结果:");
    console.log(JSON.stringify(screeningResult, null, 2));

  } catch (error) {
    console.error("Test failed:", {
      message: error.message,
      code: error.code,
      stack: error.stack
    });
  }
}

testRealPositionScreening();
