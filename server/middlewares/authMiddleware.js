// 导入jsonwebtoken库，用于验证token
const jwt = require("jsonwebtoken");

// 定义JWT密钥，实际应用中应该从环境变量中获取
const JWT_SECRET = "your-secret-key";

// 生成token的函数
function generateToken(user) {
  // 创建payload，包含用户ID、用户名和角色
  const payload = {
    id: user._id,
    username: user.username,
    role: user.role,
  };

  // 生成token，设置过期时间为24小时
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "24h" });
}

// 验证token的中间件
function verifyToken(req, res, next) {
  // 从请求头获取token
  const token = req.headers.authorization?.split(" ")[1];

  // 如果没有token，返回401错误
  if (!token) {
    return res.status(401).json({
      success: false,
      message: "未提供认证token",
    });
  }

  try {
    // 验证token
    const decoded = jwt.verify(token, JWT_SECRET);

    // 将解码后的用户信息添加到请求对象中
    req.user = decoded;

    // 继续处理请求
    next();
  } catch (error) {
    // token验证失败
    return res.status(401).json({
      success: false,
      message: "无效的token",
    });
  }
}

// 导出函数
module.exports = {
  generateToken,
  verifyToken,
};
