'use client';
import { useState } from 'react';
import { Message } from '@/types';

// 🌟 核心修复：统一 Ref 类型（匹配 useRef 创建的 RefObject<HTMLDivElement | null>）
interface MessageListProps {
  messages: Message[];
  chatContainerRef: React.RefObject<HTMLDivElement | null>; // 正确类型：允许 Ref 内部值为 null
}

export default function MessageList({ messages, chatContainerRef }: MessageListProps) {
  const [copiedMsgId, setCopiedMsgId] = useState<string | null>(null);

  const copyMessageContent = (msg: Message) => {
    try {
      const copyText = msg.type === 'file' ? msg.content : msg.content;
      navigator.clipboard.writeText(copyText);
      setCopiedMsgId(msg.id);
      setTimeout(() => setCopiedMsgId(null), 2000);
    } catch (error) {
      console.error('复制失败：', error);
      alert('复制失败，请手动复制');
    }
  };

  if (!messages.length)
    return (
      <div className="flex-1 flex items-center justify-center text-teal-200/80 text-sm bg-white/5 backdrop-blur-xl">
        暂无消息，快来开聊吧~
      </div>
    );

  return (
    <div 
      className="flex-1 overflow-y-auto p-5 pt-6 space-y-8 message-list 
      scrollbar scrollbar-thumb-teal-300/30 scrollbar-track-transparent scrollbar-w-1.5
      bg-white/5 backdrop-blur-xl"
      ref={chatContainerRef} // 类型完全匹配，无报错
    >
      {messages.map((msg) => (
        <div
          key={msg.id}
          className={`flex items-end ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
        >
          {/* AI头像 */}
          {msg.role !== 'user' && (
            <div className="mr-3 flex-shrink-0">
              <img
                src="/avatar.jpg"
                alt="ai"
                className="w-9 h-9 rounded-full object-cover ring-2 ring-teal-300/40 
                  shadow-md shadow-teal-900/10 hover:scale-105 transition-transform duration-200"
              />
            </div>
          )}

          {/* 气泡容器：相对定位，为外部按钮提供参考 */}
          <div className={`relative max-w-[75%]`}>
            {/* 对话气泡：恢复原内边距，无额外预留（按钮在外部） */}
            <div
              className={`
                rounded-3xl px-5 py-4 
                shadow-lg transition-all duration-300
                hover:shadow-xl hover:translate-y-[-1px]
                ${
                  msg.role === 'user' 
                    ? 'bg-gradient-to-br from-teal-600/95 to-teal-700/95 text-white rounded-tr-none shadow-teal-900/30' 
                    : 'bg-gradient-to-br from-white/12 to-white/8 text-teal-100 border border-teal-700/25 rounded-tl-none shadow-teal-900/15'
                }
              `}
            >
              {msg.type === 'text' && (
                <p className="whitespace-pre-wrap text-sm leading-relaxed tracking-tight">{msg.content}</p>
              )}
              {msg.type === 'file' && (
                <a
                  href={msg.content}
                  target="_blank"
                  rel="noreferrer"
                  className="text-teal-200 text-sm font-medium underline underline-offset-2 hover:text-teal-100 transition-colors"
                >
                  {msg.fileName}
                </a>
              )}
            </div>

            {/* 🌟 核心调整：按钮在气泡外右下角，不遮挡内容 */}
            <button
              onClick={() => copyMessageContent(msg)}
              className={`
                absolute bottom-[-4px] right-[-4px]  // 气泡外右下角（轻微超出）
                z-10  // 保证按钮在最上层
                w-7 h-7 rounded-full flex items-center justify-center
                opacity-70 hover:opacity-100 transition-all duration-200
                ${msg.role === 'user' 
                  ? 'bg-white/20 text-white hover:bg-white/40 shadow-md shadow-teal-900/20' 
                  : 'bg-teal-700/20 text-teal-200 hover:bg-teal-700/40 shadow-md shadow-teal-900/10'
                }
                ${copiedMsgId === msg.id ? 'opacity-100 bg-teal-500/80 text-white scale-110' : ''}
              `}
              title="复制内容"
            >
              {copiedMsgId === msg.id ? (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
                </svg>
              )}
            </button>
          </div>

          {/* 用户头像 */}
          {msg.role === 'user' && (
            <div className="ml-3 flex-shrink-0">
              <img
                src="/user-avatar.png"
                alt="me"
                className="w-9 h-9 rounded-full object-cover ring-2 ring-teal-400/40 
                  shadow-md shadow-teal-900/10 hover:scale-105 transition-transform duration-200"
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}