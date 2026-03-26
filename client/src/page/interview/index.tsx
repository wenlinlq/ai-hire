import { FormEvent, useEffect, useRef, useState } from 'react'
import { SiteFooter, SiteNav } from '../../components/site'

type InterviewType = 'tech' | 'product' | 'general'
type Message = {
  sender: 'ai' | 'user'
  content: string
}

const typeConfig: Record<InterviewType, { label: string; desc: string; color: string; button: string }> = {
  tech: { label: '技术面试', desc: '适合程序员、工程师等技术岗位', color: 'bg-primary-500', button: 'bg-primary-500 hover:bg-primary-600' },
  product: { label: '产品面试', desc: '适合产品经理、产品运营等岗位', color: 'bg-accent-500', button: 'bg-accent-500 hover:bg-accent-600' },
  general: { label: '综合面试', desc: '适合大多数通用岗位面试', color: 'bg-neutral-600', button: 'bg-neutral-600 hover:bg-neutral-700' },
}

const initialMessages: Message[] = [
  { sender: 'ai', content: '你好！我是你的AI面试助手。今天我们将进行一场模拟面试，帮助你准备真实的面试场景。' },
  { sender: 'ai', content: '请告诉我你的姓名，然后我们就可以开始了。' },
]

const feedbackSections = {
  strengths: ['对技术概念有清晰的理解', '回答问题逻辑清晰', '能够提供具体的项目经验'],
  improvements: ['可以更详细地解释技术实现细节', '回答问题时可以更有条理，使用 STAR 法则', '需要提高对压力问题的应对能力'],
}

function getAIResponse(type: InterviewType, message: string) {
  const lower = message.toLowerCase()
  if (lower.includes('张') || lower.includes('我叫')) {
    return '好的，我们正式开始。请你先做一个 1 分钟左右的自我介绍，重点讲讲和目标岗位相关的经历。'
  }
  if (type === 'tech') {
    return '请讲讲你最近负责的一个前端或后端项目，你在其中承担了什么职责？遇到过最有挑战的技术问题是什么？'
  }
  if (type === 'product') {
    return '请分享一个你从 0 到 1 推动上线的产品功能，你是如何验证需求并衡量结果的？'
  }
  return '你认为自己最适合这个岗位的三个原因是什么？如果加入团队，你希望在前 90 天完成什么？'
}

function Interview() {
  const [selectedType, setSelectedType] = useState<InterviewType>('tech')
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [messageInput, setMessageInput] = useState('')
  const [started, setStarted] = useState(false)
  const [paused, setPaused] = useState(false)
  const [ended, setEnded] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const chatRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    chatRef.current?.scrollTo({ top: chatRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, isTyping])

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const content = messageInput.trim()
    if (!content || paused || ended || !started) {
      return
    }

    setMessages((current) => [...current, { sender: 'user', content }])
    setMessageInput('')
    setIsTyping(true)

    window.setTimeout(() => {
      setIsTyping(false)
      setMessages((current) => [...current, { sender: 'ai', content: getAIResponse(selectedType, content) }])
    }, 1200)
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <SiteNav current="interview" />

      <main className="py-12">
        <section className="bg-gradient-to-r from-accent-600 to-accent-500 py-16 text-white">
          <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
            <h1 className="animate-fade-in-up mb-4 text-4xl font-bold">AI模拟面试</h1>
            <p className="animate-fade-in-up mb-8 text-xl text-accent-100" style={{ animationDelay: '0.2s' }}>
              基于真实面试场景的AI对话系统，提供即时反馈和改进建议
            </p>
            <button
              type="button"
              className="animate-fade-in-up rounded-lg bg-primary-500 px-8 py-3 text-lg font-semibold text-white transition-colors hover:bg-primary-600"
              style={{ animationDelay: '0.4s' }}
              onClick={() => {
                setStarted(true)
                setEnded(false)
                setPaused(false)
              }}
            >
              开始模拟面试
            </button>
          </div>
        </section>

        <section className="bg-white py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-12 text-center">
              <h2 className="mb-4 text-3xl font-bold text-neutral-800">选择面试类型</h2>
              <p className="text-lg text-neutral-600">根据你的目标职位选择相应的面试类型</p>
            </div>

            <div className="grid gap-8 md:grid-cols-3">
              {(Object.keys(typeConfig) as InterviewType[]).map((type) => {
                const item = typeConfig[type]
                return (
                  <div key={type} className={`rounded-xl border border-neutral-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-lg ${selectedType === type ? 'ring-2 ring-accent-500 ring-offset-2' : ''}`}>
                    <div className={`mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-xl ${item.color}`}>
                      <span className="text-lg font-bold text-white">{item.label.slice(0, 2)}</span>
                    </div>
                    <h3 className="mb-3 text-center text-xl font-bold text-neutral-800">{item.label}</h3>
                    <p className="mb-4 text-center text-neutral-600">{item.desc}</p>
                    <div className="text-center">
                      <button type="button" className={`rounded-lg px-4 py-2 text-sm text-white transition-colors ${item.button}`} onClick={() => setSelectedType(type)}>
                        选择
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {started && (
          <section className="bg-neutral-50 py-16">
            <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
              <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
                <div className="bg-accent-500 p-6 text-white">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold">AI模拟面试</h2>
                    <div className="rounded-full bg-white/20 px-3 py-1 text-sm">{ended ? '已结束' : paused ? '已暂停' : '进行中'}</div>
                  </div>
                  <p className="mt-2 text-accent-100">{typeConfig[selectedType].label}</p>
                </div>

                <div ref={chatRef} className="h-[500px] space-y-6 overflow-y-auto p-6">
                  {messages.map((message, index) => (
                    <div key={`${message.sender}-${index}`} className={`flex items-start ${message.sender === 'user' ? 'justify-end' : ''}`}>
                      {message.sender === 'ai' && <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-accent-500 text-white">AI</div>}
                      <div className={`max-w-[80%] rounded-lg p-4 ${message.sender === 'ai' ? 'ml-3 bg-accent-100 text-neutral-800' : 'bg-primary-100 text-neutral-800'}`}>
                        <p>{message.content}</p>
                      </div>
                    </div>
                  ))}

                  {isTyping && (
                    <div className="flex items-start">
                      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-accent-500 text-white">AI</div>
                      <div className="ml-3 rounded-lg bg-accent-100 p-4">
                        <div className="flex items-center gap-1">
                          <span className="h-2 w-2 rounded-full bg-primary-500" />
                          <span className="h-2 w-2 rounded-full bg-primary-500" />
                          <span className="h-2 w-2 rounded-full bg-primary-500" />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="border-t border-neutral-200 p-4">
                  <form className="flex" onSubmit={handleSubmit}>
                    <input
                      type="text"
                      value={messageInput}
                      onChange={(event) => setMessageInput(event.target.value)}
                      placeholder="输入你的回答..."
                      className="flex-1 rounded-l-lg border border-neutral-300 px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-accent-500 focus:outline-none"
                    />
                    <button type="submit" className="rounded-r-lg bg-accent-500 px-6 py-3 text-white transition-colors hover:bg-accent-600">
                      发送
                    </button>
                  </form>
                </div>
              </div>

              <div className="mt-8 flex justify-center space-x-4">
                <button type="button" className="rounded-lg bg-neutral-200 px-6 py-2 text-neutral-700 transition-colors hover:bg-neutral-300" onClick={() => setPaused((current) => !current)}>
                  {paused ? '继续' : '暂停'}
                </button>
                <button type="button" className="rounded-lg bg-primary-500 px-6 py-2 text-white transition-colors hover:bg-primary-600" onClick={() => { setEnded(true); setPaused(false) }}>
                  结束面试
                </button>
              </div>
            </div>
          </section>
        )}

        {(started || ended) && (
          <section className="bg-white py-16">
            <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
              <div className="mb-12 text-center">
                <h2 className="mb-4 text-3xl font-bold text-neutral-800">面试反馈</h2>
                <p className="text-lg text-neutral-600">基于你的表现，我们为你提供以下反馈和建议</p>
              </div>

              <div className="rounded-2xl border border-neutral-200 bg-white p-8 shadow-sm">
                <div className="mb-8 grid gap-6 md:grid-cols-4">
                  {[
                    ['整体评分', '85', 'bg-primary-50 text-primary-600'],
                    ['专业知识', '90', 'bg-accent-50 text-accent-600'],
                    ['表达能力', '80', 'bg-neutral-100 text-neutral-600'],
                    ['应变能力', '85', 'bg-blue-50 text-blue-600'],
                  ].map(([label, value, classes]) => (
                    <div key={label} className={`rounded-xl p-4 text-center ${classes}`}>
                      <div className="mb-2 text-3xl font-bold">{value}</div>
                      <div className="text-sm text-neutral-600">{label}</div>
                    </div>
                  ))}
                </div>

                <div className="space-y-6">
                  <div>
                    <h3 className="mb-3 text-xl font-bold text-neutral-800">优势</h3>
                    <ul className="space-y-2">{feedbackSections.strengths.map((item) => <li key={item} className="text-neutral-600">{item}</li>)}</ul>
                  </div>

                  <div>
                    <h3 className="mb-3 text-xl font-bold text-neutral-800">改进建议</h3>
                    <ul className="space-y-2">{feedbackSections.improvements.map((item) => <li key={item} className="text-neutral-600">{item}</li>)}</ul>
                  </div>

                  <div>
                    <h3 className="mb-3 text-xl font-bold text-neutral-800">常见问题建议</h3>
                    <div className="rounded-lg bg-neutral-50 p-4">
                      <p className="mb-2 font-medium text-neutral-700">“请介绍一下你自己”</p>
                      <p className="text-neutral-600">建议从教育背景、工作经验、核心技能和职业目标四个方面进行介绍，控制在 1-2 分钟内。</p>
                    </div>
                  </div>
                </div>

                <div className="mt-8 flex justify-center space-x-4">
                  <button type="button" className="rounded-lg bg-primary-500 px-6 py-2 text-white transition-colors hover:bg-primary-600">
                    下载反馈报告
                  </button>
                  <button
                    type="button"
                    className="rounded-lg bg-primary-500 px-6 py-2 text-white transition-colors hover:bg-primary-600"
                    onClick={() => {
                      setMessages(initialMessages)
                      setStarted(false)
                      setPaused(false)
                      setEnded(false)
                    }}
                  >
                    重新面试
                  </button>
                </div>
              </div>
            </div>
          </section>
        )}
      </main>

      <SiteFooter />
    </div>
  )
}

export default Interview
