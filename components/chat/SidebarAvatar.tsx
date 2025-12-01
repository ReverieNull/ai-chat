// src/components/SidebarAvatar.tsx
'use client';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/hooks/useAuth';

export default function SidebarAvatar() {
  const router = useRouter();
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="flex items-center gap-3 p-4 rounded-xl bg-white/60 border border-teal-100">
        <div className="w-10 h-10 rounded-full bg-teal-50 grid place-items-center">
          <span className="text-teal-500 text-xs font-medium">未登录</span>
        </div>
        <span className="text-xs text-teal-600">请先登录</span>
      </div>
    );
  }

  return (
    <div
      onClick={() => router.push('/profile')}
      title="进入个人中心"
      className="group flex items-center gap-3 p-4 rounded-xl bg-white/60 border border-teal-100 cursor-pointer
                 hover:bg-teal-50 hover:shadow-sm hover:-translate-y-0.5 transition-all duration-200"
    >
      {/* 头像 */}
      <div className="relative w-11 h-11 rounded-full overflow-hidden ring-2 ring-teal-400/70 group-hover:ring-teal-400 transition-all">
        <img
          src={user.avatar || '/avatar.jpg'}
          alt={user.nickname}
          className="w-full h-full object-cover"
        />
      </div>

      {/* 信息 */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-800 truncate group-hover:text-teal-700 transition-colors">
          {user.nickname}
        </p>
        <p className="text-xs text-teal-600/80 mt-0.5">查看资料</p>
      </div>

      {/* 微光指示 */}
      <div className="w-1.5 h-1.5 rounded-full bg-teal-400/60 group-hover:bg-teal-400 transition-all" />
    </div>
  );
}
