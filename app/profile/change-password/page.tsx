'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/hooks/useAuth';
import axiosInstance from '@/utils/axiosInstance';

// 🔥 对齐后端修改密码 DTO 类型（示例：ChangePasswordDto）
interface ChangePasswordDto {
  oldPassword: string; // 原密码
  newPassword: string; // 新密码
  confirmPassword: string; // 确认新密码
}

export default function ChangePasswordPage() {
  const { isLoggedIn, loading: authLoading } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState<ChangePasswordDto>({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [showPasswords, setShowPasswords] = useState({
    old: false,
    new: false,
    confirm: false,
  });

  // 1. 未登录跳转
  useEffect(() => {
    if (!isLoggedIn && !authLoading) {
      router.push('/login');
    }
  }, [isLoggedIn, authLoading, router]);

  // 2. 关闭提示消息
  const closeMessage = () => {
    setErrorMsg('');
    setSuccessMsg('');
  };

  // 3. 切换密码显示/隐藏
  const togglePasswordVisibility = (type: 'old' | 'new' | 'confirm') => {
    setShowPasswords(prev => ({ ...prev, [type]: !prev[type] }));
  };

  // 4. 表单输入变更
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    closeMessage();
  };

  // 5. 表单校验（前端基础校验，后端需二次校验）
  const validateForm = (): boolean => {
    const { oldPassword, newPassword, confirmPassword } = form;

    // 非空校验
    if (!oldPassword.trim()) {
      setErrorMsg('原密码不能为空');
      return false;
    }
    if (!newPassword.trim()) {
      setErrorMsg('新密码不能为空');
      return false;
    }
    if (!confirmPassword.trim()) {
      setErrorMsg('请确认新密码');
      return false;
    }

    // 新密码长度校验（6-20位，可按后端要求调整）
    if (newPassword.length < 6 || newPassword.length > 20) {
      setErrorMsg('新密码长度需在 6-20 位之间');
      return false;
    }

    // 新密码复杂度校验（可选，按后端要求调整）
    const passwordRegex = /^(?=.*[a-zA-Z])(?=.*\d).{6,20}$/; // 字母+数字组合
    if (!passwordRegex.test(newPassword)) {
      setErrorMsg('新密码需包含字母和数字组合');
      return false;
    }

    // 两次密码一致性校验
    if (newPassword !== confirmPassword) {
      setErrorMsg('两次输入的新密码不一致');
      return false;
    }

    // 新密码不能与原密码相同
    if (newPassword === oldPassword) {
      setErrorMsg('新密码不能与原密码相同');
      return false;
    }

    return true;
  };

  // 6. 提交修改密码请求（对接后端接口）
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    closeMessage();

    // 前端校验
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      // 🔥 对接后端修改密码接口（请根据实际接口路径调整）
      await axiosInstance.put('/user/change-password', {
        oldPassword: form.oldPassword.trim(),
        newPassword: form.newPassword.trim(),
        confirmPassword: form.confirmPassword.trim(),
      });

      // 提交成功
      setSuccessMsg('密码修改成功！请重新登录');
      setForm({ oldPassword: '', newPassword: '', confirmPassword: '' });

      // 3秒后跳转到登录页（可选：也可跳回个人中心）
      setTimeout(() => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        router.push('/login');
      }, 3000);
    } catch (error: any) {
      // 后端错误处理（如原密码错误、新密码不符合要求等）
      const errMsg = error.response?.data?.message || '密码修改失败，请重试';
      setErrorMsg(errMsg);
      console.error('修改密码失败:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 加载中状态
  if (authLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="w-10 h-10 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // 未登录时返回空
  if (!isLoggedIn) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* 顶部导航栏 */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <button
              onClick={() => router.push('/profile')}
              className="mr-2 text-gray-500 hover:text-gray-700"
              aria-label="返回"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
            <h1 className="text-xl font-bold text-gray-800">修改密码</h1>
          </div>
        </div>
      </header>

      {/* 主内容区 */}
      <main className="max-w-md mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 提示消息框 */}
        {errorMsg && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-center justify-between">
            <span className="text-red-600 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M12 16a4 4 0 100-8 4 4 0 000 8z" />
              </svg>
              {errorMsg}
            </span>
            <button onClick={closeMessage} className="text-red-400 hover:text-red-600">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}
        {successMsg && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 flex items-center justify-between">
            <span className="text-green-600 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              {successMsg}
            </span>
            <button onClick={closeMessage} className="text-green-400 hover:text-green-600">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        {/* 密码修改表单卡片 */}
        <div className="bg-white rounded-2xl shadow-md p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 原密码 */}
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-1">原密码</label>
              <input
                type={showPasswords.old ? 'text' : 'password'}
                name="oldPassword"
                value={form.oldPassword}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-black"
                placeholder="请输入当前密码"
                disabled={isSubmitting}
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility('old')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                disabled={isSubmitting}
              >
                {showPasswords.old ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0012 5c4.478 0 8.268 2.943 9.543 7a10.002 10.002 0 01-1.563 3.028m-5.857.908a3 3 0 004.243 4.243m4.242-11.751l-1.679-1.679" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                )}
              </button>
            </div>

            {/* 新密码 */}
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-1">新密码</label>
              <input
                type={showPasswords.new ? 'text' : 'password'}
                name="newPassword"
                value={form.newPassword}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-black"
                placeholder="请输入新密码（6-20位，字母+数字）"
                disabled={isSubmitting}
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility('new')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                disabled={isSubmitting}
              >
                {showPasswords.new ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0012 5c4.478 0 8.268 2.943 9.543 7a10.002 10.002 0 01-1.563 3.028m-5.857.908a3 3 0 004.243 4.243m4.242-11.751l-1.679-1.679" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                )}
              </button>
            </div>

            {/* 确认新密码 */}
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-1">确认新密码</label>
              <input
                type={showPasswords.confirm ? 'text' : 'password'}
                name="confirmPassword"
                value={form.confirmPassword}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-black"
                placeholder="请再次输入新密码"
                disabled={isSubmitting}
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility('confirm')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                disabled={isSubmitting}
              >
                {showPasswords.confirm ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0012 5c4.478 0 8.268 2.943 9.543 7a10.002 10.002 0 01-1.563 3.028m-5.857.908a3 3 0 004.243 4.243m4.242-11.751l-1.679-1.679" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                )}
              </button>
            </div>

            {/* 密码安全提示 */}
            <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-500">
              <p className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                密码建议：包含字母和数字，避免使用生日、手机号等易泄露信息
              </p>
            </div>

            {/* 提交按钮 */}
            <button
              type="submit"
              className="w-full py-3 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors flex items-center justify-center gap-2"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  提交中...
                </>
              ) : (
                '确认修改'
              )}
            </button>

            {/* 取消按钮 */}
            <button
              type="button"
              onClick={() => router.push('/profile')}
              className="w-full py-3 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors text-gray-700"
              disabled={isSubmitting}
            >
              取消
            </button>
          </form>
        </div>
      </main>

      {/* 页脚 */}
      <footer className="bg-white border-t border-gray-200 py-6 mt-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-500 text-sm">
          <p>© {new Date().getFullYear()} AI Chat. 保留所有权利。</p>
        </div>
      </footer>
    </div>
  );
}