import { useState } from 'react'
import { SiteFooter, SiteNav } from '../../components/site'

const hotKeywords = ['前端开发', 'Java工程师', '产品经理', 'UI设计师', '算法工程师', '数据分析师']
const experienceFilters = ['不限', '应届生', '1-3年', '3-5年', '5-10年', '10年以上']
const educationFilters = ['不限', '大专', '本科', '硕士', '博士']

const jobs = [
  {
    title: '高级前端工程师',
    companyInfo: '阿里巴巴 · 杭州西湖区 · 3-5年 · 本科',
    salary: '25k-40k',
    bonus: '14薪',
    tags: ['React', 'TypeScript', 'Node.js', '微前端'],
    summary:
      '负责公司核心产品的前端开发，参与技术架构设计，优化前端性能，提升用户体验。要求有扎实的 JavaScript 基础，熟悉 React 生态系统。',
    time: '2天前',
    applied: 128,
    favorited: true,
  },
  {
    title: '高级产品经理',
    companyInfo: '腾讯 · 深圳南山区 · 3-5年 · 本科',
    salary: '30k-50k',
    bonus: '16薪',
    tags: ['产品设计', '数据分析', '用户研究', 'A/B测试'],
    summary:
      '负责社交产品线的规划与迭代，深入理解用户需求，制定产品策略，推动产品落地。要求有互联网产品经验，具备优秀的沟通协调能力。',
    time: '1天前',
    applied: 256,
    favorited: false,
  },
  {
    title: '算法工程师',
    companyInfo: '字节跳动 · 北京海淀区 · 1-3年 · 硕士',
    salary: '35k-60k',
    bonus: '15薪',
    tags: ['Python', '机器学习', '深度学习', 'NLP'],
    summary:
      '参与推荐算法的研发与优化，提升用户推荐效果。要求熟悉机器学习算法，有扎实的数学基础，对推荐系统有深入理解。',
    time: '3小时前',
    applied: 89,
    favorited: true,
  },
  {
    title: 'Java开发工程师',
    companyInfo: '京东 · 北京亦庄 · 3-5年 · 本科',
    salary: '25k-45k',
    bonus: '15薪',
    tags: ['Java', 'Spring Boot', 'MySQL', '分布式'],
    summary:
      '负责中台业务系统开发与性能优化，参与系统架构迭代。要求具备大型互联网后台研发经验，熟悉微服务架构。',
    time: '4小时前',
    applied: 167,
    favorited: false,
  },
  {
    title: 'UI设计师',
    companyInfo: '美团 · 上海长宁区 · 1-3年 · 本科',
    salary: '20k-35k',
    bonus: '13薪',
    tags: ['Figma', 'Sketch', '动效设计', 'Design System'],
    summary:
      '负责本地生活业务的视觉设计与交互迭代，参与设计系统建设。要求有扎实的视觉表达能力和良好的协作意识。',
    time: '昨天',
    applied: 73,
    favorited: true,
  },
  {
    title: '内容运营专家',
    companyInfo: '小红书 · 上海静安区 · 3-5年 · 本科',
    salary: '18k-32k',
    bonus: '14薪',
    tags: ['内容运营', '增长策略', '数据分析', '社区运营'],
    summary:
      '负责平台核心垂类的内容增长，制定运营活动策略并跟踪效果。需要较强的数据意识和用户洞察能力。',
    time: '5小时前',
    applied: 142,
    favorited: false,
  },
] as const

function FavoriteIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      className={`h-5 w-5 ${filled ? 'fill-primary-500 text-primary-500' : 'fill-none text-neutral-400'}`}
      stroke="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
        d="M11.995 21.147l-1.465-1.333C5.4 15.153 2 12.066 2 8.275 2 5.188 4.42 2.75 7.5 2.75c1.74 0 3.41.808 4.495 2.082C13.09 3.558 14.76 2.75 16.5 2.75c3.08 0 5.5 2.438 5.5 5.525 0 3.791-3.4 6.878-8.53 11.539l-1.475 1.333Z"
      />
    </svg>
  )
}

function Hall() {
  const [keyword, setKeyword] = useState('')
  const [city, setCity] = useState('全部城市')
  const [jobType, setJobType] = useState('全部类型')
  const [salary, setSalary] = useState('全部薪资')
  const [experience, setExperience] = useState('不限')
  const [education, setEducation] = useState('不限')
  const [sort, setSort] = useState('推荐排序')
  const [favoriteJobs, setFavoriteJobs] = useState<Record<string, boolean>>(
    Object.fromEntries(jobs.map((job) => [job.title, job.favorited])),
  )

  const filteredJobs = jobs.filter((job) => {
    const keywordMatched =
      keyword.trim() === '' ||
      `${job.title}${job.companyInfo}${job.tags.join('')}${job.summary}`.includes(keyword.trim())
    const cityMatched = city === '全部城市' || job.companyInfo.includes(city)
    return keywordMatched && cityMatched
  })

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-700">
      <SiteNav current="hall" />

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 rounded-2xl bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row">
            <div className="flex-1">
              <label className="mb-2 block text-sm font-medium text-neutral-600">关键词</label>
              <div className="relative">
                <input
                  type="text"
                  value={keyword}
                  onChange={(event) => setKeyword(event.target.value)}
                  placeholder="搜索职位、公司、技能"
                  className="w-full rounded-lg border border-neutral-200 py-3 pr-4 pl-10 focus:border-transparent focus:ring-2 focus:ring-primary-500 focus:outline-none"
                />
                <svg className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>

            {[['工作地点', city, setCity, ['全部城市', '北京', '上海', '广州', '深圳', '杭州', '成都']], ['职位类型', jobType, setJobType, ['全部类型', '全职', '兼职', '实习', '远程']], ['薪资范围', salary, setSalary, ['全部薪资', '10k以下', '10k-20k', '20k-30k', '30k-50k', '50k以上']]].map(([label, value, setter, options]) => (
              <div key={label as string} className="md:w-48">
                <label className="mb-2 block text-sm font-medium text-neutral-600">{label as string}</label>
                <select
                  value={value as string}
                  onChange={(event) => (setter as (value: string) => void)(event.target.value)}
                  className="w-full rounded-lg border border-neutral-200 bg-white px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-primary-500 focus:outline-none"
                >
                  {(options as string[]).map((item) => (
                    <option key={item}>{item}</option>
                  ))}
                </select>
              </div>
            ))}

            <div className="flex items-end md:w-32">
              <button type="button" className="w-full rounded-lg bg-primary-500 px-6 py-3 font-semibold text-white transition-colors hover:bg-primary-600">
                搜索
              </button>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <span className="text-sm text-neutral-500">热门搜索：</span>
            {hotKeywords.map((item) => (
              <button
                key={item}
                type="button"
                className="rounded-full bg-primary-50 px-3 py-1 text-sm text-primary-600 transition-colors hover:bg-primary-100"
                onClick={() => setKeyword(item)}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-6 rounded-2xl bg-white p-4 shadow-sm">
          <div className="flex flex-wrap items-center gap-6">
            {[['工作经验：', experience, setExperience, experienceFilters], ['学历要求：', education, setEducation, educationFilters]].map(([label, value, setter, options]) => (
              <div key={label as string} className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-medium text-neutral-600">{label as string}</span>
                {(options as string[]).map((item) => (
                  <button
                    key={item}
                    type="button"
                    className={`rounded-full px-3 py-1 text-sm transition-colors ${value === item ? 'bg-primary-500 text-white' : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                      }`}
                    onClick={() => (setter as (value: string) => void)(item)}
                  >
                    {item}
                  </button>
                ))}
              </div>
            ))}
          </div>
        </div>

        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-neutral-800">职位列表</h1>
            <p className="mt-1 text-sm text-neutral-500">
              共找到 <span className="font-semibold text-primary-600">{filteredJobs.length.toLocaleString()}</span> 个职位
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-neutral-600">排序：</span>
            <select
              value={sort}
              onChange={(event) => setSort(event.target.value)}
              className="rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none"
            >
              {['推荐排序', '最新发布', '薪资从高到低', '薪资从低到高'].map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-4">
          {filteredJobs.map((job) => (
            <div key={`${job.title}-${job.companyInfo}`} className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
              <div className="flex flex-col gap-4 md:flex-row md:items-start">
                <button
                  type="button"
                  aria-label={favoriteJobs[job.title] ? `取消收藏${job.title}` : `收藏${job.title}`}
                  className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full bg-neutral-100 transition-colors hover:bg-primary-50"
                  onClick={() =>
                    setFavoriteJobs((current) => ({
                      ...current,
                      [job.title]: !current[job.title],
                    }))
                  }
                >
                  <FavoriteIcon filled={favoriteJobs[job.title]} />
                </button>

                <div className="flex-1">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <h3 className="cursor-pointer text-lg font-bold text-neutral-800 hover:text-primary-600">{job.title}</h3>
                      <p className="mt-1 text-sm text-neutral-500">{job.companyInfo}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-primary-600">{job.salary}</div>
                      <div className="mt-1 text-xs text-neutral-400">{job.bonus}</div>
                    </div>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    {job.tags.map((tag) => (
                      <span key={tag} className="rounded bg-primary-50 px-2 py-1 text-xs text-primary-600">
                        {tag}
                      </span>
                    ))}
                  </div>

                  <p className="mt-3 text-sm text-neutral-600">{job.summary}</p>

                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center gap-4 text-sm text-neutral-500">
                      <span>{job.time}</span>
                      <span>已投递 {job.applied}</span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        className={`rounded-lg border px-4 py-2 text-sm transition-colors ${
                          favoriteJobs[job.title]
                            ? 'border-primary-500 bg-primary-50 text-primary-600'
                            : 'border-primary-500 text-primary-600 hover:bg-primary-50'
                        }`}
                        onClick={() =>
                          setFavoriteJobs((current) => ({
                            ...current,
                            [job.title]: !current[job.title],
                          }))
                        }
                      >
                        {favoriteJobs[job.title] ? '已收藏' : '收藏'}
                      </button>
                      <button type="button" className="rounded-lg bg-primary-500 px-4 py-2 text-sm text-white transition-colors hover:bg-primary-600">
                        立即投递
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 flex items-center justify-center gap-2">
          {['上一页', '1', '2', '3', '下一页'].map((item, index) => (
            <button
              key={item}
              type="button"
              className={`rounded-lg border px-3 py-2 text-sm ${index === 1 ? 'border-primary-500 bg-primary-500 text-white' : 'border-neutral-300 text-neutral-700 hover:bg-neutral-50'
                }`}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      <SiteFooter />
    </div>
  )
}

export default Hall
