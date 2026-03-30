import api from "./api";

// 团队信息
interface Team {
  _id: string;
  name: string;
  description: string;
  logo: string;
  leader: string;
  contact: string;
  members: string[];
  createdAt: Date;
  updatedAt: Date;
}

// 创建团队请求参数
interface CreateTeamParams {
  name: string;
  department: string;
  description: string;
  leaderId: string;
  logo: string;
  contact: {
    phone: string;
  };
}

// 团队API
const teamApi = {
  // 获取所有团队
  getTeams: async (): Promise<Team[]> => {
    try {
      const response = await api.get("/teams");
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "获取团队列表失败");
    }
  },

  // 获取团队详情
  getTeamById: async (id: string): Promise<Team> => {
    try {
      const response = await api.get(`/teams/${id}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "获取团队详情失败");
    }
  },

  // 创建团队
  createTeam: async (params: CreateTeamParams): Promise<Team> => {
    try {
      const response = await api.post("/teams", params);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "创建团队失败");
    }
  },

  // 更新团队信息
  updateTeam: async (id: string, data: Partial<CreateTeamParams>): Promise<boolean> => {
    try {
      const response = await api.put(`/teams/${id}`, data);
      return response.success;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "更新团队失败");
    }
  },

  // 删除团队
  deleteTeam: async (id: string): Promise<boolean> => {
    try {
      const response = await api.delete(`/teams/${id}`);
      return response.success;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "删除团队失败");
    }
  },
};

export default teamApi;
export type { Team, CreateTeamParams };