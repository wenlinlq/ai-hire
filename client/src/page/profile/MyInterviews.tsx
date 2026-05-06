import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import userApi from "../../api/userApi";
import { aiPreInterviewApi } from "../../api/aiPreInterviewApi";
import { interviewInvitationApi } from "../../api/interviewInvitationApi";

export default function MyInterviews() {
  const navigate = useNavigate();
  const [interviewLoading, setInterviewLoading] = useState(false);
  const [aiPreInterviews, setAiPreInterviews] = useState<any[]>([]);
  const [interviewInvitations, setInterviewInvitations] = useState<any[]>([]);

  useEffect(() => {
    const fetchInterviewData = async () => {
      const user = userApi.getCurrentUser();
      if (!user) return;

      try {
        setInterviewLoading(true);
        const [aiPreInterviewData, invitationData] = await Promise.all([
          aiPreInterviewApi.getUserAiPreInterviews(user._id),
          interviewInvitationApi.getUserInterviewInvitations(user._id),
        ]);
        setAiPreInterviews(aiPreInterviewData.data || []);
        setInterviewInvitations(invitationData.data || []);
      } catch (error) {
        console.error("获取面试数据失败:", error);
      } finally {
        setInterviewLoading(false);
      }
    };

    fetchInterviewData();
  }, []);

  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-8 shadow-sm h-[calc(100vh-150px)] overflow-y-auto">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-neutral-800">我的面试</h2>
      </div>
      {interviewLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
        </div>
      ) : (
        <div className="space-y-6">
          <div>
            <h3 className="mb-4 text-lg font-semibold text-neutral-700">
              团队面试邀请
            </h3>
            {interviewInvitations.length === 0 ? (
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
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
                <p className="mt-4 text-lg text-neutral-500">暂无面试邀请</p>
                <p className="mt-2 text-sm text-neutral-400">
                  当有面试邀请时，会显示在这里
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {interviewInvitations.map((invitation: any) => (
                  <div
                    key={invitation._id}
                    className="rounded-lg border border-neutral-200 p-4"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="text-md font-semibold text-neutral-800">
                          {invitation.type === "online" ? "线上面试" : "线下面试"}{" "}
                          - 职位名称
                        </h4>
                        <p className="mt-1 text-sm text-neutral-600">
                          邀请你参加{invitation.type === "online" ? "线上" : "线下"}
                          面试
                        </p>
                        <div className="mt-3 space-y-2">
                          <div>
                            <label className="block text-xs font-medium text-neutral-500 mb-1">
                              面试时间
                            </label>
                            <p className="text-sm text-neutral-700">
                              {new Date(invitation.scheduledTime).toLocaleString(
                                "zh-CN",
                              )}
                            </p>
                          </div>
                          {invitation.type === "online" && (
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-neutral-500">
                                面试链接：
                              </span>
                              <a
                                href={invitation.meetingUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-primary-600 hover:underline"
                              >
                                {invitation.meetingUrl}
                              </a>
                            </div>
                          )}
                          {invitation.type === "offline" && (
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-neutral-500">
                                面试地点：
                              </span>
                              <span className="text-sm text-neutral-700">
                                {invitation.location}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <button
                          className="rounded-lg bg-primary-500 px-4 py-2 text-sm text-white transition-colors hover:bg-primary-600"
                          onClick={async () => {
                            try {
                              await interviewInvitationApi.confirmInterviewInvitation(
                                invitation._id,
                                { userFeedback: "confirmed" },
                              );
                              const user = userApi.getCurrentUser();
                              if (user) {
                                const interviewInvitationData =
                                  await interviewInvitationApi.getUserInterviewInvitations(
                                    user._id,
                                  );
                                setInterviewInvitations(
                                  interviewInvitationData.data || [],
                                );
                              }
                            } catch (error) {
                              console.error("接受面试邀请失败:", error);
                              alert("接受面试邀请失败，请重试");
                            }
                          }}
                        >
                          接受
                        </button>
                        <button
                          className="rounded-lg border border-neutral-200 px-4 py-2 text-sm text-neutral-600 transition-colors hover:bg-neutral-50"
                          onClick={async () => {
                            try {
                              await interviewInvitationApi.confirmInterviewInvitation(
                                invitation._id,
                                { userFeedback: "declined" },
                              );
                              const user = userApi.getCurrentUser();
                              if (user) {
                                const interviewInvitationData =
                                  await interviewInvitationApi.getUserInterviewInvitations(
                                    user._id,
                                  );
                                setInterviewInvitations(
                                  interviewInvitationData.data || [],
                                );
                              }
                            } catch (error) {
                              console.error("拒绝面试邀请失败:", error);
                              alert("拒绝面试邀请失败，请重试");
                            }
                          }}
                        >
                          拒绝
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div>
            <h3 className="mb-4 text-lg font-semibold text-neutral-700">
              AI预面试
            </h3>
            {aiPreInterviews.length === 0 ? (
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
                    d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                  />
                </svg>
                <p className="mt-4 text-lg text-neutral-500">暂无AI预面试</p>
                <p className="mt-2 text-sm text-neutral-400">
                  当有AI预面试时，会显示在这里
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {aiPreInterviews.map((interview: any) => (
                  <div
                    key={interview._id}
                    className="rounded-lg border border-neutral-200 p-4"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="text-md font-semibold text-neutral-800">
                          AI预面试 - 职位名称
                        </h4>
                        <p className="mt-1 text-sm text-neutral-600">AI预面试</p>
                        <p className="mt-2 text-sm text-neutral-500">
                          投递时间：
                          {new Date(interview.createdAt).toLocaleString(
                            "zh-CN",
                          )}
                        </p>
                        {interview.score !== null && (
                          <p className="mt-1 text-sm text-neutral-500">
                            面试得分：{interview.score}
                          </p>
                        )}
                      </div>
                      <div className="flex flex-col gap-2">
                        {interview.status === "pending" && (
                          <button
                            className="rounded-lg bg-primary-500 px-4 py-2 text-sm text-white transition-colors hover:bg-primary-600"
                            onClick={() =>
                              navigate(`/ai-interview/${interview._id}`)
                            }
                          >
                            开始面试
                          </button>
                        )}
                        {interview.status === "completed" && (
                          <span className="rounded-lg bg-neutral-100 px-4 py-2 text-sm text-neutral-600">
                            已完成
                          </span>
                        )}
                        <button
                          className="rounded-lg border border-red-200 px-4 py-2 text-sm text-red-600 transition-colors hover:bg-red-50"
                          onClick={async () => {
                            if (window.confirm("确定要删除这条面试记录吗？")) {
                              try {
                                await aiPreInterviewApi.deleteAiPreInterview(
                                  interview._id,
                                );
                                const user = userApi.getCurrentUser();
                                if (user) {
                                  const aiPreInterviewData =
                                    await aiPreInterviewApi.getUserAiPreInterviews(
                                      user._id,
                                    );
                                  setAiPreInterviews(
                                    aiPreInterviewData.data || [],
                                  );
                                }
                              } catch (error) {
                                console.error("删除面试记录失败:", error);
                                alert("删除面试记录失败，请重试");
                              }
                            }
                          }}
                        >
                          删除
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}