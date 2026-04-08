import { useState, useEffect } from "react";
import { SiteFooter, SiteNav } from "../../components/site";
import positionApi from "../../api/positionApi";
import teamApi from "../../api/teamApi";

const hotKeywords = [
  "前端开发",
  "Java工程师",
  "产品经理",
  "UI设计师",
  "算法工程师",
  "数据分析师",
];
const experienceFilters = [
  "不限",
  "应届生",
  "1-3年",
  "3-5年",
  "5-10年",
  "10年以上",
];
const educationFilters = ["不限", "大专", "本科", "硕士", "博士"];

interface Job {
  _id: string;
  title: string;
  type: string;
  department: string;
  quota: number;
  salary: string;
  interviewType: string;
  requirements: {
    skills: string[];
    experience: string;
    education: string;
    description: string;
  };
  responsibilities: string[];
  benefits: string[];
  status: string;
  deadline: string;
  viewCount: number;
  applyCount: number;
  createdBy: string;
  teamId: string;
  teamName?: string;
  createdAt: string;
  updatedAt: string;
}

function FavoriteIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      className={`h-5 w-5 ${filled ? "fill-primary-500 text-primary-500" : "fill-none text-neutral-400"}`}
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
  );
}

function Hall() {
  const [keyword, setKeyword] = useState("");
  const [city, setCity] = useState("全部城市");
  const [jobType, setJobType] = useState("全部类型");
  const [salary, setSalary] = useState("全部薪资");
  const [experience, setExperience] = useState("不限");
  const [education, setEducation] = useState("不限");
  const [sort, setSort] = useState("推荐排序");
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [favoriteJobs, setFavoriteJobs] = useState<Record<string, boolean>>({});

  // 加载职位数据
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true);
        console.log("开始获取职位数据");
        const response = await positionApi.getPositions();
        console.log("获取职位数据成功:", response);

        // 获取所有团队数据
        const teams = await teamApi.getTeams();
        console.log("获取团队数据成功:", teams);

        // 为每个职位添加团队名称
        const jobsWithTeamName = response.map((job) => ({
          ...job,
          teamName:
            teams.find((team) => team._id === job.teamId)?.name || "未知团队",
        }));

        setJobs(jobsWithTeamName);
        // 初始化收藏状态
        const initialFavorites: Record<string, boolean> = {};
        jobsWithTeamName.forEach((job) => {
          initialFavorites[job._id] = false;
        });
        setFavoriteJobs(initialFavorites);
      } catch (error) {
        console.error("获取职位数据失败:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  const filteredJobs = jobs.filter((job) => {
    const keywordMatched =
      keyword.trim() === "" ||
      `${job.title}${job.department}${job.requirements.skills.join("")}${job.requirements.description}`.includes(
        keyword.trim(),
      );
    // 简化城市匹配，因为API返回的数据中没有城市信息
    const cityMatched = city === "全部城市";
    return keywordMatched && cityMatched;
  });

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-700">
      <SiteNav current="hall" />

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 rounded-2xl bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row">
            <div className="flex-1">
              <label className="mb-2 block text-sm font-medium text-neutral-600">
                关键词
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={keyword}
                  onChange={(event) => setKeyword(event.target.value)}
                  placeholder="搜索职位、公司、技能"
                  className="w-full rounded-lg border border-neutral-200 py-3 pr-4 pl-10 focus:border-transparent focus:ring-2 focus:ring-primary-500 focus:outline-none"
                />
                <svg
                  className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-neutral-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
            </div>

            {[
              [
                "工作地点",
                city,
                setCity,
                ["全部城市", "北京", "上海", "广州", "深圳", "杭州", "成都"],
              ],
              [
                "职位类型",
                jobType,
                setJobType,
                ["全部类型", "全职", "兼职", "实习", "远程"],
              ],
              [
                "薪资范围",
                salary,
                setSalary,
                [
                  "全部薪资",
                  "10k以下",
                  "10k-20k",
                  "20k-30k",
                  "30k-50k",
                  "50k以上",
                ],
              ],
            ].map(([label, value, setter, options]) => (
              <div key={label as string} className="md:w-48">
                <label className="mb-2 block text-sm font-medium text-neutral-600">
                  {label as string}
                </label>
                <select
                  value={value as string}
                  onChange={(event) =>
                    (setter as (value: string) => void)(event.target.value)
                  }
                  className="w-full rounded-lg border border-neutral-200 bg-white px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-primary-500 focus:outline-none"
                >
                  {(options as string[]).map((item) => (
                    <option key={item}>{item}</option>
                  ))}
                </select>
              </div>
            ))}

            <div className="flex items-end md:w-32">
              <button
                type="button"
                className="w-full rounded-lg bg-primary-500 px-6 py-3 font-semibold text-white transition-colors hover:bg-primary-600"
              >
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
            {[
              ["工作经验：", experience, setExperience, experienceFilters],
              ["学历要求：", education, setEducation, educationFilters],
            ].map(([label, value, setter, options]) => (
              <div
                key={label as string}
                className="flex flex-wrap items-center gap-2"
              >
                <span className="text-sm font-medium text-neutral-600">
                  {label as string}
                </span>
                {(options as string[]).map((item) => (
                  <button
                    key={item}
                    type="button"
                    className={`rounded-full px-3 py-1 text-sm transition-colors ${
                      value === item
                        ? "bg-primary-500 text-white"
                        : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
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
              共找到{" "}
              <span className="font-semibold text-primary-600">
                {filteredJobs.length.toLocaleString()}
              </span>{" "}
              个职位
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-neutral-600">排序：</span>
            <select
              value={sort}
              onChange={(event) => setSort(event.target.value)}
              className="rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none"
            >
              {["推荐排序", "最新发布", "薪资从高到低", "薪资从低到高"].map(
                (item) => (
                  <option key={item}>{item}</option>
                ),
              )}
            </select>
          </div>
        </div>

        <div className="space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
            </div>
          ) : filteredJobs.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-neutral-500">暂无职位</p>
            </div>
          ) : (
            filteredJobs.map((job) => (
              <div
                key={job._id}
                className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-start">
                  <button
                    type="button"
                    aria-label={
                      favoriteJobs[job._id]
                        ? `取消收藏${job.title}`
                        : `收藏${job.title}`
                    }
                    className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full bg-neutral-100 transition-colors hover:bg-primary-50"
                    onClick={() =>
                      setFavoriteJobs((current) => ({
                        ...current,
                        [job._id]: !current[job._id],
                      }))
                    }
                  >
                    <FavoriteIcon filled={favoriteJobs[job._id] || false} />
                  </button>

                  <div className="flex-1">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <h3 className="cursor-pointer text-lg font-bold text-neutral-800 hover:text-primary-600">
                          {job.title}
                        </h3>
                        <p className="mt-1 text-sm text-neutral-500">
                          {job.teamName} · {job.department}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-primary-600">
                          {job.interviewType === "online"
                            ? "线上面试"
                            : "线下面试"}
                        </div>
                        <div className="mt-1 text-xs text-neutral-400">
                          招聘 {job.quota} 人
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-2">
                      {job.requirements.skills.map((skill) => (
                        <span
                          key={skill}
                          className="rounded bg-primary-50 px-2 py-1 text-xs text-primary-600"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>

                    <p className="mt-3 text-sm text-neutral-600">
                      {job.requirements.description}
                    </p>

                    <div className="mt-4 flex items-center justify-between">
                      <div className="flex items-center gap-4 text-sm text-neutral-500">
                        <span>
                          {new Date(job.createdAt).toLocaleDateString()}
                        </span>
                        <span>已投递 {job.applyCount}</span>
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          className={`rounded-lg border px-4 py-2 text-sm transition-colors ${
                            favoriteJobs[job._id]
                              ? "border-primary-500 bg-primary-50 text-primary-600"
                              : "border-primary-500 text-primary-600 hover:bg-primary-50"
                          }`}
                          onClick={() =>
                            setFavoriteJobs((current) => ({
                              ...current,
                              [job._id]: !current[job._id],
                            }))
                          }
                        >
                          {favoriteJobs[job._id] ? "已收藏" : "收藏"}
                        </button>
                        <button
                          type="button"
                          className="rounded-lg bg-primary-500 px-4 py-2 text-sm text-white transition-colors hover:bg-primary-600"
                        >
                          立即投递
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="mt-8 flex items-center justify-center gap-2">
          {["上一页", "1", "2", "3", "下一页"].map((item, index) => (
            <button
              key={item}
              type="button"
              className={`rounded-lg border px-3 py-2 text-sm ${
                index === 1
                  ? "border-primary-500 bg-primary-500 text-white"
                  : "border-neutral-300 text-neutral-700 hover:bg-neutral-50"
              }`}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      <SiteFooter />
    </div>
  );
}

export default Hall;
