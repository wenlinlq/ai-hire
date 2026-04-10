import api from './api';

// 面试题库类型定义
export interface QuestionBank {
  _id: string;
  title: string;
  type: string;
  category: string;
  teamId: string;
  questions: string[];
  createdAt: string;
  updatedAt: string;
  team?: {
    name: string;
  };
}

// 创建面试题库
export const createQuestionBank = async (data: Omit<QuestionBank, '_id' | 'createdAt' | 'updatedAt' | 'team'>) => {
  return api.post<{ success: boolean; message: string; data: QuestionBank }>('/questionBanks', data);
};

// 获取所有面试题库
export const getAllQuestionBanks = async () => {
  return api.get<{ success: boolean; data: QuestionBank[] }>('/questionBanks');
};

// 根据ID获取面试题库
export const getQuestionBankById = async (id: string) => {
  return api.get<{ success: boolean; data: QuestionBank }>(`/questionBanks/${id}`);
};

// 更新面试题库
export const updateQuestionBank = async (id: string, data: Omit<QuestionBank, '_id' | 'createdAt' | 'updatedAt' | 'team'>) => {
  return api.put<{ success: boolean; message: string; data: QuestionBank }>(`/questionBanks/${id}`, data);
};

// 删除面试题库
export const deleteQuestionBank = async (id: string) => {
  return api.delete<{ success: boolean; message: string }>(`/questionBanks/${id}`);
};

// 根据团队ID获取面试题库
export const getQuestionBanksByTeamId = async (teamId: string) => {
  return api.get<{ success: boolean; data: QuestionBank[] }>(`/questionBanks/team/${teamId}`);
};

// 根据分类获取面试题库
export const getQuestionBanksByCategory = async (category: string) => {
  return api.get<{ success: boolean; data: QuestionBank[] }>(`/questionBanks/category/${category}`);
};

// 搜索面试题库
export const searchQuestionBanks = async (keyword: string) => {
  return api.get<{ success: boolean; data: QuestionBank[] }>(`/questionBanks/search?keyword=${keyword}`);
};