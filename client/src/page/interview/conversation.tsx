import { type FormEvent, useEffect, useRef, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { SiteNav } from "../../components/site";
import api from "../../api/api";

interface Message {
  sender: "interviewer" | "candidate";
  content: string;
  timestamp: string;
}

type InterviewState = "loading" | "preparing" | "ongoing" | "completed";

type InterviewType = "frontend" | "backend" | "ui";
type InterviewSubType = "interview" | "written";

const InterviewConversation = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [interviewState, setInterviewState] =
    useState<InterviewState>("loading");
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageInput, setMessageInput] = useState("");
  const [isInterviewerTyping, setIsInterviewerTyping] = useState(false);
  const chatRef = useRef<HTMLDivElement>(null);

  const type = searchParams.get("type") as InterviewType;
  const subType = searchParams.get("subType") as InterviewSubType;

  useEffect(() => {
    chatRef.current?.scrollTo({
      top: chatRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, isInterviewerTyping]);

  useEffect(() => {
    if (type) {
      initializeInterview();
    }
  }, [type, subType]);

  const initializeInterview = async () => {
    try {
      setInterviewState("preparing");

      // 生成面试开场白
      const openingMessage: Message = {
        sender: "interviewer",
        content: getOpeningMessage(type),
        timestamp: new Date().toLocaleTimeString(),
      };

      // 调用API生成面试问题
      const response = await api.post("/aiPreInterviews/generate-question", {
        type,
        subType,
      });

      console.log("API Response:", response);

      const generatedQuestion =
        response.data?.question ||
        response.question ||
        response.data?.data?.question;

      if (!generatedQuestion) {
        throw new Error("无法生成面试问题");
      }

      // 生成第一个问题
      const firstQuestion: Message = {
        sender: "interviewer",
        content: generatedQuestion,
        timestamp: new Date().toLocaleTimeString(),
      };

      setMessages([openingMessage, firstQuestion]);
      setInterviewState("ongoing");
    } catch (error) {
      console.error("初始化面试失败:", error);
      // 如果API调用失败，使用默认问题
      const openingMessage: Message = {
        sender: "interviewer",
        content: getOpeningMessage(type),
        timestamp: new Date().toLocaleTimeString(),
      };

      const firstQuestion: Message = {
        sender: "interviewer",
        content: getFirstQuestion(type, subType),
        timestamp: new Date().toLocaleTimeString(),
      };

      setMessages([openingMessage, firstQuestion]);
      setInterviewState("ongoing");
    }
  };

  const getOpeningMessage = (type: InterviewType): string => {
    const typeMap: Record<InterviewType, string> = {
      frontend: "前端开发",
      backend: "后端开发",
      ui: "UI设计",
    };

    return `您好，欢迎参加${typeMap[type]}面试。我是AI面试官，今天将由我负责您的面试。`;
  };

  const getFirstQuestion = (
    type: InterviewType,
    subType: InterviewSubType | null,
  ): string => {
    switch (type) {
      case "frontend":
        if (subType === "written") {
          return "请您做一个简短的自我介绍，重点介绍您的前端开发技能和项目经验。";
        } else {
          return "请您做一个简短的自我介绍，重点介绍您的前端技术栈和项目经验。";
        }
      case "backend":
        if (subType === "written") {
          return "请您做一个简短的自我介绍，重点介绍您的后端开发技能和项目经验。";
        } else {
          return "请您做一个简短的自我介绍，重点介绍您的后端技术栈和项目经验。";
        }
      case "ui":
        return "请您做一个简短的自我介绍，重点介绍您的设计理念和项目经验。";
      default:
        return "请您做一个简短的自我介绍。";
    }
  };

  const handleSendMessage = (e: FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim()) return;

    // 添加用户消息
    const userMessage: Message = {
      sender: "candidate",
      content: messageInput,
      timestamp: new Date().toLocaleTimeString(),
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setMessageInput("");

    // 模拟AI面试官思考和回复
    setTimeout(() => {
      setIsInterviewerTyping(true);

      setTimeout(() => {
        const interviewerMessage: Message = {
          sender: "interviewer",
          content: getNextQuestion(type, subType, updatedMessages.length),
          timestamp: new Date().toLocaleTimeString(),
        };

        setMessages((prev) => [...prev, interviewerMessage]);
        setIsInterviewerTyping(false);
      }, 1500);
    }, 500);
  };

  const getNextQuestion = (
    type: InterviewType,
    subType: InterviewSubType | null,
    questionIndex: number,
  ): string => {
    // 只设置1个问题，所以回答完第一个问题后就结束面试
    if (questionIndex < 1) {
      // 这里可以添加逻辑生成后续问题，但根据需求只设置1个问题
      return "感谢您的回答。面试到此结束，我们会在后续联系您。";
    } else {
      // 提取问题和回答
      const questions: string[] = [];
      const answers: string[] = [];

      for (let i = 1; i < messages.length; i += 2) {
        if (messages[i] && messages[i].sender === "interviewer") {
          questions.push(messages[i].content);
        }
        if (
          i + 1 < messages.length &&
          messages[i + 1] &&
          messages[i + 1].sender === "candidate"
        ) {
          answers.push(messages[i + 1].content);
        }
      }

      console.log("Interview questions:", questions);
      console.log("Interview answers:", answers);

      // 面试结束，跳转到总结页面
      setTimeout(async () => {
        try {
          // 调用API分析面试问答
          const response = await api.post("/aiPreInterviews/analyze-answers", {
            type,
            subType,
            questions,
            answers,
          });

          console.log("Analysis response:", response);

          // 跳转到总结页面并传递分析结果
          const analysis = response.data?.data || response.data;
          navigate(`/interview/summary?type=${type}&subType=${subType}`, {
            state: { analysis },
          });
        } catch (error) {
          console.error("Error analyzing interview:", error);
          // 如果API调用失败，仍然跳转到总结页面
          navigate(`/interview/summary?type=${type}&subType=${subType}`);
        }
      }, 2000);
      return "感谢您的回答。面试到此结束，我们会在后续联系您。";
    }
  };

  if (interviewState === "loading") {
    return (
      <div className="min-h-screen bg-neutral-50">
        <SiteNav current="interview" />
        <main className="flex-1 flex items-center justify-center py-12">
          <div className="text-center">
            <div className="mb-4 animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
            <p className="text-lg text-neutral-600">正在准备面试...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <SiteNav current="interview" />
      <main className="flex-1 py-8">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-neutral-200 bg-white shadow-sm overflow-hidden">
            {/* 面试头部 */}
            <div className="bg-primary-50 px-6 py-4 border-b border-neutral-200">
              <h2 className="text-xl font-semibold text-neutral-800">
                AI模拟面试
              </h2>
              <p className="text-sm text-neutral-600">
                {type === "frontend" && "前端开发"}
                {type === "backend" && "后端开发"}
                {type === "ui" && "UI设计"}
                {subType && ` - ${subType === "interview" ? "面试" : "笔试"}`}
              </p>
            </div>

            {/* 聊天区域 */}
            <div
              ref={chatRef}
              className="h-[500px] overflow-y-auto px-6 py-4 space-y-4"
            >
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${message.sender === "interviewer" ? "justify-start" : "justify-end"}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-4 ${
                      message.sender === "interviewer"
                        ? "bg-neutral-100 text-neutral-800"
                        : "bg-primary-500 text-white"
                    }`}
                  >
                    <p className="mb-1 text-sm">
                      {message.sender === "interviewer" ? "AI面试官" : "您"}
                    </p>
                    <p>{message.content}</p>
                    <p className="mt-1 text-xs opacity-70">
                      {message.timestamp}
                    </p>
                  </div>
                </div>
              ))}

              {isInterviewerTyping && (
                <div className="flex justify-start">
                  <div className="bg-neutral-100 rounded-lg p-4 max-w-[80%]">
                    <p className="mb-1 text-sm">AI面试官</p>
                    <div className="flex space-x-1">
                      <div
                        className="h-2 w-2 rounded-full bg-neutral-400 animate-bounce"
                        style={{ animationDelay: "0ms" }}
                      ></div>
                      <div
                        className="h-2 w-2 rounded-full bg-neutral-400 animate-bounce"
                        style={{ animationDelay: "150ms" }}
                      ></div>
                      <div
                        className="h-2 w-2 rounded-full bg-neutral-400 animate-bounce"
                        style={{ animationDelay: "300ms" }}
                      ></div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 输入区域 */}
            <div className="border-t border-neutral-200 px-6 py-4">
              <form onSubmit={handleSendMessage} className="flex space-x-2">
                <input
                  type="text"
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  placeholder="请输入您的回答..."
                  className="flex-1 rounded-lg border border-neutral-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  disabled={interviewState !== "ongoing"}
                />
                <button
                  type="submit"
                  className="rounded-lg bg-primary-500 px-4 py-2 text-white font-medium transition-colors hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={
                    !messageInput.trim() || interviewState !== "ongoing"
                  }
                >
                  发送
                </button>
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default InterviewConversation;
