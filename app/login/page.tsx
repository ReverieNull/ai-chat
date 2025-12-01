'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axiosInstance from '@/utils/axiosInstance';
import { useAuth } from '@/components/hooks/useAuth';

interface LoginFormState {
  email: string;
  password: string;
}

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoggedIn } = useAuth();

  const [form, setForm] = useState<LoginFormState>({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const { email, password } = form;
    if (!email.trim() || !password.trim()) {
      setError('邮箱或密码不能为空');
      return;
    }

    setLoading(true);
    try {
      const res = await axiosInstance.post('/auth/login', {
        email: email.trim(),
        password: password.trim(),
      });
      const { code, message, data, accessToken, tokenExpires } = res;
      const { accessToken: token, user } = data;
      if (code !== 200) throw new Error(message || '登录失败');
      localStorage.setItem('accessToken', token as string);
      login(token as string, '', user);
      router.push('/chat');
    } catch (err: any) {
      console.error('❌ 登录失败:', err);
      setError(err.response?.status === 401 ? '邮箱或密码错误' : err.message || '登录失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isLoggedIn) router.push('/chat');
  }, [isLoggedIn, router]);

  return (
  <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-teal-100 via-white to-cyan-100">
    {/* 淡青玻璃舱 - 压暗 1 档，更柔和 */}
    <div className="w-full max-w-md bg-white/60 backdrop-blur rounded-3xl shadow-xl border border-teal-200/60 p-10 transition-all hover:shadow-teal-300/30">
      {/* 标题 - 压暗 1 档 */}
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-teal-700 tracking-tight">欢迎回来</h1>
        <p className="text-sm text-teal-600 mt-2">输入邮箱和密码登录系统</p>
      </div>

      {/* 表单舱 - 保持你原来的结构，仅压暗背景 */}
      <form onSubmit={handleLogin} className="space-y-8">
        <div className="relative">
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            className="
              w-full rounded-xl px-4 py-3 border
              bg-teal-50/60
              text-teal-800
              border-teal-200
              placeholder:text-teal-400/70
              focus:bg-teal-100
              focus:border-teal-400
              focus:ring-2 focus:ring-teal-300/50
              outline-none
              transition-all duration-200
            "
            placeholder="注册邮箱"
            disabled={loading}
            autoComplete="email"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-teal-500">✉️</span>
        </div>

        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            name="password"
            value={form.password}
            onChange={handleChange}
            className="
              w-full rounded-xl px-4 py-3 border
              bg-teal-50/60
              text-teal-800
              border-teal-200
              placeholder:text-teal-400/70
              focus:bg-teal-100
              focus:border-teal-400
              focus:ring-2 focus:ring-teal-300/50
              outline-none
              transition-all duration-200
            "
            placeholder="密码"
            disabled={loading}
            autoComplete="current-password"
          />
          <button
            type="button"
            onClick={() => setShowPassword(p => !p)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-teal-500 hover:text-teal-700 transition-colors"
            disabled={loading}
          >
            {showPassword ? '🙈' : '👁️'}
          </button>
        </div>

        {error && (
          <div className="text-red-500 text-sm text-center animate-pulse">⚠️ {error}</div>
        )}

        <button
          type="submit"
          className="w-full py-3 bg-teal-500 text-white rounded-xl font-semibold hover:bg-teal-600 active:scale-95 disabled:bg-teal-200 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl"
          disabled={loading}
        >
          {loading ? '登录中…' : '登录'}
        </button>

        <div className="text-center text-sm text-teal-600">
          还没有账号？{' '}
          <button
            type="button"
            onClick={() => router.push('/register')}
            className="text-teal-700 hover:text-teal-900 hover:underline transition-colors"
          >
            立即注册
          </button>
        </div>
      </form>
    </div>
  </div>
);

}
