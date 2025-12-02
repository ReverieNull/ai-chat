'use client';
import { useRouter } from 'next/navigation';
import SidebarAvatar from './SidebarAvatar';
import { useChat } from '@/components/hooks/useChat';
import { useAuth } from '@/components/hooks/useAuth';

// 🌟 修复：添加 onToggle 属性到接口
interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void; // 新增：补充缺失的 onToggle
  onCreateConversation?: (title: string) => Promise<string | null>;
}

export default function Sidebar({ isOpen, onToggle, onCreateConversation }: SidebarProps) {
  const router = useRouter();
  const { user, isLoggedIn } = useAuth();
  const { createConversation: localCreateConversation } = useChat(undefined, user?.id || '');

  const handleCreateConversation = async () => {
    try {
      if (!isLoggedIn || !user?.id) {
        alert('请先登录再创建对话！');
        console.error('创建对话失败：用户未登录或 userId 为空');
        return;
      }

      console.log('📝 Sidebar - 开始创建新对话');
      const createFunc = onCreateConversation || localCreateConversation;
      const newConversationId = await createFunc('新对话');

      if (!newConversationId) {
        throw new Error('创建对话失败：未返回有效对话ID');
      }

      console.log('✅ Sidebar - 对话创建成功，ID:', newConversationId);
      router.push(`/chat/${newConversationId}`);
    } catch (error: any) {
      const errMsg = error.message || '创建对话失败，请重试';
      alert(errMsg);
      console.error('❌ Sidebar - 创建对话失败详情:', error);
    }
  };

  return (
    <aside
      className={`hidden md:flex flex-col overflow-hidden transition-all duration-300 ease-in-out
        ${isOpen ? 'w-64 p-4' : 'w-0 p-0'}`}
    >
      <div className="flex-1 flex flex-col rounded-2xl 
        bg-white/5 backdrop-blur-xl 
        border border-teal-700/20 
        shadow-lg shadow-teal-900/5
      "> 
        <SidebarAvatar />

        <button
          onClick={handleCreateConversation}
          className="mt-4 mx-2 px-3 py-2 
            bg-teal-600/90 text-white 
            rounded-2xl hover:bg-teal-700 
            active:scale-95 disabled:opacity-50 
            transition-all duration-200
            shadow-lg shadow-teal-900/20
          "
          disabled={!isLoggedIn || !user?.id}
        >
          新建对话
        </button>

        <div className="flex-1 px-2 mt-4 text-xs text-teal-300/80">历史对话（稍后实现）</div>
        <div className="mx-auto w-1 h-1 rounded-full bg-teal-400/40" />
      </div>
    </aside>
  );
}