import { useState, useRef } from 'react';
import axios, { AxiosResponse } from 'axios';

// 消息类型定义
interface Message {
  id?: string;
  content: string;
  role: 'user' | 'assistant' | 'ai';
  createdAt?: string;
}

interface ChatAreaProps {
  userId: string;
  sessionId: string;
  isLoading: boolean;
  children: React.ReactNode;
}

export default function ChatArea({ userId, sessionId, isLoading, children }: ChatAreaProps) {
  const [message, setMessage] = useState('');
  const [isOverLimit, setIsOverLimit] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const MAX_LENGTH = 200;

  // 输入框处理
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const inputValue = e.target.value;
    setMessage(inputValue);
    setIsOverLimit(inputValue.length >= MAX_LENGTH);

    if (textareaRef.current) {
      const textarea = textareaRef.current;
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
    }
  };

  // 发送消息（仅保留基础逻辑，实际使用ChatPage的流式功能）
  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || isLoading || isOverLimit) return;

    try {
      await axios.post('/api/chat/messages', {
        userId,
        sessionId,
        content: message,
        role: 'user',
      });

      setMessage('');
      if (textareaRef.current) {
        textareaRef.current.style.height = '60px';
      }
      setIsOverLimit(false);
    } catch (error) {
      console.error('消息发送失败：', error);
      alert('消息发送失败，请重试～');
    }
  };

  return (
    <form onSubmit={handleSend} className="flex flex-1 flex-col h-full">
      {/* 消息列表（由ChatPage渲染） */}
      <div className="flex-1 overflow-auto p-4 min-h-[300px]">
        {children}
      </div>

      {/* 输入区 */}
      <div className="flex flex-0 flex-col m-6 border-2 rounded-xl border-teal-200 p-1 transition-all duration-300 focus-within:border-teal-500 focus-within:shadow-sm">
        <textarea
          ref={textareaRef}
          value={message}
          onChange={handleInputChange}
          placeholder="输入你的问题（最多200字）"
          className="w-full p-2 text-gray-800 min-w-[200px] border-0 outline-none resize-none focus:ring-0 min-h-[60px] max-h-[200px] bg-transparent"
          disabled={isLoading || isOverLimit}
        ></textarea>

        {/* 字数统计 */}
        <div className="text-right text-xs text-gray-500 px-2 -mt-1 mb-1">
          {message.length} / {MAX_LENGTH}
          {isOverLimit && <span className="text-red-500 ml-1">已超限！</span>}
        </div>

        {/* 功能按钮区 */}
        <div className="flex py-2">
          <div className="flex flex-1 gap-2 px-1">
            <button
              type="button"
              className="flex items-center justify-center px-3 py-1 rounded-md border border-teal-200 text-teal-700 text-sm hover:bg-teal-50 transition-colors disabled:opacity-50"
              disabled={isLoading || isOverLimit}
            >
              文件上传
            </button>
            <button
              type="button"
              className="flex items-center justify-center px-3 py-1 rounded-md border border-teal-200 text-teal-700 text-sm hover:bg-teal-50 transition-colors disabled:opacity-50"
              disabled={isLoading || isOverLimit}
            >
              深度思考
            </button>
          </div>

          {/* 发送按钮 */}
          <button
            type="submit"
            className="flex items-center justify-center w-12 h-12 rounded-full bg-teal-600 text-white hover:bg-teal-700 transition-colors disabled:bg-teal-200"
            disabled={isLoading || isOverLimit || !message.trim()}
          >
            {isLoading ? (
              <div className="flex gap-1">
                <div className="w-2 h-2 rounded-full bg-white animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 rounded-full bg-white animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 rounded-full bg-white animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            ) : (
              '⬆️'
            )}
          </button>
        </div>
      </div>
    </form>
  );
}