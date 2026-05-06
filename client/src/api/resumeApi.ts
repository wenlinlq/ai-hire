import axios from "axios";
import { API_BASE_URL } from "./api";

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

interface Education {
  school: string;
  degree: string;
  major: string;
  startDate: string;
  endDate: string;
}

interface Project {
  name: string;
  description: string;
  role: string;
  startDate: string;
  endDate: string;
  technologies: string[];
}

interface Experience {
  company: string;
  position: string;
  description: string;
  startDate: string;
  endDate: string;
}

interface ParsedData {
  name: string;
  phone: string;
  email: string;
  education: Education;
  skills: string[];
  projects: Project[];
  experience: Experience[];
}

interface Resume {
  _id: string;
  studentId: string;
  fileUrl: string;
  fileType: string;
  content: string;
  parsedData: ParsedData;
  parsedAt: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

const resumeApi = {
  // 上传简历
  uploadResume: async (file: File): Promise<Resume> => {
    const formData = new FormData();
    formData.append("resume", file);

    const response = await apiClient.post("/resumes/upload", formData, {
      headers: {
        "Content-Type": undefined,
      },
    });
    return response.data.data;
  },

  // 获取用户的所有简历
  getStudentResumes: async (): Promise<Resume[]> => {
    const response = await apiClient.get("/resumes");
    return response.data.data;
  },

  // 获取用户的当前简历
  getCurrentResume: async (): Promise<Resume | null> => {
    const response = await apiClient.get("/resumes/current");
    return response.data.data;
  },

  // 删除简历
  deleteResume: async (resumeId: string): Promise<void> => {
    await apiClient.delete(`/resumes/${resumeId}`);
  },

  // 设置当前简历
  setCurrentResume: async (resumeId: string): Promise<void> => {
    await apiClient.put(`/resumes/${resumeId}/current`);
  },

  // 更新简历信息
  updateResume: async (
    resumeId: string,
    updateData: Partial<Resume>,
  ): Promise<void> => {
    await apiClient.put(`/resumes/${resumeId}`, updateData);
  },

  // 解析简历
  parseResume: async (resumeContent: string): Promise<any> => {
    const response = await apiClient.post("/resumes/parse", { resumeContent });
    return response.data.data;
  },

  // 上传并解析简历
  uploadAndParseResume: async (formData: FormData): Promise<any> => {
    const response = await apiClient.post("/resumes/parse", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data.data;
  },

  // 优化简历
  optimizeResume: async (
    resumeContent: string,
    prompt: string,
  ): Promise<string> => {
    console.log("=== 前端 API 调用 optimizeResume ===");
    console.log("=== 发送的 resumeContent 长度 ===", resumeContent.length);
    console.log("=== 发送的 prompt ===", prompt);
    console.log("=== 发送的 prompt 长度 ===", prompt.length);

    const response = await apiClient.post("/resumes/optimize", {
      resumeContent,
      prompt,
    });

    console.log("=== API 响应 ===", response.data);

    // 处理可能的多种返回格式
    let optimizedContent = response.data.data;

    // 如果返回的是对象，尝试提取 content 字段
    if (typeof optimizedContent === "object" && optimizedContent !== null) {
      optimizedContent =
        optimizedContent.content ||
        optimizedContent.optimized ||
        JSON.stringify(optimizedContent);
    }

    // 如果是字符串，移除可能的 markdown 代码块标记
    if (typeof optimizedContent === "string") {
      optimizedContent = optimizedContent
        .replace(/^```json\s*/, "")
        .replace(/^```\s*/, "")
        .replace(/\s*```$/, "")
        .trim();
    }

    console.log("=== 处理后的优化内容长度 ===", optimizedContent.length);

    return optimizedContent as string;
  },

  // 一键优化简历
  oneClickOptimizeResume: async (resumeContent: string): Promise<string> => {
    const response = await apiClient.post("/resumes/optimize/one-click", {
      resumeContent,
    });

    // 处理可能的多种返回格式
    let optimizedContent = response.data.data;

    // 如果返回的是对象，尝试提取 content 字段
    if (typeof optimizedContent === "object" && optimizedContent !== null) {
      optimizedContent =
        optimizedContent.content ||
        optimizedContent.optimized ||
        JSON.stringify(optimizedContent);
    }

    // 如果是字符串，移除可能的 markdown 代码块标记
    if (typeof optimizedContent === "string") {
      optimizedContent = optimizedContent
        .replace(/^```json\s*/, "")
        .replace(/^```\s*/, "")
        .replace(/\s*```$/, "")
        .trim();
    }

    return optimizedContent as string;
  },
};

export default resumeApi;
export type { Resume, ParsedData, Education, Project, Experience };
