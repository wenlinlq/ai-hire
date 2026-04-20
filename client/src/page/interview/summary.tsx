import { useSearchParams } from "react-router-dom";
import { SiteNav } from "../../components/site";

interface InterviewFeedback {
  overall: number;
  technical: number;
  communication: number;
  problemSolving: number;
  strengths: string[];
  improvements: string[];
  suggestions: string[];
}

const InterviewSummary = () => {
  const [searchParams] = useSearchParams();
  const type = searchParams.get("type") || "frontend";
  const subType = searchParams.get("subType") || "interview";

  const typeLabels: Record<string, string> = {
    frontend: "前端开发",
    backend: "后端开发",
    ui: "UI设计"
  };

  const subTypeLabels: Record<string, string> = {
    interview: "面试",
    written: "笔试"
  };

  const feedback: InterviewFeedback = {
    overall: 85,
    technical: 82,
    communication: 88,
    problemSolving: 84,
    strengths: [
      "技术基础扎实，对前端框架有深入理解",
      "沟通表达清晰，能够准确传达技术概念",
      "问题解决能力强，能够快速定位和解决bug",
      "学习能力强，对新技术有很好的掌握能力"
    ],
    improvements: [
      "可以更深入地分析复杂问题的根本原因",
      "建议提供更多具体的项目案例来展示能力",
      "可以提高技术细节的描述深度",
      "在回答问题时可以更加结构化"
    ],
    suggestions: [
      "在回答问题时使用STAR法则（情境、任务、行动、结果）",
      "提前准备一些常见的技术面试问题答案",
      "多参与开源项目，积累实际项目经验",
      "保持对新技术的好奇心和学习热情"
    ]
  };

  const handleRestart = () => {
    window.location.href = `/interview/preparation`;
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      <SiteNav current="interview" />
      <main className="flex-1 py-12">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-neutral-200 bg-white p-8 shadow-sm">
            <div className="mb-8 text-center">
              <h1 className="mb-4 text-3xl font-bold text-neutral-800">
                面试完成
              </h1>
              <p className="text-lg text-neutral-600">
                感谢您参加{typeLabels[type]}{subTypeLabels[subType]}，以下是您的面试反馈
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
                  {feedback.strengths.map((item, index) => (
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
                  {feedback.improvements.map((item, index) => (
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
                  {feedback.suggestions.map((item, index) => (
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

            <div className="mt-8 flex justify-center gap-4">
              <button
                type="button"
                className="rounded-lg bg-primary-500 px-8 py-3 text-lg font-semibold text-white transition-colors hover:bg-primary-600"
                onClick={handleRestart}
              >
                重新面试
              </button>
              <button
                type="button"
                className="rounded-lg border border-neutral-300 bg-white px-8 py-3 text-lg font-semibold text-neutral-700 transition-colors hover:bg-neutral-50"
                onClick={() => window.location.href = "/"}
              >
                返回首页
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default InterviewSummary;