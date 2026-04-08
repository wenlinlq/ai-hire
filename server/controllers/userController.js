// 导入用户模型，用于操作数据库
const userModel = require("../models/userModel");
// 导入认证中间件，用于生成token
const { generateToken } = require("../middlewares/authMiddleware");

// 定义用户控制器类，处理所有用户相关的HTTP请求
class UserController {
  // 创建用户（管理员操作）
  async createUser(req, res) {
    try {
      // 从请求体中解构获取用户信息
      const { username, password, email, phone, role, avatar, status } =
        req.body;

      // 验证必填字段：用户名、密码、邮箱和角色不能为空
      if (!username || !password || !email || !role) {
        // 返回400错误，缺少必填字段
        return res.status(400).json({
          success: false,
          message: "用户名、密码、邮箱和角色为必填项",
        });
      }

      // 检查用户名是否已被注册
      const existingUser = await userModel.findUserByUsername(username);
      if (existingUser) {
        // 用户名已存在，返回400错误
        return res.status(400).json({
          success: false,
          message: "用户名已存在",
        });
      }

      // 检查邮箱是否已被注册
      const existingEmail = await userModel.findUserByEmail(email);
      if (existingEmail) {
        // 邮箱已被注册，返回400错误
        return res.status(400).json({
          success: false,
          message: "邮箱已被注册",
        });
      }

      // 调用模型创建用户
      const user = await userModel.createUser({
        username,
        password,
        email,
        phone,
        role,
        avatar,
        status,
      });

      // 使用解构赋值移除密码字段，避免返回敏感信息
      // _ 是占位符，表示我们不使用的密码字段
      const { password: _, ...userWithoutPassword } = user;

      // 返回201 Created状态码，表示资源创建成功
      res.status(201).json({
        success: true,
        message: "用户创建成功",
        data: userWithoutPassword, // 返回不包含密码的用户信息
      });
    } catch (error) {
      // 捕获并记录服务器错误
      console.error("创建用户失败:", error);
      // 返回500服务器内部错误
      res.status(500).json({
        success: false,
        message: "服务器内部错误",
      });
    }
  }

  // 根据ID获取用户详情
  async getUserById(req, res) {
    try {
      // 从URL参数中获取用户ID
      const { id } = req.params;

      // 调用模型查找用户
      const user = await userModel.findUserById(id);
      if (!user) {
        // 用户不存在，返回404 Not Found
        return res.status(404).json({
          success: false,
          message: "用户不存在",
        });
      }

      // 处理旧数据：如果team字段是字符串（团队名称），则转换为团队ID
      if (user.team && typeof user.team === "string") {
        const teamModel = require("../models/teamModel");
        const team = await teamModel.findTeamByName(user.team);
        if (team) {
          // 更新用户的team字段为团队ID
          await userModel.updateUser(user._id.toString(), {
            team: team._id.toString(),
          });
          user.team = team._id.toString();
        } else {
          // 如果团队不存在，清空team字段
          await userModel.updateUser(user._id.toString(), { team: null });
          user.team = null;
        }
      }

      // 确保team字段是字符串格式
      if (user.team && typeof user.team === "object") {
        user.team = user.team.toString();
      }

      // 移除密码字段，保护用户隐私
      const { password: _, ...userWithoutPassword } = user;

      // 返回200 OK状态码和用户信息
      res.status(200).json({
        success: true,
        data: userWithoutPassword,
      });
    } catch (error) {
      // 捕获并记录错误
      console.error("获取用户详情失败:", error);
      // 返回500服务器错误
      res.status(500).json({
        success: false,
        message: "服务器内部错误",
      });
    }
  }

  // 更新用户信息
  async updateUser(req, res) {
    try {
      // 从URL参数获取用户ID
      const { id } = req.params;
      // 获取请求体中的更新数据
      const updateData = req.body;

      // 检查用户是否存在
      const existingUser = await userModel.findUserById(id);
      if (!existingUser) {
        // 用户不存在，返回404
        return res.status(404).json({
          success: false,
          message: "用户不存在",
        });
      }

      // 如果要更新用户名，且新用户名与原用户名不同，需要检查是否已被占用
      if (
        updateData.username &&
        updateData.username !== existingUser.username
      ) {
        // 检查新用户名是否已存在
        const usernameExists = await userModel.findUserByUsername(
          updateData.username,
        );
        if (usernameExists) {
          // 用户名已被占用，返回400
          return res.status(400).json({
            success: false,
            message: "用户名已存在",
          });
        }
      }

      // 如果要更新邮箱，且新邮箱与原邮箱不同，需要检查是否已被注册
      if (updateData.email && updateData.email !== existingUser.email) {
        // 检查新邮箱是否已被使用
        const emailExists = await userModel.findUserByEmail(updateData.email);
        if (emailExists) {
          // 邮箱已被注册，返回400
          return res.status(400).json({
            success: false,
            message: "邮箱已被注册",
          });
        }
      }

      // 调用模型更新用户信息
      const updated = await userModel.updateUser(id, updateData);
      if (!updated) {
        // 更新失败，返回400
        return res.status(400).json({
          success: false,
          message: "更新用户失败",
        });
      }

      // 获取更新后的用户信息
      const updatedUser = await userModel.findUserById(id);
      // 移除密码字段
      const { password: _, ...userWithoutPassword } = updatedUser;

      // 返回200 OK和更新后的用户信息
      res.status(200).json({
        success: true,
        message: "用户更新成功",
        data: userWithoutPassword,
      });
    } catch (error) {
      // 捕获并记录错误
      console.error("更新用户失败:", error);
      // 返回500服务器错误
      res.status(500).json({
        success: false,
        message: "服务器内部错误",
      });
    }
  }

  // 删除用户（硬删除）
  async deleteUser(req, res) {
    try {
      // 从URL参数获取用户ID
      const { id } = req.params;

      // 检查用户是否存在
      const existingUser = await userModel.findUserById(id);
      if (!existingUser) {
        // 用户不存在，返回404
        return res.status(404).json({
          success: false,
          message: "用户不存在",
        });
      }

      // 调用模型删除用户
      const deleted = await userModel.deleteUser(id);
      if (!deleted) {
        // 删除失败，返回400
        return res.status(400).json({
          success: false,
          message: "删除用户失败",
        });
      }

      // 返回200 OK，表示删除成功
      res.status(200).json({
        success: true,
        message: "用户删除成功",
      });
    } catch (error) {
      // 捕获并记录错误
      console.error("删除用户失败:", error);
      // 返回500服务器错误
      res.status(500).json({
        success: false,
        message: "服务器内部错误",
      });
    }
  }

  // 获取所有用户（不分页）
  async getAllUsers(req, res) {
    try {
      // 调用模型获取所有用户
      const users = await userModel.findAllUsers();
      const teamModel = require("../models/teamModel");

      // 处理每个用户的数据
      const usersWithoutPassword = await Promise.all(
        users.map(async ({ password, ...user }) => {
          // 处理旧数据：如果team字段是字符串（团队名称），则转换为团队ID
          if (user.team && typeof user.team === "string") {
            const team = await teamModel.findTeamByName(user.team);
            if (team) {
              // 更新用户的team字段为团队ID
              await userModel.updateUser(user._id.toString(), {
                team: team._id.toString(),
              });
              user.team = team._id.toString();
            } else {
              // 如果团队不存在，清空team字段
              await userModel.updateUser(user._id.toString(), { team: null });
              user.team = null;
            }
          }
          // 确保team字段是字符串格式
          if (user.team && typeof user.team === "object") {
            user.team = user.team.toString();
          }
          return user;
        }),
      );

      // 返回200 OK和用户列表
      res.status(200).json({
        success: true,
        data: usersWithoutPassword,
      });
    } catch (error) {
      // 捕获并记录错误
      console.error("获取所有用户失败:", error);
      // 返回500服务器错误
      res.status(500).json({
        success: false,
        message: "服务器内部错误",
      });
    }
  }

  // 分页获取用户列表
  async getUsersWithPagination(req, res) {
    try {
      // 从查询参数获取页码，默认为1，使用parseInt转换为整数
      const page = parseInt(req.query.page) || 1;
      // 从查询参数获取每页数量，默认为10
      const limit = parseInt(req.query.limit) || 10;
      // 从查询参数获取角色筛选条件
      const role = req.query.role;

      // 构建过滤条件对象
      const filter = {};
      if (role) {
        // 如果有角色参数，添加到过滤条件中
        filter.role = role;
      }

      // 调用模型的分页查询方法
      const result = await userModel.findUsersWithPagination(
        page,
        limit,
        filter,
      );
      const teamModel = require("../models/teamModel");

      // 处理每个用户的数据
      const usersWithoutPassword = await Promise.all(
        result.users.map(async ({ password, ...user }) => {
          // 处理旧数据：如果team字段是字符串（团队名称），则转换为团队ID
          if (user.team && typeof user.team === "string") {
            const team = await teamModel.findTeamByName(user.team);
            if (team) {
              // 更新用户的team字段为团队ID
              await userModel.updateUser(user._id.toString(), {
                team: team._id.toString(),
              });
              user.team = team._id.toString();
            } else {
              // 如果团队不存在，清空team字段
              await userModel.updateUser(user._id.toString(), { team: null });
              user.team = null;
            }
          }
          // 确保team字段是字符串格式
          if (user.team && typeof user.team === "object") {
            user.team = user.team.toString();
          }
          return user;
        }),
      );

      // 返回200 OK和分页数据
      res.status(200).json({
        success: true,
        data: {
          users: usersWithoutPassword, // 当前页的用户列表
          total: result.total, // 总记录数
          page: result.page, // 当前页码
          limit: result.limit, // 每页数量
          totalPages: result.totalPages, // 总页数
        },
      });
    } catch (error) {
      // 捕获并记录错误
      console.error("分页获取用户失败:", error);
      // 返回500服务器错误
      res.status(500).json({
        success: false,
        message: "服务器内部错误",
      });
    }
  }

  // 根据角色获取用户列表
  async getUsersByRole(req, res) {
    try {
      // 从URL参数获取角色名称
      const { role } = req.params;

      // 调用模型根据角色查询用户
      const users = await userModel.findUsersByRole(role);

      // 移除所有用户的密码字段
      const usersWithoutPassword = users.map(({ password, ...user }) => user);

      // 返回200 OK和用户列表
      res.status(200).json({
        success: true,
        data: usersWithoutPassword,
      });
    } catch (error) {
      // 捕获并记录错误
      console.error("根据角色获取用户失败:", error);
      // 返回500服务器错误
      res.status(500).json({
        success: false,
        message: "服务器内部错误",
      });
    }
  }

  // 用户登录验证
  async login(req, res) {
    try {
      // 从请求体获取用户名和密码
      const { username, password } = req.body;

      // 验证用户名和密码是否都提供了
      if (!username || !password) {
        // 缺少必填字段，返回400
        return res.status(400).json({
          success: false,
          message: "用户名和密码为必填项",
        });
      }

      // 根据用户名查找用户
      const user = await userModel.findUserByUsername(username);
      if (!user) {
        // 用户不存在，返回401 Unauthorized（模糊提示，不暴露具体信息）
        return res.status(401).json({
          success: false,
          message: "用户名或密码错误",
        });
      }

      // 处理旧数据：如果team字段是字符串（团队名称），则转换为团队ID
      if (user.team && typeof user.team === "string") {
        const teamModel = require("../models/teamModel");
        const team = await teamModel.findTeamByName(user.team);
        if (team) {
          // 更新用户的team字段为团队ID
          await userModel.updateUser(user._id.toString(), {
            team: team._id.toString(),
          });
          user.team = team._id.toString();
        } else {
          // 如果团队不存在，清空team字段
          await userModel.updateUser(user._id.toString(), { team: null });
          user.team = null;
        }
      }

      // 检查用户账号状态
      if (user.status !== "active") {
        // 账号被禁用，返回403 Forbidden
        return res.status(403).json({
          success: false,
          message: "用户账号已被禁用",
        });
      }

      // 验证密码是否正确
      const passwordMatch = await userModel.verifyPassword(user, password);
      if (!passwordMatch) {
        // 密码错误，返回401
        return res.status(401).json({
          success: false,
          message: "用户名或密码错误",
        });
      }

      // 登录成功，更新用户的最后登录时间
      await userModel.updateLastLogin(user._id);

      // 移除密码字段，避免返回敏感信息
      const { password: _, ...userWithoutPassword } = user;

      // 确保team字段是字符串格式
      if (
        userWithoutPassword.team &&
        typeof userWithoutPassword.team === "object"
      ) {
        userWithoutPassword.team = userWithoutPassword.team.toString();
      }

      // 生成token
      const token = generateToken(user);

      console.log("登录返回的用户信息:", userWithoutPassword);

      // 返回200 OK、用户信息和token
      res.status(200).json({
        success: true,
        message: "登录成功",
        data: userWithoutPassword,
        token: token,
      });
    } catch (error) {
      // 捕获并记录错误
      console.error("登录失败:", error);
      // 返回500服务器错误
      res.status(500).json({
        success: false,
        message: "服务器内部错误",
      });
    }
  }

  // 用户注册
  async register(req, res) {
    try {
      // 从请求体获取注册信息，角色默认为"student"
      const { username, password, email, phone, role = "student" } = req.body;

      // 验证必填字段
      if (!username || !password || !email) {
        // 缺少必填字段，返回400
        return res.status(400).json({
          success: false,
          message: "用户名、密码和邮箱为必填项",
        });
      }

      // 检查用户名是否已被注册
      const existingUser = await userModel.findUserByUsername(username);
      if (existingUser) {
        // 用户名已存在，返回400
        return res.status(400).json({
          success: false,
          message: "用户名已存在",
        });
      }

      // 检查邮箱是否已被注册
      const existingEmail = await userModel.findUserByEmail(email);
      if (existingEmail) {
        // 邮箱已存在，返回400
        return res.status(400).json({
          success: false,
          message: "邮箱已被注册",
        });
      }

      // 创建新用户，状态默认为active（激活）
      const user = await userModel.createUser({
        username,
        password,
        email,
        phone,
        role,
        status: "active", // 新注册用户默认激活
      });

      // 移除密码字段
      const { password: _, ...userWithoutPassword } = user;

      // 返回201 Created，表示注册成功
      res.status(201).json({
        success: true,
        message: "注册成功",
        data: userWithoutPassword,
      });
    } catch (error) {
      // 捕获并记录错误
      console.error("注册失败:", error);
      // 返回500服务器错误
      res.status(500).json({
        success: false,
        message: "服务器内部错误",
      });
    }
  }
}

// 导出UserController的单例实例
// 使用new UserController()确保整个应用共享同一个控制器实例
module.exports = new UserController();
