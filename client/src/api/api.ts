import axios from "axios";

// 根据环境确定API地址
// 开发模式默认使用本地地址，生产模式使用环境变量或默认公网地址
const getBaseUrl = () => {
  // 优先使用环境变量
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }
  // 开发模式默认使用本地地址
  if (import.meta.env.DEV) {
    return "http://localhost:3000/api";
  }
  // 生产模式默认使用公网地址
  return "http://47.109.205.191:3000/api";
};

// 创建axios实例
const api = axios.create({
  baseURL: getBaseUrl(),
  timeout: 300000, // 5分钟，支持AI简历筛选等耗时操作
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

// 流式请求函数
export const streamRequest = async (
  url: string,
  data: any,
  onMessage: (content: string) => void,
  onError?: (error: Error) => void,
  onDone?: () => void,
) => {
  try {
    const token = localStorage.getItem("token");

    const response = await fetch(`${api.defaults.baseURL}${url}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error("Response body is not readable");
    }

    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();

      if (done) {
        break;
      }

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";

      for (const line of lines) {
        if (line.trim() === "") continue;

        if (line.startsWith("data: ")) {
          const dataStr = line.substring(6);

          // 检查是否是[DONE]标记
          if (dataStr === "[DONE]") {
            onDone?.();
            return;
          }

          // 尝试解析JSON
          try {
            const parsed = JSON.parse(dataStr);
            if (parsed.content) {
              onMessage(parsed.content);
            }
            if (parsed.error) {
              throw new Error(parsed.error);
            }
          } catch (e) {
            // 忽略解析错误，继续处理
            // 如果是DONE标记的解析错误，不用处理
            if (dataStr === "[DONE]") {
              onDone?.();
              return;
            }
          }
        }
      }
    }

    // 如果循环正常结束但还没有调用onDone，调用它
    onDone?.();
  } catch (error) {
    onError?.(error as Error);
  }
};
