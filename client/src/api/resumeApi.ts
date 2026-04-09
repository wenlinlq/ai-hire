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
        "Content-Type": "multipart/form-data",
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
  updateResume: async (resumeId: string, updateData: Partial<Resume>): Promise<void> => {
    await apiClient.put(`/resumes/${resumeId}`, updateData);
  },
};

export default resumeApi;
export type { Resume, ParsedData, Education, Project, Experience };
