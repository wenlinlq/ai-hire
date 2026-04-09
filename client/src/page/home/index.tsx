import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { SiteFooter, SiteNav } from "../../components/site";
import positionApi from "../../api/positionApi";
import teamApi from "../../api/teamApi";
import favoriteApi from "../../api/favoriteApi";
import userApi from "../../api/userApi";

const slides = [
  {
    title: "AI驱动的智能招聘平台",
    description: "让人才与机会精准匹配，开启职业新篇章",
    buttonLabel: "立即体验",
    image:
      "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1200&h=500&fit=crop",
    alt: "团队协作",
    overlayClass: "bg-gradient-to-r from-primary-700/90 to-primary-600/80",
    descriptionClass: "text-primary-100",
    buttonClass: "bg-primary-500 hover:bg-primary-600",
  },
  {
    title: "智能简历解析",
    description: "AI深度分析，挖掘你的核心竞争力",
    buttonLabel: "上传简历",
    image:
      "https://images.unsplash.com/photo-1552664730-d307ca884978?w=1200&h=500&fit=crop",
    alt: "AI技术",
    overlayClass: "bg-gradient-to-r from-primary-600/90 to-primary-500/80",
    descriptionClass: "text-primary-100",
    buttonClass: "bg-primary-500 hover:bg-primary-600",
  },
  {
    title: "AI模拟面试",
    description: "真实场景演练，提升面试成功率",
    buttonLabel: "开始练习",
    image:
      "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=1200&h=500&fit=crop",
    alt: "面试场景",
    overlayClass: "bg-gradient-to-r from-neutral-700/90 to-neutral-600/80",
    descriptionClass: "text-neutral-200",
    buttonClass: "bg-primary-500 hover:bg-primary-600",
  },
] as const;

const features = [
  {
    title: "AI简历解析",
    description:
      "智能分析简历内容，提取关键信息，生成人才画像，帮助HR快速筛选合适候选人",
    cardClass: "bg-primary-50",
    iconClass: "bg-primary-500",
    linkClass: "text-primary-600 hover:text-primary-700",
    path: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
  },
  {
    title: "AI模拟面试",
    description:
      "基于真实面试场景的AI对话系统，提供即时反馈和改进建议，助你从容应对真实面试",
    cardClass: "bg-primary-50",
    iconClass: "bg-primary-500",
    linkClass: "text-primary-600 hover:text-primary-700",
    path: "M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z",
  },
  {
    title: "简历优化",
    description:
      "AI智能诊断简历问题，提供个性化优化建议，让你的简历脱颖而出，提高面试邀约率",
    cardClass: "bg-neutral-100",
    iconClass: "bg-neutral-600",
    linkClass: "text-neutral-600 hover:text-neutral-700",
    path: "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z",
  },
] as const;

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

const stats = [
  {
    title: "招募团队",
    target: 126,
    delta: "+12% 较上月",
    iconClass: "bg-primary-500",
    path: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0z",
  },
  {
    title: "开放职位",
    target: 508,
    delta: "+28% 较上月",
    iconClass: "bg-primary-400",
    path: "M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z",
  },
  {
    title: "已投递人数",
    target: 51860,
    delta: "+35% 较上月",
    iconClass: "bg-white/20",
    path: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
  },
] as const;

function useCountUp(target: number, duration = 2000) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let frameId = 0;
    let startTime: number | undefined;

    const tick = (timestamp: number) => {
      if (startTime === undefined) {
        startTime = timestamp;
      }

      const progress = Math.min((timestamp - startTime) / duration, 1);
      setCount(Math.floor(target * progress));

      if (progress < 1) {
        frameId = window.requestAnimationFrame(tick);
      }
    };

    frameId = window.requestAnimationFrame(tick);

    return () => window.cancelAnimationFrame(frameId);
  }, [duration, target]);

  return count.toLocaleString();
}

function ArrowRightIcon({
  className = "ml-2 h-4 w-4",
}: {
  className?: string;
}) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M9 5l7 7-7 7"
      />
    </svg>
  );
}

function ChevronLeftIcon() {
  return (
    <svg
      className="h-6 w-6 text-white"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M15 19l-7-7 7-7"
      />
    </svg>
  );
}

function ChevronRightIcon() {
  return (
    <svg
      className="h-6 w-6 text-white"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M9 5l7 7-7 7"
      />
    </svg>
  );
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

function Home() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [favoriteJobs, setFavoriteJobs] = useState<Record<string, boolean>>({});
  const teamCount = useCountUp(126);
  const jobCount = useCountUp(508);
  const applyCount = useCountUp(51860);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setCurrentSlide((previousSlide) => (previousSlide + 1) % slides.length);
    }, 5000);

    return () => window.clearInterval(intervalId);
  }, []);

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

        // 为每个职位添加团队名称，并获取前6个职位作为热门职位
        const jobsWithTeamName = response
          .map((job) => ({
            ...job,
            teamName:
              teams.find((team) => team._id === job.teamId)?.name || "未知团队",
          }))
          .slice(0, 6);

        // 初始化收藏状态
        const initialFavorites: Record<string, boolean> = {};
        jobsWithTeamName.forEach((job) => {
          initialFavorites[job._id] = false;
        });

        // 获取用户收藏状态
        const currentUser = userApi.getCurrentUser();
        if (currentUser) {
          try {
            const favoriteIds = await favoriteApi.getUserFavorites(
              currentUser._id,
            );
            favoriteIds.forEach((id) => {
              initialFavorites[id] = true;
            });
          } catch (error) {
            console.error("获取收藏状态失败:", error);
          }
        }

        setJobs(jobsWithTeamName);
        setFavoriteJobs(initialFavorites);
      } catch (error) {
        console.error("获取职位数据失败:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  const statValues = [teamCount, jobCount, applyCount];

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-700">
      <SiteNav current="home" />

      <section className="relative mt-8 h-[400px] overflow-hidden">
        <div className="mx-auto h-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="relative h-full overflow-hidden rounded-2xl">
            {slides.map((slide, index) => {
              const isActive = currentSlide === index;

              return (
                <div
                  key={slide.title}
                  className={`absolute inset-0 transition-opacity duration-500 ${isActive ? "opacity-100" : "opacity-0"}`}
                >
                  <div className={`absolute inset-0 ${slide.overlayClass}`} />
                  <img
                    src={slide.image}
                    alt={slide.alt}
                    className="h-full w-full object-cover"
                  />

                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="px-4 text-center text-white">
                      <h1
                        className={`mb-4 text-4xl font-bold md:text-5xl ${isActive ? "animate-fade-in-up" : ""}`}
                      >
                        {slide.title}
                      </h1>
                      <p
                        className={`mb-8 text-lg md:text-xl ${slide.descriptionClass} ${isActive ? "animate-fade-in-up" : ""}`}
                        style={{ animationDelay: "0.2s" }}
                      >
                        {slide.description}
                      </p>
                      <button
                        type="button"
                        className={`rounded-lg px-8 py-3 text-lg font-semibold transition-colors ${slide.buttonClass} ${isActive ? "animate-fade-in-up" : ""}`}
                        style={{ animationDelay: "0.4s" }}
                      >
                        {slide.buttonLabel}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}

            <button
              type="button"
              aria-label="上一张"
              className="absolute top-1/2 left-4 z-20 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm transition-all hover:bg-white/40"
              onClick={() =>
                setCurrentSlide(
                  (previousSlide) =>
                    (previousSlide - 1 + slides.length) % slides.length,
                )
              }
            >
              <ChevronLeftIcon />
            </button>

            <button
              type="button"
              aria-label="下一张"
              className="absolute top-1/2 right-4 z-20 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm transition-all hover:bg-white/40"
              onClick={() =>
                setCurrentSlide(
                  (previousSlide) => (previousSlide + 1) % slides.length,
                )
              }
            >
              <ChevronRightIcon />
            </button>
          </div>

          <div className="absolute bottom-8 left-1/2 z-10 flex -translate-x-1/2 space-x-4">
            {slides.map((slide, index) => (
              <button
                key={slide.title}
                type="button"
                aria-label={`切换到第${index + 1}张`}
                aria-current={currentSlide === index}
                className={`h-4 w-4 cursor-pointer rounded-full transition-all hover:scale-125 ${
                  currentSlide === index
                    ? "bg-white"
                    : "bg-white/50 hover:bg-white"
                }`}
                onClick={() => setCurrentSlide(index)}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-bold text-neutral-800">
              AI增强功能
            </h2>
            <p className="text-lg text-neutral-600">
              利用人工智能技术，让求职更高效、更智能
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {features.map((feature) => (
              <div
                key={feature.title}
                className={`group rounded-2xl p-8 transition-shadow hover:shadow-xl ${feature.cardClass}`}
              >
                <div
                  className={`mb-6 flex h-16 w-16 items-center justify-center rounded-xl text-white transition-transform group-hover:scale-110 ${feature.iconClass}`}
                >
                  <svg
                    className="h-8 w-8"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d={feature.path}
                    />
                  </svg>
                </div>
                <h3 className="mb-3 text-xl font-bold text-neutral-800">
                  {feature.title}
                </h3>
                <p className="mb-6 text-neutral-600">{feature.description}</p>
                <Link
                  to={feature.title === "AI模拟面试" ? "/interview" : "/login"}
                  className={`inline-flex items-center font-semibold ${feature.linkClass}`}
                >
                  了解更多
                  <ArrowRightIcon />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-neutral-50 pb-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 flex items-end justify-between">
            <div>
              <h2 className="mb-4 text-3xl font-bold text-neutral-800">
                热门职位
              </h2>
              <p className="text-lg text-neutral-600">
                精选优质岗位，助你快速找到心仪工作
              </p>
            </div>
            <Link
              to="/hall"
              className="hidden items-center font-semibold text-primary-600 hover:text-primary-700 md:inline-flex"
            >
              查看全部
              <ArrowRightIcon />
            </Link>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {loading ? (
              <div className="col-span-3 flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
              </div>
            ) : jobs.length === 0 ? (
              <div className="col-span-3 text-center py-12">
                <p className="text-neutral-500">暂无职位</p>
              </div>
            ) : (
              jobs.map((job) => (
                <div
                  key={job._id}
                  className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-lg"
                >
                  <div className="mb-4 flex items-start justify-between">
                    <button
                      type="button"
                      aria-label={
                        favoriteJobs[job._id]
                          ? `取消收藏${job.title}`
                          : `收藏${job.title}`
                      }
                      className="flex h-12 w-12 items-center justify-center rounded-full bg-neutral-100 transition-colors hover:bg-primary-50"
                      onClick={async () => {
                        const currentUser = userApi.getCurrentUser();
                        if (!currentUser) {
                          alert("请先登录");
                          return;
                        }

                        try {
                          if (favoriteJobs[job._id]) {
                            // 取消收藏
                            await favoriteApi.removeFavorite(
                              currentUser._id,
                              job._id,
                            );
                            setFavoriteJobs((current) => ({
                              ...current,
                              [job._id]: false,
                            }));
                          } else {
                            // 添加收藏
                            await favoriteApi.addFavorite(
                              currentUser._id,
                              job._id,
                            );
                            setFavoriteJobs((current) => ({
                              ...current,
                              [job._id]: true,
                            }));
                          }
                        } catch (error) {
                          console.error("操作收藏失败:", error);
                          alert("操作收藏失败，请重试");
                        }
                      }}
                    >
                      <FavoriteIcon filled={favoriteJobs[job._id] || false} />
                    </button>
                    <span className="rounded-full px-3 py-1 text-sm bg-primary-100 text-primary-600">
                      热招
                    </span>
                  </div>
                  <h3 className="mb-2 text-lg font-bold text-neutral-800">
                    {job.title}
                  </h3>
                  <p className="mb-4 text-sm text-neutral-500">
                    {job.teamName} · {job.department}
                  </p>
                  <div className="mb-4 flex flex-wrap gap-2">
                    {job.requirements.skills.map((skill) => (
                      <span
                        key={skill}
                        className="rounded bg-neutral-100 px-2 py-1 text-xs text-neutral-600"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-primary-600">
                      {job.interviewType === "online" ? "线上面试" : "线下面试"}
                    </span>
                    <button
                      type="button"
                      className="rounded-lg bg-primary-500 px-4 py-2 text-sm text-white transition-colors hover:bg-primary-600"
                    >
                      立即投递
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="mt-8 text-center md:hidden">
            <Link
              to="/hall"
              className="inline-flex items-center font-semibold text-primary-600 hover:text-primary-700"
            >
              查看全部职位
              <ArrowRightIcon />
            </Link>
          </div>
        </div>
      </section>

      <section className="py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-lg bg-primary-700 p-6">
            <div className="mb-6 text-center">
              <h2 className="mb-2 text-xl font-bold text-white">
                招新数据看板
              </h2>
              <p className="text-sm text-primary-200">
                实时数据展示，洞察招聘动态
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {stats.map((stat, index) => (
                <div
                  key={stat.title}
                  className="rounded-lg border border-white/20 bg-white/10 p-4 text-center backdrop-blur-sm"
                >
                  <div
                    className={`mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full ${stat.iconClass}`}
                  >
                    <svg
                      className="h-6 w-6 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d={stat.path}
                      />
                    </svg>
                  </div>
                  <div className="mb-1 text-3xl font-bold text-white">
                    {statValues[index]}
                  </div>
                  <div className="text-sm text-primary-200">{stat.title}</div>
                  <div className="mt-2 text-xs text-primary-300">
                    {stat.delta}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}

export default Home;
