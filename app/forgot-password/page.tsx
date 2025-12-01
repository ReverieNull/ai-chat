'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from '@/utils/axios';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: '', code: '', newPassword: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState(1); // 1-输入邮箱 2-验证验证码 3-重置密码

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  // 发送验证码（接口路径修正：和后端/auth前缀一致）
  const sendCode = async () => {
    if (!form.email.trim()) {
      setError('请输入邮箱');
      return;
    }
    // 邮箱格式校验
    const emailRegex = /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/;
    if (!emailRegex.test(form.email.trim())) {
      setError('请输入有效的邮箱格式');
      return;
    }

    setLoading(true);
    try {
      // 接口路径修正：后端重置密码验证码接口（需和后端保持一致，若不同请修改）
      await axios.post('/auth/send-reset-code', { 
        email: form.email.trim(),
        type: 'RESET' // 后端可能需要区分验证码类型，按需调整
      });
      alert('验证码已发送到邮箱，请查收');
      setStep(2);
    } catch (err: any) {
      setError(err.message || '验证码发送失败，请检查邮箱是否已注册');
    } finally {
      setLoading(false);
    }
  };

  // 重置密码（接口路径修正）
  const resetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const { code, newPassword } = form;

    // 表单校验
    if (!code.trim()) {
      setError('请输入邮箱验证码');
      return;
    }
    if (!newPassword.trim()) {
      setError('请设置新密码');
      return;
    }
    // 密码强度校验（和注册页一致：6位以上字母+数字）
    const pwdRegex = /^(?=.*[a-zA-Z])(?=.*\d).{6,}$/;
    if (!pwdRegex.test(newPassword.trim())) {
      setError('密码需6位以上，包含字母和数字');
      return;
    }

    setLoading(true);
    try {
      // 接口路径修正：后端重置密码接口（需和后端保持一致，若不同请修改）
      await axios.post('/auth/reset-password', {
        email: form.email.trim(),
        code: code.trim(),
        newPassword: newPassword.trim()
      });
      alert('密码重置成功！请登录');
      router.push('/login');
    } catch (err: any) {
      setError(err.message || '密码重置失败（验证码无效或已过期）');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-teal-50 flex items-center justify-center p-4 font-sans">
      {/* 纯白卡片+细腻阴影（和登录/注册页一致） */}
      <div className="w-full max-w-md bg-white rounded-2xl shadow-md p-8 border border-teal-100 transform transition-all hover:shadow-lg">
        <div className="text-center mb-8">
          {/* 标题颜色：深青蓝 */}
          <h2 className="text-2xl font-bold text-teal-700">找回密码</h2>
          <p className="text-gray-500 mt-1">通过邮箱验证码重置密码</p>
        </div>

        {step === 1 ? (
          <div className="space-y-5">
            {/* 输入框：浅灰背景+青蓝边框 */}
            <div className="relative">
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-50 border border-teal-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-gray-800 transition-all"
                placeholder="输入注册邮箱"
                disabled={loading}
                autoComplete="email"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-teal-500">✉️</span>
            </div>

            {/* 错误提示 */}
            {error && <div className="text-red-500 text-sm text-center py-1">{error}</div>}

            {/* 统一风格按钮：柔和青蓝 */}
            <button
              onClick={sendCode}
              className="w-full py-3 bg-teal-500 text-white rounded-xl font-medium hover:bg-teal-600 transition-colors shadow-sm hover:shadow-md disabled:bg-teal-200 disabled:text-white disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? '发送中...' : '发送验证码'}
            </button>

            {/* 链接颜色：青蓝 */}
            <div className="text-center text-sm text-gray-500">
              返回登录？{' '}
              <button
                onClick={() => router.push('/login')}
                className="text-teal-700 hover:text-teal-900 hover:underline transition-colors"
              >
                点击登录
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={resetPassword} className="space-y-5">
            {/* 验证码输入框 */}
            <div className="relative">
              <input
                type="text"
                name="code"
                value={form.code}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-50 border border-teal-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-gray-800 transition-all"
                placeholder="输入6位邮箱验证码"
                disabled={loading}
                maxLength={6}
                autoComplete="off"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-teal-500">🔑</span>
            </div>

            {/* 新密码输入框 */}
            <div className="relative">
              <input
                type="password"
                name="newPassword"
                value={form.newPassword}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-50 border border-teal-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-gray-800 transition-all"
                placeholder="设置新密码（6位以上，含字母和数字）"
                disabled={loading}
                autoComplete="new-password"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-teal-500">🔐</span>
            </div>

            {/* 错误提示 */}
            {error && <div className="text-red-500 text-sm text-center py-1">{error}</div>}

            {/* 重置密码按钮 */}
            <button
              type="submit"
              className="w-full py-3 bg-teal-500 text-white rounded-xl font-medium hover:bg-teal-600 transition-colors shadow-sm hover:shadow-md disabled:bg-teal-200 disabled:text-white disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? '重置中...' : '重置密码'}
            </button>

            {/* 操作链接：青蓝色 */}
            <div className="flex justify-center gap-4 text-sm text-gray-500">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-teal-700 hover:text-teal-900 hover:underline transition-colors"
              >
                更换邮箱
              </button>
              <button
                type="button"
                onClick={() => router.push('/login')}
                className="text-teal-700 hover:text-teal-900 hover:underline transition-colors"
              >
                取消
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}