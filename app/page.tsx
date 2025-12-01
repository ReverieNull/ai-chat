'use client';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();

  const handleStartChat = () => {
    const accessToken = localStorage.getItem('accessToken');
    const isTokenValid = accessToken && accessToken.split('.').length === 3;
    isTokenValid ? router.push('/chat') : router.push('/login');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* 雾面深青玻璃舱 */}
      <div className="w-full max-w-2xl bg-slate-800/80 backdrop-blur rounded-3xl shadow-2xl border border-slate-700 p-10 transition-all hover:shadow-cyan-500/20">
        {/* 霓虹标题 */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-extrabold text-cyan-400 tracking-tight">人世间AI助手</h1>
          <p className="text-sm text-slate-400 mt-2">洞察世间百态，智答生活万千</p>
        </div>

        {/* 霓虹按钮 */}
        <button
          onClick={handleStartChat}
          className="w-full py-4 bg-cyan-500 text-slate-900 rounded-2xl font-semibold text-lg hover:bg-cyan-400 active:scale-95 transition-all shadow-lg hover:shadow-cyan-500/40 mb-10"
        >
          一键对话
        </button>

        {/* 辅助链接 - 霓虹色 */}
        <div className="flex justify-center gap-10 text-base">
          <a
            href="/login"
            className="text-cyan-400 hover:text-cyan-300 hover:underline transition-colors"
          >
            登录
          </a>
          <a
            href="/register"
            className="text-cyan-400 hover:text-cyan-300 hover:underline transition-colors"
          >
            注册
          </a>
          <a
            href="/profile"
            className="text-cyan-400 hover:text-cyan-300 hover:underline transition-colors"
          >
            个人中心
          </a>
        </div>

        {/* 底部文案 - 低饱和 */}
        <div className="text-center mt-8 text-xs text-slate-500">
          © 2025 人世间AI助手 | 安全 · 智能 · 高效
        </div>
      </div>
    </div>
  );
}
