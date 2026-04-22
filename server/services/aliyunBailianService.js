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

      // 实际API调用代码
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

  // 解析简历内容
  async parseResume(resumeContent) {
    try {
      console.log("Parsing resume...");

      if (!resumeContent || resumeContent.length === 0) {
        throw new Error("No resume content provided");
      }

      // 限制输入内容长度，避免超出API限制
      const maxContentLength = 10000; // 限制为10,000字符，确保prompt不会过大
      const truncatedContent =
        resumeContent.length > maxContentLength
          ? resumeContent.substring(0, maxContentLength) + "\n\n[内容已截断]"
          : resumeContent;

      // 计算内容长度，用于调试
      console.log(`Original content length: ${resumeContent.length}`);
      console.log(`Truncated content length: ${truncatedContent.length}`);

      const prompt = `
你是一位专业的简历解析专家，负责从简历文本中提取关键信息，并对简历质量进行分析评估。

请从以下简历内容中提取结构化信息并进行质量分析：
${truncatedContent}

请提取以下信息：
1. 姓名
2. 联系方式（电话、邮箱等）
3. 教育背景（学校、专业、学位、毕业时间）
4. 工作经历（公司、职位、工作时间、主要职责和成就）
5. 项目经验（项目名称、时间、角色、主要职责和成就）
6. 技能（技术技能、软技能等）
7. 证书和荣誉

同时，请对简历质量进行评估：
1. 整体评分（0-100分）
2. 优点分析（至少3点）
3. 改进建议（至少3点）
4. 具体的修改意见（针对简历中需要改进的部分）

请以JSON格式返回解析结果，不要包含任何其他文本。
JSON格式要求：
{
  "name": "",
  "contact": {
    "phone": "",
    "email": "",
    "other": ""
  },
  "education": [
    {
      "school": "",
      "major": "",
      "degree": "",
      "graduationDate": ""
    }
  ],
  "workExperience": [
    {
      "company": "",
      "position": "",
      "startDate": "",
      "endDate": "",
      "responsibilities": [""],
      "achievements": [""]
    }
  ],
  "projectExperience": [
    {
      "name": "",
      "startDate": "",
      "endDate": "",
      "role": "",
      "responsibilities": [""],
      "achievements": [""]
    }
  ],
  "skills": {
    "technical": [""],
    "soft": [""]
  },
  "certifications": [""],
  "honors": [""],
  "analysis": {
    "score": 0,
    "strengths": [""],
    "improvements": [""],
    "suggestions": [""]
  }
}
`;

      // 计算prompt长度，用于调试
      console.log(`Prompt length: ${prompt.length}`);

      const response = await axios.post(
        this.apiUrl,
        {
          model: "qwen-max", // 使用Qwen-Max模型
          messages: [
            {
              role: "system",
              content:
                "你是一位专业的简历解析专家，负责从简历文本中提取关键信息。",
            },
            {
              role: "user",
              content: prompt,
            },
          ],
          temperature: 0.3,
          max_tokens: 2000, // 一次解析最多消耗2000token
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${this.apiKey}`,
          },
        },
      );

      console.log("Resume parsing API response received:", response.data);

      // 检查响应结构
      if (
        !response.data ||
        !response.data.choices ||
        response.data.choices.length === 0
      ) {
        throw new Error("Invalid response structure from AI model");
      }

      const choice = response.data.choices[0];
      if (!choice.message || !choice.message.content) {
        throw new Error("Invalid message format from AI model");
      }

      const content = choice.message.content;
      console.log(
        "AI response content:",
        content.substring(0, 200) + (content.length > 200 ? "..." : ""),
      );

      // 提取JSON部分
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          const parsedResume = JSON.parse(jsonMatch[0]);
          console.log("Parsed resume result:", parsedResume);
          return parsedResume;
        } catch (parseError) {
          throw new Error("Failed to parse JSON response from AI model");
        }
      } else {
        throw new Error("No JSON found in AI model response");
      }
    } catch (error) {
      console.error("Error parsing resume with Aliyun Bailian:", {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
      });

      // 如果是API错误，返回更友好的错误信息
      if (error.response?.status === 400) {
        throw new Error("简历内容过大，请上传较小的简历文件");
      }

      // 重新抛出错误，让控制器处理
      throw error;
    }
  }

  // 优化简历内容
  async optimizeResume(resumeContent, prompt = "") {
    try {
      console.log("Optimizing resume...");

      if (!resumeContent || resumeContent.length === 0) {
        throw new Error("No resume content provided");
      }

      // 限制输入内容长度，避免超出API限制
      const maxContentLength = 8000; // 限制为8,000字符，确保prompt不会过大
      const truncatedContent =
        resumeContent.length > maxContentLength
          ? resumeContent.substring(0, maxContentLength) + "\n\n[内容已截断]"
          : resumeContent;

      // 计算内容长度，用于调试
      console.log(`Original content length: ${resumeContent.length}`);
      console.log(`Truncated content length: ${truncatedContent.length}`);

      let optimizationPrompt = `
你是一位专业的简历优化专家，负责提升简历的质量和吸引力。

请根据以下简历内容进行优化：
${truncatedContent}

优化要求：
1. 语言表达更加专业、简洁有力
2. 突出关键成就和技能
3. 使用量化的成果展示
4. 结构清晰，逻辑连贯
5. 符合招聘方的阅读习惯
`;

      if (prompt) {
        optimizationPrompt += `
用户特别要求：
${prompt}
`;
      }

      optimizationPrompt += `
请返回优化后的完整简历内容，不要包含任何其他文本。
`;

      // 计算prompt长度，用于调试
      console.log(`Prompt length: ${optimizationPrompt.length}`);

      const response = await axios.post(
        this.apiUrl,
        {
          model: "qwen-max", // 使用Qwen-Max模型
          messages: [
            {
              role: "system",
              content:
                "你是一位专业的简历优化专家，负责提升简历的质量和吸引力。",
            },
            {
              role: "user",
              content: optimizationPrompt,
            },
          ],
          temperature: 0.7,
          max_tokens: 2000, // 一次优化最多消耗2000token
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${this.apiKey}`,
          },
        },
      );

      console.log("Resume optimization API response received:", response.data);

      // 检查响应结构
      if (
        !response.data ||
        !response.data.choices ||
        response.data.choices.length === 0
      ) {
        throw new Error("Invalid response structure from AI model");
      }

      const choice = response.data.choices[0];
      if (!choice.message || !choice.message.content) {
        throw new Error("Invalid message format from AI model");
      }

      const content = choice.message.content;
      console.log(
        "AI response content:",
        content.substring(0, 200) + (content.length > 200 ? "..." : ""),
      );

      return content;
    } catch (error) {
      console.error("Error optimizing resume with Aliyun Bailian:", {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
      });

      // 如果是API错误，返回更友好的错误信息
      if (error.response?.status === 400) {
        throw new Error("简历内容过大，请上传较小的简历文件");
      }

      throw error;
    }
  }

  // 生成面试问题
  async generateInterviewQuestion(type, subType) {
    try {
      console.log("Generating interview question:", { type, subType });

      const typeMap = {
        frontend: "前端开发",
        backend: "后端开发",
        ui: "UI设计",
      };

      const subTypeMap = {
        interview: "面试",
        written: "笔试",
      };

      const questionType = subType === "written" ? "笔试题" : "面试题";
      const domain = typeMap[type] || "技术";

      const prompt = `
你是一位专业的${domain}${questionType}生成专家。

请为${domain}${subTypeMap[subType]}生成1个高质量的${questionType}。

要求：
1. 问题要专业、有深度，能够考察候选人的真实能力
2. 问题要与${domain}领域紧密相关
3. 如果是面试题，问题要适合一对一交流
4. 如果是笔试题，问题要适合书面回答，可能包含代码或设计任务
5. 只生成1个问题，不要生成多个问题
6. 问题要具体、明确，避免过于宽泛
7. 直接返回问题内容，不要包含任何其他文本
`;

      console.log(`Prompt length: ${prompt.length}`);

      const response = await axios.post(
        this.apiUrl,
        {
          model: "qwen-flash", // 使用Qwen-Flash模型
          messages: [
            {
              role: "system",
              content: `你是一位专业的${domain}${questionType}生成专家。`,
            },
            {
              role: "user",
              content: prompt,
            },
          ],
          temperature: 0.7,
          max_tokens: 500,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${this.apiKey}`,
          },
        },
      );

      console.log(
        "Interview question generation API response received:",
        response.data,
      );

      // 检查响应结构
      if (
        !response.data ||
        !response.data.choices ||
        response.data.choices.length === 0
      ) {
        throw new Error("Invalid response structure from AI model");
      }

      const choice = response.data.choices[0];
      if (!choice.message || !choice.message.content) {
        throw new Error("Invalid message format from AI model");
      }

      const content = choice.message.content.trim();
      console.log("Generated question:", content);

      return content;
    } catch (error) {
      console.error(
        "Error generating interview question with Aliyun Bailian:",
        {
          message: error.message,
          status: error.response?.status,
          data: error.response?.data,
        },
      );

      // 返回默认问题作为备用
      const defaultQuestions = {
        frontend: {
          interview: "请解释一下React中的虚拟DOM是什么，它是如何工作的？",
          written: "请编写一个函数来实现React的useState hook的基本功能。",
        },
        backend: {
          interview: "请解释一下RESTful API的设计原则。",
          written:
            "请设计一个简单的用户认证系统，包括登录、注册和密码重置功能。",
        },
        ui: {
          interview:
            "请解释一下什么是用户体验设计，它与用户界面设计有什么区别？",
          written:
            "请为一个在线教育平台设计一个课程详情页的UI草图，并说明设计思路。",
        },
      };

      return defaultQuestions[type]?.[subType] || "请做一个简短的自我介绍。";
    }
  }

  // 分析面试问答并生成评分和总结
  async analyzeInterviewQnA(questions, answers, type) {
    try {
      console.log("Analyzing interview Q&A:", { questions, answers, type });

      const typeMap = {
        frontend: "前端开发",
        backend: "后端开发",
        ui: "UI设计",
      };

      const domain = typeMap[type] || "技术";

      let prompt = `请分析以下${domain}面试的问答内容，并生成详细的评分和总结。\n\n`;

      // 添加问答内容
      questions.forEach((question, index) => {
        prompt += `问题${index + 1}: ${question}\n`;
        prompt += `回答${index + 1}: ${answers[index] || ""}\n\n`;
      });

      // 添加分析要求
      prompt += `\n\n请按照以下格式输出分析结果：

{"overall": 0-100, "technical": 0-100, "communication": 0-100, "problemSolving": 0-100, "strengths": ["优势1", "优势2"], "improvements": ["改进点1", "改进点2"], "suggestions": ["建议1", "建议2"]}

要求：
1. overall：总体评分（0-100）
2. technical：技术能力评分（0-100）
3. communication：沟通表达评分（0-100）
4. problemSolving：问题解决能力评分（0-100）
5. strengths：候选人的优势（如果回答质量差，可能没有优势）
6. improvements：候选人需要改进的地方（至少2条）
7. suggestions：给候选人的面试建议（至少2条）
8. 评分要严格客观，基于实际回答内容的质量
9. 对于简短、无意义的回答（如"123"、"不知道"等），应该给予较低的评分
10. 只有当回答确实有价值时，才列出优势
11. 优势、改进点和建议要具体，基于实际回答内容
12. 直接输出JSON格式，不要添加其他文字`;

      console.log(`Analysis prompt length: ${prompt.length}`);

      const response = await axios.post(
        this.apiUrl,
        {
          model: "deepseek-v3.2", // 使用deepseek-v3.2模型
          messages: [
            {
              role: "system",
              content: `你是一位专业的${domain}面试分析师，擅长评估候选人的表现并提供客观的反馈。`,
            },
            {
              role: "user",
              content: prompt,
            },
          ],
          temperature: 0.3,
          max_tokens: 1000,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${this.apiKey}`,
          },
        },
      );

      console.log("Interview analysis API response received:", response.data);

      // 检查响应结构
      if (
        !response.data ||
        !response.data.choices ||
        response.data.choices.length === 0
      ) {
        throw new Error("Invalid response structure from AI model");
      }

      const choice = response.data.choices[0];
      if (!choice.message || !choice.message.content) {
        throw new Error("Invalid message format from AI model");
      }

      const content = choice.message.content.trim();
      console.log("Analysis content:", content);

      try {
        // 解析JSON响应
        const analysis = JSON.parse(content);
        console.log("Parsed analysis:", analysis);
        return analysis;
      } catch (parseError) {
        console.error("Error parsing analysis JSON:", parseError);
        // 解析失败时返回默认分析结果
        return this.getDefaultAnalysis();
      }
    } catch (error) {
      console.error("Error analyzing interview with Aliyun Bailian:", {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
      });
      // 失败时返回默认分析结果
      return this.getDefaultAnalysis();
    }
  }

  // 获取默认分析结果
  getDefaultAnalysis() {
    return {
      overall: 75,
      technical: 70,
      communication: 80,
      problemSolving: 75,
      strengths: ["回答问题积极主动", "沟通表达清晰"],
      improvements: ["技术细节可以更深入", "问题分析可以更全面"],
      suggestions: ["提前准备常见面试问题", "加强技术知识的复习"],
    };
  }

  // 智能问答功能
  async askQuestion(question, context = []) {
    try {
      console.log("Processing AI question:", question);

      if (!question || question.trim().length === 0) {
        throw new Error("No question provided");
      }

      const prompt = `
你是一位智能招聘助手，专注于高校社团招新相关的问题。

请根据以下上下文和问题，提供专业、准确的回答：

上下文：
${context.length > 0 ? context.map((item, index) => `Q: ${item.question}\nA: ${item.answer}`).join('\n\n') : '无'}

用户问题：
${question}

要求：
1. 回答要专业、准确，与招聘和社团相关
2. 语言要友好、自然，适合学生理解
3. 回答要具体，避免泛泛而谈
4. 如果问题超出招聘和社团范围，礼貌地说明无法回答
5. 直接返回回答内容，不要添加任何其他文本
`;

      console.log(`Question prompt length: ${prompt.length}`);

      const response = await axios.post(
        this.apiUrl,
        {
          model: "qwen-flash", // 使用Qwen-Flash模型
          messages: [
            {
              role: "system",
              content: "你是一位智能招聘助手，专注于高校社团招新相关的问题。",
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

      console.log("AI question API response received:", response.data);

      // 检查响应结构
      if (
        !response.data ||
        !response.data.choices ||
        response.data.choices.length === 0
      ) {
        throw new Error("Invalid response structure from AI model");
      }

      const choice = response.data.choices[0];
      if (!choice.message || !choice.message.content) {
        throw new Error("Invalid message format from AI model");
      }

      const content = choice.message.content.trim();
      console.log("AI answer:", content);

      return content;
    } catch (error) {
      console.error("Error processing AI question with Aliyun Bailian:", {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
      });

      // 返回默认回答
      return "抱歉，我暂时无法回答这个问题。请稍后再试或联系社团负责人获取更多信息。";
    }
  }
}

module.exports = new AliyunBailianService();
