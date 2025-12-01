'use client';
import { useState, useEffect } from 'react';

// 消息类型定义
interface Message {
  id: string;
  role: 'user' | 'ai'; // 用户或AI的消息
  content: string;
}

export default function ChatComponent({ conversationId }: { conversationId: string }) {
  const [messages, setMessages] = useState<Message[]>([]); // 消息列表
  const [inputValue, setInputValue] = useState(''); // 输入框内容
  const [isLoading, setIsLoading] = useState(false); // 加载状态

  // 初始化：获取历史消息
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await fetch(`/api/chat/history?conversationId=${conversationId}`);
        const data = await res.json();
        if (data.code === 200) {
          setMessages(data.data.messages);
        }
      } catch (err) {
        console.error('获取历史消息失败：', err);
      }
    };
    fetchHistory();
  }, [conversationId]);

  // 发送用户消息
  const sendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    // 1. 添加用户消息到本地列表（优化体验，无需等后端响应）
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: inputValue
    };
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      // 2. 发送消息到后端
      const res = await fetch('/api/chat/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId,
          content: inputValue,
          role: 'user'
        })
      });

      const data = await res.json();
      if (data.code !== 200) throw new Error(data.msg);

      // 3. 接收AI流式回复
      receiveAIStream(conversationId, data.data.messageId);
    } catch (err) {
      console.error('发送失败：', err);
      // 失败时移除刚才添加的用户消息（保持数据一致）
      setMessages(prev => prev.filter(msg => msg.id !== userMessage.id));
      alert('发送失败，请重试');
      setIsLoading(false);
    }
  };

  // 接收AI流式回复（SSE）
  const receiveAIStream = (conversationId: string, userMessageId: string) => {
    // 创建AI消息占位符（初始内容为空）
    const aiMessage: Message = {
      id: `ai-${Date.now()}`,
      role: 'ai',
      content: ''
    };
    setMessages(prev => [...prev, aiMessage]);

    // 建立SSE连接
    const eventSource = new EventSource(
      `/api/chat/stream?conversationId=${conversationId}&messageId=${aiMessage.id}`
    );

    // 接收流式数据
    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      if (data.type === 'end') {
        // 接收完毕，关闭连接
        eventSource.close();
        setIsLoading(false);
      } else if (data.content) {
        // 更新AI消息内容（逐字添加）
        setMessages(prev => 
          prev.map(msg => 
            msg.id === aiMessage.id 
              ? { ...msg, content: msg.content + data.content } 
              : msg
          )
        );
      }
    };

    // 处理错误
    eventSource.onerror = (err) => {
      console.error('流式响应错误：', err);
      eventSource.close();
      setIsLoading(false);
      // 标记AI消息为失败状态
      setMessages(prev => 
        prev.map(msg => 
          msg.id === aiMessage.id 
            ? { ...msg, content: '⚠️ 加载失败，请重试' } 
            : msg
        )
      );
    };
  };

  return (
    <div className="flex flex-col h-full">
      {/* 消息列表 */}
      <div className="flex-1 overflow-auto p-4">
        {messages.map(msg => (
          <div 
            key={msg.id} 
            className={`mb-4 p-3 rounded-lg ${
              msg.role === 'user' ? 'bg-blue-100 ml-auto' : 'bg-gray-100'
            } max-w-[80%]`}
          >
            <p>{msg.content}</p>
          </div>
        ))}
        {isLoading && (
          <div className="mb-4 p-3 rounded-lg bg-gray-100 max-w-[80%]">
            <p>AI正在输入...</p>
          </div>
        )}
      </div>

      {/* 输入区 */}
      <div className="p-4 border-t">
        <textarea
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="输入消息..."
          className="w-full p-2 border rounded mb-2 min-h-[80px]"
          onKeyDown={(e) => {
            // 按Enter发送（Shift+Enter换行）
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              sendMessage();
            }
          }}
        />
        <button
          onClick={sendMessage}
          disabled={isLoading}
          className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-400"
        >
          {isLoading ? '发送中...' : '发送'}
        </button>
      </div>
    </div>
  );
}
