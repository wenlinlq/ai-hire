const { MongoClient } = require("mongodb");
// 加载环境变量配置文件
require("dotenv").config();
// 配置变量
const url = process.env.MONGODB_URI || "mongodb://localhost:27017";
const dbName = process.env.DB_NAME || "ai-hire";

let db;
let client;

/**
 * 连接数据库
 */
async function connectDB() {
  try {
    client = new MongoClient(url);
    await client.connect();
    db = client.db(dbName);
    console.log(`MongoDB 连接成功！`);
    return db;
  } catch (err) {
    console.error("MongoDB 连接失败:", err.message);
    process.exit(1);
  }
}

/**
 * 获取数据库实例
 */
function getDB() {
  if (!db) {
    throw new Error("数据库未连接，请先调用 connectDB()");
  }
  return db;
}

/**
 * 获取 MongoDB 客户端（用于事务等高级操作）
 */
function getClient() {
  if (!client) {
    throw new Error("数据库未连接，请先调用 connectDB()");
  }
  return client;
}

/**
 * 关闭数据库连接
 */
async function closeDB() {
  if (client) {
    await client.close();
    console.log("数据库连接已关闭");
  }
}

module.exports = { connectDB, getDB, getClient, closeDB };
