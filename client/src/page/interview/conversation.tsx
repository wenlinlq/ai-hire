import { type FormEvent, useEffect, useRef, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { SiteNav } from "../../components/site";
import api, { streamRequest } from "../../api/api";

interface Message {
  sender: "interviewer" | "candidate";
  content: string;
  timestamp: string;
  id: string;
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
  const [isInitializing, setIsInitializing] = useState(false); // 防止重复初始化
  const initializedRef = useRef(false); // 跟踪是否已经初始化过
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
    console.log("useEffect triggered:", {
      type,
      subType,
      initialized: initializedRef.current,
    });
    // 只在初次渲染时初始化，使用ref确保只执行一次
    if (type && !initializedRef.current) {
      console.log("Starting initialization...");
      initializedRef.current = true;
      initializeInterview();
    } else if (type && initializedRef.current) {
      console.log("Already initialized, skipping...");
    }
  }, [type, subType]);

  const initializeInterview = async () => {
    // 提前生成问题消息ID，确保在catch块中也能访问
    const questionMessageId = `msg-${Date.now()}-2`;

    try {
      setIsInitializing(true); // 开始初始化
      setInterviewState("preparing");

      // 生成面试开场白和空问题消息
      const openingMessage: Message = {
        sender: "interviewer",
        content: getOpeningMessage(type),
        timestamp: new Date().toLocaleTimeString(),
        id: `msg-${Date.now()}-1`,
      };

      let generatedQuestion = "";

      const firstQuestionMessage: Message = {
        sender: "interviewer",
        content: "",
        timestamp: new Date().toLocaleTimeString(),
        id: questionMessageId,
      };

      console.log("Setting initial messages:", {
        openingMessage: {
          id: openingMessage.id,
          content: openingMessage.content.substring(0, 30),
        },
        firstQuestionMessage: {
          id: firstQuestionMessage.id,
          content: firstQuestionMessage.content,
        },
      });

      // 一次性设置所有初始消息，避免异步状态更新的竞争条件
      setMessages([openingMessage, firstQuestionMessage]);
      setIsInterviewerTyping(true);

      // 调用流式API生成面试问题
      await new Promise<void>((resolve, reject) => {
        streamRequest(
          "/aiPreInterviews/generate-question-stream",
          { type, subType },
          (content) => {
            // 逐字更新问题内容
            generatedQuestion += content;
            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === questionMessageId
                  ? { ...msg, content: generatedQuestion }
                  : msg,
              ),
            );
          },
          (error) => {
            console.error("流式获取面试问题失败:", error);
            // 使用默认问题
            generatedQuestion = getFirstQuestion(type, subType);
            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === questionMessageId
                  ? { ...msg, content: generatedQuestion }
                  : msg,
              ),
            );
            resolve();
          },
          () => {
            // 流式传输完成
            if (!generatedQuestion) {
              generatedQuestion = getFirstQuestion(type, subType);
              setMessages((prev) =>
                prev.map((msg) =>
                  msg.id === questionMessageId
                    ? { ...msg, content: generatedQuestion }
                    : msg,
                ),
              );
            }
            resolve();
          },
        );
      });

      setIsInterviewerTyping(false);
      setInterviewState("ongoing");
    } catch (error) {
      console.error("初始化面试失败:", error);
      // 如果API调用失败，使用默认问题
      const openingContent = getOpeningMessage(type);
      const defaultQuestion = getFirstQuestion(type, subType);

      // 检查当前消息状态，决定如何更新
      setMessages((prev) => {
        console.log(
          "Current messages in catch:",
          prev.length,
          prev.map((m) => ({
            sender: m.sender,
            content: m.content.substring(0, 20),
            id: m.id,
          })),
        );

        // 情况1：还没有任何消息（不太可能发生在这个阶段）
        // 情况2：只有开场白
        // 情况3：有开场白和空问题消息（等待流式响应）
        // 情况4：已经有内容了（流式已经返回了问题）

        if (prev.length === 0) {
          return [
            {
              sender: "interviewer" as const,
              content: openingContent,
              timestamp: new Date().toLocaleTimeString(),
              id: `msg-${Date.now()}-1`,
            },
            {
              sender: "interviewer" as const,
              content: defaultQuestion,
              timestamp: new Date().toLocaleTimeString(),
              id: `msg-${Date.now()}-2`,
            },
          ];
        } else if (prev.length === 1) {
          // 只有开场白，添加默认问题
          return [
            ...prev,
            {
              sender: "interviewer" as const,
              content: defaultQuestion,
              timestamp: new Date().toLocaleTimeString(),
              id: `msg-${Date.now()}-2`,
            },
          ];
        } else {
          // 使用消息ID来更新问题内容
          const hasQuestionMessage = prev.some(
            (msg) => msg.id === questionMessageId,
          );
          if (hasQuestionMessage) {
            return prev.map((msg) =>
              msg.id === questionMessageId
                ? { ...msg, content: defaultQuestion }
                : msg,
            );
          }
        }
        // 已经有完整内容了，不用修改
        return prev;
      });

      setIsInterviewerTyping(false);
      setInterviewState("ongoing");
    } finally {
      setIsInitializing(false); // 初始化完成
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

  // 默认面试问题库
  const getDefaultQuestion = (
    type: InterviewType,
    subType: InterviewSubType | null,
    questionNumber: number,
  ): string => {
    const questions: Record<InterviewType, string[]> = {
      frontend: [
        "请解释一下JavaScript中的闭包是什么，以及它的应用场景。",
        "请描述React中的生命周期方法，以及在函数组件中如何使用hooks替代它们。",
        "请解释CSS中的Flexbox布局，以及如何实现水平和垂直居中。",
        "请描述浏览器的事件循环机制，以及宏任务和微任务的区别。",
        "请解释HTTP和HTTPS的区别，以及HTTPS的工作原理。",
        "请描述Vue中的响应式原理，以及Vue3相比Vue2的改进。",
        "请解释Webpack的工作原理，以及如何进行代码分割优化。",
        "请描述跨域问题的解决方案，以及CORS的工作原理。",
        "请解释TypeScript中的泛型，以及它的应用场景。",
        "请描述前端性能优化的常用方法，包括代码层面和资源层面。",
      ],
      backend: [
        "请解释RESTful API的设计原则，以及如何设计一个良好的API接口。",
        "请描述数据库事务的ACID特性，以及如何处理并发事务问题。",
        "请解释JWT认证的工作原理，以及如何实现安全的用户认证。",
        "请描述微服务架构的优缺点，以及服务间通信的常用方式。",
        "请解释Redis的常用数据结构，以及它们的应用场景。",
        "请描述消息队列的工作原理，以及常用的消息队列系统有哪些。",
        "请解释Docker容器的工作原理，以及如何使用Docker部署应用。",
        "请描述负载均衡的常用算法，以及如何实现高可用的服务架构。",
        "请解释数据库索引的工作原理，以及如何优化SQL查询性能。",
        "请描述分布式系统中的CAP理论，以及如何在实际项目中权衡。",
      ],
      ui: [
        "请描述您的设计理念，以及如何平衡美观性和实用性。",
        "请解释色彩理论在UI设计中的应用，以及如何选择合适的配色方案。",
        "请描述响应式设计的原则，以及如何设计适配不同设备的界面。",
        "请解释用户体验设计的流程，以及如何进行用户研究。",
        "请描述设计系统的概念，以及如何构建和维护设计系统。",
        "请解释无障碍设计的重要性，以及如何确保产品的可访问性。",
        "请描述原型设计的常用工具和方法，以及如何进行交互设计。",
        "请解释设计规范的重要性，以及如何制定设计规范。",
        "请描述设计评审的流程，以及如何收集和处理反馈。",
        "请描述设计趋势的变化，以及如何保持设计的创新性。",
      ],
    };

    const questionList = questions[type] || questions.frontend;
    const index = (questionNumber - 1) % questionList.length;
    return questionList[index];
  };

  // 面试问题总数
  const TOTAL_QUESTIONS = 10;

  const handleSendMessage = (e: FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim()) return;

    // 添加用户消息
    const userMessage: Message = {
      sender: "candidate",
      content: messageInput,
      timestamp: new Date().toLocaleTimeString(),
      id: `msg-${Date.now()}-candidate`,
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setMessageInput("");

    // 计算当前问题数量（面试官消息数 - 1个开场白）
    const interviewerMessages = updatedMessages.filter(
      (msg) => msg.sender === "interviewer",
    );
    const currentQuestionCount = interviewerMessages.length - 1; // 减去开场白

    // 检查是否还有问题要问
    if (currentQuestionCount < TOTAL_QUESTIONS) {
      // 还有问题，调用API生成下一个问题
      setIsInterviewerTyping(true);
      const questionMessageId = `msg-${Date.now()}-question`;

      // 先添加一个空消息占位
      setMessages((prev) => [
        ...prev,
        {
          sender: "interviewer",
          content: "",
          timestamp: new Date().toLocaleTimeString(),
          id: questionMessageId,
        },
      ]);

      // 调用流式API生成下一个问题
      let generatedQuestion = "";
      streamRequest(
        "/aiPreInterviews/generate-question-stream",
        { type, subType },
        (content) => {
          generatedQuestion += content;
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === questionMessageId
                ? { ...msg, content: generatedQuestion }
                : msg,
            ),
          );
        },
        (error) => {
          console.error("生成面试问题失败:", error);
          generatedQuestion = getDefaultQuestion(
            type,
            subType,
            currentQuestionCount + 1,
          );
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === questionMessageId
                ? { ...msg, content: generatedQuestion }
                : msg,
            ),
          );
          setIsInterviewerTyping(false);
        },
        () => {
          if (!generatedQuestion) {
            generatedQuestion = getDefaultQuestion(
              type,
              subType,
              currentQuestionCount + 1,
            );
            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === questionMessageId
                  ? { ...msg, content: generatedQuestion }
                  : msg,
              ),
            );
          }
          setIsInterviewerTyping(false);
        },
      );
    } else {
      // 问题问完了，结束面试
      setTimeout(() => {
        setIsInterviewerTyping(true);

        setTimeout(() => {
          // 提取所有问题和回答
          const questions: string[] = [];
          const answers: string[] = [];

          // 跳过开场白，从第二个面试官消息开始
          let isFirstInterviewer = true;
          for (const msg of updatedMessages) {
            if (msg.sender === "interviewer") {
              if (isFirstInterviewer) {
                isFirstInterviewer = false;
                continue; // 跳过开场白
              }
              questions.push(msg.content);
            } else if (msg.sender === "candidate") {
              answers.push(msg.content);
            }
          }

          const conclusionMessage: Message = {
            sender: "interviewer",
            content: "感谢您的回答。面试到此结束，我们会在后续联系您。",
            timestamp: new Date().toLocaleTimeString(),
            id: `msg-${Date.now()}-conclusion`,
          };

          setMessages((prev) => [...prev, conclusionMessage]);
          setIsInterviewerTyping(false);

          // 调用API分析面试
          setTimeout(async () => {
            try {
              const response = await api.post(
                "/aiPreInterviews/analyze-answers",
                {
                  type,
                  subType,
                  questions,
                  answers,
                },
              );

              console.log("Analysis response:", response);
              const analysis = response.data?.data || response.data;
              navigate(`/interview/summary?type=${type}&subType=${subType}`, {
                state: { analysis },
              });
            } catch (error) {
              console.error("Error analyzing interview:", error);
              navigate(`/interview/summary?type=${type}&subType=${subType}`);
            }
          }, 2000);
        }, 1500);
      }, 500);
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
