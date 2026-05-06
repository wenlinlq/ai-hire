export default function EmptyTeamNotice() {
  return (
    <section className="flex flex-col items-center justify-center py-20">
      <div className="w-16 h-16 rounded-full bg-yellow-100 flex items-center justify-center mb-4">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-8 w-8 text-yellow-600"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </div>
      <h3 className="text-xl font-semibold text-neutral-800 mb-2">
        您暂未加入任何团队
      </h3>
      <p className="text-neutral-600 text-center max-w-md">
        请联系超级管理员为您设置所属团队，设置完成后即可使用团队管理功能。
      </p>
    </section>
  );
}