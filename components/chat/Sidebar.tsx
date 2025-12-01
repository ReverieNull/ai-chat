'use client';
import { useRouter } from 'next/navigation';
import SidebarAvatar from './SidebarAvatar';
import { useChat } from '@/components/hooks/useChat';
import { useAuth } from '@/components/hooks/useAuth';

interface SidebarProps {
  isOpen: boolean;
  // 🌟 新增：接收ChatPage传递的createConversation（确保函数上下文一致）
  onCreateConversation?: (title: string) => Promise<string>;
}

// 🌟 保留你所有原有逻辑，仅添加onCreateConversation入参
export default function Sidebar({ isOpen, onCreateConversation }: SidebarProps) {
  const router = useRouter();
  const { user, isLoggedIn } = useAuth();
  // 🌟 保留你原有useChat调用，同时兼容外部传递的createConversation
  const { createConversation: localCreateConversation } = useChat(undefined, user?.id || '');

  // 🌟 保留你所有原有新建对话逻辑，仅优化函数调用优先级（优先用外部传递的）
  const handleCreateConversation = async () => {
    try {
      if (!isLoggedIn || !user?.id) {
        alert('请先登录再创建对话！');
        console.error('创建对话失败：用户未登录或 userId 为空');
        return;
      }

      console.log('Sidebar - 调用 createConversation 创建对话');
      // 优先用ChatPage传递的createConversation，避免重复初始化useChat
      const createFunc = onCreateConversation || localCreateConversation;
      const newConversationId = await createFunc('新对话');

      if (!newConversationId) {
        throw new Error('未获取到对话 ID');
      }

      console.log('Sidebar - 对话创建成功，ID:', newConversationId);
      router.push(`/chat/${newConversationId}`);
      router.refresh();
    } catch (error: any) {
      const errMsg = error.message || '创建对话失败，请重试';
      alert(errMsg);
      console.error('Sidebar - 创建对话失败详情:', error);
    }
  };

  return (
    <aside
      className={`hidden md:flex flex-col overflow-hidden transition-all duration-300 ease-in-out
        ${isOpen ? 'w-64 p-4' : 'w-0 p-0'}`}
    >
      {/* 🌟 仅修改样式（适配暗背景），保留你所有原有结构 */}
      <div className="flex-1 flex flex-col rounded-2xl 
        /* 替换浅背景为chat页面同款暗背景毛玻璃，恢复头像显示 */
        bg-white/5 backdrop-blur-xl 
        border border-teal-700/20 
        shadow-lg shadow-teal-900/5
        /* 保留你原有其他样式 */
      "> 
        {/* 🌟 保留你的SidebarAvatar组件（头像显示核心） */}
        <SidebarAvatar />

        {/* 🌟 保留你所有按钮逻辑，仅修改样式适配暗背景 */}
        <button
          onClick={handleCreateConversation} // 🌟 核心：绑定新建对话逻辑（你原有代码已写，仅确保生效）
          className="mt-4 mx-2 px-3 py-2 
            /* 适配暗背景的按钮颜色 */
            bg-teal-600/90 text-white 
            /* 保留你原有按钮样式 */
            rounded-2xl hover:bg-teal-700 
            active:scale-95 disabled:opacity-50 
            transition-all duration-200
            /* 新增：匹配chat页面按钮阴影 */
            shadow-lg shadow-teal-900/20
          "
          disabled={!isLoggedIn || !user?.id}
        >
          新建对话
        </button>

        {/* 🌟 仅修改文字颜色适配暗背景，保留你原有内容 */}
        <div className="flex-1 px-2 mt-4 text-xs text-teal-300/80">历史对话（稍后实现）</div>
        <div className="mx-auto w-1 h-1 rounded-full bg-teal-400/40" />
      </div>
    </aside>
  );
}