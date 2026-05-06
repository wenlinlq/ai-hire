import { useRef, useState, useEffect } from "react";
import userApi from "../../api/userApi";
import resumeApi from "../../api/resumeApi";

type ResumeItem = {
  name: string;
  uploadedAt: string;
  type: "PDF";
  _id: string;
  isActive: boolean;
};

export default function MyResume() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [resumes, setResumes] = useState<ResumeItem[]>([]);
  const [resumeLoading, setResumeLoading] = useState(false);

  useEffect(() => {
    const fetchResumes = async () => {
      const user = userApi.getCurrentUser();
      if (!user) return;

      try {
        setResumeLoading(true);
        const resumeData = await resumeApi.getStudentResumes();
        const formattedResumes: ResumeItem[] = resumeData.map((r) => ({
          _id: r._id,
          name: r.fileUrl.split("/").pop() || "resume",
          uploadedAt: new Date(r.createdAt).toLocaleString("zh-CN"),
          type: r.fileType.toUpperCase() as "PDF",
          isActive: r.isActive,
        }));
        setResumes(formattedResumes);
      } catch (error) {
        console.error("获取简历列表失败:", error);
      } finally {
        setResumeLoading(false);
      }
    };

    fetchResumes();
  }, []);

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      alert("仅支持 PDF 格式");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert("文件大小不能超过 10MB");
      return;
    }

    const user = userApi.getCurrentUser();
    if (!user) {
      alert("请先登录");
      return;
    }

    try {
      setResumeLoading(true);
      const formData = new FormData();
      formData.append("file", file);
      formData.append("userId", user._id);

      await resumeApi.uploadResume(formData);

      const resumeData = await resumeApi.getStudentResumes();
      const formattedResumes: ResumeItem[] = resumeData.map((r) => ({
        _id: r._id,
        name: r.fileUrl.split("/").pop() || "resume",
        uploadedAt: new Date(r.createdAt).toLocaleString("zh-CN"),
        type: r.fileType.toUpperCase() as "PDF",
        isActive: r.isActive,
      }));
      setResumes(formattedResumes);
      alert("上传成功");
    } catch (error) {
      console.error("上传简历失败:", error);
      alert("上传失败，请重试");
    } finally {
      setResumeLoading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-8 shadow-sm h-[calc(100vh-150px)] overflow-y-auto">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-neutral-800">我的简历</h2>
      </div>
      <button
        type="button"
        className="w-full rounded-xl border-2 border-dashed border-neutral-300 p-12 text-center transition-colors hover:border-primary-500"
        onClick={() => fileInputRef.current?.click()}
      >
        <svg
          className="mx-auto mb-4 h-16 w-16 text-neutral-400"
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
        <p className="mb-2 text-lg text-neutral-600">点击或拖拽上传简历</p>
        <p className="text-sm text-neutral-500">
          支持 PDF 格式，文件大小不超过 10MB
        </p>
      </button>
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        accept=".pdf"
        onChange={handleUpload}
      />

      <div className="mt-8">
        <h3 className="mb-4 text-lg font-semibold text-neutral-800">
          已上传简历
        </h3>
        {resumeLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
          </div>
        ) : resumes.length === 0 ? (
          <div className="text-center py-12">
            <svg
              className="mx-auto h-16 w-16 text-neutral-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <p className="mt-4 text-lg text-neutral-500">暂无上传的简历</p>
            <p className="mt-2 text-sm text-neutral-400">
              点击上方按钮上传您的简历
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {resumes.map((resume) => (
              <div
                key={resume._id}
                className="flex items-center justify-between rounded-lg border border-neutral-200 bg-neutral-50 p-4"
              >
                <div className="flex items-center space-x-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-red-100">
                    <span className="font-bold text-red-600">{resume.type}</span>
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <p className="font-medium text-neutral-800">
                        {resume.name}
                      </p>
                      {resume.isActive && (
                        <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">
                          当前简历
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-neutral-500">
                      上传时间：{resume.uploadedAt}
                    </p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    type="button"
                    className="rounded-lg px-4 py-2 text-primary-600 transition-colors hover:bg-primary-50"
                    onClick={() => {
                      window.open(
                        `http://localhost:3000/uploads/${encodeURIComponent(resume.name)}`,
                        "_blank",
                      );
                    }}
                  >
                    查看
                  </button>
                  {!resume.isActive && (
                    <button
                      type="button"
                      className="rounded-lg px-4 py-2 text-blue-600 transition-colors hover:bg-blue-50"
                      onClick={async () => {
                        try {
                          await resumeApi.setCurrentResume(resume._id);
                          const user = userApi.getCurrentUser();
                          if (user) {
                            const resumeData = await resumeApi.getStudentResumes();
                            const formattedResumes: ResumeItem[] = resumeData.map(
                              (r) => ({
                                _id: r._id,
                                name: r.fileUrl.split("/").pop() || "resume",
                                uploadedAt: new Date(
                                  r.createdAt,
                                ).toLocaleString("zh-CN"),
                                type: r.fileType.toUpperCase() as "PDF",
                                isActive: r.isActive,
                              }),
                            );
                            setResumes(formattedResumes);
                          }
                        } catch (error) {
                          console.error("设置当前简历失败:", error);
                          alert("设置当前简历失败，请重试");
                        }
                      }}
                    >
                      设为当前
                    </button>
                  )}
                  <button
                    type="button"
                    className="rounded-lg px-4 py-2 text-red-600 transition-colors hover:bg-red-50"
                    onClick={async () => {
                      if (window.confirm("确定要删除这份简历吗？")) {
                        try {
                          await resumeApi.deleteResume(resume._id);
                          const user = userApi.getCurrentUser();
                          if (user) {
                            const resumeData = await resumeApi.getStudentResumes();
                            const formattedResumes: ResumeItem[] = resumeData.map(
                              (r) => ({
                                _id: r._id,
                                name: r.fileUrl.split("/").pop() || "resume",
                                uploadedAt: new Date(
                                  r.createdAt,
                                ).toLocaleString("zh-CN"),
                                type: (r.fileType || "").toUpperCase() as "PDF",
                                isActive: r.isActive,
                              }),
                            );
                            setResumes(formattedResumes);
                          }
                        } catch (error) {
                          console.error("删除简历失败:", error);
                          alert("删除简历失败，请重试");
                        }
                      }
                    }}
                  >
                    删除
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}