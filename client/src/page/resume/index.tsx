import { useState } from "react";

import { SiteNav } from "../../components/site";

function ResumeAnalyze() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const [chatMessages, setChatMessages] = useState<
    { role: "user" | "ai"; content: string }[]
  >([]);
  const [chatInput, setChatInput] = useState("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setLoading(true);
    // 模拟AI解析过程
    setTimeout(() => {
      setResult({
        name: "张三",
        phone: "13800138000",
        email: "zhangsan@example.com",
        education: {
          school: "北京大学",
          major: "计算机科学与技术",
          degree: "本科",
          graduationYear: "2024",
        },
        skills: ["JavaScript", "React", "Node.js", "Python", "数据结构"],
        projects: [
          {
            name: "个人博客系统",
            description:
              "使用React和Node.js开发的个人博客系统，支持文章发布、评论等功能",
            technologies: ["React", "Node.js", "MongoDB"],
          },
        ],
        experience: [
          {
            company: "ABC科技有限公司",
            position: "前端开发实习生",
            duration: "2023年7月 - 2023年9月",
            description: "参与公司官网的前端开发，使用React和TypeScript",
          },
        ],
      });
      setLoading(false);
    }, 2000);
  };

  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    // 添加用户消息
    const newUserMessage = { role: "user" as const, content: chatInput };
    setChatMessages((prev) => [...prev, newUserMessage]);
    setChatInput("");

    // 模拟AI回复
    setTimeout(() => {
      const aiResponses = [
        "我建议您在简历中添加具体的项目成果和量化数据，这样能更直观地展示您的能力。",
        "您可以使用STAR法则（情境、任务、行动、结果）来描述您的实习经历，使内容更加结构化。",
        "技能部分可以按照熟练度或相关性进行排序，突出与应聘职位相关的技能。",
        "简历格式建议保持简洁明了，使用一致的字体和格式，确保易读性。",
        "如果有个人项目或GitHub仓库，建议在简历中添加链接，让招聘方能够更全面地了解您的能力。",
      ];
      const randomResponse =
        aiResponses[Math.floor(Math.random() * aiResponses.length)];
      const newAiMessage = { role: "ai" as const, content: randomResponse };
      setChatMessages((prev) => [...prev, newAiMessage]);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-700">
      <SiteNav current="resume" />

      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-neutral-800">AI简历解析</h1>
          <p className="mt-2 text-neutral-600">
            上传您的简历，AI将自动解析并提取关键信息
          </p>
        </div>

        <div className="mb-8 rounded-2xl border border-neutral-200 bg-white shadow-sm overflow-hidden">
          <div className="border-b border-neutral-200 bg-primary-700 py-3 text-center">
            <h2 className="text-lg font-semibold text-white">
              简历解析 · AI智能提取
            </h2>
          </div>

          <div className="p-6">
            <div className="grid gap-6 md:grid-cols-2">
              {/* 左侧上传区域 */}
              <div className="rounded-lg border-2 border-dashed border-neutral-300 p-8 text-center">
                <h3 className="mb-4 font-medium text-neutral-700">
                  简历上传区域
                </h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div
                    className="flex flex-col items-center gap-4 cursor-pointer"
                    onClick={() =>
                      document.getElementById("fileInput")?.click()
                    }
                  >
                    <div className="flex flex-col items-center space-y-4">
                      <svg
                        className="h-16 w-16 text-neutral-300"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                        />
                      </svg>
                      <p className="text-lg text-neutral-600">
                        点击或拖拽上传简历
                      </p>
                      <p className="text-sm text-neutral-500">
                        支持 PDF、DOC、DOCX、JPG、PNG 格式
                      </p>
                      {file && (
                        <p className="text-sm text-primary-600">
                          已选择：{file.name}
                        </p>
                      )}
                    </div>
                    <input
                      id="fileInput"
                      type="file"
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={!file || loading}
                    className="w-full rounded-lg bg-primary-500 px-6 py-3 font-semibold text-white transition-colors hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? "解析中..." : "开始解析"}
                  </button>
                </form>
              </div>

              {/* 右侧解析结果 */}
              <div className="rounded-lg border border-neutral-200 p-6 min-h-[400px] flex flex-col">
                <h3 className="mb-4 font-medium text-neutral-700">
                  AI解析结果展示
                </h3>
                {result ? (
                  <div className="space-y-4 flex-1">
                    <p>
                      <span className="font-medium">姓名：</span>
                      {result.name}
                    </p>
                    <p>
                      <span className="font-medium">学校：</span>
                      {result.education.school}
                    </p>
                    <p>
                      <span className="font-medium">专业：</span>
                      {result.education.major}
                    </p>
                    <p>
                      <span className="font-medium">电话：</span>
                      {result.phone}
                    </p>
                    <p>
                      <span className="font-medium">邮箱：</span>
                      {result.email}
                    </p>
                    <div>
                      <span className="font-medium">技能标签：</span>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {result.skills.map((skill: string, index: number) => (
                          <span
                            key={index}
                            className="rounded bg-primary-50 px-3 py-1 text-sm text-primary-600"
                          >
                            [{skill}]
                          </span>
                        ))}
                      </div>
                    </div>
                    {result.projects && result.projects.length > 0 && (
                      <div className="mt-4">
                        <span className="font-medium">项目经历：</span>
                        <div className="mt-2 space-y-2">
                          {result.projects.map(
                            (project: any, index: number) => (
                              <div
                                key={index}
                                className="p-3 rounded-lg border border-neutral-100"
                              >
                                <p className="font-medium">{project.name}</p>
                                <p className="text-sm text-neutral-600">
                                  {project.description}
                                </p>
                              </div>
                            ),
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex-1 flex items-center justify-center text-center text-neutral-500">
                    <div>
                      <svg
                        className="mx-auto h-16 w-16 text-neutral-300 mb-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                      <p>上传简历后将显示解析结果</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* AI简历优化 - 对话模式 */}
            <div className="mt-8 rounded-lg border border-neutral-200 p-6">
              <h3 className="mb-4 font-medium text-neutral-700 text-center">
                AI简历优化 - 智能对话
              </h3>
              <div className="space-y-4">
                {/* 对话历史 */}
                <div className="h-80 overflow-y-auto rounded-lg border border-neutral-200 p-4 space-y-4">
                  {chatMessages.length === 0 ? (
                    <div className="text-center text-neutral-500 py-8">
                      <p>您好！我是AI简历优化助手，有什么可以帮助您的？</p>
                      <p className="mt-2 text-sm">
                        例如："如何优化我的项目经历描述？"
                      </p>
                    </div>
                  ) : (
                    chatMessages.map((message, index) => (
                      <div
                        key={index}
                        className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[80%] p-3 rounded-lg ${message.role === "user" ? "bg-primary-100 text-primary-700" : "bg-neutral-100 text-neutral-700"}`}
                        >
                          <p>{message.content}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* 输入框 */}
                <form onSubmit={handleChatSubmit} className="flex gap-2">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="输入您的问题..."
                    className="flex-1 rounded-lg border border-neutral-200 px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-primary-500 focus:outline-none"
                  />
                  <button
                    type="submit"
                    disabled={!chatInput.trim()}
                    className="rounded-lg bg-primary-500 px-6 py-3 font-semibold text-white transition-colors hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    发送
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ResumeAnalyze;
