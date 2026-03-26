import { useEffect, useState } from 'react'

type AuthTab = 'login' | 'register'

type LoginFormState = {
  username: string
  password: string
  remember: boolean
}

type RegisterFormState = {
  phone: string
  code: string
  password: string
  confirmPassword: string
  agree: boolean
}

const initialLoginForm: LoginFormState = {
  username: '',
  password: '',
  remember: false,
}

const initialRegisterForm: RegisterFormState = {
  phone: '',
  code: '',
  password: '',
  confirmPassword: '',
  agree: false,
}

function LogoMark() {
  return (
    <svg className="h-10 w-10 text-primary-600" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
    </svg>
  )
}

function Login() {
  const [activeTab, setActiveTab] = useState<AuthTab>('login')
  const [countdown, setCountdown] = useState(0)
  const [loginForm, setLoginForm] = useState<LoginFormState>(initialLoginForm)
  const [registerForm, setRegisterForm] = useState<RegisterFormState>(initialRegisterForm)

  useEffect(() => {
    if (countdown <= 0) {
      return
    }

    const timerId = window.setTimeout(() => {
      setCountdown((current) => current - 1)
    }, 1000)

    return () => window.clearTimeout(timerId)
  }, [countdown])

  const codeButtonLabel = countdown > 0 ? `${countdown}秒后重新获取` : '获取验证码'

  return (
    <main className="flex min-h-screen flex-1 items-center justify-center bg-neutral-50 py-16 text-neutral-700">
      <div className="mx-auto w-full max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 text-center">
          <div className="mb-2 flex items-center justify-center space-x-2">
            <LogoMark />
            <span className="text-2xl font-bold text-neutral-800">AI招聘</span>
          </div>
          <p className="text-neutral-600">智能连接人才与未来</p>
        </div>

        <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-md">
          <div className="border-b border-neutral-200">
            <div className="flex">
              <button
                type="button"
                className={`flex-1 border-b-2 py-4 text-center font-semibold transition-colors ${
                  activeTab === 'login'
                    ? 'border-primary-500 text-primary-500'
                    : 'border-transparent text-neutral-600 hover:text-primary-500'
                }`}
                onClick={() => setActiveTab('login')}
              >
                登录
              </button>
              <button
                type="button"
                className={`flex-1 border-b-2 py-4 text-center font-semibold transition-colors ${
                  activeTab === 'register'
                    ? 'border-primary-500 text-primary-500'
                    : 'border-transparent text-neutral-600 hover:text-primary-500'
                }`}
                onClick={() => setActiveTab('register')}
              >
                注册
              </button>
            </div>
          </div>

          {activeTab === 'login' ? (
            <div className="p-8">
              <h2 className="mb-6 text-2xl font-bold text-neutral-800">账号登录</h2>
              <form
                className="space-y-6"
                onSubmit={(event) => {
                  event.preventDefault()
                }}
              >
                <div>
                  <label htmlFor="login-username" className="mb-2 block text-sm font-medium text-neutral-700">
                    用户名
                  </label>
                  <input
                    id="login-username"
                    type="text"
                    value={loginForm.username}
                    onChange={(event) =>
                      setLoginForm((current) => ({ ...current, username: event.target.value }))
                    }
                    className="w-full rounded-lg border border-neutral-300 px-4 py-3 focus:ring-2 focus:ring-primary-500 focus:outline-none"
                    placeholder="请输入用户名"
                  />
                </div>

                <div>
                  <label htmlFor="login-password" className="mb-2 block text-sm font-medium text-neutral-700">
                    密码
                  </label>
                  <input
                    id="login-password"
                    type="password"
                    value={loginForm.password}
                    onChange={(event) =>
                      setLoginForm((current) => ({ ...current, password: event.target.value }))
                    }
                    className="w-full rounded-lg border border-neutral-300 px-4 py-3 focus:ring-2 focus:ring-primary-500 focus:outline-none"
                    placeholder="请输入密码"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={loginForm.remember}
                      onChange={(event) =>
                        setLoginForm((current) => ({ ...current, remember: event.target.checked }))
                      }
                      className="h-4 w-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="ml-2 block text-sm text-neutral-600">记住我</span>
                  </label>

                  <a href="#" className="text-sm text-primary-600 hover:text-primary-700">
                    忘记密码？
                  </a>
                </div>

                <div>
                  <button
                    type="submit"
                    className="w-full rounded-lg bg-primary-500 px-4 py-3 font-semibold text-white transition-colors hover:bg-primary-600"
                  >
                    登录
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="p-8">
              <h2 className="mb-6 text-2xl font-bold text-neutral-800">账号注册</h2>
              <form
                className="space-y-6"
                onSubmit={(event) => {
                  event.preventDefault()
                }}
              >
                <div>
                  <label htmlFor="register-phone" className="mb-2 block text-sm font-medium text-neutral-700">
                    手机号
                  </label>
                  <div className="flex space-x-4">
                    <input
                      id="register-phone"
                      type="tel"
                      value={registerForm.phone}
                      onChange={(event) =>
                        setRegisterForm((current) => ({ ...current, phone: event.target.value }))
                      }
                      className="flex-1 rounded-lg border border-neutral-300 px-4 py-3 focus:ring-2 focus:ring-primary-500 focus:outline-none"
                      placeholder="请输入手机号"
                    />
                    <button
                      type="button"
                      disabled={countdown > 0}
                      onClick={() => setCountdown(60)}
                      className={`whitespace-nowrap rounded-lg px-4 py-3 font-medium transition-colors ${
                        countdown > 0
                          ? 'cursor-not-allowed bg-neutral-200 text-neutral-500'
                          : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                      }`}
                    >
                      {codeButtonLabel}
                    </button>
                  </div>
                </div>

                <div>
                  <label htmlFor="register-code" className="mb-2 block text-sm font-medium text-neutral-700">
                    验证码
                  </label>
                  <input
                    id="register-code"
                    type="text"
                    value={registerForm.code}
                    onChange={(event) =>
                      setRegisterForm((current) => ({ ...current, code: event.target.value }))
                    }
                    className="w-full rounded-lg border border-neutral-300 px-4 py-3 focus:ring-2 focus:ring-primary-500 focus:outline-none"
                    placeholder="请输入验证码"
                  />
                </div>

                <div>
                  <label htmlFor="register-password" className="mb-2 block text-sm font-medium text-neutral-700">
                    密码
                  </label>
                  <input
                    id="register-password"
                    type="password"
                    value={registerForm.password}
                    onChange={(event) =>
                      setRegisterForm((current) => ({ ...current, password: event.target.value }))
                    }
                    className="w-full rounded-lg border border-neutral-300 px-4 py-3 focus:ring-2 focus:ring-primary-500 focus:outline-none"
                    placeholder="请设置密码"
                  />
                </div>

                <div>
                  <label htmlFor="register-confirm-password" className="mb-2 block text-sm font-medium text-neutral-700">
                    确认密码
                  </label>
                  <input
                    id="register-confirm-password"
                    type="password"
                    value={registerForm.confirmPassword}
                    onChange={(event) =>
                      setRegisterForm((current) => ({ ...current, confirmPassword: event.target.value }))
                    }
                    className="w-full rounded-lg border border-neutral-300 px-4 py-3 focus:ring-2 focus:ring-primary-500 focus:outline-none"
                    placeholder="请确认密码"
                  />
                </div>

                <label className="flex items-start">
                  <input
                    type="checkbox"
                    checked={registerForm.agree}
                    onChange={(event) =>
                      setRegisterForm((current) => ({ ...current, agree: event.target.checked }))
                    }
                    className="mt-0.5 h-4 w-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="ml-2 block text-sm text-neutral-600">
                    我已阅读并同意
                    <a href="#" className="text-primary-600 hover:text-primary-700">
                      《用户协议》
                    </a>
                    和
                    <a href="#" className="text-primary-600 hover:text-primary-700">
                      《隐私政策》
                    </a>
                  </span>
                </label>

                <div>
                  <button
                    type="submit"
                    className="w-full rounded-lg bg-primary-500 px-4 py-3 font-semibold text-white transition-colors hover:bg-primary-600"
                  >
                    注册
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}

export default Login
