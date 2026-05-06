import { useAdmin } from "./AdminContext";

export default function AdminUser() {
  const {
    users,
    teams,
    isLoading,
    error,
    openEditModal,
    handleDeleteUser,
    openAddModal,
  } = useAdmin();

  const getRoleLabel = (role: string, userTeam: string | object | null) => {
    if (role === "admin") return "超级管理员";
    if (role === "hr") {
      const team = teams.find((t: any) => {
        if (userTeam && typeof userTeam === "object" && "_id" in userTeam) {
          return t._id === userTeam._id;
        }
        return t._id === userTeam;
      });
      return team ? `团队管理员 (${team.name})` : "团队管理员 (无所属团队)";
    }
    return "学生";
  };

  const getTeamName = (userTeam: string | object | null) => {
    if (!userTeam) return "无";
    const team = teams.find((t: any) => {
      if (userTeam && typeof userTeam === "object" && "_id" in userTeam) {
        return t._id === userTeam._id;
      }
      return t._id === userTeam;
    });
    return team ? team.name : "无";
  };

  return (
    <section>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-neutral-800">用户管理</h2>
        <button
          type="button"
          className="rounded-lg bg-primary-500 px-4 py-2 text-white transition-colors hover:bg-primary-600"
          onClick={openAddModal}
        >
          添加用户
        </button>
      </div>

      <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm">
        <div className="border-b border-neutral-200 p-4">
          <div className="flex items-center space-x-4">
            <input
              type="text"
              placeholder="搜索用户"
              className="flex-1 rounded-lg border border-neutral-300 px-4 py-2 focus:ring-2 focus:ring-primary-500 focus:outline-none"
            />
            <select className="rounded-lg border border-neutral-300 px-4 py-2 focus:ring-2 focus:ring-primary-500 focus:outline-none">
              {["全部角色", "超级管理员", "团队管理员", "学生"].map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-neutral-50">
              <tr className="text-left text-xs uppercase tracking-wider text-neutral-500">
                {["用户", "邮箱", "所属团队", "状态", "操作"].map((item) => (
                  <th key={item} className="px-6 py-3">
                    {item}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200 bg-white">
              {isLoading ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-8 text-center text-neutral-500"
                  >
                    加载中...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-8 text-center text-red-500"
                  >
                    {error}
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-8 text-center text-neutral-500"
                  >
                    暂无用户
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user._id}>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-100">
                          <span className="font-semibold text-primary-600">
                            {user.username.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-neutral-900">
                            {user.username}
                          </div>
                          <div className="text-sm text-neutral-500">
                            {getRoleLabel(user.role, user.team)}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-neutral-900">
                      {user.email}
                    </td>
                    <td className="px-6 py-4 text-sm text-neutral-900">
                      {getTeamName(user.team)}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span
                        className={`rounded-full px-2 py-1 text-xs font-semibold ${user.status === "active" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}
                      >
                        {user.status === "active" ? "活跃" : "未活跃"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <button
                        type="button"
                        className="mr-3 text-primary-600 hover:text-primary-900"
                        onClick={() => openEditModal(user)}
                      >
                        编辑
                      </button>
                      <button
                        type="button"
                        className="text-red-600 hover:text-red-900"
                        onClick={() => handleDeleteUser(user._id)}
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
