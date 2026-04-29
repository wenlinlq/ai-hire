const mongoose = require("mongoose");

// MongoDB 连接配置
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/ai-hire";

async function testPositionData() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI);
    console.log("Connected successfully");

    // 获取职位集合
    const db = mongoose.connection.db;
    
    console.log("\n=== 检查职位数据 ===");
    const positions = await db.collection("positions").find({}).limit(5).toArray();
    console.log(`Found ${positions.length} positions`);
    
    for (const position of positions) {
      console.log("\n职位ID:", position._id);
      console.log("职位名称:", position.title);
      console.log("aiResumeFilterSkills:", position.aiResumeFilterSkills || "undefined");
      console.log("requirements:", position.requirements ? JSON.stringify(position.requirements, null, 2) : "undefined");
      console.log("skills:", position.skills || "undefined");
      console.log("education:", position.education || "undefined");
      console.log("experience:", position.experience || "undefined");
    }

    // 关闭连接
    await mongoose.connection.close();
    console.log("\nConnection closed");
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

testPositionData();
