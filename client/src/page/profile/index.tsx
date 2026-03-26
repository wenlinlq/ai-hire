import { ChangeEvent, useMemo, useRef, useState } from 'react'
import { SiteFooter, SiteNav } from '../../components/site'

type ProfileTab = 'profile' | 'resume' | 'favorites' | 'interviews'

type ProfileForm = {
  name: string
  phone: string
  email: string
  city: string
  intro: string
}

type ResumeItem = {
  name: string
  uploadedAt: string
  type: 'PDF' | 'DOC' | 'DOCX'
}

const favoriteJobs = [
  { title: '高级前端工程师', company: '阿里巴巴 · 杭州 · 3-5年', salary: '25k-40k', tags: ['React', 'TypeScript', 'Node.js'], savedAt: '2024-01-14' },
  { title: '产品经理', company: '腾讯 · 深圳 · 3-5年', salary: '30k-50k', tags: ['产品设计', '数据分析', '项目管理'], savedAt: '2024-01-13' },
  { title: 'UI设计师', company: '字节跳动 · 北京 · 1-3年', salary: '20k-35k', tags: ['Figma', 'Sketch', '动效设计'], savedAt: '2024-01-12' },
] as const

const interviewHistory = [
  { title: '技术面试模拟', time: '2024-01-15 14:30 - 15:15', score: 85, details: [{ label: '专业知识', value: 90 }, { label: '表达能力', value: 80 }, { label: '应变能力', value: 85 }] },
  { title: '综合面试模拟', time: '2024-01-10 10:00 - 10:45', score: 78, details: [{ label: '专业知识', value: 75 }, { label: '表达能力', value: 82 }, { label: '应变能力', value: 77 }] },
  { title: '产品面试模拟', time: '2024-01-05 16:00 - 16:40', score: 88, details: [{ label: '专业知识', value: 84 }, { label: '表达能力', value: 91 }, { label: '应变能力', value: 89 }] },
] as const

function Profile() {
  const [activeTab, setActiveTab] = useState<ProfileTab>('profile')
  const [profileForm, setProfileForm] = useState<ProfileForm>({
    name: '张三',
    phone: '138****8888',
    email: 'zhangsan@example.com',
    city: '北京',
    intro: '',
  })
  const [resumes, setResumes] = useState<ResumeItem[]>([
    { name: '张三_前端工程师.pdf', uploadedAt: '2024-01-15 14:30', type: 'PDF' },
  ])

  const fileInputRef = useRef<HTMLInputElement>(null)
  const averageScore = useMemo(() => Math.round(interviewHistory.reduce((sum, item) => sum + item.score, 0) / interviewHistory.length), [])

  const handleUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) {
      return
    }

    const extension = file.name.split('.').pop()?.toUpperCase()
    const type = extension === 'DOC' || extension === 'DOCX' ? extension : 'PDF'
    const now = new Date()

    setResumes((current) => [
      {
        name: file.name,
        uploadedAt: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`,
        type,
      },
      ...current,
    ])

    event.target.value = ''
  }

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-700">
      <SiteNav current="profile" />

      <main className="py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-neutral-800">个人中心</h1>
            <p className="mt-2 text-neutral-600">管理你的个人信息、简历和求职进度</p>
          </div>

          <div className="grid gap-8 lg:grid-cols-4">
            <div className="lg:col-span-1">
              <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
                <div className="mb-6 text-center">
                  <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-primary-500">
                    <svg className="h-10 w-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-bold text-neutral-800">张三</h3>
                  <p className="text-sm text-neutral-500">zhangsan@example.com</p>
                </div>

                <nav className="space-y-2">
                  {[
                    ['profile', '个人信息'],
                    ['resume', '我的简历'],
                    ['favorites', '收藏岗位'],
                    ['interviews', '历史模拟面试'],
                  ].map(([key, label]) => (
                    <button
                      key={key}
                      type="button"
                      className={`w-full rounded-lg px-4 py-3 text-left transition-colors ${activeTab === key ? 'bg-primary-500 text-white' : 'hover:bg-neutral-100'
                        }`}
                      onClick={() => setActiveTab(key as ProfileTab)}
                    >
                      {label}
                    </button>
                  ))}
                </nav>
              </div>
            </div>

            <div className="lg:col-span-3">
              {activeTab === 'profile' && (
                <div className="rounded-xl border border-neutral-200 bg-white p-8 shadow-sm">
                  <h2 className="mb-6 text-2xl font-bold text-neutral-800">个人信息</h2>
                  <form className="space-y-6" onSubmit={(event) => event.preventDefault()}>
                    <div className="grid gap-6 md:grid-cols-2">
                      {[
                        ['姓名', 'name', 'text'],
                        ['手机号', 'phone', 'tel'],
                        ['邮箱', 'email', 'email'],
                      ].map(([label, key, type]) => (
                        <div key={key}>
                          <label className="mb-2 block text-sm font-medium text-neutral-700">{label}</label>
                          <input
                            type={type}
                            value={profileForm[key as keyof ProfileForm] as string}
                            onChange={(event) =>
                              setProfileForm((current) => ({ ...current, [key]: event.target.value }))
                            }
                            className="w-full rounded-lg border border-neutral-300 px-4 py-3 focus:ring-2 focus:ring-primary-500 focus:outline-none"
                          />
                        </div>
                      ))}

                      <div>
                        <label className="mb-2 block text-sm font-medium text-neutral-700">所在城市</label>
                        <select
                          value={profileForm.city}
                          onChange={(event) => setProfileForm((current) => ({ ...current, city: event.target.value }))}
                          className="w-full rounded-lg border border-neutral-300 px-4 py-3 focus:ring-2 focus:ring-primary-500 focus:outline-none"
                        >
                          {['北京', '上海', '广州', '深圳', '杭州'].map((item) => (
                            <option key={item}>{item}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-neutral-700">个人简介</label>
                      <textarea
                        rows={4}
                        value={profileForm.intro}
                        onChange={(event) => setProfileForm((current) => ({ ...current, intro: event.target.value }))}
                        placeholder="介绍一下你自己..."
                        className="w-full rounded-lg border border-neutral-300 px-4 py-3 focus:ring-2 focus:ring-primary-500 focus:outline-none"
                      />
                    </div>

                    <div className="flex justify-end">
                      <button type="submit" className="rounded-lg bg-primary-500 px-6 py-3 font-semibold text-white transition-colors hover:bg-primary-600">
                        保存修改
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {activeTab === 'resume' && (
                <div className="rounded-xl border border-neutral-200 bg-white p-8 shadow-sm">
                  <h2 className="mb-6 text-2xl font-bold text-neutral-800">我的简历</h2>
                  <button
                    type="button"
                    className="w-full rounded-xl border-2 border-dashed border-neutral-300 p-12 text-center transition-colors hover:border-primary-500"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <svg className="mx-auto mb-4 h-16 w-16 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <p className="mb-2 text-lg text-neutral-600">点击或拖拽上传简历</p>
                    <p className="text-sm text-neutral-500">支持 PDF、DOC、DOCX 格式，文件大小不超过 10MB</p>
                  </button>
                  <input ref={fileInputRef} type="file" className="hidden" accept=".pdf,.doc,.docx" onChange={handleUpload} />

                  <div className="mt-8">
                    <h3 className="mb-4 text-lg font-semibold text-neutral-800">已上传简历</h3>
                    <div className="space-y-4">
                      {resumes.map((resume) => (
                        <div key={`${resume.name}-${resume.uploadedAt}`} className="flex items-center justify-between rounded-lg border border-neutral-200 bg-neutral-50 p-4">
                          <div className="flex items-center space-x-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-red-100">
                              <span className="font-bold text-red-600">{resume.type}</span>
                            </div>
                            <div>
                              <p className="font-medium text-neutral-800">{resume.name}</p>
                              <p className="text-sm text-neutral-500">上传时间：{resume.uploadedAt}</p>
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <button type="button" className="rounded-lg px-4 py-2 text-primary-600 transition-colors hover:bg-primary-50">查看</button>
                            <button
                              type="button"
                              className="rounded-lg px-4 py-2 text-red-600 transition-colors hover:bg-red-50"
                              onClick={() => setResumes((current) => current.filter((item) => item.name !== resume.name || item.uploadedAt !== resume.uploadedAt))}
                            >
                              删除
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'favorites' && (
                <div className="rounded-xl border border-neutral-200 bg-white p-8 shadow-sm">
                  <div className="mb-6 flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-neutral-800">收藏岗位</h2>
                    <button type="button" className="rounded-lg bg-primary-500 px-6 py-2 text-white transition-colors hover:bg-primary-600">
                      一键投递
                    </button>
                  </div>
                  <div className="space-y-4">
                    {favoriteJobs.map((job) => (
                      <div key={job.title} className="rounded-xl border border-neutral-200 p-6 transition-shadow hover:shadow-md">
                        <div className="mb-4 flex items-start justify-between">
                          <div>
                            <h3 className="mb-2 text-xl font-bold text-neutral-800">{job.title}</h3>
                            <p className="text-neutral-600">{job.company}</p>
                          </div>
                          <span className="text-lg font-bold text-primary-600">{job.salary}</span>
                        </div>
                        <div className="mb-4 flex flex-wrap gap-2">
                          {job.tags.map((tag) => (
                            <span key={tag} className="rounded-full bg-neutral-100 px-3 py-1 text-sm text-neutral-600">{tag}</span>
                          ))}
                        </div>
                        <span className="text-sm text-neutral-500">收藏时间：{job.savedAt}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'interviews' && (
                <div className="rounded-xl border border-neutral-200 bg-white p-8 shadow-sm">
                  <div className="mb-6 flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-neutral-800">历史模拟面试</h2>
                    <div className="rounded-full bg-accent-50 px-4 py-2 text-sm font-medium text-accent-600">平均分 {averageScore}</div>
                  </div>
                  <div className="space-y-4">
                    {interviewHistory.map((record) => (
                      <div key={record.title} className="rounded-xl border border-neutral-200 p-6 transition-shadow hover:shadow-md">
                        <div className="mb-4 flex items-start justify-between">
                          <div>
                            <h3 className="mb-2 text-xl font-bold text-neutral-800">{record.title}</h3>
                            <p className="text-neutral-600">{record.time}</p>
                          </div>
                          <div className="text-center">
                            <span className="text-3xl font-bold text-accent-500">{record.score}</span>
                            <p className="text-sm text-neutral-500">综合评分</p>
                          </div>
                        </div>
                        <div className="mb-4 grid grid-cols-3 gap-4">
                          {record.details.map((item) => (
                            <div key={item.label} className="rounded-lg bg-neutral-50 p-3 text-center">
                              <p className="text-lg font-semibold text-neutral-800">{item.value}</p>
                              <p className="text-sm text-neutral-500">{item.label}</p>
                            </div>
                          ))}
                        </div>
                        <div className="flex justify-end">
                          <button type="button" className="rounded-lg px-4 py-2 text-primary-600 transition-colors hover:bg-primary-50">查看详情</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  )
}

export default Profile
