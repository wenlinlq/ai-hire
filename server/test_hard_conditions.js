const fs = require("fs");
const path = require("path");
const baiduDocumentService = require("./services/baiduDocumentService");
const aliyunBailianService = require("./services/aliyunBailianService");

// 测试硬性条件筛选
async function testHardConditions() {
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

    // 测试场景1：有硬性技能要求，但简历中没有
    console.log("\n=== 测试场景1：有硬性技能要求，但简历中没有 ===");
    const jobRequirements1 = {
      skills: ["JavaScript", "Vue", "React"],
      experience: "1-3年前端开发经验",
      education: "本科及以上学历",
      hardSkills: ["Python", "Go"], // 硬性技能要求，简历中可能没有
      description: "测试硬性条件"
    };

    const result1 = await aliyunBailianService.analyzeResumeForScreening(resumeContent, jobRequirements1);
    console.log("筛选结果:", JSON.stringify(result1, null, 2));

    // 测试场景2：学历要求高于简历中的学历
    console.log("\n=== 测试场景2：学历要求高于简历中的学历 ===");
    const jobRequirements2 = {
      skills: ["JavaScript", "Vue"],
      experience: "1-3年前端开发经验",
      education: "硕士及以上学历", // 要求硕士，但简历可能是本科
      description: "测试学历硬性要求"
    };

    const result2 = await aliyunBailianService.analyzeResumeForScreening(resumeContent, jobRequirements2);
    console.log("筛选结果:", JSON.stringify(result2, null, 2));

    // 测试场景3：无硬性条件，正常评分
    console.log("\n=== 测试场景3：无硬性条件，正常评分 ===");
    const jobRequirements3 = {
      skills: ["JavaScript", "Vue", "React", "CSS", "HTML"],
      experience: "1-3年前端开发经验",
      education: "本科及以上学历",
      description: "正常评分测试"
    };

    const result3 = await aliyunBailianService.analyzeResumeForScreening(resumeContent, jobRequirements3);
    console.log("筛选结果:", JSON.stringify(result3, null, 2));

  } catch (error) {
    console.error("Test failed:", {
      message: error.message,
      code: error.code,
      stack: error.stack
    });
  }
}

testHardConditions();
