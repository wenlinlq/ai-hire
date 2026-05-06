import { useState, useEffect } from "react";
import userApi from "../../api/userApi";
import favoriteApi from "../../api/favoriteApi";
import { deliveryApi } from "../../api/deliveryApi";
import resumeApi from "../../api/resumeApi";
import type { Position } from "../../api/positionApi";

type FavoriteJob = Position & {
  savedAt: string;
};

export default function FavoriteJobs() {
  const [favoriteJobs, setFavoriteJobs] = useState<FavoriteJob[]>([]);
  const [deliveredJobs, setDeliveredJobs] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchFavoriteJobs = async () => {
      const user = userApi.getCurrentUser();
      if (!user) return;

      try {
        setLoading(true);
        const response = await favoriteApi.getFavorites(user._id);
        const jobs = (response.data || []).map((item: any) => ({
          ...item.jobId,
          savedAt: new Date(item.createdAt).toLocaleString("zh-CN"),
        }));
        setFavoriteJobs(jobs);
      } catch (error) {
        console.error("获取收藏岗位失败:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFavoriteJobs();
  }, []);

  const handleDeliverJob = async (jobId: string) => {
    const currentUser = userApi.getCurrentUser();
    if (!currentUser) {
      alert("请先登录");
      return;
    }

    try {
      const resumes = await resumeApi.getStudentResumes();
      if (resumes.length === 0) {
        alert("请先上传简历");
        return;
      }

      const job = favoriteJobs.find((j) => j._id === jobId);
      if (!job) return;

      const resumeId = resumes[0]._id;
      const hasAiPreInterview = job.aiPreInterview || false;

      await deliveryApi.createDelivery({
        userId: currentUser._id,
        jobId: jobId,
        resumeId,
        hasAiPreInterview,
      });

      setDeliveredJobs((current) => ({
        ...current,
        [jobId]: true,
      }));

      alert("投递成功！");
    } catch (error) {
      console.error("投递失败:", error);
      alert("投递失败，请重试");
    }
  };

  const handleBatchDelivery = async () => {
    const currentUser = userApi.getCurrentUser();
    if (!currentUser) {
      alert("请先登录");
      return;
    }

    try {
      const resumes = await resumeApi.getStudentResumes();
      if (resumes.length === 0) {
        alert("请先上传简历");
        return;
      }

      const resumeId = resumes[0]._id;
      const undeliveredJobs = favoriteJobs.filter(
        (job) => !deliveredJobs[job._id],
      );

      if (undeliveredJobs.length === 0) {
        alert("所有收藏岗位都已投递");
        return;
      }

      let successCount = 0;
      for (const job of undeliveredJobs) {
        try {
          const hasAiPreInterview = job.aiPreInterview || false;
          await deliveryApi.createDelivery({
            userId: currentUser._id,
            jobId: job._id,
            resumeId,
            hasAiPreInterview,
          });
          successCount++;
          setDeliveredJobs((current) => ({
            ...current,
            [job._id]: true,
          }));
        } catch (error) {
          console.error(`投递岗位 ${job.title} 失败:`, error);
        }
      }

      if (successCount > 0) {
        alert(`成功投递 ${successCount} 个岗位！`);
      } else {
        alert("投递失败，请重试");
      }
    } catch (error) {
      console.error("批量投递失败:", error);
      alert("投递失败，请重试");
    }
  };

  const handleRemoveFavorite = async (jobId: string) => {
    const currentUser = userApi.getCurrentUser();
    if (!currentUser) return;

    if (!window.confirm("确定要取消收藏吗？")) return;

    try {
      await favoriteApi.removeFavorite(currentUser._id, jobId);
      setFavoriteJobs((current) => current.filter((job) => job._id !== jobId));
      alert("已取消收藏");
    } catch (error) {
      console.error("取消收藏失败:", error);
      alert("取消收藏失败，请重试");
    }
  };

  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-8 shadow-sm h-[calc(100vh-150px)] overflow-y-auto">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-neutral-800">收藏岗位</h2>
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="rounded-lg bg-primary-500 px-6 py-2 text-white transition-colors hover:bg-primary-600"
            onClick={handleBatchDelivery}
          >
            一键投递
          </button>
        </div>
      </div>
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
        </div>
      ) : favoriteJobs.length === 0 ? (
        <div className="text-center py-12">
          <svg
            className="mx-auto h-16 w-16 text-neutral-300"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
            />
          </svg>
          <p className="mt-4 text-lg text-neutral-500">暂无收藏岗位</p>
          <p className="mt-2 text-sm text-neutral-400">去招新大厅浏览职位吧</p>
        </div>
      ) : (
        <div className="space-y-4">
          {favoriteJobs.map((job) => (
            <div
              key={job._id}
              className="rounded-xl border border-neutral-200 p-6 transition-shadow hover:shadow-md"
            >
              <div className="mb-4 flex items-start justify-between">
                <div>
                  <h3 className="mb-2 text-xl font-bold text-neutral-800">
                    {job.title}
                  </h3>
                  <p className="text-neutral-600">{job.department}</p>
                </div>
                <span className="text-lg font-bold text-primary-600">
                  {job.interviewType === "online" ? "线上面试" : "线下面试"}
                </span>
              </div>
              <div className="mb-4 flex flex-wrap gap-2">
                {job.requirements?.skills?.map((skill) => (
                  <span
                    key={skill}
                    className="rounded-full bg-neutral-100 px-3 py-1 text-sm text-neutral-600"
                  >
                    {skill}
                  </span>
                ))}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-neutral-500">
                  收藏时间：{job.savedAt}
                </span>
                <div className="flex gap-2">
                  {deliveredJobs[job._id] ? (
                    <span className="rounded-lg bg-green-100 px-4 py-2 text-sm text-green-700">
                      已投递
                    </span>
                  ) : (
                    <button
                      type="button"
                      className="rounded-lg bg-primary-500 px-4 py-2 text-sm text-white transition-colors hover:bg-primary-600"
                      onClick={() => handleDeliverJob(job._id)}
                    >
                      投递
                    </button>
                  )}
                  <button
                    type="button"
                    className="rounded-lg border border-neutral-200 px-4 py-2 text-sm text-neutral-600 transition-colors hover:bg-neutral-50"
                    onClick={() => handleRemoveFavorite(job._id)}
                  >
                    取消收藏
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}