import api from "./api";

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
  // 发送问题（非流式）
  askQuestion: async (
    params: AskQuestionParams,
  ): Promise<AskQuestionResponse> => {
    try {
      const response = await api.post("/aiChat/ask", params);
      return response as AskQuestionResponse;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "发送问题失败");
    }
  },

  // 发送问题（SSE 流式）
  askQuestionStream: async (
    params: AskQuestionParams,
    onChunk: (content: string) => void,
    onError?: (error: Error) => void,
  ): Promise<void> => {
    try {
      const token = localStorage.getItem("token");
      const apiUrl =
        (import.meta.env.VITE_API_URL as string) || "http://localhost:3000";
      const response = await fetch(`${apiUrl}/api/aiChat/ask-stream`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(params),
      });

      if (!response.ok) {
        throw new Error("网络请求失败");
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error("无法获取响应流");
      }

      const decoder = new TextDecoder("utf-8");
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        // 处理 SSE 格式的数据
        const lines = buffer.split("\n\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const data = JSON.parse(line.substring(6));
              if (data.content === "[DONE]") {
                return;
              }
              if (data.content) {
                onChunk(data.content);
              }
              if (data.error) {
                throw new Error(data.error);
              }
            } catch (error) {
              console.error("解析 SSE 数据失败:", error);
            }
          }
        }
      }
    } catch (error) {
      if (onError) {
        onError(error as Error);
      } else {
        throw error;
      }
    }
  },
};

export default aiChatApi;
export type { AskQuestionParams, AskQuestionResponse };
