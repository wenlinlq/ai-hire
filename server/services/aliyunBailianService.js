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
5. 综合评价（对候选人的整体评价和职业发展建议）
6. 面试提问预测（根据简历内容，预测面试官可能会问到的问题，至少5个）

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
    "suggestions": [""],
    "overallComment": "",
    "interviewQuestions": [""]
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
          max_tokens: 4000, // 增加token限制，确保完整返回
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
你是一位专业的简历优化专家，负责根据用户的具体要求提升简历的质量和吸引力。

以下是用户提供的原始简历内容：
${truncatedContent}

${
  prompt
    ? `
=============================
用户的核心优化要求（必须优先满足）：
${prompt}
=============================
`
    : ""
}

请根据以上内容和要求进行优化：

${prompt ? "特别注意：请务必优先满足用户的核心要求，所有优化都必须围绕用户的要求进行。" : ""}

基础优化要求：
1. 语言表达更加专业、简洁有力
2. 突出关键成就和技能
3. 使用量化的成果展示（数字、百分比等）
4. 结构清晰，逻辑连贯
5. 符合招聘方的阅读习惯

请直接返回优化后的完整简历内容，不要包含任何解释性文字。
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
3. 如果是面试题，问题要适合一对一交流，应该是概念性问题，不需要编写代码或设计任务
4. 如果是笔试题，问题要适合书面回答，必须包含代码或设计任务
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

  // 流式生成面试问题
  async generateInterviewQuestionStream(
    res,
    type,
    subType,
    questionNumber = 1,
    askedQuestions = [],
  ) {
    try {
      console.log("Generating streaming interview question:", {
        type,
        subType,
        questionNumber,
        askedQuestions: askedQuestions.length,
      });

      const typeMap = {
        frontend: "前端开发",
        backend: "后端开发",
        ui: "UI设计",
      };
      const domain = typeMap[type] || "技术";

      const questionTypeMap = {
        interview: "面试题",
        written: "笔试题",
      };
      const questionType = questionTypeMap[subType] || "面试题";

      // 根据问题序号选择不同难度和类型的问题（校园招聘版本）
      // 校园招聘以基础和入门级问题为主，降低难度
      const difficultyLevel =
        questionNumber <= 6 ? "入门" : questionNumber <= 9 ? "基础" : "中等";

      // 获取不同类型的问题主题（校园招聘版本 - 降低难度）
      const questionTopics = {
        frontend: {
          入门: ["HTML基础", "CSS基础", "JavaScript基础", "简单DOM操作"],
          基础: ["响应式设计", "ES6+语法", "简单算法", "Git基础"],
          中等: ["React/Vue基础", "状态管理基础", "HTTP基础", "简单性能优化"],
        },
        backend: {
          入门: ["HTTP协议基础", "数据库基础", "API基础", "Git协作"],
          基础: ["RESTful API设计", "SQL基础", "Node.js基础", "身份认证基础"],
          中等: ["缓存基础", "消息队列基础", "Docker基础", "简单架构设计"],
        },
        ui: {
          入门: ["设计原则基础", "色彩理论基础", "排版布局", "组件设计基础"],
          基础: ["用户体验基础", "交互设计基础", "设计工具使用", "设计规范"],
          中等: ["响应式设计", "设计系统基础", "设计研究基础", "设计评审"],
        },
      };

      const topics = questionTopics[type]?.[difficultyLevel] || [];
      const topicStr =
        topics.length > 0 ? `，主题包括：${topics.join("、")}` : "";

      let prompt = `请为${domain}岗位生成第${questionNumber}个${questionType}（${difficultyLevel}难度）${topicStr}。\n\n`;

      // 如果有已问问题列表，提示避免重复
      if (askedQuestions && askedQuestions.length > 0) {
        prompt += `已问过的问题：\n${askedQuestions.map((q, i) => `${i + 1}. ${q}`).join("\n")}\n\n`;
        prompt += "请确保新问题与以上问题不重复，且覆盖不同的知识点。\n\n";
      }

      prompt += `
要求：
1. 问题要专业、有深度，能够考察候选人的真实能力
2. 问题要与${domain}领域紧密相关，属于${difficultyLevel}难度
3. 如果是面试题，问题要适合一对一交流，应该是概念性问题，不需要编写代码或设计任务
4. 如果是笔试题，问题要适合书面回答，必须包含代码或设计任务
5. 只生成1个问题，不要生成多个问题
6. 问题要具体、明确，避免过于宽泛
7. 直接返回问题内容，不要包含任何其他文本
`;

      console.log(`Stream prompt length: ${prompt.length}`);

      const response = await axios.post(
        this.apiUrl,
        {
          model: "qwen-flash", // 使用Qwen-Flash模型
          messages: [
            {
              role: "system",
              content: `你是一位专业的${domain}${questionType}生成专家，擅长生成多样化、有针对性的面试问题。`,
            },
            {
              role: "user",
              content: prompt,
            },
          ],
          temperature: 0.8, // 增加温度参数使问题更多样化
          max_tokens: 500,
          stream: true, // 开启流式输出
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${this.apiKey}`,
          },
          responseType: "stream", // 设置响应类型为流
        },
      );

      console.log("Streaming interview question response received");

      // 处理流式响应
      response.data.on("data", (chunk) => {
        const chunkStr = chunk.toString();
        const lines = chunkStr.split("\n");

        for (const line of lines) {
          if (line.trim() === "") continue;
          if (line === "data: [DONE]") {
            res.write("data: [DONE]\n\n");
            break;
          }
          if (line.startsWith("data: ")) {
            try {
              const data = JSON.parse(line.substring(6));
              if (data.choices && data.choices[0] && data.choices[0].delta) {
                const delta = data.choices[0].delta;
                if (delta.content) {
                  // 发送流式数据
                  res.write(
                    `data: ${JSON.stringify({ content: delta.content })}\n\n`,
                  );
                }
              }
            } catch (error) {
              console.error("Error parsing stream chunk:", error);
            }
          }
        }
      });

      response.data.on("end", () => {
        console.log("Stream completed");
        res.end();
      });

      response.data.on("error", (error) => {
        console.error("Stream error:", error);
        res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
        res.end();
      });
    } catch (error) {
      console.error("Error generating streaming interview question:", error);
      // 发送默认问题
      const defaultQuestions = this.getDefaultQuestions(
        type,
        subType,
        questionNumber,
      );
      const defaultQuestion =
        defaultQuestions[questionNumber] || defaultQuestions[1];
      res.write(`data: ${JSON.stringify({ content: defaultQuestion })}\n\n`);
      res.write("data: [DONE]\n\n");
      res.end();
    }
  }

  // 获取默认面试问题（校园招聘版本 - 降低难度）
  getDefaultQuestions(type, subType, questionNumber) {
    const defaultQuestions = {
      frontend: {
        interview: [
          "请做一个简短的自我介绍，重点介绍您的前端学习经历和项目经验。",
          "什么是HTML？它的基本结构是什么？",
          "CSS选择器有哪些类型？请举例说明。",
          "JavaScript中var、let、const有什么区别？",
          "什么是CSS盒模型？标准盒模型和IE盒模型有什么区别？",
          "JavaScript中==和===有什么区别？",
          "什么是响应式设计？如何实现响应式布局？",
          "React组件的生命周期有哪些阶段？",
          "什么是AJAX？如何使用JavaScript发起AJAX请求？",
          "您觉得自己学习前端最大的收获是什么？",
        ],
        written: [
          "请编写HTML结构，创建一个包含标题、段落和图片的简单页面。",
          "请编写CSS代码，实现一个水平居中的div容器。",
          "请编写JavaScript函数，实现数组去重功能。",
          "请编写JavaScript代码，实现点击按钮切换元素显示/隐藏。",
          "请编写CSS代码，实现一个简单的导航栏样式。",
          "请编写JavaScript函数，反转一个字符串。",
          "请编写HTML和CSS代码，实现一个两列布局。",
          "请编写JavaScript代码，实现倒计时功能。",
          "请编写CSS代码，实现一个卡片式布局。",
          "请编写JavaScript函数，计算数组中所有数字的和。",
        ],
      },
      backend: {
        interview: [
          "请做一个简短的自我介绍，重点介绍您的后端学习经历和项目经验。",
          "什么是HTTP协议？常用的HTTP方法有哪些？",
          "什么是数据库？常用的数据库有哪些类型？",
          "什么是API？RESTful API有什么特点？",
          "什么是SQL？SELECT语句的基本语法是什么？",
          "什么是Node.js？它有什么特点？",
          "什么是Git？常用的Git命令有哪些？",
          "什么是JSON？它的特点是什么？",
          "什么是身份认证？常见的认证方式有哪些？",
          "您学习后端开发过程中遇到的最大挑战是什么？",
        ],
        written: [
          "请编写SQL语句，查询用户表中所有用户的姓名和邮箱。",
          "请设计一个简单的用户表结构，包含用户名、密码、邮箱字段。",
          "请编写Node.js代码，创建一个简单的HTTP服务器。",
          "请编写SQL语句，向用户表中插入一条新记录。",
          "请设计一个简单的登录API接口。",
          "请编写Node.js代码，读取一个JSON文件并输出内容。",
          "请编写SQL语句，更新用户表中某个用户的邮箱。",
          "请设计一个简单的学生管理系统的数据表结构。",
          "请编写Node.js代码，实现简单的路由功能。",
          "请编写SQL语句，删除用户表中指定ID的记录。",
        ],
      },
      ui: {
        interview: [
          "请做一个简短的自我介绍，重点介绍您的设计学习经历和项目经验。",
          "什么是UI设计？UI设计的基本原则有哪些？",
          "什么是色彩理论？常用的配色方案有哪些？",
          "什么是排版？排版设计需要注意哪些方面？",
          "什么是组件设计？为什么组件设计很重要？",
          "什么是用户体验？如何提升用户体验？",
          "什么是交互设计？交互设计的原则是什么？",
          "常用的设计工具有哪些？您最擅长使用哪个？",
          "什么是设计规范？为什么需要设计规范？",
          "您觉得一个好的设计作品应该具备哪些特点？",
        ],
        written: [
          "请设计一个简单的登录页面UI草图，并说明设计思路。",
          "请为一个博客网站设计首页布局，并说明配色方案。",
          "请设计一个移动端App的底部导航栏，并说明交互方式。",
          "请设计一个电商产品卡片组件，并说明设计细节。",
          "请为一个新闻App设计文章列表页，并说明布局思路。",
          "请设计一个社交媒体个人主页的UI草图。",
          "请为一个音乐播放器设计播放界面，并说明交互设计。",
          "请设计一个在线教育平台的课程卡片组件。",
          "请为一个健康管理App设计仪表盘界面。",
          "请设计一个企业官网的首页布局方案。",
        ],
      },
    };

    return (
      defaultQuestions[type]?.[subType] || defaultQuestions.frontend.interview
    );
  }

  // 分析面试问答并生成评分和总结（按类型）
  async analyzeInterviewQnAByType(questions, answers, type) {
    try {
      console.log("Analyzing interview Q&A by type:", {
        questions,
        answers,
        type,
      });

      const typeMap = {
        frontend: "前端开发",
        backend: "后端开发",
        ui: "UI设计",
      };

      const domain = typeMap[type] || "技术";

      // 预处理：检查回答质量
      const answerQuality = this.evaluateAnswerQuality(questions, answers);

      // 如果所有回答质量都很差，直接返回低分
      if (answerQuality.allPoor) {
        console.log("All answers are poor quality, returning low score");
        return {
          overall: answerQuality.averageScore,
          technical: answerQuality.averageScore - 5,
          communication: answerQuality.averageScore,
          problemSolving: answerQuality.averageScore - 5,
          strengths: [
            "参与面试本身就是一种宝贵的学习经历",
            "展现了积极的求职态度和学习意愿",
            "愿意面对挑战并尝试回答问题",
          ],
          improvements: [
            "回答内容过于简短，未能有效展示能力",
            "建议提供更详细的回答",
            "需要加强技术知识储备",
          ],
          suggestions: [
            "提前准备常见面试问题",
            "多练习口头表达能力",
            "学习STAR法则",
          ],
        };
      }

      // 构建问答内容字符串，标记低质量回答
      let qaContent = "";
      questions.forEach((question, index) => {
        const answer = answers[index] || "";
        const qualityNote = answerQuality.poorIndices.includes(index)
          ? "【回答质量较低】"
          : "";
        qaContent += `问题${index + 1}: ${question}\n`;
        qaContent += `回答${index + 1}${qualityNote}: ${answer}\n\n`;
      });

      let prompt = `请分析以下${domain}面试的问答内容，并生成详细的评分和总结。\n\n`;

      // 添加问答内容
      prompt += qaContent;

      // 添加分析要求
      prompt += `\n\n请按照以下格式输出分析结果：

{"overall": 0-100, "technical": 0-100, "communication": 0-100, "problemSolving": 0-100, "strengths": ["优势1", "优势2"], "improvements": ["改进点1", "改进点2"], "suggestions": ["建议1", "建议2"]}

评分标准：
1. 总体评分（overall）：综合考虑技术能力、沟通表达和问题解决能力
2. 技术能力评分（technical）：评估回答的技术深度和准确性
3. 沟通表达评分（communication）：评估表达清晰度、逻辑性和条理性
4. 问题解决能力评分（problemSolving）：评估分析问题和解决问题的能力

评分原则：
- 回答准确、详细、有深度 → 高评分（80-100）
- 回答基本正确但不够详细 → 中等评分（60-79）
- 回答错误或过于简短 → 低评分（0-59）
- 回答"不知道"、"不会"等 → 极低评分（0-20）
- 回答与问题无关 → 极低评分（0-20）

内容要求（非常重要！）：
1. strengths（优势）：候选人的优点，必须基于实际回答内容，每条至少50字，要具体说明为什么是优势
2. improvements（改进点）：需要改进的地方，至少列出3条，每条至少50字，要具体说明问题所在和如何改进
3. suggestions（建议）：面试技巧建议，至少列出3条，每条至少50字，要提供具体可行的建议

注意事项：
- 评分要严格客观，基于实际回答内容的质量
- 对于简短、无意义的回答（如"123"、"不知道"等），应该给予较低的评分（0-30分）
- 只有当回答确实有价值时，才列出优势
- 优势、改进点和建议要详细、具体，基于实际回答内容，不能泛泛而谈
- 直接输出JSON格式，不要添加其他文字`;

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
          temperature: 0.2, // 降低温度，使评分更一致
          max_tokens: 1500,
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

        // 验证评分范围
        const validatedAnalysis = this.validateAndAdjustScores(analysis);
        return validatedAnalysis;
      } catch (parseError) {
        console.error("Error parsing analysis JSON:", parseError);
        // 解析失败时返回基于回答质量的分析结果
        return this.generateFallbackAnalysis(answerQuality, domain);
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

  // 评估回答质量
  evaluateAnswerQuality(questions, answers) {
    const poorIndices = [];
    let totalScore = 0;

    answers.forEach((answer, index) => {
      const question = questions[index];
      let score = this.scoreSingleAnswer(answer, question);
      totalScore += score;
      if (score < 40) {
        poorIndices.push(index);
      }
    });

    const averageScore = Math.round(totalScore / answers.length);

    return {
      poorIndices,
      averageScore,
      allPoor: poorIndices.length === answers.length,
    };
  }

  // 评分单个回答
  scoreSingleAnswer(answer, question) {
    if (!answer || answer.trim() === "") return 10;

    const trimmedAnswer = answer.trim();

    // 检查明显的低质量回答
    const poorAnswers = [
      "不知道",
      "不会",
      "不懂",
      "不清楚",
      "不了解",
      "忘了",
      "忘记了",
      "随便",
      "都行",
    ];
    if (poorAnswers.some((p) => trimmedAnswer.includes(p))) {
      return 15;
    }

    // 检查回答长度
    const answerLength = trimmedAnswer.length;
    const questionLength = question.length;

    // 回答太短（小于问题长度的一半）
    if (answerLength < questionLength / 2) {
      return 25;
    }

    // 回答较短（小于问题长度）
    if (answerLength < questionLength) {
      return 40;
    }

    // 回答长度适中
    if (answerLength >= questionLength && answerLength < questionLength * 3) {
      return 60;
    }

    // 回答详细
    return 80;
  }

  // 验证并调整评分范围
  validateAndAdjustScores(analysis) {
    const adjusted = { ...analysis };

    // 确保所有评分在0-100范围内
    const scoreFields = [
      "overall",
      "technical",
      "communication",
      "problemSolving",
    ];
    scoreFields.forEach((field) => {
      if (adjusted[field] === undefined) {
        adjusted[field] = 50;
      } else {
        adjusted[field] = Math.max(0, Math.min(100, adjusted[field]));
      }
    });

    // 确保数组字段存在
    if (
      !adjusted.strengths ||
      !Array.isArray(adjusted.strengths) ||
      adjusted.strengths.length === 0
    ) {
      adjusted.strengths = [
        "展现了积极的求职态度和学习意愿",
        "参与面试本身就是一种宝贵的学习经历",
        "具备进一步学习和成长的潜力",
      ];
    }
    if (!adjusted.improvements || !Array.isArray(adjusted.improvements)) {
      adjusted.improvements = ["需要提高回答质量"];
    }
    if (!adjusted.suggestions || !Array.isArray(adjusted.suggestions)) {
      adjusted.suggestions = ["加强面试准备"];
    }

    return adjusted;
  }

  // 生成基于回答质量的备用分析结果
  generateFallbackAnalysis(answerQuality, domain) {
    const avgScore = answerQuality.averageScore;

    // 生成详细的优势描述
    const strengths =
      avgScore >= 60
        ? [
            "回答态度积极主动，能够主动思考问题并尝试给出答案，展现出良好的学习态度和积极性",
            "具备基本的专业知识基础，能够理解问题的核心要点，为进一步学习打下了良好基础",
            "表达清晰有条理，能够用简洁明了的语言表达自己的想法，便于面试官理解",
          ]
        : [];

    // 生成详细的改进点描述
    const improvements = [
      "回答内容需要更加详细，建议在回答时多提供具体的例子和细节，这样可以更好地展示您的理解和能力",
      "建议提供更多技术细节，例如在回答技术问题时，可以深入解释相关概念、原理和实现方式",
      "加强对问题的理解和分析能力，在回答前可以先思考问题的核心要点，确保回答切中要害",
      "可以提高回答的逻辑性和结构性，采用分点说明的方式会让回答更加清晰易读",
    ];

    // 生成详细的建议描述
    const suggestions = [
      "提前准备常见面试问题的回答，可以通过查阅资料、观看视频教程等方式学习相关知识，做到有备无患",
      "练习使用STAR法则回答问题，即情境(Situation)、任务(Task)、行动(Action)、结果(Result)，这样可以让回答更有条理",
      `加强${domain}领域的技术知识学习，可以通过在线课程、技术博客、开源项目等多种途径进行学习和实践`,
      "多进行模拟面试练习，可以找同学或朋友进行模拟面试，获取反馈并不断改进自己的表现",
      "在面试前了解应聘单位的背景和业务，这样可以更好地理解岗位需求，有针对性地准备回答",
    ];

    return {
      overall: avgScore,
      technical: Math.max(0, avgScore - 10),
      communication: avgScore,
      problemSolving: Math.max(0, avgScore - 10),
      strengths: strengths,
      improvements: improvements,
      suggestions: suggestions,
    };
  }

  // 获取默认分析结果
  getDefaultAnalysis() {
    return {
      overall: 75,
      technical: 70,
      communication: 80,
      problemSolving: 75,
      strengths: [
        "回答问题积极主动，展现出良好的学习态度和积极性，能够主动思考并尝试解决问题",
        "沟通表达清晰，能够用简洁明了的语言表达自己的想法，逻辑较为清晰",
        "具备一定的专业知识基础，对于基础概念有较好的理解和掌握",
      ],
      improvements: [
        "技术细节可以更深入，建议在回答技术问题时提供更多具体的实现细节和技术原理",
        "问题分析可以更全面，建议从多个角度思考问题，提供更完整的解决方案",
        "回答的结构性可以加强，建议采用分点论述的方式，使回答更具逻辑性",
      ],
      suggestions: [
        "提前准备常见面试问题，可以通过查阅资料、观看技术视频等方式进行系统性学习",
        "加强技术知识的复习，重点关注基础概念和常用技术栈的深入理解",
        "多进行模拟面试练习，通过实践提高面试技巧和应变能力",
        "学习使用STAR法则进行回答，即情境、任务、行动、结果，使回答更加结构化",
      ],
    };
  }

  // 检查硬性条件
  checkHardConditions(
    resumeContent,
    requiredSkills,
    requiredEducation,
    hardSkills,
  ) {
    const reasons = [];
    const resumeLower = resumeContent.toLowerCase();
    let passed = true;
    let skillScore = 50;
    let educationScore = 50;

    // 检查硬性技能要求
    if (hardSkills && hardSkills.length > 0) {
      for (const skill of hardSkills) {
        if (!resumeLower.includes(skill.toLowerCase())) {
          reasons.push(`缺少硬性技能要求：${skill}`);
          passed = false;
          skillScore = 10;
        }
      }
    }

    // 检查学历要求
    if (requiredEducation && requiredEducation !== "无") {
      const hasBachelor =
        resumeLower.includes("本科") ||
        resumeLower.includes("学士") ||
        resumeLower.includes("bachelor") ||
        resumeLower.includes("bsc");
      const hasMaster =
        resumeLower.includes("硕士") ||
        resumeLower.includes("研究生") ||
        resumeLower.includes("master") ||
        resumeLower.includes("msc");
      const hasPhD =
        resumeLower.includes("博士") ||
        resumeLower.includes("phd") ||
        resumeLower.includes("博士后");

      // 判断学历等级
      let candidateEducationLevel = 0; // 0: 无, 1: 本科, 2: 硕士, 3: 博士
      if (hasPhD) candidateEducationLevel = 3;
      else if (hasMaster) candidateEducationLevel = 2;
      else if (hasBachelor) candidateEducationLevel = 1;

      // 判断岗位要求的学历等级
      let requiredEducationLevel = 0;
      if (requiredEducation.includes("博士")) requiredEducationLevel = 3;
      else if (
        requiredEducation.includes("硕士") ||
        requiredEducation.includes("研究生")
      )
        requiredEducationLevel = 2;
      else if (requiredEducation.includes("本科")) requiredEducationLevel = 1;

      if (candidateEducationLevel < requiredEducationLevel) {
        reasons.push(
          `学历不满足要求：要求${requiredEducation}，但简历中未体现`,
        );
        passed = false;
        educationScore = 10;
      } else if (candidateEducationLevel === 0 && requiredEducationLevel > 0) {
        reasons.push(`简历中未提及学历信息，无法满足${requiredEducation}要求`);
        passed = false;
        educationScore = 20;
      }
    }

    return {
      passed,
      reasons,
      skillScore,
      experienceScore: passed ? 50 : 10,
      educationScore,
    };
  }

  // AI简历筛选分析 - 根据岗位要求分析简历匹配度并评分
  async analyzeResumeForScreening(resumeContent, jobRequirements) {
    try {
      console.log("Analyzing resume for screening with deepseek...");

      if (!resumeContent || resumeContent.length === 0) {
        throw new Error("No resume content provided");
      }

      if (!jobRequirements) {
        throw new Error("No job requirements provided");
      }

      // 限制输入内容长度，避免超出API限制
      const maxContentLength = 10000;
      const truncatedContent =
        resumeContent.length > maxContentLength
          ? resumeContent.substring(0, maxContentLength) + "\n\n[内容已截断]"
          : resumeContent;

      // 处理jobRequirements - 支持字符串或对象格式
      let jobDescription = "";
      let requiredSkills = [];
      let requiredEducation = "";
      let hardSkills = []; // 硬性技能要求

      if (typeof jobRequirements === "string") {
        jobDescription = jobRequirements;
      } else {
        // 构建技能要求字符串 - 优先使用硬性技能要求
        const skills1 = jobRequirements.skills || [];
        const skills2 = jobRequirements.requirements?.skills || [];
        const skills3 = jobRequirements.aiResumeFilterSkills || [];
        // 合并所有技能，去重
        requiredSkills = [...new Set([...skills1, ...skills2, ...skills3])];
        const requiredSkillsStr =
          requiredSkills.length > 0 ? requiredSkills.join(", ") : "无";

        // 构建工作经验要求字符串
        const experienceReq =
          jobRequirements.experience ||
          jobRequirements.requirements?.experience ||
          "无";

        // 构建学历要求字符串
        requiredEducation =
          jobRequirements.education ||
          jobRequirements.requirements?.education ||
          "无";

        // 获取硬性技能要求 - 优先从职位模型的 aiResumeFilterSkills 字段获取
        hardSkills =
          jobRequirements.aiResumeFilterSkills ||
          jobRequirements.hardSkills ||
          [];

        // 获取其他要求描述
        const otherRequirements =
          jobRequirements.description ||
          jobRequirements.requirements?.description ||
          "无";

        jobDescription = `技能要求：${requiredSkillsStr}\n经验要求：${experienceReq}\n学历要求：${requiredEducation}\n其他要求：${otherRequirements}`;
      }

      // ============ 硬性条件检查 ============
      const hardConditionResult = this.checkHardConditions(
        resumeContent,
        requiredSkills,
        requiredEducation,
        hardSkills,
      );
      if (!hardConditionResult.passed) {
        console.log(
          "Resume failed hard condition check:",
          hardConditionResult.reason,
        );
        return {
          skillMatch: hardConditionResult.skillScore || 10,
          experienceMatch: hardConditionResult.experienceScore || 10,
          educationMatch: hardConditionResult.educationScore || 10,
          overallScore: 10,
          strengths: ["简历格式规范", "信息完整"],
          weaknesses: hardConditionResult.reasons || ["未满足硬性条件要求"],
        };
      }

      const prompt = `
你是一位专业的HR招聘专家，负责根据岗位要求对候选人简历进行筛选评分。

请根据以下岗位要求，对候选人的简历进行详细分析和评分：

【岗位要求】
${jobDescription}

【候选人简历】
${truncatedContent}

请从以下几个维度进行评分（每项0-100分）：
1. 技能匹配度：评估简历中的技能与岗位要求的匹配程度
2. 经验匹配度：评估候选人的工作/项目经验与岗位要求的匹配程度
3. 学历匹配度：评估候选人的学历背景与岗位要求的匹配程度
4. 综合评分：综合考虑以上各项的总体评分

【分析要求】
请提供详细的分析结果，每个优势和不足点都需要具体说明，包含以下内容：
- strengths（优势）：列出3-5条候选人的核心优势，每条不少于20字，具体说明候选人具备的哪些能力、经验或特质符合岗位要求
- weaknesses（不足）：列出3-5条候选人的主要不足，每条不少于20字，具体说明候选人缺少哪些关键技能、经验或与岗位要求不匹配的地方

请以JSON格式返回分析结果，不要包含任何其他文本。
JSON格式要求：
{
  "skillMatch": 0,
  "experienceMatch": 0,
  "educationMatch": 0,
  "overallScore": 0,
  "strengths": ["优势1", "优势2", "优势3"],
  "weaknesses": ["不足1", "不足2", "不足3"]
}
`;

      console.log(`Screening prompt length: ${prompt.length}`);

      const response = await axios.post(
        this.apiUrl,
        {
          model: "deepseek-v3",
          messages: [
            {
              role: "system",
              content:
                "你是一位专业的HR招聘专家，负责根据岗位要求对候选人简历进行筛选评分。",
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

      console.log("Resume screening API response received:", response.data);

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
        "AI screening response content:",
        content.substring(0, 200) + (content.length > 200 ? "..." : ""),
      );

      // 提取JSON部分
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          const analysis = JSON.parse(jsonMatch[0]);
          console.log("Screening analysis result:", analysis);
          return analysis;
        } catch (parseError) {
          throw new Error("Failed to parse JSON response from AI model");
        }
      } else {
        throw new Error("No JSON found in AI model response");
      }
    } catch (error) {
      console.error(
        "Error analyzing resume for screening with Aliyun Bailian:",
        {
          message: error.message,
          status: error.response?.status,
          data: error.response?.data,
        },
      );

      // 返回默认分析结果，避免因API错误影响筛选流程
      return {
        skillMatch: 50,
        experienceMatch: 50,
        educationMatch: 50,
        overallScore: 50,
        strengths: ["简历格式规范", "信息完整"],
        weaknesses: ["技能匹配度一般", "经验匹配度一般"],
      };
    }
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
${context.length > 0 ? context.map((item, index) => `Q: ${item.question}\nA: ${item.answer}`).join("\n\n") : "无"}

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

      // 流式请求配置
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
          stream: true, // 开启流式输出
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${this.apiKey}`,
          },
          responseType: "stream", // 设置响应类型为流
        },
      );

      console.log("AI question API stream response received");

      // 处理流式响应
      return new Promise((resolve, reject) => {
        let fullContent = "";
        let isCompleted = false;

        response.data.on("data", (chunk) => {
          const chunkStr = chunk.toString();
          const lines = chunkStr.split("\n");

          for (const line of lines) {
            if (line.trim() === "") continue;
            if (line === "data: [DONE]") {
              isCompleted = true;
              break;
            }
            if (line.startsWith("data: ")) {
              try {
                const data = JSON.parse(line.substring(6));
                if (data.choices && data.choices[0] && data.choices[0].delta) {
                  const delta = data.choices[0].delta;
                  if (delta.content) {
                    fullContent += delta.content;
                  }
                }
              } catch (error) {
                console.error("Error parsing stream chunk:", error);
              }
            }
          }
        });

        response.data.on("end", () => {
          if (isCompleted) {
            const content = fullContent.trim();
            console.log("AI answer:", content);
            resolve(content);
          } else {
            reject(new Error("Stream ended without completion marker"));
          }
        });

        response.data.on("error", (error) => {
          reject(error);
        });
      });
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

  // 智能问答功能（流式）
  async askQuestionStream(question, context = [], onChunk) {
    try {
      console.log("Processing AI question (streaming):", question);

      if (!question || question.trim().length === 0) {
        throw new Error("No question provided");
      }

      const prompt = `
你是一位智能招聘助手，专注于高校社团招新相关的问题。

请根据以下上下文和问题，提供专业、准确的回答：

上下文：
${context.length > 0 ? context.map((item, index) => `Q: ${item.question}\nA: ${item.answer}`).join("\n\n") : "无"}

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

      // 流式请求配置
      const response = await axios.post(
        this.apiUrl,
        {
          model: "qwen-flash",
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
          stream: true,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${this.apiKey}`,
          },
          responseType: "stream",
        },
      );

      console.log("AI question API stream response received");

      // 处理流式响应，通过回调返回数据
      return new Promise((resolve, reject) => {
        response.data.on("data", (chunk) => {
          const chunkStr = chunk.toString();
          const lines = chunkStr.split("\n");

          for (const line of lines) {
            if (line.trim() === "") continue;
            if (line.startsWith("data: ")) {
              try {
                const data = JSON.parse(line.substring(6));
                if (data.choices && data.choices[0] && data.choices[0].delta) {
                  const delta = data.choices[0].delta;
                  if (delta.content) {
                    // 通过回调返回数据块
                    onChunk(delta.content);
                  }
                }
              } catch (error) {
                console.error("Error parsing stream chunk:", error);
              }
            }
          }
        });

        response.data.on("end", () => {
          console.log("AI question stream completed");
          resolve();
        });

        response.data.on("error", (error) => {
          reject(error);
        });
      });
    } catch (error) {
      console.error("Error processing AI question stream with Aliyun Bailian:", {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
      });

      throw error;
    }
  }
}

module.exports = new AliyunBailianService();
