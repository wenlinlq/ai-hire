import api from './api';

export const interviewQuestionsApi = {
  // 生成面试问题
  generateQuestions: async (
    type: string,
    subType: string,
    count: number = 5,
  ) => {
    const response = await api.post("/interview-questions/generate-questions", {
      type,
      subType,
      count,
    });
    return response;
  },

  // 生成笔试题
  generateWrittenTest: async (type: string, count: number = 15) => {
    const response = await api.post(
      "/interview-questions/generate-written-test",
      {
        type,
        count,
      },
    );
    return response;
  },
};

export default interviewQuestionsApi;
