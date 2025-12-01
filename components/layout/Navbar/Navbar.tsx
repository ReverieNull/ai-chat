'use client';
import { useState, useEffect } from 'react';

interface NavbarProps {
  toggleSidebar: () => void;
  isSidebarOpen?: boolean;
}

export default function Navbar({ toggleSidebar, isSidebarOpen }: NavbarProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // 未挂载时显示简单占位
  if (!mounted) {
    return (
      <div className="h-16 border-b border-gray-200 flex items-center px-4 bg-white shadow-sm">
        <div className="w-8 h-8 bg-gray-200 rounded"></div>
      </div>
    );
  }

  return (
    <div className="h-16 border-b border-gray-200 flex items-center px-4 bg-white shadow-sm transition-all duration-300">
      {/* 汉堡菜单按钮（小屏幕） */}
      <button
        onClick={toggleSidebar}
        className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors mr-3"
        aria-label="切换侧边栏"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* 页面标题 */}
      <h1 className="text-lg font-bold text-teal-700 hidden md:block">
        AI 聊天
      </h1>

      {/* 右侧操作区域 */}
      <div className="ml-auto flex items-center space-x-4">
        {/* 侧边栏切换按钮（大屏幕） */}
        <button
          onClick={toggleSidebar}
          className={`hidden md:block p-2 hover:bg-gray-100 rounded-lg transition-colors ${
            isSidebarOpen ? 'text-teal-500' : 'text-gray-400'
          }`}
          aria-label={isSidebarOpen ? "折叠侧边栏" : "展开侧边栏"}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            {isSidebarOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            )}
          </svg>
        </button>

        {/* 用户信息 */}
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-teal-400 to-teal-600 flex items-center justify-center text-white font-medium text-sm">
            {localStorage.getItem('userName')?.charAt(0) || 'U'}
          </div>
          <span className="text-sm font-medium text-gray-700 hidden sm:inline">
            {localStorage.getItem('userName') || '用户'}
          </span>
        </div>
      </div>
    </div>
  );
}