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
    
    // 检查 deliveries 集合 - 查找有 aiScreening 的记录
    console.log("\n=== 检查 deliveries 集合（有 aiScreening 的记录）===");
    const deliveries = await db.collection("deliveries").find({ 
      aiScreening: { $exists: true, $ne: null } 
    }).limit(10).toArray();
    console.log(`Found ${deliveries.length} deliveries with aiScreening`);
    
    for (const delivery of deliveries) {
      console.log("\nDelivery ID:", delivery._id);
      console.log("aiScreening:", JSON.stringify(delivery.aiScreening, null, 2));
      console.log("aiScore:", delivery.aiScore);
      console.log("status:", delivery.status);
    }

    // 检查最新的 deliveries 记录
    console.log("\n=== 检查最新的 10 条 deliveries ===");
    const latestDeliveries = await db.collection("deliveries").find({}).sort({ createdAt: -1 }).limit(10).toArray();
    
    for (const delivery of latestDeliveries) {
      console.log("\nDelivery ID:", delivery._id);
      console.log("Created at:", delivery.createdAt);
      console.log("aiScore:", delivery.aiScore);
      console.log("aiScreening:", delivery.aiScreening ? "exists" : "undefined");
      console.log("status:", delivery.status);
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
