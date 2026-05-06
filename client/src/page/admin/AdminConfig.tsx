export default function AdminConfig() {
  return (
    <section>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-neutral-800">系统配置</h2>
        <button type="button" className="rounded-lg bg-primary-500 px-4 py-2 text-white transition-colors hover:bg-primary-600">
          保存配置
        </button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-lg font-semibold text-neutral-800">基本设置</h3>
          <div className="space-y-4">
            <input className="w-full rounded-lg border border-neutral-300 px-4 py-2" defaultValue="AI招聘平台" />
            <input className="w-full rounded-lg border border-neutral-300 px-4 py-2" defaultValue="contact@aihire.com" />
            <select className="w-full rounded-lg border border-neutral-300 px-4 py-2">
              <option>简体中文</option>
              <option>English</option>
            </select>
            <select className="w-full rounded-lg border border-neutral-300 px-4 py-2">
              <option>Asia/Shanghai (UTC+8)</option>
              <option>America/New_York (UTC-5)</option>
              <option>Europe/London (UTC+0)</option>
            </select>
          </div>
        </div>

        <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-lg font-semibold text-neutral-800">安全设置</h3>
          <div className="space-y-4">
            <label className="flex items-center justify-between">
              <span className="text-sm font-medium text-neutral-700">启用两步验证</span>
              <input type="checkbox" defaultChecked className="h-4 w-4 accent-primary-500" />
            </label>
            <label className="flex items-center justify-between">
              <span className="text-sm font-medium text-neutral-700">密码复杂度要求</span>
              <input type="checkbox" defaultChecked className="h-4 w-4 accent-primary-500" />
            </label>
            <input className="w-full rounded-lg border border-neutral-300 px-4 py-2" defaultValue="90" />
            <input className="w-full rounded-lg border border-neutral-300 px-4 py-2" defaultValue="5" />
          </div>
        </div>
      </div>
    </section>
  );
}