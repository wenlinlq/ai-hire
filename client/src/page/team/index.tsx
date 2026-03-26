import { useState } from 'react'
import { LogoMark } from '../../components/site'

type TeamTab = 'user' | 'team' | 'stats' | 'config'
type ModalType = 'user' | 'team' | null

const userRows = [
  { name: '张经理', email: 'zhang@example.com', role: '管理员', status: '活跃', initial: '张' },
  { name: '李助理', email: 'li@example.com', role: '招聘专员', status: '活跃', initial: '李' },
  { name: '王面试官', email: 'wang@example.com', role: '面试官', status: '未活跃', initial: '王' },
] as const

const teams = [
  { name: '产品团队', count: '3 人', desc: '负责产品设计和管理的团队', members: ['张', '李', '王'] },
  { name: '技术团队', count: '5 人', desc: '负责技术开发和维护的团队', members: ['赵', '钱', '孙', '周', '吴'] },
  { name: '设计团队', count: '2 人', desc: '负责UI/UX设计的团队', members: ['郑', '王'] },
] as const

const charts = [
  { title: '用户活跃度', values: [68, 74, 81, 76, 88, 92, 86] },
  { title: '团队分布', values: [35, 55, 22, 41] },
  { title: '功能使用频率', values: [92, 77, 65, 58, 81] },
  { title: '系统性能', values: [99, 97, 98, 96, 99] },
] as const

function Team() {
  const [activeTab, setActiveTab] = useState<TeamTab>('user')
  const [modal, setModal] = useState<ModalType>(null)

  return (
    <div className="flex min-h-screen bg-neutral-50 text-neutral-700">
      <aside className="sticky top-0 h-screen w-64 border-r border-neutral-200 bg-white">
        <div className="border-b border-neutral-200 p-4">
          <div className="flex items-center space-x-2">
            <LogoMark className="h-8 w-8 text-primary-600" />
            <span className="text-xl font-bold text-neutral-800">AI招聘</span>
          </div>
        </div>

        <nav className="py-4">
          <div className="mb-2 px-4 text-xs font-semibold uppercase text-neutral-500">团队管理</div>
          <ul className="space-y-1">
            {[
              ['user', '用户管理'],
              ['team', '团队管理'],
              ['stats', '数据统计'],
              ['config', '系统配置'],
            ].map(([key, label]) => (
              <li key={key}>
                <button
                  type="button"
                  className={`w-full border-r-4 px-4 py-3 text-left transition-colors ${activeTab === key ? 'border-primary-500 bg-neutral-50 text-primary-500' : 'border-transparent hover:bg-neutral-50'
                    }`}
                  onClick={() => setActiveTab(key as TeamTab)}
                >
                  {label}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      <div className="flex flex-1 flex-col">
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-neutral-200 bg-white px-6">
          <h1 className="text-xl font-bold text-neutral-800">团队管理</h1>
          <div className="flex items-center space-x-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-100">
              <span className="font-semibold text-primary-600">张</span>
            </div>
            <span className="text-sm font-medium text-neutral-700">张经理</span>
          </div>
        </header>

        <main className="flex-1 p-6">
          {activeTab === 'user' && (
            <section>
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-neutral-800">用户管理</h2>
                <button type="button" className="rounded-lg bg-primary-500 px-4 py-2 text-white transition-colors hover:bg-primary-600" onClick={() => setModal('user')}>
                  添加用户
                </button>
              </div>

              <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm">
                <div className="border-b border-neutral-200 p-4">
                  <div className="flex items-center space-x-4">
                    <input type="text" placeholder="搜索用户" className="flex-1 rounded-lg border border-neutral-300 px-4 py-2 focus:ring-2 focus:ring-primary-500 focus:outline-none" />
                    <select className="rounded-lg border border-neutral-300 px-4 py-2 focus:ring-2 focus:ring-primary-500 focus:outline-none">
                      {['全部角色', '管理员', '招聘专员', '面试官'].map((item) => <option key={item}>{item}</option>)}
                    </select>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-neutral-50">
                      <tr className="text-left text-xs uppercase tracking-wider text-neutral-500">
                        {['用户', '邮箱', '角色', '状态', '操作'].map((item) => <th key={item} className="px-6 py-3">{item}</th>)}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-200 bg-white">
                      {userRows.map((row) => (
                        <tr key={row.email}>
                          <td className="px-6 py-4">
                            <div className="flex items-center">
                              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-100">
                                <span className="font-semibold text-primary-600">{row.initial}</span>
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-neutral-900">{row.name}</div>
                                <div className="text-sm text-neutral-500">{row.role}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-neutral-900">{row.email}</td>
                          <td className="px-6 py-4 text-sm text-neutral-700">{row.role}</td>
                          <td className="px-6 py-4 text-sm">
                            <span className={`rounded-full px-2 py-1 text-xs font-semibold ${row.status === '活跃' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                              {row.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm">
                            <button type="button" className="mr-3 text-primary-600 hover:text-primary-900">编辑</button>
                            <button type="button" className="text-red-600 hover:text-red-900">删除</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>
          )}

          {activeTab === 'team' && (
            <section>
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-neutral-800">团队管理</h2>
                <button type="button" className="rounded-lg bg-primary-500 px-4 py-2 text-white transition-colors hover:bg-primary-600" onClick={() => setModal('team')}>
                  创建团队
                </button>
              </div>

              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {teams.map((team) => (
                  <div key={team.name} className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
                    <div className="mb-4 flex items-start justify-between">
                      <h3 className="text-lg font-semibold text-neutral-800">{team.name}</h3>
                      <span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-semibold text-blue-800">{team.count}</span>
                    </div>
                    <p className="mb-4 text-sm text-neutral-600">{team.desc}</p>
                    <div className="mb-4 flex items-center space-x-2">
                      {team.members.map((member) => (
                        <div key={member} className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-100">
                          <span className="font-semibold text-primary-600">{member}</span>
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-end space-x-2">
                      <button type="button" className="rounded-lg border border-neutral-300 px-3 py-1 text-sm text-neutral-700 hover:bg-neutral-50">编辑</button>
                      <button type="button" className="rounded-lg border border-red-300 px-3 py-1 text-sm text-red-700 hover:bg-red-50">删除</button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {activeTab === 'stats' && (
            <section>
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-neutral-800">数据统计</h2>
                <select className="rounded-lg border border-neutral-300 px-4 py-2 focus:ring-2 focus:ring-primary-500 focus:outline-none">
                  {['最近7天', '最近30天', '最近90天', '自定义'].map((item) => <option key={item}>{item}</option>)}
                </select>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                {charts.map((chart) => (
                  <div key={chart.title} className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
                    <h3 className="mb-4 text-lg font-semibold text-neutral-800">{chart.title}</h3>
                    <div className="flex h-80 items-end gap-3">
                      {chart.values.map((value, index) => (
                        <div key={`${chart.title}-${index}`} className="flex flex-1 flex-col items-center">
                          <div className="w-full rounded-t-md bg-primary-400" style={{ height: `${value}%` }} />
                          <span className="mt-2 text-xs text-neutral-500">{index + 1}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {activeTab === 'config' && (
            <section>
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-neutral-800">系统配置</h2>
                <button type="button" className="rounded-lg bg-primary-500 px-4 py-2 text-white transition-colors hover:bg-primary-600">保存配置</button>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
                  <h3 className="mb-4 text-lg font-semibold text-neutral-800">基本设置</h3>
                  <div className="space-y-4">
                    <input className="w-full rounded-lg border border-neutral-300 px-4 py-2" defaultValue="AI招聘平台" />
                    <input className="w-full rounded-lg border border-neutral-300 px-4 py-2" defaultValue="contact@aihire.com" />
                    <select className="w-full rounded-lg border border-neutral-300 px-4 py-2"><option>简体中文</option><option>English</option></select>
                    <select className="w-full rounded-lg border border-neutral-300 px-4 py-2"><option>Asia/Shanghai (UTC+8)</option><option>America/New_York (UTC-5)</option><option>Europe/London (UTC+0)</option></select>
                  </div>
                </div>

                <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
                  <h3 className="mb-4 text-lg font-semibold text-neutral-800">安全设置</h3>
                  <div className="space-y-4">
                    <label className="flex items-center justify-between"><span className="text-sm font-medium text-neutral-700">启用两步验证</span><input type="checkbox" defaultChecked className="h-4 w-4 accent-primary-500" /></label>
                    <label className="flex items-center justify-between"><span className="text-sm font-medium text-neutral-700">密码复杂度要求</span><input type="checkbox" defaultChecked className="h-4 w-4 accent-primary-500" /></label>
                    <input className="w-full rounded-lg border border-neutral-300 px-4 py-2" defaultValue="90" />
                    <input className="w-full rounded-lg border border-neutral-300 px-4 py-2" defaultValue="5" />
                  </div>
                </div>
              </div>
            </section>
          )}
        </main>
      </div>

      {modal !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-xl rounded-xl bg-white p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-xl font-bold text-neutral-800">{modal === 'user' ? '添加用户' : '创建团队'}</h3>
              <button type="button" className="text-neutral-500 hover:text-neutral-800" onClick={() => setModal(null)}>关闭</button>
            </div>

            {modal === 'user' ? (
              <div className="space-y-4">
                <input className="w-full rounded-lg border border-neutral-300 px-4 py-3" placeholder="用户姓名" />
                <input className="w-full rounded-lg border border-neutral-300 px-4 py-3" placeholder="邮箱地址" />
                <select className="w-full rounded-lg border border-neutral-300 px-4 py-3"><option>管理员</option><option>招聘专员</option><option>面试官</option></select>
              </div>
            ) : (
              <div className="space-y-4">
                <input className="w-full rounded-lg border border-neutral-300 px-4 py-3" placeholder="团队名称" />
                <textarea className="w-full rounded-lg border border-neutral-300 px-4 py-3" rows={4} placeholder="团队描述" />
                <select className="w-full rounded-lg border border-neutral-300 px-4 py-3"><option>产品线</option><option>技术线</option><option>设计线</option></select>
              </div>
            )}

            <div className="mt-6 flex justify-end space-x-3">
              <button type="button" className="rounded-lg border border-neutral-300 px-4 py-2" onClick={() => setModal(null)}>取消</button>
              <button type="button" className="rounded-lg bg-primary-500 px-4 py-2 text-white" onClick={() => setModal(null)}>确认</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Team
