import { useTeam } from "./TeamContext";
import { notificationTemplateApi } from "../../api/notificationApi";

export default function TeamNotifications() {
  const {
    notificationTemplates,
    isLoadingTemplates,
    errorTemplates,
    currentUser,
    currentNotificationId,
    setCurrentNotificationId,
    notificationForm,
    setNotificationForm,
    openModal,
    fetchNotificationTemplates,
  } = useTeam();

  return (
    <section>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-neutral-800">
          消息通知管理
        </h2>
      </div>

      <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm mb-6">
        <h3 className="text-lg font-semibold text-neutral-800 mb-4">
          通知类型列表
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-neutral-50">
              <tr className="text-left text-xs uppercase tracking-wider text-neutral-500">
                <th className="px-6 py-3">通知类型</th>
                <th className="px-6 py-3">触发时机</th>
                <th className="px-6 py-3">是否可编辑</th>
                <th className="px-6 py-3">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {isLoadingTemplates ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-6 py-8 text-center text-neutral-500"
                  >
                    加载中...
                  </td>
                </tr>
              ) : errorTemplates ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-6 py-8 text-center text-red-500"
                  >
                    {errorTemplates}
                  </td>
                </tr>
              ) : notificationTemplates.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-6 py-8 text-center text-neutral-500"
                  >
                    暂无通知模板
                  </td>
                </tr>
              ) : (
                notificationTemplates.map((template) => (
                  <tr key={template._id}>
                    <td className="px-6 py-4 text-sm font-medium text-neutral-900">
                      {template.name}
                    </td>
                    <td className="px-6 py-4 text-sm text-neutral-500">
                      {template.type === "resume_pass" &&
                        "HR将状态改为'待面试'"}
                      {template.type === "resume_reject" &&
                        "HR将状态改为'已拒绝'"}
                      {template.type === "interview_invite" &&
                        "HR安排面试后"}
                      {template.type === "interview_reminder" &&
                        "面试前1小时自动发送"}
                      {template.type === "interview_result" &&
                        "面试后HR填写结果"}
                      {template.type === "offer" &&
                        "HR将状态改为'已录取'"}
                      {template.type === "rejection" && "最终未录取"}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span
                        className={
                          template.isDefault
                            ? "text-yellow-600"
                            : "text-green-600"
                        }
                      >
                        {template.isDefault ? "系统默认" : "✅"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <button
                        className="text-primary-600 hover:text-primary-900 mr-3"
                        onClick={() => {
                          setCurrentNotificationId(template._id);
                          setNotificationForm({
                            type: template.type,
                            name: template.name,
                            title: template.title,
                            content: template.content,
                          });
                          openModal("notification");
                        }}
                      >
                        编辑
                      </button>
                      {!template.isDefault && (
                        <button
                          className="text-red-600 hover:text-red-900"
                          onClick={async () => {
                            if (
                              window.confirm(
                                "确定要删除这个通知模板吗？",
                              )
                            ) {
                              try {
                                await notificationTemplateApi.deleteTemplate(
                                  template._id,
                                  { teamId: currentUser?.team },
                                );
                                fetchNotificationTemplates();
                              } catch (err) {
                                console.error("删除通知模板失败:", err);
                              }
                            }
                          }}
                        >
                          删除
                        </button>
                      )}
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