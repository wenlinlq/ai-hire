const fs = require("fs");
const path = require("path");
const baiduDocumentService = require("./services/baiduDocumentService");
const aliyunBailianService = require("./services/aliyunBailianService");

// 测试简历筛选完整流程
async function testScreening() {
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

    // 测试数据 - 模拟岗位要求
    const jobRequirements = {
      skills: ["JavaScript", "Vue", "React", "CSS", "HTML", "TypeScript"],
      experience: "1-3年前端开发经验",
      education: "本科及以上学历",
      description: "负责公司前端项目的开发和维护，需要有良好的团队协作能力"
    };

    console.log("\n=== Step 1: Parsing document with Baidu ===");
    const resumeContent = await baiduDocumentService.parseDocument(filePath);
    console.log("Resume content length:", resumeContent.length);
    console.log("Resume content preview:\n", resumeContent.substring(0, 500), "\n");

    console.log("=== Step 2: Analyzing resume with Aliyun Bailian ===");
    const screeningResult = await aliyunBailianService.analyzeResumeForScreening(
      resumeContent,
      jobRequirements
    );
    console.log("Screening result:", JSON.stringify(screeningResult, null, 2));

  } catch (error) {
    console.error("Test failed:", {
      message: error.message,
      code: error.code,
      stack: error.stack
    });
  }
}

testScreening();
