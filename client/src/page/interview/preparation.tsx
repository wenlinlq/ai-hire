import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { SiteNav } from "../../components/site";

type InterviewType = "frontend" | "backend" | "ui";
type InterviewSubType = "interview" | "written";

const typeConfig: Record<
  InterviewType,
  { label: string; desc: string; color: string; button: string }
> = {
  frontend: {
    label: "前端",
    desc: "适合前端开发工程师岗位",
    color: "bg-primary-500",
    button: "bg-primary-500 hover:bg-primary-600",
  },
  backend: {
    label: "后端",
    desc: "适合后端开发工程师岗位",
    color: "bg-primary-500",
    button: "bg-primary-500 hover:bg-primary-600",
  },
  ui: {
    label: "UI",
    desc: "适合UI设计师岗位",
    color: "bg-neutral-600",
    button: "bg-neutral-600 hover:bg-neutral-700",
  },
};

const subTypeConfig: Record<
  InterviewType,
  { label: string; options: { value: InterviewSubType; label: string }[] }
> = {
  frontend: {
    label: "选择面试形式",
    options: [
      { value: "interview", label: "技术面试" },
      { value: "written", label: "技术笔试" },
    ],
  },
  backend: {
    label: "选择面试形式",
    options: [
      { value: "interview", label: "技术面试" },
      { value: "written", label: "技术笔试" },
    ],
  },
  ui: {
    label: "选择面试形式",
    options: [{ value: "interview", label: "面试" }],
  },
};

const InterviewPreparation = () => {
  const navigate = useNavigate();
  const [selectedType, setSelectedType] = useState<InterviewType>("frontend");
  const [selectedSubType, setSelectedSubType] =
    useState<InterviewSubType | null>(null);

  const handleStartInterview = () => {
    // 跳转到面试对话页面，携带面试类型和子类型参数
    let url = `/interview/conversation?type=${selectedType}`;
    if (selectedSubType || selectedType === "ui") {
      // 对于UI类型，默认使用interview子类型
      url += `&subType=${selectedSubType || "interview"}`;
    }
    navigate(url);
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      <SiteNav current="interview" />
      <main className="flex-1 py-12">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-neutral-200 bg-white p-8 shadow-sm">
            <div className="mb-8 text-center">
              <h1 className="mb-4 text-3xl font-bold text-neutral-800">
                面试准备
              </h1>
              <p className="text-lg text-neutral-600">
                请选择面试类型，做好充分准备
              </p>
            </div>

            <div className="space-y-6">
              <div className="rounded-lg border border-neutral-200 p-6">
                <h2 className="mb-6 text-xl font-semibold text-neutral-800">
                  选择面试类型
                </h2>
                <div className="grid gap-4 md:grid-cols-3">
                  {(Object.keys(typeConfig) as InterviewType[]).map((type) => {
                    const item = typeConfig[type];
                    return (
                      <div
                        key={type}
                        className={`rounded-xl border border-neutral-200 p-6 transition-shadow hover:shadow-lg cursor-pointer ${selectedType === type ? "ring-2 ring-primary-500 ring-offset-2" : ""}`}
                        onClick={() => {
                          setSelectedType(type);
                          // 只有非UI类型才需要重置selectedSubType
                          if (type !== "ui") {
                            setSelectedSubType(null);
                          }
                        }}
                      >
                        <div
                          className={`mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full ${item.color}`}
                        >
                          <span className="text-sm font-bold text-white">
                            {item.label.slice(0, 2)}
                          </span>
                        </div>
                        <h3 className="mb-2 text-center text-lg font-medium text-neutral-800">
                          {item.label}
                        </h3>
                        <p className="text-center text-sm text-neutral-600">
                          {item.desc}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 子选项选择 */}
              {selectedType !== "ui" &&
                subTypeConfig[selectedType].options.length > 0 && (
                  <div className="rounded-lg border border-neutral-200 p-6">
                    <h2 className="mb-6 text-xl font-semibold text-neutral-800">
                      {subTypeConfig[selectedType].label}
                    </h2>
                    <div className="grid gap-4 md:grid-cols-2">
                      {subTypeConfig[selectedType].options.map((option) => (
                        <div
                          key={option.value}
                          className={`rounded-xl border border-neutral-200 p-6 transition-shadow hover:shadow-lg cursor-pointer ${selectedSubType === option.value ? "ring-2 ring-primary-500 ring-offset-2" : ""}`}
                          onClick={() => setSelectedSubType(option.value)}
                        >
                          <h3 className="text-center text-lg font-medium text-neutral-800">
                            {option.label}
                          </h3>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              <div className="rounded-lg border border-neutral-200 p-6 bg-neutral-50">
                <h2 className="mb-4 text-xl font-semibold text-neutral-800">
                  面试准备事项
                </h2>
                <ul className="space-y-3 text-neutral-600">
                  <li className="flex items-start">
                    <span className="mr-3 mt-1 text-primary-500">•</span>
                    <span>
                      准备一个简洁有力的自我介绍，包括教育背景、工作经验、核心技能和职业目标
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-3 mt-1 text-primary-500">•</span>
                    <span>
                      准备回答常见的面试问题，如"你的优点和缺点是什么？"、"为什么想加入我们公司？"等
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-3 mt-1 text-primary-500">•</span>
                    <span>
                      准备详细的项目经验，包括项目背景、你的角色、使用的技术栈和取得的成果
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-3 mt-1 text-primary-500">•</span>
                    <span>
                      确保网络连接稳定，摄像头和麦克风正常工作，找一个安静的环境进行面试
                    </span>
                  </li>
                </ul>
              </div>

              <div className="flex justify-center">
                <button
                  type="button"
                  className="rounded-lg bg-primary-500 px-8 py-3 text-lg font-semibold text-white transition-colors hover:bg-primary-600"
                  onClick={handleStartInterview}
                  disabled={
                    selectedType !== "ui" &&
                    subTypeConfig[selectedType].options.length > 0 &&
                    !selectedSubType
                  }
                >
                  开始模拟面试
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default InterviewPreparation;
