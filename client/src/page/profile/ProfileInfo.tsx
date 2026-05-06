import { useState, useEffect } from "react";
import userApi from "../../api/userApi";

type ProfileForm = {
  name: string;
  phone: string;
  email: string;
  grade: string;
  intro: string;
  _id: string;
};

export default function ProfileInfo() {
  const [profileForm, setProfileForm] = useState<ProfileForm>({
    name: "",
    phone: "",
    email: "",
    grade: "",
    intro: "",
    _id: "",
  });
  const [loading, setLoading] = useState(false);
  const [newPhone, setNewPhone] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [countdown, setCountdown] = useState(0);
  const [showPhoneModal, setShowPhoneModal] = useState(false);

  useEffect(() => {
    const fetchUserProfile = async () => {
      const user = userApi.getCurrentUser();
      if (user) {
        try {
          const userData = await userApi.getUserById(user._id);
          let maskedPhone = userData.phone || "";
          if (maskedPhone.length === 11) {
            maskedPhone =
              maskedPhone.substring(0, 3) + "****" + maskedPhone.substring(7);
          }

          setProfileForm({
            name: userData.username || "",
            phone: maskedPhone,
            email: userData.email || "",
            grade: userData.grade || "",
            intro: userData.intro || "",
            _id: userData._id,
          });
        } catch (error) {
          console.error("获取用户信息失败:", error);
        }
      }
    };

    fetchUserProfile();
  }, []);

  const handleSaveProfile = async () => {
    try {
      setLoading(true);
      await userApi.updateUser(profileForm._id, {
        username: profileForm.name,
        email: profileForm.email,
        grade: profileForm.grade,
        intro: profileForm.intro,
      });
      alert("保存成功");
    } catch (error) {
      console.error("保存失败:", error);
      alert("保存失败，请重试");
    } finally {
      setLoading(false);
    }
  };

  const handleChangePhone = () => {
    setShowPhoneModal(true);
    setNewPhone("");
    setVerificationCode("");
  };

  const handleSendCode = () => {
    if (!newPhone || newPhone.length !== 11) {
      alert("请输入正确的手机号");
      return;
    }
    setCountdown(60);
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    alert("验证码已发送");
  };

  const handleConfirmPhoneChange = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      alert("请输入6位验证码");
      return;
    }
    try {
      await userApi.updateUser(profileForm._id, { phone: newPhone });
      alert("手机号修改成功");
      setShowPhoneModal(false);
      const userData = await userApi.getUserById(profileForm._id);
      let maskedPhone = userData.phone || "";
      if (maskedPhone.length === 11) {
        maskedPhone =
          maskedPhone.substring(0, 3) + "****" + maskedPhone.substring(7);
      }
      setProfileForm((prev) => ({ ...prev, phone: maskedPhone }));
    } catch (error) {
      console.error("修改手机号失败:", error);
      alert("修改失败，请重试");
    }
  };

  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-8 shadow-sm h-[calc(100vh-150px)] overflow-y-auto">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-neutral-800">个人信息</h2>
      </div>
      <form className="space-y-6" onSubmit={(event) => event.preventDefault()}>
        <div className="grid gap-6 md:grid-cols-2">
          {[
            ["姓名", "name", "text"],
            ["手机号", "phone", "tel"],
            ["邮箱", "email", "email"],
          ].map(([label, key, type]) => (
            <div key={key} className="flex flex-col">
              <label className="mb-2 block text-sm font-medium text-neutral-700">
                {label}
              </label>
              <div className="flex items-center space-x-3">
                <input
                  type={type}
                  value={profileForm[key as keyof ProfileForm] as string}
                  onChange={(event) =>
                    setProfileForm((current) => ({
                      ...current,
                      [key]: event.target.value,
                    }))
                  }
                  disabled={key === "phone"}
                  className="flex-1 rounded-lg border border-neutral-300 px-4 py-3 focus:ring-2 focus:ring-primary-500 focus:outline-none"
                />
                {key === "phone" && (
                  <button
                    type="button"
                    className="rounded-lg bg-primary-500 px-3 py-3 text-sm text-white transition-colors hover:bg-primary-600"
                    onClick={handleChangePhone}
                  >
                    更换手机号
                  </button>
                )}
              </div>
            </div>
          ))}

          <div>
            <label className="mb-2 block text-sm font-medium text-neutral-700">
              年级
            </label>
            <select
              value={profileForm.grade}
              onChange={(event) =>
                setProfileForm((current) => ({
                  ...current,
                  grade: event.target.value,
                }))
              }
              className="w-full rounded-lg border border-neutral-300 px-4 py-3 focus:ring-2 focus:ring-primary-500 focus:outline-none"
            >
              <option value="">请选择年级</option>
              {["大一", "大二", "大三", "大四"].map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-neutral-700">
            个人简介
          </label>
          <textarea
            rows={4}
            value={profileForm.intro}
            onChange={(event) =>
              setProfileForm((current) => ({
                ...current,
                intro: event.target.value,
              }))
            }
            placeholder="介绍一下你自己..."
            className="w-full rounded-lg border border-neutral-300 px-4 py-3 focus:ring-2 focus:ring-primary-500 focus:outline-none"
          />
        </div>

        <div className="flex justify-end">
          <button
            type="button"
            onClick={handleSaveProfile}
            disabled={loading}
            className="rounded-lg bg-primary-500 px-6 py-3 font-semibold text-white transition-colors hover:bg-primary-600 disabled:opacity-50"
          >
            {loading ? "保存中..." : "保存修改"}
          </button>
        </div>
      </form>

      {showPhoneModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-md rounded-lg bg-white p-6">
            <h3 className="mb-4 text-xl font-bold text-neutral-800">
              更换手机号
            </h3>
            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-neutral-700">
                  新手机号
                </label>
                <input
                  type="tel"
                  value={newPhone}
                  onChange={(event) => setNewPhone(event.target.value)}
                  placeholder="请输入新手机号"
                  className="w-full rounded-lg border border-neutral-300 px-4 py-3 focus:ring-2 focus:ring-primary-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-neutral-700">
                  验证码
                </label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={verificationCode}
                    onChange={(event) => setVerificationCode(event.target.value)}
                    placeholder="请输入验证码"
                    className="flex-1 rounded-lg border border-neutral-300 px-4 py-3 focus:ring-2 focus:ring-primary-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleSendCode}
                    disabled={countdown > 0}
                    className="rounded-lg bg-primary-500 px-4 py-3 text-white transition-colors hover:bg-primary-600 disabled:opacity-50"
                  >
                    {countdown > 0 ? `${countdown}s` : "发送验证码"}
                  </button>
                </div>
              </div>
            </div>
            <div className="mt-6 flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => setShowPhoneModal(false)}
                className="rounded-lg border border-neutral-300 px-4 py-2 text-neutral-700 transition-colors hover:bg-neutral-50"
              >
                取消
              </button>
              <button
                type="button"
                onClick={handleConfirmPhoneChange}
                className="rounded-lg bg-primary-500 px-4 py-2 text-white transition-colors hover:bg-primary-600"
              >
                确认
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}