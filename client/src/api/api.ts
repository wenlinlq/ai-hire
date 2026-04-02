import axios from "axios";

// 创建axios实例
const api = axios.create({
  baseURL: "http://localhost:3000/api",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// 请求拦截器
api.interceptors.request.use(
  (config) => {
    // 从localStorage获取token
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // 如果是FormData，不设置Content-Type，让浏览器自动处理
    if (config.data instanceof FormData) {
      delete config.headers["Content-Type"];
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// 响应拦截器
api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    // 处理错误
    if (error.response) {
      // 服务器返回错误
      console.error("API Error:", error.response.data);
      // 处理401错误（token无效）
      if (error.response.status === 401) {
        // 清除localStorage中的token和用户信息
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        // 跳转到登录页面
        window.location.href = "/login";
      }
    } else if (error.request) {
      // 请求已发出但没有收到响应
      console.error("Network Error:", error.request);
    } else {
      // 请求配置出错
      console.error("Request Error:", error.message);
    }
    return Promise.reject(error);
  },
);

export default api;
