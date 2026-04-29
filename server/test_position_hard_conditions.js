const fs = require("fs");
const path = require("path");
const baiduDocumentService = require("./services/baiduDocumentService");
const aliyunBailianService = require("./services/aliyunBailianService");

// 测试职位模型中的硬性条件筛选
async function testPositionHardConditions() {
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

    // 模拟从数据库获取的职位数据（完整的职位模型结构）
    const positionFromDB = {
      _id: "69f065575c666c4d41efe2d4",
      title: "高级前端工程师",
      type: "fulltime",
      department: "技术部",
      quota: 3,
      salary: "25k-40k",
      aiPreInterview: true,
      aiPreInterviewScore: 60,
      aiResumeFilter: true,
      aiResumeFilterScore: 60,
      aiResumeFilterSkills: ["React", "TypeScript", "Node.js"], // 硬性技能要求
      requirements: {
        skills: ["JavaScript", "Vue", "React", "CSS", "HTML"],
        experience: "3-5年前端开发经验",
        education: "本科及以上学历",
        description: "负责公司核心前端项目的开发和维护"
      },
      status: "open",
      createdAt: new Date(),
      updatedAt: new Date()
    };

    console.log("\n=== 测试场景1：职位模型中的硬性技能要求 ===");
    console.log("硬性技能要求:", positionFromDB.aiResumeFilterSkills);
    
    const result1 = await aliyunBailianService.analyzeResumeForScreening(resumeContent, positionFromDB);
    console.log("筛选结果:", JSON.stringify(result1, null, 2));

    // 测试场景2：没有硬性技能要求的情况
    console.log("\n=== 测试场景2：没有硬性技能要求 ===");
    const positionWithoutHardSkills = {
      ...positionFromDB,
      aiResumeFilterSkills: []
    };
    
    const result2 = await aliyunBailianService.analyzeResumeForScreening(resumeContent, positionWithoutHardSkills);
    console.log("筛选结果:", JSON.stringify(result2, null, 2));

    // 测试场景3：学历要求高于简历中的学历
    console.log("\n=== 测试场景3：学历要求高于简历中的学历 ===");
    const positionWithHighEducation = {
      ...positionFromDB,
      requirements: {
        ...positionFromDB.requirements,
        education: "硕士及以上学历" // 提高学历要求
      }
    };
    
    const result3 = await aliyunBailianService.analyzeResumeForScreening(resumeContent, positionWithHighEducation);
    console.log("筛选结果:", JSON.stringify(result3, null, 2));

  } catch (error) {
    console.error("Test failed:", {
      message: error.message,
      code: error.code,
      stack: error.stack
    });
  }
}

testPositionHardConditions();
