import { useTeam } from "./TeamContext";
import positionApi from "../../api/positionApi";
import userApi from "../../api/userApi";
import EmptyTeamNotice from "./EmptyTeamNotice";

export default function TeamJobs() {
  const {
    jobs,
    isLoading,
    error,
    jobForm,
    setJobForm,
    skillsInput,
    setSkillsInput,
    aiResumeFilterSkillsInput,
    setAiResumeFilterSkillsInput,
    currentJobId,
    setCurrentJobId,
    questionBanks,
    currentUser,
    openModal,
    fetchJobs,
  } = useTeam();

  const user = userApi.getCurrentUser();
  const hasNoTeam = user?.role === "hr" && !user?.team;

  if (hasNoTeam) {
    return <EmptyTeamNotice />;
  }

  return (
    <section>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-neutral-800">
          职位管理
        </h2>
        <button
          type="button"
          className="rounded-lg bg-primary-500 px-4 py-2 text-white transition-colors hover:bg-primary-600"
          onClick={() => {
            setCurrentJobId(null);
            setSkillsInput("");
            setAiResumeFilterSkillsInput("");
            setJobForm({
              title: "",
              type: "full-time",
              department: "",
              quota: 1,
              salary: "",
              requirements: {
                skills: [],
                experience: "",
                education: "",
                description: "",
              },
              responsibilities: [],
              benefits: [],
              status: "open",
              deadline: "",
              teamId: currentUser?.team || "",
              interviewType: "online",
              aiQuestionBankId: "",
              aiPreInterview: false,
              aiPreInterviewScore: 60,
              aiResumeFilter: false,
              aiResumeFilterScore: 60,
              aiResumeFilterSkills: [],
            });
            openModal("job");
          }}
        >
          发布新职位
        </button>
      </div>

      <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm">
        <div className="border-b border-neutral-200 p-4">
          <div className="flex items-center space-x-4">
            <input
              type="text"
              placeholder="搜索职位"
              className="flex-1 rounded-lg border border-neutral-300 px-4 py-2 focus:ring-2 focus:ring-primary-500 focus:outline-none"
            />
            <select className="rounded-lg border border-neutral-300 px-4 py-2">
              <option>全部状态</option>
              <option>招聘中</option>
              <option>已关闭</option>
            </select>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-neutral-50">
              <tr className="text-left text-xs uppercase tracking-wider text-neutral-500">
                {[
                  "职位名称",
                  "部门",
                  "招聘人数",
                  "截止时间",
                  "状态",
                  "AI试题",
                  "AI预面试最低分",
                  "AI简历筛选最低分",
                  "AI简历筛选关键词",
                  "操作",
                ].map((item) => (
                  <th key={item} className="px-6 py-3">
                    {item}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {isLoading ? (
                <tr>
                  <td
                    colSpan={9}
                    className="px-6 py-8 text-center text-neutral-500"
                  >
                    加载中...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td
                    colSpan={9}
                    className="px-6 py-8 text-center text-red-500"
                  >
                    {error}
                  </td>
                </tr>
              ) : jobs.length === 0 ? (
                <tr>
                  <td
                    colSpan={9}
                    className="px-6 py-8 text-center text-neutral-500"
                  >
                    暂无职位
                  </td>
                </tr>
              ) : (
                jobs.map((job) => (
                  <tr key={job._id}>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-neutral-900">
                        {job.title}
                      </div>
                      <div className="text-sm text-neutral-500">
                        {job.type}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {job.department}
                    </td>
                    <td className="px-6 py-4 text-sm">{job.quota}</td>
                    <td className="px-6 py-4 text-sm">
                      {new Date(job.deadline).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span
                        className={`rounded-full px-2 py-1 text-xs font-semibold ${job.status === "open" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}
                      >
                        {job.status === "open" ? "招聘中" : "已关闭"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {job.aiPreInterview
                        ? job.aiQuestionBankName ||
                          (job.aiQuestionBankId ? "已设置" : "未设置")
                        : "-"}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {job.aiPreInterview
                        ? job.aiPreInterviewScore || 60
                        : "-"}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {job.aiResumeFilter
                        ? job.aiResumeFilterScore || 60
                        : "-"}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {job.aiResumeFilterSkills &&
                      job.aiResumeFilterSkills.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {job.aiResumeFilterSkills
                            .slice(0, 3)
                            .map((skill, index) => (
                              <span
                                key={index}
                                className="text-xs bg-blue-100 text-blue-800 rounded px-1.5 py-0.5"
                              >
                                {skill}
                              </span>
                            ))}
                          {job.aiResumeFilterSkills.length > 3 && (
                            <span className="text-xs text-neutral-500">
                              +{job.aiResumeFilterSkills.length - 3}
                            </span>
                          )}
                        </div>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <button
                        type="button"
                        className="mr-3 text-primary-600 hover:text-primary-900"
                        onClick={() => {
                          setCurrentJobId(job._id);
                          const skillsValue = Array.isArray(
                            job.requirements?.skills,
                          )
                            ? job.requirements.skills.join(",")
                            : "";
                          const aiResumeFilterSkillsValue =
                            Array.isArray(job.aiResumeFilterSkills)
                              ? job.aiResumeFilterSkills.join(",")
                              : "";
                          setSkillsInput(skillsValue);
                          setAiResumeFilterSkillsInput(
                            aiResumeFilterSkillsValue,
                          );
                          setJobForm({
                            title: job.title,
                            type: job.type,
                            department: job.department,
                            quota: job.quota,
                            salary: job.salary || "",
                            requirements: {
                              ...job.requirements,
                              skills: Array.isArray(
                                job.requirements?.skills,
                              )
                                ? job.requirements.skills
                                : [],
                            },
                            responsibilities:
                              job.responsibilities || [],
                            benefits: job.benefits || [],
                            status: job.status,
                            deadline: new Date(job.deadline)
                              .toISOString()
                              .split("T")[0],
                            teamId: job.teamId,
                            interviewType:
                              job.interviewType || "online",
                            aiQuestionBankId:
                              job.aiQuestionBankId || "",
                            aiPreInterview: job.aiPreInterview || false,
                            aiPreInterviewScore:
                              job.aiPreInterviewScore || 60,
                            aiResumeFilter: job.aiResumeFilter || false,
                            aiResumeFilterScore:
                              job.aiResumeFilterScore || 60,
                            aiResumeFilterSkills:
                              job.aiResumeFilterSkills || [],
                          });
                          openModal("job");
                        }}
                      >
                        编辑
                      </button>
                      <button
                        type="button"
                        className={
                          job.status === "open"
                            ? "text-red-600 hover:text-red-900"
                            : "text-green-600 hover:text-green-900"
                        }
                        onClick={async () => {
                          try {
                            if (job.status === "open") {
                              await positionApi.updatePosition(
                                job._id,
                                { status: "closed" },
                              );
                              window.message.success("职位已关闭");
                            } else {
                              await positionApi.updatePosition(
                                job._id,
                                { status: "open" },
                              );
                              window.message.success("职位已重新开放");
                            }
                            fetchJobs();
                          } catch (err: any) {
                            window.message.error(
                              err.message || "操作失败",
                            );
                          }
                        }}
                      >
                        {job.status === "open" ? "关闭" : "重新开放"}
                      </button>
                      <button
                        type="button"
                        className="ml-3 text-red-600 hover:text-red-900"
                        onClick={async () => {
                          try {
                            if (
                              window.confirm("确定要删除这个职位吗？")
                            ) {
                              await positionApi.deletePosition(job._id);
                              window.message.success("职位已删除");
                              fetchJobs();
                            }
                          } catch (err: any) {
                            window.message.error(
                              err.message || "删除失败",
                            );
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