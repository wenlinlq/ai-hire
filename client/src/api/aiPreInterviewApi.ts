import api from './api';

// AI预面试相关API
export const aiPreInterviewApi = {
  // 开始AI预面试
  startAiPreInterview: (interviewId: string) => {
    return api.put(`/aiPreInterviews/${interviewId}/start`);
  },

  // 完成AI预面试
  completeAiPreInterview: (interviewId: string, data: {
    score: number;
    questions: Array<{
      questionId: string;
      question: string;
      userAnswer: string;
      score: number;
    }>;
  }) => {
    return api.put(`/aiPreInterviews/${interviewId}/complete`, data);
  },

  // 获取用户的AI预面试记录
  getUserAiPreInterviews: (userId: string) => {
    return api.get(`/aiPreInterviews/user/${userId}`);
  },

  // 获取AI预面试详情
  getAiPreInterviewById: (interviewId: string) => {
    return api.get(`/aiPreInterviews/${interviewId}`);
  },

  // 根据投递ID获取AI预面试记录
  getAiPreInterviewByDeliveryId: (deliveryId: string) => {
    return api.get(`/aiPreInterviews/delivery/${deliveryId}`);
  },

  // 删除AI预面试记录
  deleteAiPreInterview: (interviewId: string) => {
    return api.delete(`/aiPreInterviews/${interviewId}`);
  },
};