const mongoose = require("mongoose");

// MongoDB 连接配置
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/ai-hire";

async function testAiScreeningData() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI);
    console.log("Connected successfully");

    // 获取 collections
    const db = mongoose.connection.db;
    
    // 检查 deliveries 集合
    console.log("\n=== 检查 deliveries 集合 ===");
    const deliveries = await db.collection("deliveries").find({}).limit(5).toArray();
    console.log(`Found ${deliveries.length} deliveries`);
    
    for (const delivery of deliveries) {
      if (delivery.aiScreening) {
        console.log("\nDelivery ID:", delivery._id);
        console.log("aiScreening:", JSON.stringify(delivery.aiScreening, null, 2));
      }
    }

    // 检查 applications 集合
    console.log("\n=== 检查 applications 集合 ===");
    const applications = await db.collection("applications").find({}).limit(5).toArray();
    console.log(`Found ${applications.length} applications`);
    
    for (const application of applications) {
      if (application.aiScreening || application.aiAnalysis) {
        console.log("\nApplication ID:", application._id);
        console.log("aiScreening:", JSON.stringify(application.aiScreening, null, 2));
        console.log("aiAnalysis:", JSON.stringify(application.aiAnalysis, null, 2));
        console.log("aiScore:", application.aiScore);
      }
    }

    // 关闭连接
    await mongoose.connection.close();
    console.log("\nConnection closed");
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

testAiScreeningData();
