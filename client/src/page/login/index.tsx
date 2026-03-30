import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import userApi from "../../api/userApi";

type AuthTab = "login" | "register";

type LoginFormState = {
  username: string;
  password: string;
  remember: boolean;
};

type RegisterFormState = {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: string;
  agree: boolean;
};

const initialLoginForm: LoginFormState = {
  username: "",
  password: "",
  remember: false,
};

const initialRegisterForm: RegisterFormState = {
  username: "",
  email: "",
  password: "",
  confirmPassword: "",
  role: "student",
  agree: false,
};

function LogoMark() {
  return (
    <svg
      className="h-10 w-10 text-primary-600"
      fill="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
    </svg>
  );
}

function Login() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<AuthTab>("login");
  const [loginForm, setLoginForm] = useState<LoginFormState>(initialLoginForm);
  const [registerForm, setRegisterForm] =
    useState<RegisterFormState>(initialRegisterForm);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

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
                  activeTab === "login"
                    ? "border-primary-500 text-primary-500"
                    : "border-transparent text-neutral-600 hover:text-primary-500"
                }`}
                onClick={() => setActiveTab("login")}
              >
                登录
              </button>
              <button
                type="button"
                className={`flex-1 border-b-2 py-4 text-center font-semibold transition-colors ${
                  activeTab === "register"
                    ? "border-primary-500 text-primary-500"
                    : "border-transparent text-neutral-600 hover:text-primary-500"
                }`}
                onClick={() => setActiveTab("register")}
              >
                注册
              </button>
            </div>
          </div>

          {activeTab === "login" ? (
            <div className="p-8">
              <h2 className="mb-6 text-2xl font-bold text-neutral-800">
                账号登录
              </h2>
              {error && (
                <div className="mb-4 rounded-lg bg-red-50 p-4 text-red-600">
                  {error}
                </div>
              )}
              {success && (
                <div className="mb-4 rounded-lg bg-green-50 p-4 text-green-600">
                  {success}
                </div>
              )}
              <form
                className="space-y-6"
                onSubmit={async (event) => {
                  event.preventDefault();
                  setError(null);
                  setSuccess(null);
                  setIsLoading(true);

                  try {
                    const response = await userApi.login({
                      username: loginForm.username,
                      password: loginForm.password,
                    });
                    setSuccess("登录成功！正在跳转...");
                    // 根据用户角色进行不同的跳转
                    setTimeout(() => {
                      if (response.user.role === "admin") {
                        navigate("/team");
                      } else if (response.user.role === "hr") {
                        navigate("/admin");
                      } else {
                        navigate("/");
                      }
                    }, 1000);
                  } catch (err: any) {
                    setError(
                      err.response?.data?.message ||
                        "登录失败，请检查用户名和密码",
                    );
                  } finally {
                    setIsLoading(false);
                  }
                }}
              >
                <div>
                  <label
                    htmlFor="login-username"
                    className="mb-2 block text-sm font-medium text-neutral-700"
                  >
                    用户名
                  </label>
                  <input
                    id="login-username"
                    type="text"
                    value={loginForm.username}
                    onChange={(event) =>
                      setLoginForm((current) => ({
                        ...current,
                        username: event.target.value,
                      }))
                    }
                    className="w-full rounded-lg border border-neutral-300 px-4 py-3 focus:ring-2 focus:ring-primary-500 focus:outline-none"
                    placeholder="请输入用户名"
                  />
                </div>

                <div>
                  <label
                    htmlFor="login-password"
                    className="mb-2 block text-sm font-medium text-neutral-700"
                  >
                    密码
                  </label>
                  <input
                    id="login-password"
                    type="password"
                    value={loginForm.password}
                    onChange={(event) =>
                      setLoginForm((current) => ({
                        ...current,
                        password: event.target.value,
                      }))
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
                        setLoginForm((current) => ({
                          ...current,
                          remember: event.target.checked,
                        }))
                      }
                      className="h-4 w-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="ml-2 block text-sm text-neutral-600">
                      记住我
                    </span>
                  </label>

                  <a
                    href="#"
                    className="text-sm text-primary-600 hover:text-primary-700"
                  >
                    忘记密码？
                  </a>
                </div>

                <div>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full rounded-lg bg-primary-500 px-4 py-3 font-semibold text-white transition-colors hover:bg-primary-600 disabled:bg-primary-400 disabled:cursor-not-allowed"
                  >
                    {isLoading ? "登录中..." : "登录"}
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="p-8">
              <h2 className="mb-6 text-2xl font-bold text-neutral-800">
                账号注册
              </h2>
              {error && (
                <div className="mb-4 rounded-lg bg-red-50 p-4 text-red-600">
                  {error}
                </div>
              )}
              {success && (
                <div className="mb-4 rounded-lg bg-green-50 p-4 text-green-600">
                  {success}
                </div>
              )}
              <form
                className="space-y-6"
                onSubmit={async (event) => {
                  event.preventDefault();
                  setError(null);
                  setSuccess(null);
                  setIsLoading(true);

                  try {
                    // 验证密码确认
                    if (
                      registerForm.password !== registerForm.confirmPassword
                    ) {
                      throw new Error("两次输入的密码不一致");
                    }

                    // 验证是否同意协议
                    if (!registerForm.agree) {
                      throw new Error("请阅读并同意用户协议和隐私政策");
                    }

                    await userApi.register({
                      username: registerForm.username,
                      password: registerForm.password,
                      email: registerForm.email,
                      role: registerForm.role,
                    });

                    setSuccess("注册成功！请登录");
                    setTimeout(() => {
                      setActiveTab("login");
                      setRegisterForm(initialRegisterForm);
                    }, 1500);
                  } catch (err: any) {
                    setError(err.message || "注册失败，请稍后重试");
                  } finally {
                    setIsLoading(false);
                  }
                }}
              >
                <div>
                  <label
                    htmlFor="register-username"
                    className="mb-2 block text-sm font-medium text-neutral-700"
                  >
                    用户名
                  </label>
                  <input
                    id="register-username"
                    type="text"
                    value={registerForm.username}
                    onChange={(event) =>
                      setRegisterForm((current) => ({
                        ...current,
                        username: event.target.value,
                      }))
                    }
                    className="w-full rounded-lg border border-neutral-300 px-4 py-3 focus:ring-2 focus:ring-primary-500 focus:outline-none"
                    placeholder="请设置用户名"
                  />
                </div>

                <div>
                  <label
                    htmlFor="register-email"
                    className="mb-2 block text-sm font-medium text-neutral-700"
                  >
                    邮箱
                  </label>
                  <input
                    id="register-email"
                    type="email"
                    value={registerForm.email}
                    onChange={(event) =>
                      setRegisterForm((current) => ({
                        ...current,
                        email: event.target.value,
                      }))
                    }
                    className="w-full rounded-lg border border-neutral-300 px-4 py-3 focus:ring-2 focus:ring-primary-500 focus:outline-none"
                    placeholder="请输入邮箱"
                  />
                </div>

                <div>
                  <label
                    htmlFor="register-role"
                    className="mb-2 block text-sm font-medium text-neutral-700"
                  >
                    角色
                  </label>
                  <select
                    id="register-role"
                    value={registerForm.role}
                    onChange={(event) =>
                      setRegisterForm((current) => ({
                        ...current,
                        role: event.target.value,
                      }))
                    }
                    className="w-full rounded-lg border border-neutral-300 px-4 py-3 focus:ring-2 focus:ring-primary-500 focus:outline-none"
                  >
                    <option value="student">普通用户</option>
                    <option value="hr">团队管理员</option>
                    <option value="admin">超级管理员</option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="register-password"
                    className="mb-2 block text-sm font-medium text-neutral-700"
                  >
                    密码
                  </label>
                  <input
                    id="register-password"
                    type="password"
                    value={registerForm.password}
                    onChange={(event) =>
                      setRegisterForm((current) => ({
                        ...current,
                        password: event.target.value,
                      }))
                    }
                    className="w-full rounded-lg border border-neutral-300 px-4 py-3 focus:ring-2 focus:ring-primary-500 focus:outline-none"
                    placeholder="请设置密码"
                  />
                </div>

                <div>
                  <label
                    htmlFor="register-confirm-password"
                    className="mb-2 block text-sm font-medium text-neutral-700"
                  >
                    确认密码
                  </label>
                  <input
                    id="register-confirm-password"
                    type="password"
                    value={registerForm.confirmPassword}
                    onChange={(event) =>
                      setRegisterForm((current) => ({
                        ...current,
                        confirmPassword: event.target.value,
                      }))
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
                      setRegisterForm((current) => ({
                        ...current,
                        agree: event.target.checked,
                      }))
                    }
                    className="mt-0.5 h-4 w-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="ml-2 block text-sm text-neutral-600">
                    我已阅读并同意
                    <a
                      href="#"
                      className="text-primary-600 hover:text-primary-700"
                    >
                      《用户协议》
                    </a>
                    和
                    <a
                      href="#"
                      className="text-primary-600 hover:text-primary-700"
                    >
                      《隐私政策》
                    </a>
                  </span>
                </label>

                <div>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full rounded-lg bg-primary-500 px-4 py-3 font-semibold text-white transition-colors hover:bg-primary-600 disabled:bg-primary-400 disabled:cursor-not-allowed"
                  >
                    {isLoading ? "注册中..." : "注册"}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

export default Login;
