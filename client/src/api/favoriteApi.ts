import axios from "axios";

const API_BASE_URL = "http://localhost:3000/api";

// 获取认证token
const getAuthToken = (): string | null => {
  return localStorage.getItem("token");
};

// 创建axios实例，添加认证头
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// 请求拦截器，添加认证token
apiClient.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

interface Favorite {
  _id: string;
  userId: string;
  positionId: string;
  createdAt: string;
}

const favoriteApi = {
  // 添加收藏
  addFavorite: async (userId: string, positionId: string): Promise<Favorite> => {
    const response = await apiClient.post("/favorites", {
      userId,
      positionId,
    });
    return response.data.data;
  },

  // 取消收藏
  removeFavorite: async (userId: string, positionId: string): Promise<void> => {
    await apiClient.delete("/favorites", {
      data: {
        userId,
        positionId,
      },
    });
  },

  // 检查是否收藏
  checkFavorite: async (userId: string, positionId: string): Promise<boolean> => {
    const response = await apiClient.get("/favorites/check", {
      params: {
        userId,
        positionId,
      },
    });
    return response.data.data.isFavorite;
  },

  // 获取用户收藏列表
  getUserFavorites: async (userId: string): Promise<string[]> => {
    const response = await apiClient.get("/favorites/user", {
      params: {
        userId,
      },
    });
    return response.data.data;
  },
};

export default favoriteApi;
