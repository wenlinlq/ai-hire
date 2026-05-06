import ReactECharts from "echarts-for-react";
import { useAdmin } from "./AdminContext";

export default function AdminDashboard() {
  const { users, teams, positions } = useAdmin();

  const activeUsers = users.filter((user) => user.status === "active").length;
  const ongoingPositions = positions.filter((position: any) => {
    const now = new Date();
    const deadline = new Date(position.deadline);
    return deadline > now;
  }).length;
  const totalApplications = ongoingPositions > 0
    ? positions
        .filter((position: any) => {
          const now = new Date();
          const deadline = new Date(position.deadline);
          return deadline > now;
        })
        .reduce((total: number, position: any) => total + (position.applyCount || 0), 0)
    : 0;

  return (
    <section>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-neutral-800">仪表盘</h2>
      </div>

      {/* 核心指标卡片区 */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-6">
        <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-neutral-500">平台总用户数</h3>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-100">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
          </div>
          <p className="text-3xl font-bold text-neutral-800">{users.length}</p>
          <p className="mt-2 text-sm text-neutral-500">注册总人数（分角色统计）</p>
        </div>

        <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-neutral-500">近7日活跃用户</h3>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
          </div>
          <p className="text-3xl font-bold text-neutral-800">{activeUsers}</p>
          <p className="mt-2 text-sm text-neutral-500">有登录/投递行为的用户数</p>
        </div>

        <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-neutral-500">入驻团队总数</h3>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          </div>
          <p className="text-3xl font-bold text-neutral-800">{teams.length}</p>
          <p className="mt-2 text-sm text-neutral-500">已审核通过的团队数量</p>
        </div>

        <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-neutral-500">进行中职位数</h3>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-100">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            </div>
          </div>
          <p className="text-3xl font-bold text-neutral-800">{ongoingPositions}</p>
          <p className="mt-2 text-sm text-neutral-500">全平台开放岗位总数</p>
        </div>

        <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-neutral-500">总投递量</h3>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-yellow-100">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
          <p className="text-3xl font-bold text-neutral-800">{totalApplications}</p>
          <p className="mt-2 text-sm text-neutral-500">累计简历投递次数</p>
        </div>

        <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-neutral-500">待审核团队</h3>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-100">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-.633-1.964-.633-2.732 0L3.34 16c-.77.633.192 3 1.732 3z" />
              </svg>
            </div>
          </div>
          <p className="text-3xl font-bold text-neutral-800">3</p>
          <p className="mt-2 text-sm text-neutral-500">新注册待审批的团队数量</p>
        </div>
      </div>

      {/* 数据趋势图表区 */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-6">
        {/* 平台整体活跃趋势 */}
        <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm lg:col-span-3">
          <h3 className="text-lg font-semibold text-neutral-800 mb-4">平台整体活跃趋势</h3>
          <ReactECharts
            option={{
              tooltip: { trigger: "axis" },
              xAxis: {
                type: "category",
                data: ["第1日", "第2日", "第3日", "第4日", "第5日", "第6日", "第7日"],
              },
              yAxis: { type: "value" },
              series: [
                {
                  data: [68, 74, 81, 76, 88, 92, 86],
                  type: "line",
                  smooth: true,
                  itemStyle: { color: "#3b82f6" },
                  lineStyle: { width: 3 },
                },
              ],
            }}
            style={{ height: "320px" }}
          />
          <p className="mt-4 text-sm text-neutral-500">折线图：全平台用户活跃度趋势（登录/投递行为）</p>
          <p className="text-sm text-neutral-500">作用：判断平台整体运营状况</p>
        </div>

        {/* 各类型团队分布 */}
        <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-neutral-800 mb-4">各类型团队分布</h3>
          <ReactECharts
            option={{
              tooltip: { trigger: "item", formatter: "{a} <br/>{b}: {c} ({d}%)" },
              legend: { orient: "vertical", left: "left", data: ["技术类", "宣传类", "外联类", "其他"] },
              series: [
                {
                  name: "团队分布",
                  type: "pie",
                  radius: ["40%", "70%"],
                  avoidLabelOverlap: false,
                  itemStyle: { borderRadius: 10, borderColor: "#fff", borderWidth: 2 },
                  label: { show: false, position: "center" },
                  emphasis: { label: { show: true, fontSize: 20, fontWeight: "bold" } },
                  labelLine: { show: false },
                  data: [
                    { value: 70, name: "技术类", itemStyle: { color: "#3b82f6" } },
                    { value: 20, name: "宣传类", itemStyle: { color: "#10b981" } },
                    { value: 8, name: "外联类", itemStyle: { color: "#f59e0b" } },
                    { value: 2, name: "其他", itemStyle: { color: "#ef4444" } },
                  ],
                },
              ],
            }}
            style={{ height: "256px" }}
          />
          <p className="mt-4 text-sm text-neutral-500">饼图/柱状图：技术类 / 宣传类 / 外联类 / 其他</p>
          <p className="text-sm text-neutral-500">作用：了解平台入驻团队的构成比例</p>
        </div>

        {/* 投递量趋势 */}
        <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm lg:col-span-2">
          <h3 className="text-lg font-semibold text-neutral-800 mb-4">投递量趋势</h3>
          <ReactECharts
            option={{
              tooltip: { trigger: "axis" },
              xAxis: {
                type: "category",
                data: ["第1日", "第2日", "第3日", "第4日", "第5日", "第6日", "第7日"],
              },
              yAxis: { type: "value" },
              series: [
                {
                  data: [45, 52, 49, 63, 78, 82, 75],
                  type: "line",
                  smooth: true,
                  itemStyle: { color: "#10b981" },
                  lineStyle: { width: 3 },
                  areaStyle: {
                    color: {
                      type: "linear",
                      x: 0, y: 0, x2: 0, y2: 1,
                      colorStops: [
                        { offset: 0, color: "rgba(16, 185, 129, 0.3)" },
                        { offset: 1, color: "rgba(16, 185, 129, 0.05)" },
                      ],
                    },
                  },
                },
              ],
            }}
            style={{ height: "256px" }}
          />
          <p className="mt-4 text-sm text-neutral-500">折线图：全平台每日投递量变化</p>
          <p className="text-sm text-neutral-500">作用：识别招新高峰期，做好系统扩容准备</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 mb-6">
        {/* 待处理事项 */}
        <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-neutral-800">待处理事项</h3>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border border-neutral-100 rounded-lg hover:bg-neutral-50 transition-colors">
              <div className="flex items-center">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-yellow-100">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-neutral-800">待审核团队</p>
                  <p className="text-xs text-neutral-500">新注册待审批的团队</p>
                </div>
              </div>
              <div className="flex items-center">
                <span className="text-lg font-bold text-neutral-800 mr-4">3</span>
                <button className="px-3 py-1 bg-primary-500 text-white rounded-lg text-sm hover:bg-primary-600 transition-colors">处理</button>
              </div>
            </div>
            <div className="flex items-center justify-between p-4 border border-neutral-100 rounded-lg hover:bg-neutral-50 transition-colors">
              <div className="flex items-center">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-.633-1.964-.633-2.732 0L3.34 16c-.77.633.192 3 1.732 3z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-neutral-800">待处理举报</p>
                  <p className="text-xs text-neutral-500">用户提交的举报信息</p>
                </div>
              </div>
              <div className="flex items-center">
                <span className="text-lg font-bold text-neutral-800 mr-4">2</span>
                <button className="px-3 py-1 bg-primary-500 text-white rounded-lg text-sm hover:bg-primary-600 transition-colors">处理</button>
              </div>
            </div>
          </div>
        </div>

        {/* 快捷操作入口 */}
        <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-neutral-800">快捷操作</h3>
          </div>
          <div className="grid gap-4 grid-cols-3">
            <button className="flex flex-col items-center justify-center p-4 border border-neutral-100 rounded-lg hover:bg-neutral-50 transition-colors">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 mb-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <span className="text-sm font-medium text-neutral-800">发布公告</span>
            </button>
            <button className="flex flex-col items-center justify-center p-4 border border-neutral-100 rounded-lg hover:bg-neutral-50 transition-colors">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 mb-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <span className="text-sm font-medium text-neutral-800">导出报表</span>
            </button>
            <button className="flex flex-col items-center justify-center p-4 border border-neutral-100 rounded-lg hover:bg-neutral-50 transition-colors">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-100 mb-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <span className="text-sm font-medium text-neutral-800">清除缓存</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}