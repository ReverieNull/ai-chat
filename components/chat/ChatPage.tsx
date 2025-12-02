'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/hooks/useAuth';
import { useViewport } from '@/components/hooks/useViewport';
import { useModels } from '@/components/hooks/useModels';
import { useChat } from '@/components/hooks/useChat';
import Sidebar from '@/components/chat/Sidebar';
import Header from '@/components/chat/Header';
import MessageList from '@/components/chat/MessageList';
import MessageInput from '@/components/chat/MessageInput';
import FullScreenSpin from '@/components/FullScreenSpin';
import { Message, AiModel } from '@/types';

// 补全 SidebarProps
interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  onCreateConversation?: (title: string) => Promise<string | null>;
}

// 🌟 关键修复：MessageListProps 必须包含 chatContainerRef
interface MessageListProps {
  messages: Message[];
  chatContainerRef: React.RefObject<HTMLDivElement>; // 和 MessageList 组件一致
}

// 修复 MessageInputProps（移除多余的流式开关属性）
interface MessageInputProps {
  models: AiModel[];
  selectedModel: string;
  onChangeModel: (v: string) => void;
  showAbort: boolean;
  onAbort: () => void;
  onSend: (t: string) => Promise<void>;
  onDeepThink: (t: string) => Promise<void>;
  onUpload: (f: File) => Promise<void>;
  loading: boolean;
}

export default function ChatPage({ params }: { params?: { id?: string } }) {
  const router = useRouter();
  const { user, isLoggedIn, loading: authLoading } = useAuth();
  const { isSidebarOpen, setIsSidebarOpen } = useViewport();
  const { models, selected, setSelected } = useModels();

  // 未登录跳转
  useEffect(() => {
    if (!authLoading && !isLoggedIn) {
      router.push('/login');
    }
  }, [authLoading, isLoggedIn, router]);

  if (authLoading || !isLoggedIn) {
    return <FullScreenSpin />;
  }

  // 初始化 useChat
  const {
    messages,
    isLoading,
    streamAbortController,
    chatContainerRef,
    loadMessages,
    sendText,
    sendDeepThink,
    uploadFile,
    abortStream,
    createConversation,
  } = useChat(params?.id, user?.id || '');

  // 加载历史消息
  useEffect(() => {
    if (params?.id && isLoggedIn) {
      loadMessages(params.id);
    }
  }, [params?.id, isLoggedIn]);

  return (
    <div className="flex h-screen overflow-hidden bg-gradient-to-br from-teal-900/98 to-teal-800/95">
      {/* 侧边栏 - 类型匹配 */}
      <Sidebar
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen(prev => !prev)}
        onCreateConversation={createConversation}
      />

      {/* 主聊天区域 */}
      <div className="flex-1 flex flex-col bg-white/5 backdrop-blur-xl border border-teal-700/10 rounded-2xl overflow-hidden m-3 shadow-lg shadow-teal-900/5">
        <Header
          title={params?.id ? `对话 ${params.id.slice(-6)}` : '新建对话'}
          onToggleSidebar={() => setIsSidebarOpen(prev => !prev)}
        />

        {/* 消息列表 - 现在属性匹配 */}
        <MessageList
          messages={messages}
          chatContainerRef={chatContainerRef}
        />

        {/* 输入区域 - 移除多余的流式开关属性 */}
        <div className="border-t border-teal-700/20 p-4 bg-white/10">
          <MessageInput
            models={models}
            selectedModel={selected}
            onChangeModel={setSelected}
            showAbort={!!streamAbortController}
            onAbort={abortStream}
            onSend={(text) => sendText(text, selected)}
            onDeepThink={(text) => sendDeepThink(text, selected)}
            onUpload={(file) => uploadFile(file, selected)}
            loading={isLoading}
          />
        </div>
      </div>
    </div>
  );
}