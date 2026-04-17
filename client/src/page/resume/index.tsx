import { useState } from "react";

import { SiteNav } from "../../components/site";
import resumeApi from "../../api/resumeApi";

function ResumeAnalyze() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [resumeContent, setResumeContent] = useState("");
  const [optimizationPrompt, setOptimizationPrompt] = useState("");
  const [optimizedResume, setOptimizedResume] = useState("");
  const [optimizing, setOptimizing] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      // 检查文件大小，限制为1MB
      if (selectedFile.size > 1024 * 1024) {
        alert("文件大小超过1MB，请上传较小的文件");
        return;
      }
      // 限制文件类型，只接受文本文件
      const allowedTypes = ["text/plain", ".txt"];
      const fileExtension = selectedFile.name.split(".").pop()?.toLowerCase();
      if (
        !allowedTypes.includes(selectedFile.type) &&
        fileExtension !== "txt"
      ) {
        alert("请上传文本文件（.txt）");
        return;
      }
      setFile(selectedFile);
    }
  };

  const extractTextFromFile = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          const content = e.target.result as string;
          // 检查提取的内容是否有效
          if (content && content.length > 0) {
            // 限制内容长度，避免发送过大的数据
            const maxLength = 50000; // 限制为50,000字符
            const truncatedContent =
              content.length > maxLength
                ? content.substring(0, maxLength) +
                  "\n\n[内容已截断，请上传更完整的简历文本]"
                : content;
            resolve(truncatedContent);
          } else {
            reject(new Error("文件内容为空"));
          }
        } else {
          reject(new Error("Failed to read file"));
        }
      };
      reader.onerror = () => reject(new Error("Failed to read file"));
      reader.readAsText(file);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setLoading(true);
    try {
      // 提取文件内容
      const content = await extractTextFromFile(file);
      setResumeContent(content);

      // 调用后端API解析简历
      const parsedData = await resumeApi.parseResume(content);
      setResult(parsedData);
    } catch (error) {
      console.error("Error parsing resume:", error);
      alert("解析简历失败，请重试");
    } finally {
      setLoading(false);
    }
  };

  const handleOptimize = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resumeContent) return;

    setOptimizing(true);
    try {
      const optimized = await resumeApi.optimizeResume(
        resumeContent,
        optimizationPrompt,
      );
      setOptimizedResume(optimized);
    } catch (error) {
      console.error("Error optimizing resume:", error);
      alert("优化简历失败，请重试");
    } finally {
      setOptimizing(false);
    }
  };

  const handleOneClickOptimize = async () => {
    if (!resumeContent) return;

    setOptimizing(true);
    try {
      const optimized = await resumeApi.oneClickOptimizeResume(resumeContent);
      setOptimizedResume(optimized);
    } catch (error) {
      console.error("Error with one-click optimization:", error);
      alert("一键优化失败，请重试");
    } finally {
      setOptimizing(false);
    }
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
              <div className="rounded-lg border-2 border-dashed border-neutral-300 p-8 text-center flex flex-col h-full">
                <h3 className="mb-4 font-medium text-neutral-700">
                  简历上传区域
                </h3>
                <form
                  onSubmit={handleSubmit}
                  className="space-y-4 flex-1 flex flex-col justify-between"
                >
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
                      accept=".txt"
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
              <div className="rounded-lg border border-neutral-200 p-6 flex flex-col h-full">
                <h3 className="mb-4 font-medium text-neutral-700">
                  AI解析结果展示
                </h3>
                {result ? (
                  <div className="space-y-4 flex-1 overflow-y-auto pr-2 max-h-[calc(100vh-300px)]">
                    <p>
                      <span className="font-medium">姓名：</span>
                      {result.name}
                    </p>
                    <p>
                      <span className="font-medium">电话：</span>
                      {result.contact.phone}
                    </p>
                    <p>
                      <span className="font-medium">邮箱：</span>
                      {result.contact.email}
                    </p>
                    {result.education && result.education.length > 0 && (
                      <div>
                        <span className="font-medium">教育背景：</span>
                        {result.education.map((edu: any, index: number) => (
                          <div key={index} className="mt-1 ml-4">
                            <p>
                              {edu.school} - {edu.major} ({edu.degree})
                            </p>
                            <p className="text-sm text-neutral-600">
                              毕业时间：{edu.graduationDate}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                    {result.skills &&
                      (result.skills.technical || result.skills.soft) && (
                        <div>
                          <span className="font-medium">技能标签：</span>
                          <div className="mt-2 flex flex-wrap gap-2">
                            {(result.skills.technical || []).map(
                              (skill: string, index: number) => (
                                <span
                                  key={index}
                                  className="rounded bg-primary-50 px-3 py-1 text-sm text-primary-600"
                                >
                                  [{skill}]
                                </span>
                              ),
                            )}
                            {(result.skills.soft || []).map(
                              (skill: string, index: number) => (
                                <span
                                  key={index}
                                  className="rounded bg-secondary-50 px-3 py-1 text-sm text-secondary-600"
                                >
                                  [{skill}]
                                </span>
                              ),
                            )}
                          </div>
                        </div>
                      )}
                    {result.projectExperience &&
                      result.projectExperience.length > 0 && (
                        <div className="mt-4">
                          <span className="font-medium">项目经历：</span>
                          <div className="mt-2 space-y-2">
                            {result.projectExperience.map(
                              (project: any, index: number) => (
                                <div
                                  key={index}
                                  className="p-3 rounded-lg border border-neutral-100"
                                >
                                  <p className="font-medium">{project.name}</p>
                                  <p className="text-sm text-neutral-600">
                                    {project.responsibilities?.join("; ") ||
                                      project.description}
                                  </p>
                                </div>
                              ),
                            )}
                          </div>
                        </div>
                      )}

                    {result.analysis && (
                      <div className="mt-6 p-4 bg-gradient-to-r from-primary-50 to-secondary-50 rounded-lg border border-primary-200">
                        <h4 className="mb-3 font-bold text-primary-700">
                          简历质量分析
                        </h4>

                        <div className="mb-4">
                          <span className="font-medium">整体评分：</span>
                          <span className="text-2xl font-bold text-primary-600 ml-2">
                            {result.analysis.score}/100
                          </span>
                        </div>

                        <div className="mb-4">
                          <span className="font-medium text-green-700">
                            优点分析：
                          </span>
                          <ul className="mt-2 ml-4 space-y-1">
                            {result.analysis.strengths?.map(
                              (strength: string, index: number) => (
                                <li
                                  key={index}
                                  className="text-sm text-neutral-700"
                                >
                                  ✓ {strength}
                                </li>
                              ),
                            )}
                          </ul>
                        </div>

                        <div className="mb-4">
                          <span className="font-medium text-orange-700">
                            改进建议：
                          </span>
                          <ul className="mt-2 ml-4 space-y-1">
                            {result.analysis.improvements?.map(
                              (improvement: string, index: number) => (
                                <li
                                  key={index}
                                  className="text-sm text-neutral-700"
                                >
                                  • {improvement}
                                </li>
                              ),
                            )}
                          </ul>
                        </div>

                        <div>
                          <span className="font-medium text-blue-700">
                            具体修改意见：
                          </span>
                          <ul className="mt-2 ml-4 space-y-1">
                            {result.analysis.suggestions?.map(
                              (suggestion: string, index: number) => (
                                <li
                                  key={index}
                                  className="text-sm text-neutral-700"
                                >
                                  💡 {suggestion}
                                </li>
                              ),
                            )}
                          </ul>
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

            {/* AI简历优化 */}
            <div className="mt-8 rounded-lg border border-neutral-200 p-6">
              <h3 className="mb-4 font-medium text-neutral-700 text-center">
                AI简历优化
              </h3>
              <div className="space-y-4">
                <form onSubmit={handleOptimize} className="space-y-4">
                  <div>
                    <label
                      htmlFor="optimizationPrompt"
                      className="block mb-2 text-sm font-medium text-neutral-700"
                    >
                      优化提示词（可选）
                    </label>
                    <textarea
                      id="optimizationPrompt"
                      value={optimizationPrompt}
                      onChange={(e) => setOptimizationPrompt(e.target.value)}
                      placeholder="例如：突出我的项目成果，使用量化数据展示"
                      className="w-full rounded-lg border border-neutral-200 px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-primary-500 focus:outline-none resize-none"
                      rows={2}
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={!resumeContent || optimizing}
                    className="w-full rounded-lg bg-primary-500 px-6 py-3 font-semibold text-white transition-colors hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {optimizing ? "优化中..." : "根据提示词优化"}
                  </button>
                  {optimizedResume && (
                    <div className="mt-6">
                      <h4 className="mb-2 font-medium text-neutral-700">
                        优化结果：
                      </h4>
                      <div className="rounded-lg border border-neutral-200 p-4 bg-neutral-50 whitespace-pre-wrap">
                        {optimizedResume}
                      </div>
                    </div>
                  )}
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
