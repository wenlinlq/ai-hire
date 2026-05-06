import ReactECharts from "echarts-for-react";
import { useTeam } from "./TeamContext";

export default function TeamDashboard() {
  const { dashboardStats } = useTeam();

  return (
    <section>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-neutral-800">
          团队管理员仪表盘
        </h2>
      </div>

      {/* 核心指标卡片区 */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-6">
        <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-neutral-500">
              本团队职位数
            </h3>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-100">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 text-purple-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                />
              </svg>
            </div>
          </div>
          <p className="text-3xl font-bold text-neutral-800">
            {dashboardStats.activeJobs}/{dashboardStats.closedJobs}
          </p>
          <p className="mt-2 text-sm text-neutral-500">进行中/已结束</p>
        </div>

        <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-neutral-500">
              本团队总投递量
            </h3>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 text-blue-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </div>
          </div>
          <p className="text-3xl font-bold text-neutral-800">
            {dashboardStats.totalApplications}
          </p>
          <p className="mt-2 text-sm text-neutral-500">累计投递次数</p>
        </div>

        <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-neutral-500">
              待筛选简历数
            </h3>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-yellow-100">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 text-yellow-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>
          <p className="text-3xl font-bold text-neutral-800">
            {dashboardStats.pendingResumes}
          </p>
          <p className="mt-2 text-sm text-neutral-500">等待处理</p>
        </div>

        <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-neutral-500">
              待安排面试数
            </h3>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 text-green-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
          </div>
          <p className="text-3xl font-bold text-neutral-800">
            {dashboardStats.pendingInterviews}
          </p>
          <p className="mt-2 text-sm text-neutral-500">需要安排</p>
        </div>

        <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-neutral-500">
              本月新投递数（环比）
            </h3>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-100">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 text-red-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                />
              </svg>
            </div>
          </div>
          <p className="text-3xl font-bold text-neutral-800">
            {dashboardStats.monthlyApplications}
          </p>
          <p
            className={`mt-2 text-sm ${dashboardStats.monthlyGrowth >= 0 ? "text-green-600" : "text-red-600"}`}
          >
            {dashboardStats.monthlyGrowth >= 0 ? "+" : ""}
            {dashboardStats.monthlyGrowth}% 较上月
          </p>
        </div>
      </div>

      {/* 投递趋势图表区 */}
      <div className="grid gap-6 md:grid-cols-2 mb-6">
        <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-neutral-800 mb-4">
            本团队投递量趋势（近30天）
          </h3>
          <ReactECharts
            option={{
              tooltip: { trigger: "axis" },
              legend: {
                data: ["前端", "后端", "产品", "设计"],
              },
              xAxis: {
                type: "category",
                data: [
                  "第1日",
                  "第5日",
                  "第10日",
                  "第15日",
                  "第20日",
                  "第25日",
                  "第30日",
                ],
              },
              yAxis: {
                type: "value",
              },
              series: [
                {
                  name: "前端",
                  type: "line",
                  data: [12, 19, 15, 21, 18, 25, 22],
                  smooth: true,
                  itemStyle: { color: "#3b82f6" },
                },
                {
                  name: "后端",
                  type: "line",
                  data: [8, 15, 12, 18, 14, 20, 17],
                  smooth: true,
                  itemStyle: { color: "#10b981" },
                },
                {
                  name: "产品",
                  type: "line",
                  data: [5, 10, 8, 12, 9, 14, 11],
                  smooth: true,
                  itemStyle: { color: "#f59e0b" },
                },
                {
                  name: "设计",
                  type: "line",
                  data: [3, 7, 5, 9, 6, 11, 8],
                  smooth: true,
                  itemStyle: { color: "#8b5cf6" },
                },
              ],
            }}
            style={{ height: "320px" }}
          />
        </div>

        <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-neutral-800 mb-4">
            各职位投递分布
          </h3>
          <ReactECharts
            option={{
              tooltip: { trigger: "item" },
              legend: {
                orient: "vertical",
                left: "left",
              },
              series: [
                {
                  name: "投递量",
                  type: "pie",
                  radius: "60%",
                  data: [
                    { value: 68, name: "前端" },
                    { value: 52, name: "后端" },
                    { value: 24, name: "产品" },
                    { value: 12, name: "设计" },
                  ],
                  emphasis: {
                    itemStyle: {
                      shadowBlur: 10,
                      shadowOffsetX: 0,
                      shadowColor: "rgba(0, 0, 0, 0.5)",
                    },
                  },
                },
              ],
            }}
            style={{ height: "320px" }}
          />
        </div>
      </div>

      {/* 候选人质量概览区 */}
      <div className="grid gap-6 md:grid-cols-2 mb-6">
        <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-neutral-800 mb-4">
            AI评分分布
          </h3>
          <ReactECharts
            option={{
              tooltip: { trigger: "item" },
              legend: {
                orient: "vertical",
                left: "left",
              },
              series: [
                {
                  name: "评分分布",
                  type: "pie",
                  radius: "60%",
                  data: [
                    { value: 45, name: "高匹配" },
                    { value: 78, name: "中匹配" },
                    { value: 33, name: "低匹配" },
                  ],
                  itemStyle: {
                    color: function (params: any) {
                      const colors = ["#10b981", "#f59e0b", "#ef4444"];
                      return colors[params.dataIndex];
                    },
                  },
                },
              ],
            }}
            style={{ height: "320px" }}
          />
        </div>

        <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-neutral-800 mb-4">
            各状态人数
          </h3>
          <ReactECharts
            option={{
              tooltip: { trigger: "axis" },
              xAxis: {
                type: "category",
                data: ["待筛选", "面试中", "已通过", "已拒绝"],
              },
              yAxis: {
                type: "value",
              },
              series: [
                {
                  name: "人数",
                  type: "bar",
                  data: [42, 36, 18, 60],
                  itemStyle: {
                    color: function (params: any) {
                      const colors = [
                        "#f59e0b",
                        "#3b82f6",
                        "#10b981",
                        "#ef4444",
                      ];
                      return colors[params.dataIndex];
                    },
                  },
                },
              ],
            }}
            style={{ height: "320px" }}
          />
        </div>
      </div>

      {/* 待处理事项区 */}
      <div className="grid gap-6 md:grid-cols-3 mb-6">
        <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-neutral-500">
              待筛选简历
            </h3>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-yellow-100">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 text-yellow-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
            </div>
          </div>
          <div className="flex items-center">
            <span className="text-lg font-bold text-neutral-800 mr-4">
              {dashboardStats.pendingResumes}
            </span>
            <button className="px-3 py-1 bg-primary-500 text-white rounded-lg text-sm hover:bg-primary-600 transition-colors">
              处理
            </button>
          </div>
          <p className="mt-2 text-xs text-neutral-500">
            需要筛选的简历数量
          </p>
        </div>

        <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-neutral-500">
              待安排面试
            </h3>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 text-green-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
          </div>
          <div className="flex items-center">
            <span className="text-lg font-bold text-neutral-800 mr-4">
              {dashboardStats.pendingInterviews}
            </span>
            <button className="px-3 py-1 bg-primary-500 text-white rounded-lg text-sm hover:bg-primary-600 transition-colors">
              安排
            </button>
          </div>
          <p className="mt-2 text-xs text-neutral-500">
            需要安排的面试数量
          </p>
        </div>

        <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-neutral-500">
              待填写面试反馈
            </h3>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 text-blue-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
            </div>
          </div>
          <div className="flex items-center">
            <span className="text-lg font-bold text-neutral-800 mr-4">
              7
            </span>
            <button className="px-3 py-1 bg-primary-500 text-white rounded-lg text-sm hover:bg-primary-600 transition-colors">
              处理
            </button>
          </div>
          <p className="mt-2 text-xs text-neutral-500">
            需要填写的面试反馈数量
          </p>
        </div>
      </div>

      {/* 快捷操作入口 */}
      <div className="grid gap-6 md:grid-cols-3 mb-6">
        <button className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm hover:bg-neutral-50 transition-colors">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-blue-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
          </div>
          <h4 className="text-lg font-semibold text-neutral-800 mb-2">
            发布新职位
          </h4>
          <p className="text-sm text-neutral-500">
            创建新的招聘职位并发布到平台
          </p>
        </button>

        <button className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm hover:bg-neutral-50 transition-colors">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-green-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
          </div>
          <h4 className="text-lg font-semibold text-neutral-800 mb-2">
            导入候选人
          </h4>
          <p className="text-sm text-neutral-500">
            批量导入候选人信息到系统
          </p>
        </button>

        <button className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm hover:bg-neutral-50 transition-colors">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-100 mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-purple-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
              />
            </svg>
          </div>
          <h4 className="text-lg font-semibold text-neutral-800 mb-2">
            创建面试题库
          </h4>
          <p className="text-sm text-neutral-500">
            为不同职位创建专属面试题库
          </p>
        </button>
      </div>
    </section>
  );
}