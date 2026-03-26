import { useState } from 'react'
import { LogoMark } from '../../components/site'

type AdminTab = 'dashboard' | 'jobs' | 'candidates' | 'interviews'
type AdminModal = 'job' | 'candidate' | 'interview' | null

const dashboardStats = [
  { label: '开放职位', value: '24', delta: '+12%', iconClass: 'bg-primary-100 text-primary-600' },
  { label: '候选人', value: '156', delta: '+8%', iconClass: 'bg-accent-100 text-accent-600' },
  { label: '面试中', value: '32', delta: '-3%', iconClass: 'bg-blue-100 text-blue-600' },
  { label: '已录用', value: '8', delta: '+25%', iconClass: 'bg-green-100 text-green-600' },
] as const

const activityFeed = [
  { title: '新职位发布', subtitle: '高级前端工程师 - 阿里巴巴', time: '2小时前' },
  { title: '候选人通过面试', subtitle: '李四 - 产品经理', time: '5小时前' },
  { title: '面试安排', subtitle: '王五 - UI设计师', time: '1天前' },
] as const

const jobs = [
  { title: '高级前端工程师', meta: '3-5年 · 本科', company: '阿里巴巴', salary: '25k-40k', date: '2024-01-15', status: '招聘中' },
  { title: '产品经理', meta: '3-5年 · 本科', company: '腾讯', salary: '30k-50k', date: '2024-01-14', status: '招聘中' },
  { title: 'UI设计师', meta: '1-3年 · 本科', company: '字节跳动', salary: '20k-35k', date: '2024-01-13', status: '已关闭' },
] as const

const candidates = [
  { name: '李四', email: 'lisi@example.com', position: '产品经理', date: '2024-01-15', status: '复试' },
  { name: '王五', email: 'wangwu@example.com', position: 'UI设计师', date: '2024-01-14', status: '初试' },
  { name: '赵六', email: 'zhaoliu@example.com', position: '前端工程师', date: '2024-01-12', status: '已录用' },
] as const

const interviewPrograms = [
  { title: '技术面试任务', count: 28, note: '本周计划完成 12 场' },
  { title: '评分分布', count: 86, note: '平均分稳定在 80 以上' },
] as const

function Admin() {
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard')
  const [modal, setModal] = useState<AdminModal>(null)

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
          <div className="mb-2 px-4 text-xs font-semibold uppercase text-neutral-500">管理后台</div>
          <ul className="space-y-1">
            {[
              ['dashboard', '团队仪表盘'],
              ['jobs', '职位管理'],
              ['candidates', '候选人管理'],
              ['interviews', 'AI面试中心'],
            ].map(([key, label]) => (
              <li key={key}>
                <button
                  type="button"
                  className={`w-full border-r-4 px-4 py-3 text-left transition-colors ${activeTab === key ? 'border-primary-500 bg-neutral-50 text-primary-500' : 'border-transparent hover:bg-neutral-50'
                    }`}
                  onClick={() => setActiveTab(key as AdminTab)}
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
          <h1 className="text-xl font-bold text-neutral-800">管理后台</h1>
          <div className="flex items-center space-x-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-100">
              <span className="font-semibold text-primary-600">张</span>
            </div>
            <span className="text-sm font-medium text-neutral-700">张经理</span>
          </div>
        </header>

        <main className="flex-1 p-6">
          {activeTab === 'dashboard' && (
            <section>
              <div className="mb-6 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {dashboardStats.map((item) => (
                  <div key={item.label} className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="mb-1 text-sm text-neutral-500">{item.label}</p>
                        <h3 className="text-2xl font-bold text-neutral-800">{item.value}</h3>
                      </div>
                      <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${item.iconClass}`}>●</div>
                    </div>
                    <div className="mt-4 flex items-center">
                      <span className={`text-sm ${item.delta.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>{item.delta}</span>
                      <span className="ml-2 text-xs text-neutral-500">较上月</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mb-6 grid gap-6 lg:grid-cols-2">
                {['招聘漏斗', '月度招聘趋势'].map((chart) => (
                  <div key={chart} className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
                    <h3 className="mb-4 text-lg font-semibold text-neutral-800">{chart}</h3>
                    <div className="flex h-80 items-end gap-3">
                      {[35, 62, 48, 70, 54, 83].map((value, index) => (
                        <div key={`${chart}-${index}`} className="flex flex-1 flex-col items-center">
                          <div className="w-full rounded-t-md bg-primary-400" style={{ height: `${value}%` }} />
                          <span className="mt-2 text-xs text-neutral-500">{index + 1}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
                <h3 className="mb-4 text-lg font-semibold text-neutral-800">最近活动</h3>
                <div className="space-y-4">
                  {activityFeed.map((item) => (
                    <div key={item.title + item.time} className="flex items-start space-x-4">
                      <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600">●</div>
                      <div>
                        <p className="text-neutral-800">{item.title}</p>
                        <p className="text-sm text-neutral-500">{item.subtitle}</p>
                        <p className="text-xs text-neutral-400">{item.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {activeTab === 'jobs' && (
            <section>
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-neutral-800">职位管理</h2>
                <button type="button" className="rounded-lg bg-primary-500 px-4 py-2 text-white transition-colors hover:bg-primary-600" onClick={() => setModal('job')}>
                  发布新职位
                </button>
              </div>

              <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm">
                <div className="border-b border-neutral-200 p-4">
                  <div className="flex items-center space-x-4">
                    <input type="text" placeholder="搜索职位" className="flex-1 rounded-lg border border-neutral-300 px-4 py-2 focus:ring-2 focus:ring-primary-500 focus:outline-none" />
                    <select className="rounded-lg border border-neutral-300 px-4 py-2"><option>全部状态</option><option>招聘中</option><option>已关闭</option></select>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-neutral-50">
                      <tr className="text-left text-xs uppercase tracking-wider text-neutral-500">
                        {['职位名称', '公司', '薪资', '发布时间', '状态', '操作'].map((item) => <th key={item} className="px-6 py-3">{item}</th>)}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-200">
                      {jobs.map((job) => (
                        <tr key={job.title}>
                          <td className="px-6 py-4"><div className="text-sm font-medium text-neutral-900">{job.title}</div><div className="text-sm text-neutral-500">{job.meta}</div></td>
                          <td className="px-6 py-4 text-sm">{job.company}</td>
                          <td className="px-6 py-4 text-sm">{job.salary}</td>
                          <td className="px-6 py-4 text-sm">{job.date}</td>
                          <td className="px-6 py-4 text-sm"><span className={`rounded-full px-2 py-1 text-xs font-semibold ${job.status === '招聘中' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>{job.status}</span></td>
                          <td className="px-6 py-4 text-sm"><button type="button" className="mr-3 text-primary-600 hover:text-primary-900">编辑</button><button type="button" className={job.status === '招聘中' ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'}>{job.status === '招聘中' ? '关闭' : '重新开放'}</button></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>
          )}

          {activeTab === 'candidates' && (
            <section>
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-neutral-800">候选人管理</h2>
                <button type="button" className="rounded-lg bg-primary-500 px-4 py-2 text-white transition-colors hover:bg-primary-600" onClick={() => setModal('candidate')}>
                  导入候选人
                </button>
              </div>

              <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm">
                <div className="border-b border-neutral-200 p-4">
                  <div className="flex items-center space-x-4">
                    <input type="text" placeholder="搜索候选人" className="flex-1 rounded-lg border border-neutral-300 px-4 py-2 focus:ring-2 focus:ring-primary-500 focus:outline-none" />
                    <select className="rounded-lg border border-neutral-300 px-4 py-2">{['全部状态', '简历筛选', '初试', '复试', '已录用', '已拒绝'].map((item) => <option key={item}>{item}</option>)}</select>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-neutral-50">
                      <tr className="text-left text-xs uppercase tracking-wider text-neutral-500">
                        {['候选人', '应聘职位', '投递时间', '状态', '操作'].map((item) => <th key={item} className="px-6 py-3">{item}</th>)}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-200">
                      {candidates.map((candidate) => (
                        <tr key={candidate.email}>
                          <td className="px-6 py-4"><div className="text-sm font-medium text-neutral-900">{candidate.name}</div><div className="text-sm text-neutral-500">{candidate.email}</div></td>
                          <td className="px-6 py-4 text-sm">{candidate.position}</td>
                          <td className="px-6 py-4 text-sm">{candidate.date}</td>
                          <td className="px-6 py-4 text-sm"><span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-semibold text-blue-800">{candidate.status}</span></td>
                          <td className="px-6 py-4 text-sm"><button type="button" className="mr-3 text-primary-600 hover:text-primary-900">查看</button><button type="button" className="text-green-600 hover:text-green-900">安排面试</button></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>
          )}

          {activeTab === 'interviews' && (
            <section>
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-neutral-800">AI面试中心</h2>
                <button type="button" className="rounded-lg bg-primary-500 px-4 py-2 text-white transition-colors hover:bg-primary-600" onClick={() => setModal('interview')}>
                  创建面试
                </button>
              </div>

              <div className="grid gap-6 lg:grid-cols-2">
                {interviewPrograms.map((card) => (
                  <div key={card.title} className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
                    <h3 className="mb-4 text-lg font-semibold text-neutral-800">{card.title}</h3>
                    <div className="mb-3 text-4xl font-bold text-primary-600">{card.count}</div>
                    <p className="text-sm text-neutral-500">{card.note}</p>
                    <div className="mt-6 flex h-48 items-end gap-3">
                      {[45, 72, 60, 80, 68].map((value, index) => (
                        <div key={`${card.title}-${index}`} className="flex flex-1 flex-col items-center">
                          <div className="w-full rounded-t-md bg-accent-400" style={{ height: `${value}%` }} />
                          <span className="mt-2 text-xs text-neutral-500">{index + 1}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </main>
      </div>

      {modal !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-xl rounded-xl bg-white p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-xl font-bold text-neutral-800">{modal === 'job' ? '发布新职位' : modal === 'candidate' ? '导入候选人' : '创建面试'}</h3>
              <button type="button" className="text-neutral-500 hover:text-neutral-800" onClick={() => setModal(null)}>关闭</button>
            </div>

            {modal === 'job' && (
              <div className="space-y-4">
                <input className="w-full rounded-lg border border-neutral-300 px-4 py-3" placeholder="职位名称" />
                <select className="w-full rounded-lg border border-neutral-300 px-4 py-3"><option>选择部门</option><option>技术部</option><option>产品部</option><option>设计部</option></select>
                <textarea className="w-full rounded-lg border border-neutral-300 px-4 py-3" rows={4} placeholder="职位描述" />
                <textarea className="w-full rounded-lg border border-neutral-300 px-4 py-3" rows={4} placeholder="任职要求" />
              </div>
            )}

            {modal === 'candidate' && (
              <div className="space-y-4">
                <input type="file" className="w-full rounded-lg border border-neutral-300 px-4 py-3" />
                <select className="w-full rounded-lg border border-neutral-300 px-4 py-3"><option>选择导入岗位</option><option>高级前端工程师</option><option>产品经理</option></select>
              </div>
            )}

            {modal === 'interview' && (
              <div className="space-y-4">
                <select className="w-full rounded-lg border border-neutral-300 px-4 py-3"><option>技术面试</option><option>产品面试</option><option>综合面试</option></select>
                <select className="w-full rounded-lg border border-neutral-300 px-4 py-3"><option>选择候选人</option><option>李四</option><option>王五</option></select>
                <select className="w-full rounded-lg border border-neutral-300 px-4 py-3"><option>选择面试官</option><option>王面试官</option></select>
                <textarea className="w-full rounded-lg border border-neutral-300 px-4 py-3" rows={4} placeholder="备注信息" />
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

export default Admin
