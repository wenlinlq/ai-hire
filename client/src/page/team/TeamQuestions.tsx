import { useTeam } from "./TeamContext";
import * as questionBankApi from "../../api/questionBankApi";

export default function TeamQuestions() {
  const {
    questionBanks,
    isLoadingQuestionBanks,
    errorQuestionBanks,
    currentQuestionBankId,
    setCurrentQuestionBankId,
    questionBankForm,
    setQuestionBankForm,
    openModal,
    fetchQuestionBanks,
  } = useTeam();

  return (
    <section>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-neutral-800">
          面试题库
        </h2>
        <button
          type="button"
          className="rounded-lg bg-primary-500 px-4 py-2 text-white transition-colors hover:bg-primary-600"
          onClick={() => {
            setCurrentQuestionBankId(null);
            setQuestionBankForm({
              title: "",
              description: "",
              category: "",
              questionCount: 0,
              createdAt: new Date().toISOString().split("T")[0],
              questions: [],
            });
            openModal("questionBank");
          }}
        >
          添加题库
        </button>
      </div>

      <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm">
        <div className="border-b border-neutral-200 p-4">
          <div className="flex items-center space-x-4">
            <input
              type="text"
              placeholder="搜索题库"
              className="flex-1 rounded-lg border border-neutral-300 px-4 py-2 focus:ring-2 focus:ring-primary-500 focus:outline-none"
            />
            <select className="rounded-lg border border-neutral-300 px-4 py-2">
              <option>全部分类</option>
              <option>技术类</option>
              <option>行为类</option>
              <option>专业知识</option>
              <option>项目经验</option>
            </select>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-neutral-50">
              <tr className="text-left text-xs uppercase tracking-wider text-neutral-500">
                {[
                  "题库名称",
                  "描述",
                  "分类",
                  "题目数量",
                  "创建时间",
                  "操作",
                ].map((item) => (
                  <th key={item} className="px-6 py-3">
                    {item}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {isLoadingQuestionBanks ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-10 text-center text-neutral-500"
                  >
                    加载中...
                  </td>
                </tr>
              ) : errorQuestionBanks ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-10 text-center text-red-500"
                  >
                    {errorQuestionBanks}
                  </td>
                </tr>
              ) : questionBanks.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-10 text-center text-neutral-500"
                  >
                    暂无面试题库
                  </td>
                </tr>
              ) : (
                questionBanks.map((bank) => (
                  <tr key={bank._id}>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-neutral-900">
                        {bank.title}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-neutral-500">
                      {bank.type || "无类型"}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-semibold text-blue-800">
                        {bank.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {bank.questions.length}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {
                        new Date(bank.createdAt)
                          .toISOString()
                          .split("T")[0]
                      }
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <button
                        type="button"
                        className="mr-3 text-primary-600 hover:text-primary-900"
                        onClick={() => {
                          setCurrentQuestionBankId(bank._id);
                          setQuestionBankForm({
                            title: bank.title,
                            description: bank.description || "",
                            category: bank.category,
                            questionCount: bank.questions.length,
                            createdAt: new Date(bank.createdAt)
                              .toISOString()
                              .split("T")[0],
                            questions: bank.questions.map(
                              (q, index) => ({
                                id: `q-${index}`,
                                content: q,
                              }),
                            ),
                          });
                          openModal("questionBank");
                        }}
                      >
                        编辑
                      </button>
                      <button
                        type="button"
                        className="text-red-600 hover:text-red-900"
                        onClick={async () => {
                          if (
                            window.confirm("确定要删除这个题库吗？")
                          ) {
                            try {
                              await questionBankApi.deleteQuestionBank(
                                bank._id,
                              );
                              window.message.success("题库删除成功");
                              fetchQuestionBanks();
                            } catch (err: any) {
                              console.error("删除题库错误:", err);
                              window.message.error(
                                err.message || "删除题库失败",
                              );
                            }
                          }
                        }}
                      >
                        删除
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}