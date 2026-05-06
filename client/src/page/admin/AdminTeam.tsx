import { useAdmin } from "./AdminContext";

export default function AdminTeam() {
  const { teams, isLoading, error, setModal, openEditTeamModal, handleDeleteTeam } = useAdmin();

  return (
    <section>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-neutral-800">团队管理</h2>
        <button
          type="button"
          className="rounded-lg bg-primary-500 px-4 py-2 text-white transition-colors hover:bg-primary-600"
          onClick={() => setModal("team")}
        >
          创建团队
        </button>
      </div>

      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <p className="text-neutral-500">加载中...</p>
        </div>
      ) : error ? (
        <div className="flex h-64 items-center justify-center">
          <p className="text-red-500">{error}</p>
        </div>
      ) : teams.length === 0 ? (
        <div className="flex h-64 items-center justify-center">
          <p className="text-neutral-500">暂无团队</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {teams.map((team) => (
            <div key={team._id} className="flex flex-col rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-start justify-between">
                <h3 className="text-lg font-semibold text-neutral-800">{team.name}</h3>
                <span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-semibold text-blue-800">
                  {Array.isArray(team.members) ? `${team.members.length} 人` : "0 人"}
                </span>
              </div>
              <p className="mb-4 text-sm text-neutral-600">{team.description}</p>
              <div className="mb-4">
                <p className="text-sm text-neutral-500">总负责人: {team.leader || "无"}</p>
                <p className="text-sm text-neutral-500">
                  联系方式: {typeof team.contact === "object" ? team.contact.phone || "无" : team.contact || "无"}
                </p>
              </div>
              <div className="mb-4 flex items-center space-x-2">
                {team.members && team.members.map((member, index) => {
                  const memberName = typeof member === "object" && member.username ? member.username : member;
                  return (
                    <div key={index} className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-100">
                      <span className="font-semibold text-primary-600">
                        {memberName.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  );
                })}
              </div>
              <div className="mt-auto flex justify-end space-x-2">
                <button
                  type="button"
                  className="rounded-lg border border-neutral-300 px-3 py-1 text-sm text-neutral-700 hover:bg-neutral-50"
                  onClick={() => openEditTeamModal(team)}
                >
                  编辑
                </button>
                <button
                  type="button"
                  className="rounded-lg border border-red-300 px-3 py-1 text-sm text-red-700 hover:bg-red-50"
                  onClick={() => handleDeleteTeam(team._id)}
                >
                  删除
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}