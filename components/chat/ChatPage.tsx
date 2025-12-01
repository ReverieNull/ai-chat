'use client';
import { useEffect, useState } from 'react';
import { AuthProvider, useAuth } from '@/components/hooks/useAuth';
import { useViewport } from '@/components/hooks/useViewport';
import { useModels } from '@/components/hooks/useModels';
import { useChat } from '@/components/hooks/useChat';
import Sidebar from '@/components/chat/Sidebar';
import Header from '@/components/chat/Header';
import MessageList from '@/components/chat/MessageList';
import MessageInput from '@/components/chat/MessageInput';
import FullScreenSpin from '@/components/FullScreenSpin';

export default function ChatPage({ params }: { params?: { id?: string } }) {
  const { user, isLoggedIn, loading: authLoading } = useAuth();
  const { isSmallScreen, isSidebarOpen, setIsSidebarOpen } = useViewport();
  const { models, selected, setSelected } = useModels();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const {
    messages,
    isLoading,
    fileInputRef,
    enableStream,
    setEnableStream,
    streamAbortController,
    loadMessages,
    sendText,
    sendDeepThink,
    uploadFile,
    abortStream,
    sendSyncMessage
  } = useChat(params?.id, user?.id || '');

  useEffect(() => {
    if (params?.id) loadMessages(params.id);
  }, [params?.id]);

  if (authLoading || !isLoggedIn) return <FullScreenSpin />;

  return (
    <div className="flex h-screen overflow-hidden bg-gradient-to-br from-teal-900/98 to-teal-800/95">
      {/* 侧边栏：位置/逻辑不变 */}
      <Sidebar isOpen={sidebarOpen} />

      {/* 主内容容器：统一高透明背景 + 极浅边框，适配暗背景 */}
      <div className="flex-1 flex flex-col bg-white/5 backdrop-blur-xl border border-teal-700/10 rounded-2xl overflow-hidden m-3 shadow-lg shadow-teal-900/5">
        {/* Header：逻辑不变，样式已适配暗背景 */}
        <Header
          title={params?.id ? `对话 ${params.id.slice(-6)}` : '新建对话'}
          onToggleSidebar={() => setSidebarOpen(o => !o)}
        />
        {/* MessageList：统一高透明背景 */}
        <MessageList messages={messages} />
        {/* MessageInput：去掉上边框/上圆角，统一高透明 */}
        <div className="border-t-0 rounded-t-none">
          <MessageInput
            models={models}
            selectedModel={selected}
            onChangeModel={setSelected}
            enableStream={enableStream}
            onToggleStream={() => setEnableStream(p => !p)}
            showAbort={!!streamAbortController}
            onAbort={abortStream}
            onSend={t => sendText(t, selected)}
            onDeepThink={t => sendDeepThink(t, selected)}
            onUpload={f => uploadFile(f, selected)}
            loading={isLoading}
          />
        </div>
      </div>
    </div>
  );
}