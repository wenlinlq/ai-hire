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
      // 检查文件大小，限制为10MB
      if (selectedFile.size > 10 * 1024 * 1024) {
        alert("文件大小超过10MB，请上传较小的文件");
        return;
      }
      // 限制文件类型，只接受指定格式
      const allowedExtensions = ["pdf", "doc", "docx", "jpg", "jpeg", "png"];
      const fileExtension = selectedFile.name.split(".").pop()?.toLowerCase();
      if (!fileExtension || !allowedExtensions.includes(fileExtension)) {
        alert("请上传 PDF、DOC、DOCX、JPG、JPEG、PNG 格式的文件");
        return;
      }
      setFile(selectedFile);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setLoading(true);
    try {
      // 直接将文件发送到后端
      const formData = new FormData();
      formData.append("resume", file);

      // 调用后端API解析简历
      const response = await resumeApi.uploadAndParseResume(formData);

      // 后端返回的数据结构: { success: true, data: { extracted_data, analysis } }
      const parsedData = response.data || response;

      // 保存解析结果
      setResult(parsedData);

      // 提取简历文本内容用于优化功能（如果有的话）
      if (parsedData.extracted_data?.content) {
        setResumeContent(parsedData.extracted_data.content);
      } else if (parsedData.rawContent) {
        setResumeContent(parsedData.rawContent);
      }
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
              <div className="rounded-lg border border-neutral-200 p-6 flex flex-col h-full">
                <h3 className="mb-4 font-medium text-neutral-700">
                  AI解析结果展示
                </h3>
                {result ? (
                  <div className="space-y-4 flex-1 overflow-y-auto pr-2 max-h-[calc(100vh-300px)]">
                    {(() => {
                      // 从正确路径读取数据
                      const data = result.data || result;
                      const extractedData = data.extracted_data || {};
                      const analysis = data.analysis || {};
                      const basicInfo = extractedData.basic_info || {};
                      const educationList = extractedData.education || [];
                      const workExperience =
                        extractedData.work_experience || [];
                      const skills = analysis.skills || {};

                      return (
                        <>
                          {/* 基本信息 */}
                          <p>
                            <span className="font-medium">姓名：</span>
                            {basicInfo.name ||
                              analysis.summary?.name ||
                              "未识别"}
                          </p>
                          <p>
                            <span className="font-medium">电话：</span>
                            {basicInfo.phone || "未识别"}
                          </p>
                          <p>
                            <span className="font-medium">邮箱：</span>
                            {basicInfo.email || "未识别"}
                          </p>

                          {/* 教育背景 */}
                          {educationList.length > 0 && (
                            <div>
                              <span className="font-medium">教育背景：</span>
                              {educationList.map((edu: any, index: number) => (
                                <div key={index} className="mt-1 ml-4">
                                  <p>
                                    {edu.school || "未识别"} -{" "}
                                    {edu.major || "未知专业"} (
                                    {edu.degreeLevel || "本科"})
                                  </p>
                                  <p className="text-sm text-neutral-600">
                                    {edu.period?.startDate} -{" "}
                                    {edu.period?.endDate}
                                  </p>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* 技能标签 */}
                          {(skills.tech_stack?.length > 0 ||
                            skills.soft_skills?.length > 0) && (
                            <div>
                              <span className="font-medium">技能标签：</span>
                              <div className="mt-2 flex flex-wrap gap-2">
                                {(skills.tech_stack || []).map(
                                  (skill: string, index: number) => (
                                    <span
                                      key={index}
                                      className="rounded bg-primary-50 px-3 py-1 text-sm text-primary-600"
                                    >
                                      [{skill}]
                                    </span>
                                  ),
                                )}
                                {(skills.soft_skills || []).map(
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

                          {/* 项目经历 */}
                          {workExperience.length > 0 && (
                            <div className="mt-4">
                              <span className="font-medium">项目经历：</span>
                              <div className="mt-2 space-y-2">
                                {workExperience.map(
                                  (project: any, index: number) => (
                                    <div
                                      key={index}
                                      className="p-3 rounded-lg border border-neutral-100"
                                    >
                                      <p className="font-medium">
                                        {project.companyName ||
                                          project.position ||
                                          "未识别"}
                                      </p>
                                      <p className="text-sm text-neutral-600">
                                        {project.jobDescription?.substring(
                                          0,
                                          200,
                                        ) || "未提取"}
                                        ...
                                      </p>
                                    </div>
                                  ),
                                )}
                              </div>
                            </div>
                          )}

                          {/* AI 分析结果 */}
                          {analysis && (
                            <div className="mt-6 p-4 bg-gradient-to-r from-primary-50 to-secondary-50 rounded-lg border border-primary-200">
                              <h4 className="mb-3 font-bold text-primary-700">
                                简历质量分析
                              </h4>

                              <div className="mb-4">
                                <span className="font-medium">整体评分：</span>
                                <span className="text-2xl font-bold text-primary-600 ml-2">
                                  {analysis.score}/10
                                </span>
                              </div>

                              <div className="mb-4">
                                <span className="font-medium text-green-700">
                                  优点分析：
                                </span>
                                <ul className="mt-2 ml-4 space-y-1">
                                  {(analysis.strengths || []).map(
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
                                  待提升之处：
                                </span>
                                <ul className="mt-2 ml-4 space-y-1">
                                  {(analysis.weaknesses || []).map(
                                    (weakness: any, index: number) => (
                                      <li
                                        key={index}
                                        className="text-sm text-neutral-700"
                                      >
                                        •{" "}
                                        {typeof weakness === "string"
                                          ? weakness
                                          : weakness.description}
                                      </li>
                                    ),
                                  )}
                                </ul>
                              </div>

                              <div>
                                <span className="font-medium text-blue-700">
                                  综合评价：
                                </span>
                                <p className="mt-2 text-sm text-neutral-700">
                                  {analysis.overall_comment || "暂无"}
                                </p>
                              </div>
                            </div>
                          )}
                        </>
                      );
                    })()}
                  </div>
                ) : (
                  // 空状态显示
                  <div className="flex-1 flex items-center justify-center text-center text-neutral-500">
                    <div>
                      <svg
                        className="mx-auto h-16 w-16 text-neutral-300 mb-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
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
