'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
 import axiosInstance from '@/utils/axiosInstance';

interface FormState {
  nickname: string; // 对应后端的 nickname（原 username 是昵称）
  email: string;
  password: string;
  confirmPassword: string;
  code: string;
}

export default function RegisterPage() {
  const router = useRouter();
  const initialForm: FormState = {
    nickname: localStorage.getItem('registerNickname') || '', // 修正本地存储键名
    email: localStorage.getItem('registerEmail') || '',
    password: '',
    confirmPassword: '',
    code: '',
  };
  const [form, setForm] = useState<FormState>(initialForm);
  const [loading, setLoading] = useState<boolean>(false);
  const [codeLoading, setCodeLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [passwordError, setPasswordError] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [codeSent, setCodeSent] = useState<boolean>(false);
  const [countdown, setCountdown] = useState<number>(0);

  // 本地存储昵称（原 username 改为 nickname）
  useEffect(() => {
    localStorage.setItem('registerNickname', form.nickname);
    localStorage.setItem('registerEmail', form.email);
  }, [form.nickname, form.email]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    setError('');
    if (name === 'password') validatePassword(value);
  };

  // 🔥 核心修改：密码强度同步后端规则（8位以上+大小写+数字+特殊字符）
  const validatePassword = (password: string): boolean => {
    const hasChinese = /[\u4e00-\u9fa5]/.test(password);
    if (hasChinese) { setPasswordError('密码不能包含汉字'); return false; }
    if (password.length < 8) { setPasswordError('密码长度不能少于8位'); return false; }
    if (!/[A-Z]/.test(password)) { setPasswordError('密码必须包含大写字母'); return false; }
    if (!/[a-z]/.test(password)) { setPasswordError('密码必须包含小写字母'); return false; }
    if (!/\d/.test(password)) { setPasswordError('密码必须包含数字'); return false; }
    if (!/[^A-Za-z0-9]/.test(password)) { setPasswordError('密码必须包含特殊字符（如!@#$%）'); return false; }
    setPasswordError(''); return true;
  };

  // 🔥 核心修改：发送验证码接口适配后端（/auth/apply-code，参数仅 email）
  const sendEmailCode = async () => {
    const { email } = form;
    if (!email.trim()) { setError('请输入邮箱'); return; }
    const emailRegex = /^[\w-.]+@([\w-]{2,}\.)+[\w-]{2,4}$/;
    if (!emailRegex.test(email.trim())) { setError('请输入有效的邮箱格式'); return; }

    setCodeLoading(true);
    try {
      console.log('=== 发送验证码请求 ===');
      console.log('地址：', 'http://localhost:3001/auth/apply-code'); // 修正接口路径
      console.log('参数：', { email: email.trim() }); // 移除多余的 type 参数

      const response = await axiosInstance.post(
        'http://localhost:3001/auth/apply-code', // 后端实际接口
        { email: email.trim() }, // 仅传 email
        {
          timeout: 20000,
          headers: { 'Content-Type': 'application/json' },
          responseType: 'json',
        }
      );

      console.log('=== 发送验证码响应 ===');
      console.log('状态码：', response.status);
      console.log('响应体：', response.data);

      if (response.data.code === 200) {
        setCodeSent(true);
        setError('');
        setCountdown(60);
      } else {
        setError(response.data.message || '发送失败，请重试');
      }
    } catch (err: any) {
      console.log('=== 发送验证码错误详情 ===');
      console.log('错误消息：', err.message);
      if (err.response) {
        setError(err.response.data.message || '发送失败，请重试');
      } else if (err.request) {
        setError('网络异常，请检查连接');
      } else {
        setError(err.message || '发送失败，请稍后重试');
      }
    } finally {
      setCodeLoading(false);
    }
  };

  // 倒计时逻辑不变
  useEffect(() => {
  let timer: NodeJS.Timeout; // 去掉 | null，直接声明为 NodeJS.Timeout
  if (countdown > 0) {
    timer = setInterval(() => setCountdown(prev => prev - 1), 1000);
  } else if (countdown === 0 && codeSent) {
    setCodeSent(false);
  }

  // 清理函数明确不返回任何值（void），符合 EffectCallback 要求
  return () => {
    if (timer) { // 即使 timer 未赋值，TypeScript 也不会报错（因为 interval 不存在时 clear 无影响）
      clearInterval(timer);
    }
  };
}, [countdown, codeSent]);

  // 🔥 核心修改：注册接口适配后端（/auth/email-register，参数名对齐）
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    const { nickname, email, password, confirmPassword, code } = form;
    
    console.log('=== 开始注册流程 ===');
    console.log('表单数据：', form);
    
    // 字段必填校验
    if (!nickname.trim()) { setError('昵称不能为空'); return; }
    if (!email.trim()) { setError('邮箱不能为空'); return; }
    if (!code.trim()) { setError('请输入邮箱验证码'); return; }
    const emailRegex = /^[\w-.]+@([\w-]{2,}\.)+[\w-]{2,4}$/;
    if (!emailRegex.test(email.trim())) { setError('请输入有效的邮箱格式'); return; }
    if (!validatePassword(password)) { return; }
    if (password !== confirmPassword) { setError('两次密码不一致'); return; }

    setLoading(true);
    try {
      const registerData = {
        nickname: nickname.trim(), // 对应后端的 nickname
        password: password.trim(), // 对应后端的 password
        email: email.trim(),       // 对应后端的 email
        code: code.trim(),         // 对应后端的 code
        // 移除后端不需要的 type 和 confirmPassword
      };
      
      console.log('=== 发送注册请求 ===');
      console.log('地址：', 'http://localhost:3001/auth/email-register'); // 修正接口路径
      console.log('请求体：', registerData);

      const response = await axiosInstance.post(
        'http://localhost:3001/auth/email-register', // 后端实际注册接口
        registerData,
        { 
          responseType: 'json',
          headers: { 'Content-Type': 'application/json' }
        }
      );
      
      console.log('=== 注册响应 ===');
      console.log('响应体：', response.data);

      if (response.data.code === 200) {
        alert('注册成功！请登录');
        router.push('/login');
        localStorage.removeItem('registerNickname');
        localStorage.removeItem('registerEmail');
      } else {
        setError(response.data.message || '注册失败，请检查验证码');
      }
    } catch (err: any) {
      console.log('=== 注册错误详情 ===');
      if (err.response) {
        setError(err.response.data.message || '注册失败，请重试');
      } else if (err.request) {
        setError('网络异常，请检查连接');
      } else {
        setError(err.message || '注册失败，请稍后重试');
      }
    } finally {
      setLoading(false);
    }
  };

  const toggleShowPassword = () => setShowPassword(prev => !prev);

  return (
    <div className="min-h-screen bg-teal-50 flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-md p-8 border border-teal-100 transform transition-all hover:shadow-lg">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-teal-700">注册账号</h2>
          <p className="text-gray-500 mt-1">创建账号，开启智能对话</p>
        </div>
        <form onSubmit={handleRegister} className="space-y-5">
          {/* 🔥 修正 input name 为 nickname（对应后端参数） */}
          <div className="relative">
            <input 
              type="text" 
              name="nickname" 
              value={form.nickname} 
              onChange={handleChange} 
              className="w-full px-4 py-3 bg-gray-50 border border-teal-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-gray-800 transition-all" 
              placeholder="设置昵称" 
              disabled={loading} 
              autoComplete="nickname" 
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-teal-500">👤</span>
          </div>
          <div className="space-y-3">
            <div className="relative">
              <input type="email" name="email" value={form.email} onChange={handleChange} className="w-full px-4 py-3 bg-gray-50 border border-teal-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-gray-800 transition-all" placeholder="输入常用邮箱" disabled={loading} autoComplete="email" />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-teal-500">✉️</span>
              <button
                type="button"
                onClick={sendEmailCode}
                disabled={loading || countdown > 0}
                className="absolute right-12 top-1/2 -translate-y-1/2 text-sm text-teal-700 hover:text-teal-900 hover:underline transition-colors"
              >
                {codeLoading ? '发送中...' : countdown > 0 ? `${countdown}秒后重发` : '发送验证码'}
              </button>
            </div>
            <div className="relative">
              <input type="text" name="code" value={form.code} onChange={handleChange} className="w-full px-4 py-3 bg-gray-50 border border-teal-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-gray-800 transition-all" placeholder="输入6位邮箱验证码" disabled={loading} maxLength={6} autoComplete="off" />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-teal-500">🔑</span>
            </div>
          </div>
          <div className="relative">
            <input type={showPassword ? 'text' : 'password'} name="password" value={form.password} onChange={handleChange} className="w-full px-4 py-3 bg-gray-50 border border-teal-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-gray-800 transition-all" placeholder="设置密码（8位以上，含大小写+数字+特殊字符）" disabled={loading} autoComplete="new-password" />
            <button
              type="button"
              onClick={toggleShowPassword}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-teal-500 hover:text-teal-700 transition-colors"
              disabled={loading}
            >
              {showPassword ? '🙈' : '👁️'}
            </button>
          </div>
          {passwordError && <div className="text-red-500 text-sm pl-1 -mt-4">⚠️ {passwordError}</div>}
          <div className="relative">
            <input type={showPassword ? 'text' : 'password'} name="confirmPassword" value={form.confirmPassword} onChange={handleChange} className="w-full px-4 py-3 bg-gray-50 border border-teal-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-gray-800 transition-all" placeholder="再次输入密码" disabled={loading} autoComplete="new-password" />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-teal-500">🔐</span>
          </div>
          {error && passwordError === '' && <div className="text-red-500 text-sm text-center py-1">⚠️ {error}</div>}
          <button
            type="submit"
            className="w-full py-3 bg-teal-500 text-white rounded-xl font-medium hover:bg-teal-600 transition-colors shadow-sm hover:shadow-md disabled:bg-teal-200 disabled:text-white disabled:cursor-not-allowed"
            disabled={loading || !!passwordError}
          >
            {loading ? '注册中...' : '注册账号'}
          </button>
          <div className="text-center text-sm text-gray-500">
            已有账号？{' '}
            <button
              type="button"
              onClick={() => router.push('/login')}
              className="text-teal-700 hover:text-teal-900 hover:underline transition-colors"
            >
              立即登录
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}