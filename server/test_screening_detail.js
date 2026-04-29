const mongoose = require("mongoose");

// MongoDB 连接配置
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/ai-hire";

async function testScreeningDetail() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI);
    console.log("Connected successfully");

    // 获取 collections
    const db = mongoose.connection.db;
    
    // 检查最新的有 aiScreening 的 delivery
    console.log("\n=== 检查有 aiScreening 的 delivery ===");
    const delivery = await db.collection("deliveries").findOne({ 
      aiScreening: { $exists: true, $ne: null } 
    });
    
    if (delivery) {
      console.log("\nDelivery ID:", delivery._id);
      console.log("aiScreening:", JSON.stringify(delivery.aiScreening, null, 2));
      
      // 模拟前端数据结构
      const frontendData = {
        ...delivery,
        aiScreening: {
          passed: delivery.aiScreening.passed,
          score: delivery.aiScreening.score,
          details: delivery.aiScreening.details
        }
      };
      
      console.log("\n=== 前端数据结构 ===");
      console.log("aiScore:", frontendData.aiScore);
      console.log("aiScreening.score:", frontendData.aiScreening.score);
      console.log("aiScreening.details:", JSON.stringify(frontendData.aiScreening.details, null, 2));
      console.log("Strengths类型:", frontendData.aiScreening.details.strengths.map(s => typeof s));
    } else {
      console.log("没有找到有 aiScreening 的 delivery 记录");
    }

    // 关闭连接
    await mongoose.connection.close();
    console.log("\nConnection closed");
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

testScreeningDetail();
