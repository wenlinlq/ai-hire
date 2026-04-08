import axios from "axios";

// API基础URL
const API_BASE_URL = "http://localhost:3000/api";

// 从localStorage获取认证token
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

// 报名记录类型定义
export interface Application {
  _id: string;
  positionId: string;
  studentId: string;
  resumeId: string;
  status: string;
  aiScore?: number;
  aiAnalysis?: {
    strengths: string[];
    weaknesses: string[];
    summary: string;
  };
  hrScore?: number;
  hrComment?: string;
  interviewId?: string;
  appliedAt: string;
  updatedAt: string;
}

// 创建报名记录类型
export interface ApplicationCreate {
  positionId: string;
  studentId: string;
  resumeId: string;
  status?: string;
  aiScore?: number;
  aiAnalysis?: {
    strengths: string[];
    weaknesses: string[];
    summary: string;
  };
  hrScore?: number;
  hrComment?: string;
  interviewId?: string;
}

// 更新报名记录类型
export interface ApplicationUpdate {
  positionId?: string;
  studentId?: string;
  resumeId?: string;
  status?: string;
  aiScore?: number;
  aiAnalysis?: {
    strengths: string[];
    weaknesses: string[];
    summary: string;
  };
  hrScore?: number;
  hrComment?: string;
  interviewId?: string;
}

// 报名记录API
export default {
  // 获取所有报名记录
  getApplications: async (): Promise<Application[]> => {
    const response = await apiClient.get("/applications");
    return response.data.data || [];
  },

  // 根据团队ID获取报名记录
  getApplicationsByTeam: async (teamId: string): Promise<Application[]> => {
    const response = await apiClient.get(`/applications/team/${teamId}`);
    return response.data.data || [];
  },

  // 获取单个报名记录
  getApplicationById: async (id: string): Promise<Application> => {
    const response = await apiClient.get(`/applications/${id}`);
    return response.data.data;
  },

  // 获取岗位的所有报名记录
  getApplicationsByPosition: async (
    positionId: string,
  ): Promise<Application[]> => {
    const response = await apiClient.get(
      `/applications/position/${positionId}`,
    );
    return response.data.data;
  },

  // 获取学生的所有报名记录
  getApplicationsByStudent: async (
    studentId: string,
  ): Promise<Application[]> => {
    const response = await apiClient.get(`/applications/student/${studentId}`);
    return response.data.data;
  },

  // 创建报名记录
  createApplication: async (
    application: ApplicationCreate,
  ): Promise<Application> => {
    const response = await apiClient.post("/applications", application);
    return response.data.data;
  },

  // 更新报名记录
  updateApplication: async (
    id: string,
    application: ApplicationUpdate,
  ): Promise<Application> => {
    const response = await apiClient.put(`/applications/${id}`, application);
    return response.data.data;
  },

  // 删除报名记录
  deleteApplication: async (id: string): Promise<boolean> => {
    const response = await apiClient.delete(`/applications/${id}`);
    return response.data.success;
  },

  // 根据状态获取报名记录
  getApplicationsByStatus: async (status: string): Promise<Application[]> => {
    const response = await apiClient.get(`/applications?status=${status}`);
    return response.data.data;
  },

  // 导入候选人
  importCandidate: async (formData: any): Promise<Application> => {
    const response = await apiClient.post("/applications/import", formData);
    return response.data.data;
  },
};
