import api from './api';

// 智能问答请求参数
interface AskQuestionParams {
  question: string;
  context?: Array<{
    question: string;
    answer: string;
  }>;
}

// 智能问答响应
interface AskQuestionResponse {
  success: boolean;
  answer: string;
  message?: string;
}

// AI聊天API
const aiChatApi = {
  // 发送问题
  askQuestion: async (params: AskQuestionParams): Promise<AskQuestionResponse> => {
    try {
      const response = await api.post('/aiChat/ask', params);
      return response as AskQuestionResponse;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || '发送问题失败');
    }
  },
};

export default aiChatApi;
export type {
  AskQuestionParams,
  AskQuestionResponse,
};
