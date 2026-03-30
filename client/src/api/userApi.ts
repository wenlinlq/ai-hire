import api from "./api";

// 登录请求参数
interface LoginParams {
  username: string;
  password: string;
}

// 注册请求参数
interface RegisterParams {
  username: string;
  password: string;
  email: string;
  role?: string;
  phone?: string;
}

// 用户信息
interface User {
  _id: string;
  username: string;
  email: string;
  role: string;
  phone?: string;
  team?: string;
  avatar?: string;
  status: string;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// 登录响应
interface LoginResponse {
  user: User;
  token?: string;
  message: string;
}

// 注册响应
interface RegisterResponse {
  user: User;
  message: string;
}

// 用户API
const userApi = {
  // 登录
  login: async (params: LoginParams): Promise<LoginResponse> => {
    try {
      const response = await api.post("/users/login", params);
      // 保存token到localStorage
      if (response.token) {
        localStorage.setItem("token", response.token);
      }
      // 保存用户信息到localStorage
      localStorage.setItem("user", JSON.stringify(response.data));
      return {
        user: response.data,
        token: response.token,
        message: response.message,
      };
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "登录失败");
    }
  },

  // 注册
  register: async (params: RegisterParams): Promise<RegisterResponse> => {
    try {
      const response = await api.post("/users/register", params);
      return {
        user: response.data,
        message: response.message,
      };
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "注册失败");
    }
  },

  // 退出登录
  logout: (): void => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  },

  // 获取当前用户信息
  getCurrentUser: (): User | null => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      return JSON.parse(userStr);
    }
    return null;
  },

  // 检查是否已登录
  isLoggedIn: (): boolean => {
    return !!localStorage.getItem("token");
  },

  // 获取用户列表
  getUsers: async (): Promise<User[]> => {
    try {
      const response = await api.get("/users");
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "获取用户列表失败");
    }
  },

  // 获取用户详情
  getUserById: async (id: string): Promise<User> => {
    try {
      const response = await api.get(`/users/${id}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "获取用户详情失败");
    }
  },

  // 更新用户信息
  updateUser: async (id: string, data: Partial<User>): Promise<boolean> => {
    try {
      const response = await api.put(`/users/${id}`, data);
      return response.success;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "更新用户失败");
    }
  },

  // 删除用户
  deleteUser: async (id: string): Promise<boolean> => {
    try {
      const response = await api.delete(`/users/${id}`);
      return response.success;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "删除用户失败");
    }
  },
};

export default userApi;
export type {
  LoginParams,
  RegisterParams,
  User,
  LoginResponse,
  RegisterResponse,
};
