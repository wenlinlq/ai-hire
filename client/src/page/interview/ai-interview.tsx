import { FormEvent, useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { aiPreInterviewApi } from "../../api/aiPreInterviewApi";
import userApi from "../../api/userApi";

type InterviewState =
  | "loading"
  | "preparing"
  | "starting"
  | "ongoing"
  | "concluded"
  | "completed";
type Message = {
  sender: "interviewer" | "candidate";
  content: string;
  timestamp: string;
};

interface InterviewData {
  id: string;
  title: string;
  company: string;
  department: string;
  interviewer: string;
  interviewId: string;
  questions: string[];
  feedback?: {
    strengths: string[];
    improvements: string[];
    suggestions: string[];
  };
}

function AIInterview() {
  const { id } = useParams<{ id: string }>();
  const [interviewState, setInterviewState] =
    useState<InterviewState>("loading");
  const [interviewData, setInterviewData] = useState<InterviewData | null>(
    null,
  );
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageInput, setMessageInput] = useState("");
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isInterviewerTyping, setIsInterviewerTyping] = useState(false);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState<{
    overall: number;
    technical: number;
    communication: number;
    problemSolving: number;
  }>({ overall: 0, technical: 0, communication: 0, problemSolving: 0 });
  const [feedbackSections, setFeedbackSections] = useState<{
    strengths: string[];
    improvements: string[];
    suggestions: string[];
  }>({
    strengths: [],
    improvements: [],
    suggestions: [],
  });
  const chatRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatRef.current?.scrollTo({
      top: chatRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, isInterviewerTyping]);

  useEffect(() => {
    const fetchInterviewData = async () => {
      try {
        setInterviewState("loading");
        // 从API获取面试详情
        const response = await aiPreInterviewApi.getAiPreInterviewById(id!);
        const data = response.data;

        // 构建面试数据
        const interviewData: InterviewData = {
          id: data._id,
          title: data.position?.title || "未知岗位",
          company: data.team?.name || data.position?.company || "未知团队",
          department: data.position?.department || "未知部门",
          interviewer: "AI面试官",
          interviewId: data._id,
          questions: data.questions || [],
          feedback: data.feedback,
        };

        // 检查是否有自我介绍问题
        const hasSelfIntroduction = interviewData.questions.some(
          (question) =>
            question.includes("自我介绍") ||
            question.includes("介绍一下") ||
            question.includes("自我"),
        );

        // 如果没有自我介绍问题，自动添加一个
        if (!hasSelfIntroduction) {
          interviewData.questions.unshift("首先，请您做一个简短的自我介绍。");
        }

        // 检查是否有问题
        console.log("面试问题:", interviewData.questions);

        setInterviewData(interviewData);

        // 初始化消息
        const initialMessage: Message = {
          sender: "interviewer",
          content: `您好，欢迎参加${interviewData.company}${interviewData.title}岗位的面试。我是${interviewData.interviewer}，今天将由我负责您的面试。`,
          timestamp: new Date().toLocaleTimeString(),
        };

        const firstQuestion: Message = {
          sender: "interviewer",
          content:
            interviewData.questions[0] || "首先，请您做一个简短的自我介绍。",
          timestamp: new Date().toLocaleTimeString(),
        };

        setMessages([initialMessage, firstQuestion]);
        setInterviewState("preparing");
      } catch (error) {
        console.error("获取面试数据失败:", error);
        setInterviewState("preparing");
      }
    };

    if (id) {
      fetchInterviewData();
    }
  }, [id]);

  const startInterview = () => {
    if (!interviewData) return;

    setInterviewState("starting");
    // 3秒后自动进入面试
    setTimeout(() => {
      setInterviewState("ongoing");
      // 显示第一个问题
      console.log("开始面试，问题数量:", interviewData.questions.length);
      console.log("问题列表:", interviewData.questions);
      if (interviewData.questions.length > 0) {
        const firstQuestion: Message = {
          sender: "interviewer",
          content: interviewData.questions[0],
          timestamp: new Date().toLocaleTimeString(),
        };
        // 保留初始消息，添加第一个问题
        setMessages([
          {
            sender: "interviewer",
            content: `您好，欢迎参加${interviewData.company}${interviewData.title}岗位的面试。我是${interviewData.interviewer}，今天将由我负责您的面试。`,
            timestamp: new Date().toLocaleTimeString(),
          },
          firstQuestion,
        ]);
        setCurrentQuestionIndex(0);
        console.log("显示第一个问题:", interviewData.questions[0]);
      } else {
        // 如果没有问题，使用默认问题
        const defaultQuestion: Message = {
          sender: "interviewer",
          content: "首先，请您做一个简短的自我介绍。",
          timestamp: new Date().toLocaleTimeString(),
        };
        // 保留初始消息，添加默认问题
        setMessages([
          {
            sender: "interviewer",
            content: `您好，欢迎参加${interviewData.company}${interviewData.title}岗位的面试。我是${interviewData.interviewer}，今天将由我负责您的面试。`,
            timestamp: new Date().toLocaleTimeString(),
          },
          defaultQuestion,
        ]);
        setCurrentQuestionIndex(0);
        console.log("显示默认问题");
      }
    }, 3000);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const content = messageInput.trim();
    if (!content || interviewState !== "ongoing" || !interviewData) {
      return;
    }

    const newMessage: Message = {
      sender: "candidate",
      content,
      timestamp: new Date().toLocaleTimeString(),
    };

    setMessages((current) => [...current, newMessage]);
    setMessageInput("");
    setIsInterviewerTyping(true);

    window.setTimeout(() => {
      setIsInterviewerTyping(false);
      // 检查是否有问题
      if (interviewData.questions.length > 0) {
        // 如果有问题，检查是否还有下一个问题
        if (currentQuestionIndex < interviewData.questions.length - 1) {
          const nextQuestion: Message = {
            sender: "interviewer",
            content: interviewData.questions[currentQuestionIndex + 1],
            timestamp: new Date().toLocaleTimeString(),
          };
          setMessages((current) => [...current, nextQuestion]);
          setCurrentQuestionIndex((current) => current + 1);
        } else {
          // 所有问题都已回答完毕
          const conclusion: Message = {
            sender: "interviewer",
            content:
              "感谢您的回答。面试到此结束，我们会在3个工作日内通知您面试结果。",
            timestamp: new Date().toLocaleTimeString(),
          };
          setMessages((current) => [...current, conclusion]);
          setInterviewState("concluded");

          // 生成模拟评分
          const overallScore = Math.floor(Math.random() * 20) + 80;
          setFeedback({
            overall: overallScore,
            technical: Math.floor(Math.random() * 20) + 80,
            communication: Math.floor(Math.random() * 20) + 80,
            problemSolving: Math.floor(Math.random() * 20) + 80,
          });

          // 使用面试数据中的反馈或默认反馈
          setFeedbackSections(
            interviewData.feedback || {
              strengths: [
                "技术基础扎实，对前端核心概念有清晰理解",
                "项目经验丰富，能够独立完成复杂功能开发",
                "代码风格规范，注重代码质量和可维护性",
                "沟通表达清晰，能够有条理地阐述技术方案",
              ],
              improvements: [
                "可以更深入地了解前端性能优化的高级策略",
                "建议加强对前端安全最佳实践的学习",
                "可以提高对新技术和框架的探索能力",
              ],
              suggestions: [
                "在回答问题时，可以使用STAR法则（情境、任务、行动、结果）来结构化您的回答",
                "建议提前了解公司的业务和产品，以便更好地展示您的适配性",
                "在技术讨论中，可以主动分享您的思考过程和决策依据",
              ],
            },
          );

          // 调用后端API完成AI预面试
          const completeInterview = async () => {
            try {
              await aiPreInterviewApi.completeAiPreInterview(
                interviewData.interviewId,
                {
                  score: overallScore,
                  questions: interviewData.questions.map((question, index) => ({
                    questionId: `q${index + 1}`,
                    question: question,
                    userAnswer: "", // 这里可以根据实际情况获取用户的回答
                    score: overallScore,
                  })),
                },
              );
              console.log("AI预面试完成，已通知后端");
            } catch (error) {
              console.error("完成AI预面试失败:", error);
            }
          };

          completeInterview();
        }
      } else {
        // 如果没有问题，只在用户回答了默认问题后结束面试
        if (currentQuestionIndex === 0) {
          // 这是用户回答的第一个问题（默认问题），结束面试
          const conclusion: Message = {
            sender: "interviewer",
            content:
              "感谢您的回答。面试到此结束，我们会在3个工作日内通知您面试结果。",
            timestamp: new Date().toLocaleTimeString(),
          };
          setMessages((current) => [...current, conclusion]);
          setInterviewState("concluded");

          // 生成模拟评分
          const overallScore = Math.floor(Math.random() * 20) + 80;
          setFeedback({
            overall: overallScore,
            technical: Math.floor(Math.random() * 20) + 80,
            communication: Math.floor(Math.random() * 20) + 80,
            problemSolving: Math.floor(Math.random() * 20) + 80,
          });

          // 使用面试数据中的反馈或默认反馈
          setFeedbackSections(
            interviewData.feedback || {
              strengths: [
                "技术基础扎实，对前端核心概念有清晰理解",
                "项目经验丰富，能够独立完成复杂功能开发",
                "代码风格规范，注重代码质量和可维护性",
                "沟通表达清晰，能够有条理地阐述技术方案",
              ],
              improvements: [
                "可以更深入地了解前端性能优化的高级策略",
                "建议加强对前端安全最佳实践的学习",
                "可以提高对新技术和框架的探索能力",
              ],
              suggestions: [
                "在回答问题时，可以使用STAR法则（情境、任务、行动、结果）来结构化您的回答",
                "建议提前了解公司的业务和产品，以便更好地展示您的适配性",
                "在技术讨论中，可以主动分享您的思考过程和决策依据",
              ],
            },
          );

          // 调用后端API完成AI预面试
          const completeInterview = async () => {
            try {
              await aiPreInterviewApi.completeAiPreInterview(
                interviewData.interviewId,
                {
                  score: overallScore,
                  questions: interviewData.questions.map((question, index) => ({
                    questionId: `q${index + 1}`,
                    question: question,
                    userAnswer: "", // 这里可以根据实际情况获取用户的回答
                    score: overallScore,
                  })),
                },
              );
              console.log("AI预面试完成，已通知后端");
            } catch (error) {
              console.error("完成AI预面试失败:", error);
            }
          };

          completeInterview();
        }
      }
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col">
      <main className="flex-1 py-12">
        {/* 加载状态 */}
        {interviewState === "loading" && (
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <div className="rounded-2xl border border-neutral-200 bg-white p-8 shadow-sm">
              <div className="text-center">
                <div className="mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-full bg-primary-100">
                  <div className="animate-spin rounded-full border-4 border-t-primary-700 border-r-primary-100 border-b-primary-100 border-l-primary-100 h-16 w-16" />
                </div>
                <h1 className="mb-4 text-3xl font-bold text-neutral-800">
                  加载面试数据
                </h1>
                <p className="text-lg text-neutral-600">
                  正在获取面试信息，请稍候...
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 面试准备页面 */}
        {interviewState === "preparing" && interviewData && (
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <div className="rounded-2xl border border-neutral-200 bg-white p-8 shadow-sm">
              <div className="mb-8 text-center">
                <h1 className="mb-4 text-3xl font-bold text-neutral-800">
                  面试准备
                </h1>
                <p className="text-lg text-neutral-600">
                  请确认面试信息，准备开始正式面试
                </p>
              </div>

              <div className="space-y-6">
                <div className="rounded-lg border border-neutral-200 p-6">
                  <h2 className="mb-4 text-xl font-semibold text-neutral-800">
                    面试信息
                  </h2>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <p className="text-sm text-neutral-500">面试岗位</p>
                      <p className="font-medium text-neutral-800">
                        {interviewData.title}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-neutral-500">团队</p>
                      <p className="font-medium text-neutral-800">
                        {interviewData.company}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-neutral-500">部门</p>
                      <p className="font-medium text-neutral-800">
                        {interviewData.department}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-neutral-500">面试官</p>
                      <p className="font-medium text-neutral-800">
                        {interviewData.interviewer}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-neutral-500">面试时间</p>
                      <p className="font-medium text-neutral-800">
                        {new Date().toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-lg border border-neutral-200 p-6 bg-neutral-50">
                  <h2 className="mb-4 text-xl font-semibold text-neutral-800">
                    面试须知
                  </h2>
                  <ul className="space-y-2 text-neutral-600">
                    <li className="flex items-start">
                      <span className="mr-2 mt-1 text-primary-500">•</span>
                      请确保网络连接稳定，环境安静
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2 mt-1 text-primary-500">•</span>
                      面试过程中请保持专注，认真回答每个问题
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2 mt-1 text-primary-500">•</span>
                      回答问题时请尽量详细，展示您的专业能力
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2 mt-1 text-primary-500">•</span>
                      面试结束后，您将收到详细的面试反馈
                    </li>
                  </ul>
                </div>

                <div className="flex justify-center">
                  <button
                    type="button"
                    className="rounded-lg bg-primary-500 px-8 py-3 text-lg font-semibold text-white transition-colors hover:bg-primary-600"
                    onClick={startInterview}
                  >
                    开始面试
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 面试开始页面 */}
        {interviewState === "starting" && (
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <div className="rounded-2xl border border-neutral-200 bg-white p-8 shadow-sm">
              <div className="text-center">
                <div className="mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-full bg-primary-100">
                  <div className="animate-spin rounded-full border-4 border-t-primary-700 border-r-primary-100 border-b-primary-100 border-l-primary-100 h-16 w-16" />
                </div>
                <h1 className="mb-4 text-3xl font-bold text-neutral-800">
                  面试即将开始
                </h1>
                <p className="text-lg text-neutral-600 mb-8">
                  系统正在准备面试环境，请稍候...
                </p>
                <div className="mx-auto max-w-md">
                  <div className="h-2 w-full overflow-hidden rounded-full bg-neutral-200">
                    <div
                      className="animate-progress h-full bg-primary-700"
                      style={{ animationDuration: "3s" }}
                    />
                  </div>
                </div>
                <p className="mt-4 text-sm text-neutral-500">
                  面试官 {interviewData?.interviewer || "AI面试官"} 正在准备中
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 面试进行中页面 */}
        {interviewState === "ongoing" && (
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
              <div className="bg-primary-700 p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold">正式面试</h2>
                    <p className="mt-1 text-primary-100">
                      {interviewData?.company || "未知公司"} -{" "}
                      {interviewData?.title || "未知岗位"}
                    </p>
                  </div>
                  <div className="rounded-full bg-green-500 px-3 py-1 text-sm">
                    面试进行中
                  </div>
                </div>
              </div>

              <div
                ref={chatRef}
                className="h-[600px] space-y-6 overflow-y-auto p-6"
              >
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex items-start ${message.sender === "candidate" ? "justify-end" : ""}`}
                  >
                    {message.sender === "interviewer" && (
                      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary-700 text-white">
                        {(interviewData?.interviewer || "AI面试官").charAt(0)}
                      </div>
                    )}
                    <div
                      className={`max-w-[80%] rounded-lg p-4 ${message.sender === "interviewer" ? "ml-3 bg-primary-50 text-neutral-800" : "bg-primary-100 text-neutral-800"}`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-medium text-neutral-500">
                          {message.sender === "interviewer"
                            ? interviewData?.interviewer || "AI面试官"
                            : "我"}
                        </span>
                        <span className="text-xs text-neutral-400">
                          {message.timestamp}
                        </span>
                      </div>
                      <p>{message.content}</p>
                    </div>
                  </div>
                ))}

                {isInterviewerTyping && (
                  <div className="flex items-start">
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary-700 text-white">
                      {(interviewData?.interviewer || "AI面试官").charAt(0)}
                    </div>
                    <div className="ml-3 rounded-lg bg-primary-50 p-4">
                      <div className="flex items-center gap-1">
                        <span className="h-2 w-2 rounded-full bg-primary-700" />
                        <span className="h-2 w-2 rounded-full bg-primary-700" />
                        <span className="h-2 w-2 rounded-full bg-primary-700" />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="border-t border-neutral-200 p-4">
                <form className="flex" onSubmit={handleSubmit}>
                  <input
                    type="text"
                    value={messageInput}
                    onChange={(event) => setMessageInput(event.target.value)}
                    placeholder="请输入你的回答..."
                    className="flex-1 rounded-l-lg border border-neutral-300 px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-primary-500 focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="rounded-r-lg bg-primary-700 px-6 py-3 text-white transition-colors hover:bg-primary-800"
                  >
                    提交回答
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* 面试结束页面 - 显示结束语和下一步按钮 */}
        {interviewState === "concluded" && (
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
              <div className="bg-primary-700 p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold">面试结束</h2>
                    <p className="mt-1 text-primary-100">
                      {interviewData?.company || "未知公司"} -{" "}
                      {interviewData?.title || "未知岗位"}
                    </p>
                  </div>
                  <div className="rounded-full bg-blue-500 px-3 py-1 text-sm">
                    面试已结束
                  </div>
                </div>
              </div>

              <div
                ref={chatRef}
                className="h-[600px] space-y-6 overflow-y-auto p-6"
              >
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex items-start ${message.sender === "candidate" ? "justify-end" : ""}`}
                  >
                    {message.sender === "interviewer" && (
                      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary-700 text-white">
                        {(interviewData?.interviewer || "AI面试官").charAt(0)}
                      </div>
                    )}
                    <div
                      className={`max-w-[80%] rounded-lg p-4 ${message.sender === "interviewer" ? "ml-3 bg-primary-50 text-neutral-800" : "bg-primary-100 text-neutral-800"}`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-medium text-neutral-500">
                          {message.sender === "interviewer"
                            ? interviewData?.interviewer || "AI面试官"
                            : "我"}
                        </span>
                        <span className="text-xs text-neutral-400">
                          {message.timestamp}
                        </span>
                      </div>
                      <p>{message.content}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-neutral-200 p-6 bg-neutral-50">
                <div className="text-center mb-6">
                  <p className="text-lg text-neutral-700">
                    面试已经完成，您可以查看详细的面试反馈
                  </p>
                </div>
                <div className="flex justify-center">
                  <button
                    type="button"
                    className="rounded-lg bg-primary-500 px-8 py-3 text-lg font-semibold text-white transition-colors hover:bg-primary-600"
                    onClick={() => setInterviewState("completed")}
                  >
                    查看面试反馈
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 面试完成页面 */}
        {interviewState === "completed" && (
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <div className="rounded-2xl border border-neutral-200 bg-white p-8 shadow-sm">
              <div className="mb-8 text-center">
                <h1 className="mb-4 text-3xl font-bold text-neutral-800">
                  面试完成
                </h1>
                <p className="text-lg text-neutral-600">
                  感谢您参加本次面试，以下是您的面试反馈
                </p>
              </div>

              <div className="mb-8">
                <h2 className="mb-6 text-xl font-semibold text-neutral-800">
                  面试评分
                </h2>
                <div className="grid gap-6 md:grid-cols-4">
                  {[
                    [
                      "总体评分",
                      feedback.overall,
                      "bg-primary-50 text-primary-700",
                    ],
                    [
                      "技术能力",
                      feedback.technical,
                      "bg-blue-50 text-blue-700",
                    ],
                    [
                      "沟通表达",
                      feedback.communication,
                      "bg-green-50 text-green-700",
                    ],
                    [
                      "问题解决",
                      feedback.problemSolving,
                      "bg-purple-50 text-purple-700",
                    ],
                  ].map(([label, value, classes]) => (
                    <div
                      key={label}
                      className={`rounded-xl p-4 text-center ${classes}`}
                    >
                      <div className="mb-2 text-3xl font-bold">{value}</div>
                      <div className="text-sm font-medium">{label}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-8">
                <div>
                  <h3 className="mb-4 text-lg font-semibold text-neutral-800">
                    优势
                  </h3>
                  <ul className="space-y-3">
                    {feedbackSections.strengths.map((item, index) => (
                      <li key={index} className="flex items-start">
                        <span className="mr-3 mt-1 flex h-5 w-5 items-center justify-center rounded-full bg-green-100 text-green-800 text-sm font-medium">
                          ✓
                        </span>
                        <span className="text-neutral-700">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="mb-4 text-lg font-semibold text-neutral-800">
                    改进建议
                  </h3>
                  <ul className="space-y-3">
                    {feedbackSections.improvements.map((item, index) => (
                      <li key={index} className="flex items-start">
                        <span className="mr-3 mt-1 flex h-5 w-5 items-center justify-center rounded-full bg-yellow-100 text-yellow-800 text-sm font-medium">
                          !
                        </span>
                        <span className="text-neutral-700">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="mb-4 text-lg font-semibold text-neutral-800">
                    面试技巧建议
                  </h3>
                  <ul className="space-y-3">
                    {feedbackSections.suggestions.map((item, index) => (
                      <li key={index} className="flex items-start">
                        <span className="mr-3 mt-1 flex h-5 w-5 items-center justify-center rounded-full bg-blue-100 text-blue-800 text-sm font-medium">
                          i
                        </span>
                        <span className="text-neutral-700">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="mt-10 flex justify-center space-x-4">
                <button
                  type="button"
                  className="rounded-lg border border-neutral-300 px-6 py-3 text-neutral-700 transition-colors hover:bg-neutral-50"
                  onClick={() => {
                    setInterviewState("preparing");
                    setMessages([]);
                    setCurrentQuestionIndex(0);
                    setFeedback({
                      overall: 0,
                      technical: 0,
                      communication: 0,
                      problemSolving: 0,
                    });
                  }}
                >
                  重新面试
                </button>
                <button
                  type="button"
                  className="rounded-lg bg-primary-700 px-6 py-3 text-white transition-colors hover:bg-primary-800"
                >
                  下载面试报告
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default AIInterview;
