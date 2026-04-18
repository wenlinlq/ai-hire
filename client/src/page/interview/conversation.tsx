import { FormEvent, useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { SiteNav } from "../../components/site";

interface Message {
  sender: "interviewer" | "candidate";
  content: string;
  timestamp: string;
}

type InterviewState = 
  | "loading"
  | "preparing"
  | "ongoing"
  | "completed";

type InterviewType = "tech" | "product" | "general";
type InterviewSubType = 
  | "tech-defense"
  | "tech-written"
  | "product-sense"
  | "product-logic";

const InterviewConversation = () => {
  const [searchParams] = useSearchParams();
  const [interviewState, setInterviewState] = useState<InterviewState>("loading");
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
        content: getOpeningMessage(type, subType),
        timestamp: new Date().toLocaleTimeString(),
      };

      // 生成第一个问题
      const firstQuestion: Message = {
        sender: "interviewer",
        content: getFirstQuestion(type, subType),
        timestamp: new Date().toLocaleTimeString(),
      };

      setMessages([openingMessage, firstQuestion]);
      setInterviewState("ongoing");
    } catch (error) {
      console.error("初始化面试失败:", error);
      setInterviewState("preparing");
    }
  };

  const getOpeningMessage = (type: InterviewType, subType?: InterviewSubType): string => {
    const typeMap: Record<InterviewType, string> = {
      tech: "技术面试",
      product: "产品面试",
      general: "综合面试"
    };
    
    return `您好，欢迎参加${typeMap[type]}。我是AI面试官，今天将由我负责您的面试。`;
  };

  const getFirstQuestion = (type: InterviewType, subType?: InterviewSubType): string => {
    switch (type) {
      case "tech":
        if (subType === "tech-defense") {
          return "请您做一个简短的自我介绍，重点介绍您的技术背景和项目经验。";
        } else {
          return "请您做一个简短的自我介绍，重点介绍您的编程技能和解决问题的能力。";
        }
      case "product":
        if (subType === "product-sense") {
          return "请您做一个简短的自我介绍，重点介绍您的产品思维和用户体验设计经验。";
        } else {
          return "请您做一个简短的自我介绍，重点介绍您的逻辑分析能力和问题解决能力。";
        }
      case "general":
        return "请您做一个简短的自我介绍，重点介绍您的工作经验和核心优势。";
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

    setMessages(prev => [...prev, userMessage]);
    setMessageInput("");

    // 模拟AI面试官思考和回复
    setTimeout(() => {
      setIsInterviewerTyping(true);
      
      setTimeout(() => {
        const interviewerMessage: Message = {
          sender: "interviewer",
          content: getNextQuestion(type, subType, messages.length + 1),
          timestamp: new Date().toLocaleTimeString(),
        };
        
        setMessages(prev => [...prev, interviewerMessage]);
        setIsInterviewerTyping(false);
      }, 1500);
    }, 500);
  };

  const getNextQuestion = (type: InterviewType, subType?: InterviewSubType, questionIndex: number): string => {
    const questions: Record<InterviewType, Record<InterviewSubType | "default", string[]>> = {
      tech: {
        "tech-defense": [
          "请您做一个简短的自我介绍，重点介绍您的技术背景和项目经验。",
          "您最熟悉的技术栈是什么？请详细说明您在该技术栈方面的经验。",
          "您在项目开发中遇到过哪些技术挑战？是如何解决的？",
          "请解释一下您对RESTful API设计的理解。",
          "您如何看待前端性能优化？有哪些常用的优化策略？"
        ],
        "tech-written": [
          "请您做一个简短的自我介绍，重点介绍您的编程技能和解决问题的能力。",
          "请编写一个函数来反转字符串。",
          "请解释一下JavaScript中的闭包概念。",
          "请设计一个简单的登录系统，包括前端验证和后端处理。",
          "请分析一下以下代码的时间复杂度和空间复杂度。"
        ],
        "default": [
          "请您做一个简短的自我介绍，重点介绍您的技术背景。",
          "您为什么选择从事技术工作？",
          "您对未来的技术发展有什么看法？"
        ]
      },
      product: {
        "product-sense": [
          "请您做一个简短的自我介绍，重点介绍您的产品思维和用户体验设计经验。",
          "您如何理解产品经理这个角色？",
          "请分享一个您认为设计得很好的产品，并说明理由。",
          "您如何进行用户需求分析？",
          "您如何衡量产品的成功？"
        ],
        "product-logic": [
          "请您做一个简短的自我介绍，重点介绍您的逻辑分析能力和问题解决能力。",
          "请分析一下当前市场上主流的短视频产品，它们的优缺点是什么？",
          "如果让您设计一个新的社交产品，您会如何考虑？",
          "您如何处理产品开发过程中的优先级冲突？",
          "请分享一个您成功解决的产品问题案例。"
        ],
        "default": [
          "请您做一个简短的自我介绍，重点介绍您的产品相关经验。",
          "您为什么对产品管理感兴趣？",
          "您如何看待产品迭代的重要性？"
        ]
      },
      general: {
        "default": [
          "请您做一个简短的自我介绍，重点介绍您的工作经验和核心优势。",
          "您为什么对我们公司感兴趣？",
          "您的职业规划是什么？",
          "您如何处理工作中的压力和挑战？",
          "您的期望薪资是多少？"
        ]
      }
    };

    const typeQuestions = questions[type];
    const subtypeQuestions = subType && typeQuestions[subType] ? typeQuestions[subType] : typeQuestions["default"];
    
    if (questionIndex < subtypeQuestions.length) {
      return subtypeQuestions[questionIndex];
    } else {
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
              <h2 className="text-xl font-semibold text-neutral-800">AI模拟面试</h2>
              <p className="text-sm text-neutral-600">
                {type === "tech" && "技术面试"}
                {type === "product" && "产品面试"}
                {type === "general" && "综合面试"}
                {subType && ` - ${subType.includes("tech") ? "技术" : subType.includes("product") ? "产品" : ""}${subType.includes("defense") ? "答辩" : subType.includes("written") ? "笔试" : subType.includes("sense") ? "感面试" : subType.includes("logic") ? "逻辑面试" : ""}`}
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
                    className={`max-w-[80%] rounded-lg p-4 ${message.sender === "interviewer" 
                      ? "bg-neutral-100 text-neutral-800" 
                      : "bg-primary-500 text-white"}`}
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
                      <div className="h-2 w-2 rounded-full bg-neutral-400 animate-bounce" style={{ animationDelay: "0ms" }}></div>
                      <div className="h-2 w-2 rounded-full bg-neutral-400 animate-bounce" style={{ animationDelay: "150ms" }}></div>
                      <div className="h-2 w-2 rounded-full bg-neutral-400 animate-bounce" style={{ animationDelay: "300ms" }}></div>
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
                  disabled={!messageInput.trim() || interviewState !== "ongoing"}
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