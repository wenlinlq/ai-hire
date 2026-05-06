import axios from "axios";
import { API_BASE_URL } from './api';

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

interface Position {
  _id: string;
  title: string;
  type: string;
  department: string;
  quota: number;
  salary: string;
  interviewType: string;
  requirements: {
    skills: string[];
    experience: string;
    education: string;
    description: string;
  };
  responsibilities: string[];
  benefits: string[];
  status: string;
  deadline: string;
  viewCount: number;
  applyCount: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  teamId: string;
  aiPreInterview?: boolean;
}

interface PositionCreate {
  title: string;
  type: string;
  department: string;
  quota: number;
  salary: string;
  interviewType: string;
  requirements: {
    skills: string[];
    experience: string;
    education: string;
    description: string;
  };
  responsibilities: string[];
  benefits: string[];
  status: string;
  deadline: string;
  teamId: string;
  aiPreInterview?: boolean;
}

interface PositionUpdate {
  title?: string;
  type?: string;
  department?: string;
  quota?: number;
  salary?: string;
  interviewType?: string;
  requirements?: {
    skills?: string[];
    experience?: string;
    education?: string;
    description?: string;
  };
  responsibilities?: string[];
  benefits?: string[];
  status?: string;
  deadline?: string;
  teamId?: string;
  aiPreInterview?: boolean;
}

const positionApi = {
  // 获取职位列表
  getPositions: async (): Promise<Position[]> => {
    const response = await apiClient.get("/positions");
    // 服务器返回的是 { success: boolean, message: string, data: Position[] }
    return response.data.data || [];
  },

  // 根据团队ID获取职位列表
  getPositionsByTeam: async (teamId: string): Promise<Position[]> => {
    const response = await apiClient.get(`/positions/team/${teamId}`);
    // 服务器返回的是 { success: boolean, message: string, data: Position[] }
    return response.data.data || [];
  },

  // 获取单个职位
  getPosition: async (id: string): Promise<Position> => {
    const response = await apiClient.get(`/positions/${id}`);
    // 服务器返回的是 { success: boolean, message: string, data: Position }
    return response.data.data;
  },

  // 创建职位
  createPosition: async (position: PositionCreate): Promise<Position> => {
    const response = await apiClient.post("/positions", position);
    // 服务器返回的是 { success: boolean, message: string, data: Position }
    return response.data.data;
  },

  // 更新职位
  updatePosition: async (
    id: string,
    position: PositionUpdate,
  ): Promise<Position> => {
    const response = await apiClient.put(`/positions/${id}`, position);
    // 服务器返回的是 { success: boolean, message: string, data: Position }
    return response.data.data;
  },

  // 删除职位
  deletePosition: async (id: string): Promise<void> => {
    await apiClient.delete(`/positions/${id}`);
  },

  // 申请职位
  applyPosition: async (id: string): Promise<void> => {
    await apiClient.post(`/positions/${id}/apply`);
  },
};

export default positionApi;
export type { Position };
