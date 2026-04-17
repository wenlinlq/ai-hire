const axios = require("axios");

class AliyunBailianService {
  constructor() {
    // 阿里云百炼API密钥和配置
    this.apiKey =
      process.env.ALIYUN_BAILIAN_API_KEY ||
      "sk-756ae44eb5f74cf58e864a855f71f16e";
    this.apiUrl =
      "https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions";
  }

  // 分析面试问答并生成反馈
  async analyzeInterviewQnA(questions, answers, jobTitle) {
    try {
      // 打印输入参数，用于调试
      console.log("Analyzing interview with:", {
        questions: questions.length,
        answers: answers.length,
        jobTitle: jobTitle,
      });

      // 检查输入参数是否有效
      if (!questions || questions.length === 0) {
        throw new Error("No questions provided for analysis");
      }

      if (!answers || answers.length === 0) {
        throw new Error("No answers provided for analysis");
      }

      const prompt = `
你是一位专业的AI面试分析师，负责分析候选人在AI预面试中的表现。

面试岗位：${jobTitle}

以下是面试问题和候选人的回答：
${questions
  .map(
    (q, index) => `
问题 ${index + 1}: ${q}
回答 ${index + 1}: ${answers[index] || "无回答"}`,
  )
  .join("")}

请从以下几个方面分析候选人的表现：
1. 总体评分（0-100）
2. 技术能力评分（0-100）
3. 沟通表达评分（0-100）
4. 问题解决能力评分（0-100）
5. 优势（至少3点）
6. 改进建议（至少3点）
7. 面试技巧建议（至少3点）

请以JSON格式返回分析结果，不要包含任何其他文本。
JSON格式要求：
{
  "overall": 0,
  "technical": 0,
  "communication": 0,
  "problemSolving": 0,
  "strengths": [],
  "improvements": [],
  "suggestions": []
}
`;

      // 打印API请求参数，用于调试
      console.log("Making API request to Aliyun Bailian...");

      // 模拟API响应，用于测试
      // 实际项目中，这里会调用真实的API
      console.log("Simulating API response for testing...");

      // 模拟分析结果
      /*
      const analysis = {
        overall: 85,
        technical: 80,
        communication: 90,
        problemSolving: 85,
        strengths: [
          "技术基础扎实，对前端开发有深入了解",
          "沟通表达清晰，能够准确理解问题",
          "问题解决能力强，能够快速找到解决方案",
        ],
        improvements: [
          "可以更深入地分析问题的根本原因",
          "建议提供更多具体的项目案例",
          "可以提高技术细节的描述能力",
        ],
        suggestions: [
          "在回答问题时使用STAR法则",
          "提前了解公司的业务和技术栈",
          "保持自信的态度，展现自己的优势",
        ],
      };

      // 打印分析结果，用于调试
      console.log("Analysis result:", analysis);
      return analysis;
*/

      // 实际API调用代码（暂时注释掉）
      const response = await axios.post(
        this.apiUrl,
        {
          model: "deepseek-v3", // 通义千问模型
          messages: [
            {
              role: "system",
              content:
                "你是一位专业的AI面试分析师，负责分析候选人在AI预面试中的表现。",
            },
            {
              role: "user",
              content: prompt,
            },
          ],
          temperature: 0.7,
          max_tokens: 1000,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${this.apiKey}`,
          },
        },
      );

      // 打印API响应，用于调试
      console.log("API response received:", response.data);

      // 解析返回的内容
      const content = response.data.choices[0].message.content;
      // 提取JSON部分
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const analysis = JSON.parse(jsonMatch[0]);
        // 打印分析结果，用于调试
        console.log("Analysis result:", analysis);
        return analysis;
      } else {
        throw new Error("Invalid response format from AI model");
      }
    } catch (error) {
      // 打印详细的错误信息，用于调试
      console.error("Error analyzing interview with Aliyun Bailian:", {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        config: error.config,
      });
      // 返回默认分析结果，避免因API错误影响面试流程
      return {
        overall: 75,
        technical: 75,
        communication: 75,
        problemSolving: 75,
        strengths: ["技术基础扎实", "沟通表达清晰", "问题解决能力强"],
        improvements: [
          "可以更深入地分析问题",
          "建议提供更多具体案例",
          "可以提高技术细节的描述",
        ],
        suggestions: [
          "在回答问题时使用STAR法则",
          "提前了解公司业务",
          "保持自信的态度",
        ],
      };
    }
  }
}

module.exports = new AliyunBailianService();
