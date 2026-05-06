import { useTeam } from "./TeamContext";
import applicationApi from "../../api/applicationApi";
import {
  notificationApi,
  notificationTemplateApi,
} from "../../api/notificationApi";
import { interviewInvitationApi } from "../../api/interviewInvitationApi";

export default function TeamCandidates() {
  const {
    candidates,
    isLoadingCandidates,
    errorCandidates,
    searchKeyword,
    setSearchKeyword,
    selectedStatus,
    setSelectedStatus,
    currentUser,
    setCurrentCandidate,
    setViewModal,
    fetchCandidates,
    openModal,
    setCandidateForm,
    candidateForm,
    jobs,
  } = useTeam();

  return (
    <section>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-neutral-800">
          候选人管理
        </h2>
        <div className="flex space-x-3">
          <button
            type="button"
            className="rounded-lg bg-red-500 px-4 py-2 text-white transition-colors hover:bg-red-600"
            onClick={() => {
              const statusToDelete = prompt(
                "请输入要删除的候选人状态（例如：已拒绝、已录用、待处理、面试中、简历筛选、已通过预面试）:",
              );
              if (!statusToDelete) return;

              if (
                window.confirm(
                  `确定要删除所有状态为"${statusToDelete}"的候选人吗？`,
                )
              ) {
                (async () => {
                  try {
                    const statusMap: Record<string, string> = {
                      待处理: "pending",
                      简历筛选: "screening",
                      面试中: "interview",
                      已录用: "offer",
                      已通过预面试: "已通过预面试",
                      已拒绝: "rejected",
                    };

                    const actualStatus =
                      statusMap[statusToDelete] || statusToDelete;

                    const candidatesToDelete = candidates.filter(
                      (candidate) => candidate.status === actualStatus,
                    );

                    if (candidatesToDelete.length === 0) {
                      window.message.info(
                        `没有状态为"${statusToDelete}"的候选人`,
                      );
                      return;
                    }

                    let deletedCount = 0;
                    for (const candidate of candidatesToDelete) {
                      try {
                        await applicationApi.deleteApplication(
                          candidate._id,
                        );
                        deletedCount++;
                      } catch (error) {
                        console.warn(
                          `删除候选人${candidate._id}失败:`,
                          error,
                        );
                      }
                    }

                    window.message.success(
                      `成功删除${deletedCount}个候选人`,
                    );
                    fetchCandidates();
                  } catch (err: any) {
                    console.error("批量删除失败:", err);
                    window.message.error(err.message || "操作失败");
                  }
                })();
              }
            }}
          >
            批量删除
          </button>
          <button
            type="button"
            className="rounded-lg bg-primary-500 px-4 py-2 text-white transition-colors hover:bg-primary-600"
            onClick={() => {
              setCandidateForm({
                name: "",
                phone: "",
                email: "",
                grade: "",
                major: "",
                positionId: "",
                teamId: currentUser?.team || "",
                resume: null,
              });
              openModal("candidate");
            }}
          >
            导入候选人
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm">
        <div className="border-b border-neutral-200 p-4">
          <div className="flex items-center space-x-4">
            <input
              type="text"
              placeholder="搜索候选人"
              className="flex-1 rounded-lg border border-neutral-300 px-4 py-2 focus:ring-2 focus:ring-primary-500 focus:outline-none"
              onChange={(e) => {
                const value = e.target.value;
                setSearchKeyword(value);
                fetchCandidates(value, selectedStatus);
              }}
            />
            <select
              className="rounded-lg border border-neutral-300 px-4 py-2"
              onChange={(e) => {
                const value = e.target.value;
                setSelectedStatus(value);
                fetchCandidates(searchKeyword, value);
              }}
            >
              {[
                { value: "", label: "全部状态" },
                { value: "pending", label: "待处理" },
                { value: "screening", label: "简历筛选" },
                { value: "interview", label: "面试中" },
                { value: "offer", label: "已录用" },
                { value: "rejected", label: "已拒绝" },
                { value: "已通过预面试", label: "已通过预面试" },
              ].map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-neutral-50">
              <tr className="text-left text-xs uppercase tracking-wider text-neutral-500">
                {[
                  "候选人",
                  "年级",
                  "专业",
                  "应聘职位",
                  "投递时间",
                  "状态",
                  "操作",
                ].map((item) => (
                  <th key={item} className="px-6 py-3">
                    {item}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {isLoadingCandidates ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-6 py-8 text-center text-neutral-500"
                  >
                    加载中...
                  </td>
                </tr>
              ) : errorCandidates ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-6 py-8 text-center text-red-500"
                  >
                    {errorCandidates}
                  </td>
                </tr>
              ) : candidates.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-6 py-8 text-center text-neutral-500"
                  >
                    暂无候选人
                  </td>
                </tr>
              ) : (
                candidates.map((candidate) => (
                  <tr key={candidate._id}>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-neutral-900">
                        {candidate.name || candidate.studentId}{" "}
                      </div>
                      <div className="text-sm text-neutral-500">
                        {candidate.email || candidate.studentId}{" "}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {candidate.grade || "-"}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {candidate.major || "-"}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {candidate.positionName || candidate.positionId}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {new Date(
                        candidate.appliedAt,
                      ).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span
                        className={`rounded-full px-2 py-1 text-xs font-semibold ${candidate.status === "pending" ? "bg-yellow-100 text-yellow-800" : candidate.status === "screening" ? "bg-blue-100 text-blue-800" : candidate.status === "interview" ? "bg-purple-100 text-purple-800" : candidate.status === "offer" ? "bg-green-100 text-green-800" : candidate.status === "已通过预面试" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}
                      >
                        {candidate.status === "pending"
                          ? "待处理"
                          : candidate.status === "screening"
                            ? "简历筛选"
                            : candidate.status === "interview"
                              ? "面试中"
                              : candidate.status === "offer"
                                ? "已录用"
                                : candidate.status === "已通过预面试"
                                  ? "已通过预面试"
                                  : "已拒绝"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <button
                        type="button"
                        className="mr-3 text-primary-600 hover:text-primary-900"
                        onClick={() => {
                          setCurrentCandidate(candidate);
                          setViewModal(true);
                        }}
                      >
                        查看
                      </button>
                      <button
                        type="button"
                        className="text-green-600 hover:text-green-900"
                        onClick={() => {
                          const scheduledTime = prompt(
                            "请输入面试时间（格式：YYYY-MM-DD HH:MM）:",
                          );
                          if (!scheduledTime) return;

                          const interviewType = (
                            prompt(
                              "请输入面试类型（online/offline）:",
                            ) || "online"
                          ).toLowerCase();
                          let meetingUrl = "";
                          let location = "";

                          if (interviewType === "online") {
                            meetingUrl =
                              prompt("请输入面试链接:") || "";
                          } else {
                            location =
                              prompt("请输入面试地点:") || "未设置";
                          }

                          (async () => {
                            try {
                              console.log(
                                "开始安排面试，候选人信息:",
                                candidate,
                              );
                              console.log("当前用户信息:", currentUser);

                              console.log("开始更新候选人状态");
                              const updateResult =
                                await applicationApi.updateApplication(
                                  candidate._id,
                                  { status: "interview" },
                                );
                              console.log(
                                "状态更新成功:",
                                updateResult,
                              );

                              if (candidate.studentId) {
                                console.log("开始创建面试邀请记录");
                                const invitationResult =
                                  await interviewInvitationApi.createInterviewInvitation(
                                    {
                                      deliveryId: candidate._id,
                                      userId: candidate.studentId,
                                      interviewerId: currentUser?._id,
                                      type: interviewType as
                                        | "online"
                                        | "offline",
                                      scheduledTime: scheduledTime,
                                      meetingUrl: meetingUrl,
                                      location: location,
                                    },
                                  );
                                console.log(
                                  "面试邀请创建成功:",
                                  invitationResult,
                                );
                              } else {
                                console.warn(
                                  "候选人没有studentId，跳过创建面试邀请",
                                );
                              }

                              if (
                                candidate.studentId &&
                                currentUser?.team
                              ) {
                                console.log("开始发送面试邀请通知");
                                try {
                                  const templateResponse =
                                    await notificationTemplateApi.getTemplateByType(
                                      currentUser.team,
                                      "interview_invite",
                                    );
                                  const template =
                                    templateResponse.data;
                                  console.log(
                                    "获取通知模板成功:",
                                    template,
                                  );

                                  let title =
                                    template.title || "面试邀请通知";
                                  let content =
                                    template.content ||
                                    `您申请的${candidate.positionName || candidate.positionId}职位已安排面试，请留意查看面试详情。`;

                                  title = title
                                    .replace(
                                      /{studentName}/g,
                                      candidate.name || "",
                                    )
                                    .replace(
                                      /{positionName}/g,
                                      candidate.positionName ||
                                        candidate.positionId,
                                    )
                                    .replace(
                                      /{teamName}/g,
                                      currentUser?.teamName || "",
                                    )
                                    .replace(
                                      /{interviewTime}/g,
                                      scheduledTime,
                                    )
                                    .replace(
                                      /{interviewLocation}/g,
                                      interviewType === "online"
                                        ? meetingUrl
                                        : location,
                                    )
                                    .replace(
                                      /{interviewerName}/g,
                                      currentUser?.username || "",
                                    );

                                  content = content
                                    .replace(
                                      /{studentName}/g,
                                      candidate.name || "",
                                    )
                                    .replace(
                                      /{positionName}/g,
                                      candidate.positionName ||
                                        candidate.positionId,
                                    )
                                    .replace(
                                      /{teamName}/g,
                                      currentUser?.teamName || "",
                                    )
                                    .replace(
                                      /{interviewTime}/g,
                                      scheduledTime,
                                    )
                                    .replace(
                                      /{interviewLocation}/g,
                                      interviewType === "online"
                                        ? meetingUrl
                                        : location,
                                    )
                                    .replace(
                                      /{interviewerName}/g,
                                      currentUser?.username || "",
                                    );

                                  const notificationResult =
                                    await notificationApi.sendNotification(
                                      {
                                        userId: candidate.studentId,
                                        type: "interview_invite",
                                        title: title,
                                        content: content,
                                        relatedId: candidate.positionId,
                                        teamName:
                                          currentUser?.teamName || "",
                                      },
                                    );
                                  console.log(
                                    "通知发送成功:",
                                    notificationResult,
                                  );
                                } catch (templateError) {
                                  console.warn(
                                    "获取通知模板失败，使用默认模板:",
                                    templateError,
                                  );
                                  const notificationResult =
                                    await notificationApi.sendNotification(
                                      {
                                        userId: candidate.studentId,
                                        type: "interview_invite",
                                        title: "面试邀请通知",
                                        content: `您申请的${candidate.positionName || candidate.positionId}职位已安排面试，请留意查看面试详情。`,
                                        relatedId: candidate.positionId,
                                        teamName:
                                          currentUser?.teamName || "",
                                      },
                                    );
                                  console.log(
                                    "使用默认模板发送通知成功:",
                                    notificationResult,
                                  );
                                }
                              } else {
                                console.warn(
                                  "候选人没有studentId或当前用户没有团队信息，跳过发送通知",
                                );
                              }

                              window.message.success(
                                "面试已安排，状态已更新为面试中",
                              );
                              fetchCandidates();
                            } catch (err: any) {
                              console.error("安排面试失败:", err);
                              window.message.error(
                                err.message || "安排面试失败",
                              );
                            }
                          })();
                        }}
                      >
                        安排面试
                      </button>
                      <button
                        type="button"
                        className="ml-3 text-green-600 hover:text-green-900"
                        onClick={() => {
                          const onboardingTime = prompt(
                            "请输入入职时间（格式：YYYY-MM-DD）:",
                          );
                          if (!onboardingTime) return;

                          const onboardingLocation =
                            prompt("请输入入职地点:") || "";
                          const contactPerson =
                            prompt("请输入联系人:") ||
                            currentUser?.username ||
                            "";

                          (async () => {
                            try {
                              await applicationApi.updateApplication(
                                candidate._id,
                                { status: "offer" },
                              );

                              if (
                                candidate.studentId &&
                                currentUser?.team
                              ) {
                                try {
                                  const templateResponse =
                                    await notificationTemplateApi.getTemplateByType(
                                      currentUser.team,
                                      "offer",
                                    );
                                  const template =
                                    templateResponse.data;

                                  let title =
                                    template.title || "录用通知";
                                  let content =
                                    template.content ||
                                    `恭喜您被录用为${candidate.positionName || candidate.positionId}岗位成员！`;

                                  title = title
                                    .replace(
                                      /{studentName}/g,
                                      candidate.name || "",
                                    )
                                    .replace(
                                      /{positionName}/g,
                                      candidate.positionName ||
                                        candidate.positionId,
                                    )
                                    .replace(
                                      /{teamName}/g,
                                      currentUser?.teamName || "",
                                    )
                                    .replace(
                                      /{onboardingTime}/g,
                                      onboardingTime,
                                    )
                                    .replace(
                                      /{onboardingLocation}/g,
                                      onboardingLocation,
                                    )
                                    .replace(
                                      /{contactPerson}/g,
                                      contactPerson,
                                    );

                                  content = content
                                    .replace(
                                      /{studentName}/g,
                                      candidate.name || "",
                                    )
                                    .replace(
                                      /{positionName}/g,
                                      candidate.positionName ||
                                        candidate.positionId,
                                    )
                                    .replace(
                                      /{teamName}/g,
                                      currentUser?.teamName || "",
                                    )
                                    .replace(
                                      /{onboardingTime}/g,
                                      onboardingTime,
                                    )
                                    .replace(
                                      /{onboardingLocation}/g,
                                      onboardingLocation,
                                    )
                                    .replace(
                                      /{contactPerson}/g,
                                      contactPerson,
                                    );

                                  await notificationApi.sendNotification(
                                    {
                                      userId: candidate.studentId,
                                      type: "offer",
                                      title: title,
                                      content: content,
                                      relatedId: candidate.positionId,
                                      teamName:
                                        currentUser?.teamName || "",
                                    },
                                  );
                                } catch (templateError) {
                                  console.warn(
                                    "获取通知模板失败，使用默认模板:",
                                    templateError,
                                  );
                                  await notificationApi.sendNotification(
                                    {
                                      userId: candidate.studentId,
                                      type: "offer",
                                      title: "录用通知",
                                      content: `恭喜您被录用为${candidate.positionName || candidate.positionId}岗位成员！\n\n入职信息如下：\n报到时间：${onboardingTime}\n报到地点：${onboardingLocation}\n联系人：${contactPerson}`,
                                      relatedId: candidate.positionId,
                                      teamName:
                                        currentUser?.teamName || "",
                                    },
                                  );
                                }
                              }

                              window.message.success(
                                "候选人已录用，通知已发送",
                              );
                              fetchCandidates();
                            } catch (err: any) {
                              console.error("录用操作失败:", err);
                              window.message.error(
                                err.message || "操作失败",
                              );
                            }
                          })();
                        }}
                      >
                        录用
                      </button>
                      <button
                        type="button"
                        className="ml-3 text-red-600 hover:text-red-900"
                        onClick={() => {
                          (async () => {
                            try {
                              console.log(
                                "开始拒绝操作，候选人信息:",
                                candidate,
                              );
                              console.log("当前用户信息:", currentUser);

                              console.log("开始更新候选人状态");
                              const updateResult =
                                await applicationApi.updateApplication(
                                  candidate._id,
                                  { status: "rejected" },
                                );
                              console.log(
                                "状态更新成功:",
                                updateResult,
                              );

                              if (
                                candidate.studentId &&
                                currentUser?.team
                              ) {
                                console.log("开始发送拒绝通知");
                                try {
                                  const templateResponse =
                                    await notificationTemplateApi.getTemplateByType(
                                      currentUser.team,
                                      "rejection",
                                    );
                                  const template =
                                    templateResponse.data;
                                  console.log(
                                    "获取通知模板成功:",
                                    template,
                                  );

                                  let title =
                                    template.title || "感谢您的申请";
                                  let content =
                                    template.content ||
                                    `感谢您申请${candidate.positionName || candidate.positionId}岗位，很遗憾本次未能录用。`;

                                  title = title
                                    .replace(
                                      /\{studentName\}/g,
                                      candidate.name || "",
                                    )
                                    .replace(
                                      /\{positionName\}/g,
                                      candidate.positionName ||
                                        candidate.positionId,
                                    )
                                    .replace(
                                      /\{teamName\}/g,
                                      currentUser?.teamName || "",
                                    );

                                  content = content
                                    .replace(
                                      /\{studentName\}/g,
                                      candidate.name || "",
                                    )
                                    .replace(
                                      /\{positionName\}/g,
                                      candidate.positionName ||
                                        candidate.positionId,
                                    )
                                    .replace(
                                      /\{teamName\}/g,
                                      currentUser?.teamName || "",
                                    );

                                  const notificationResult =
                                    await notificationApi.sendNotification(
                                      {
                                        userId: candidate.studentId,
                                        type: "rejection",
                                        title: title,
                                        content: content,
                                        relatedId: candidate.positionId,
                                        teamName:
                                          currentUser?.teamName || "",
                                      },
                                    );
                                  console.log(
                                    "通知发送成功:",
                                    notificationResult,
                                  );
                                } catch (templateError) {
                                  console.warn(
                                    "获取通知模板失败，使用默认模板:",
                                    templateError,
                                  );
                                  try {
                                    const notificationResult =
                                      await notificationApi.sendNotification(
                                        {
                                          userId: candidate.studentId,
                                          type: "rejection",
                                          title: "感谢您的申请",
                                          content: `感谢您申请${candidate.positionName || candidate.positionId}岗位，很遗憾本次未能录用。`,
                                          relatedId:
                                            candidate.positionId,
                                          teamName:
                                            currentUser?.teamName || "",
                                        },
                                      );
                                    console.log(
                                      "使用默认模板发送通知成功:",
                                      notificationResult,
                                    );
                                  } catch (notificationError) {
                                    console.warn(
                                      "发送通知失败:",
                                      notificationError,
                                    );
                                  }
                                }
                              } else {
                                console.warn(
                                  "候选人没有studentId或当前用户没有团队信息，跳过发送通知",
                                );
                              }

                              window.message.success(
                                "候选人已拒绝，通知已发送",
                              );
                              fetchCandidates();
                            } catch (err: any) {
                              console.error("拒绝操作失败:", err);
                              window.message.error(
                                err.message || "操作失败",
                              );
                            }
                          })();
                        }}
                      >
                        拒绝
                      </button>
                      <button
                        type="button"
                        className="ml-3 text-red-600 hover:text-red-900"
                        onClick={async () => {
                          if (
                            window.confirm(
                              `确定要删除候选人"${candidate.name || candidate.studentId}"吗？`,
                            )
                          ) {
                            try {
                              await applicationApi.deleteApplication(
                                candidate._id,
                              );
                              window.message.success("候选人已删除");
                              fetchCandidates();
                            } catch (err: any) {
                              console.error("删除候选人失败:", err);
                              window.message.error(
                                err.message || "删除失败",
                              );
                            }
                          }
                        }}
                      >
                        删除
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}