'use client';
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
// 🌟 导入统一的 Message 类型
import { Message } from '@/types';

interface CreateConversationResponse {
  id: string;
  title: string;
  createdAt: string;
}

interface ApiRes<T> {
  code: number;
  message: string;
  data: T;
}

const axiosInstance = axios.create({
  baseURL: 'http://localhost:3001',
  timeout: 90000,
  withCredentials: true,
});

axiosInstance.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem('accessToken');
    if (accessToken) {
      config.headers['Authorization'] = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      alert('登录状态已过期，请重新登录');
    }
    return Promise.reject(error);
  }
);

export const buildChatContext = (messages: Message[]): Array<{ role: 'user' | 'assistant'; content: string }> => {
  return messages
    .filter(m => ['user', 'assistant'].includes(m.role))
    .map(m => ({ role: m.role as 'user' | 'assistant', content: m.content }));
};

export function useChat(conversationId: string | undefined, userId: string) {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]); // 使用统一的 Message 类型
  const [isLoading, setIsLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [streamAbortController, setStreamAbortController] = useState<AbortController | null>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatContainerRef.current) {
      const timer = setTimeout(() => {
        chatContainerRef.current!.scrollTop = chatContainerRef.current!.scrollHeight;
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [messages]);

  const loadMessages = async (cid: string) => {
    if (!cid) return;
    setIsLoading(true);
    try {
      const res = await axiosInstance.get<ApiRes<Message[]>>(`/conversations/${cid}/messages`);
      const list = res.data.data ?? [];
      setMessages(list.filter((m) => ['user', 'assistant'].includes(m.role)));
    } catch (e: any) {
      alert(e.response?.data?.message || '加载消息失败');
    } finally {
      setIsLoading(false);
    }
  };

  const createConversation = async (title = '新对话'): Promise<string | null> => {
    try {
      const res = await axiosInstance.post<ApiRes<CreateConversationResponse>>('/conversations', { title });
      const conversation = res.data.data ?? res.data;
      if (!conversation?.id) throw new Error('创建对话失败：后端未返回有效 ID');
      router.push(`/chat/${conversation.id}`);
      return conversation.id;
    } catch (error: any) {
      const errMsg = error.message || '创建对话失败，请重试';
      console.error(errMsg, error);
      alert(errMsg);
      return null;
    }
  };

  const sendStreamMessage = async (cid: string, content: string, model: string) => {
    if (!cid || !userId) return;

    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      type: 'text',
      content,
      conversationId: cid,
      userId,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMsg]);

    const assistantMsg: Message = {
      id: crypto.randomUUID(),
      role: 'assistant',
      type: 'text',
      content: '',
      conversationId: cid,
      userId: 'ai',
      createdAt: new Date().toISOString(),
      streamId: `s-${Date.now()}`,
    };
    setMessages((prev) => [...prev, assistantMsg]);

    const ctrl = new AbortController();
    setStreamAbortController(ctrl);

    try {
      const accessToken = localStorage.getItem('accessToken');
      const response = await fetch('http://localhost:3001/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'text/event-stream',
          'Authorization': accessToken ? `Bearer ${accessToken}` : '',
        },
        body: JSON.stringify({
          userId,
          conversationId: cid,
          chatContext: buildChatContext([...messages, userMsg]),
          model,
        }),
        signal: ctrl.signal,
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`请求失败: ${response.status} ${response.statusText}`);
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('无法获取流式响应');

      const decoder = new TextDecoder('utf-8');
      let fullContent = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n').filter(line => line.trim());

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const dataStr = line.replace('data: ', '').trim();
            
            if (dataStr === '[DONE]') {
              setMessages((m) => m.map((x) => 
                x.streamId === assistantMsg.streamId ? { ...x, streamId: undefined } : x
              ));
              setStreamAbortController(null);
              return;
            }

            try {
              const { content } = JSON.parse(dataStr);
              if (content) {
                fullContent += content;
                setMessages((m) => m.map((x) => 
                  x.streamId === assistantMsg.streamId ? { ...x, content: fullContent } : x
                ));
              }
            } catch (e) {
              console.error('解析流式数据失败:', e, dataStr);
            }
          }
        }
      }
    } catch (error: any) {
      if (error.name !== 'AbortError') {
        console.error('流式请求失败:', error);
        setMessages((m) =>
          m.map((x) =>
            x.streamId === assistantMsg.streamId
              ? { ...x, content: `❌ ${error.message || '流式输出异常'}`, streamId: undefined }
              : x,
          ),
        );
      }
      setStreamAbortController(null);
    }
  };

  const sendText = async (text: string, model: string) => {
    if (!text.trim()) return;

    setIsLoading(true);
    try {
      const cid = conversationId || (await createConversation());
      if (cid) {
        await sendStreamMessage(cid, text, model);
      }
    } catch (e) {
      console.error('发送失败', e);
    } finally {
      setIsLoading(false);
    }
  };

  const sendDeepThink = async (text: string, model: string) => {
    await sendText(`[深度思考模式] ${text}`, model);
  };

  const uploadFile = async (f: File, model: string) => {
    const cid = conversationId || (await createConversation());
    if (!cid) return;

    setIsLoading(true);
    try {
      const body = new FormData();
      body.append('file', f);
      body.append('conversationId', cid);
      const res = await axiosInstance.post<ApiRes<Message>>('/ai/chat/file', body);
      setMessages((prev) => [...prev, res.data.data]);
      setFile(null);
    } catch (e: any) {
      alert(e.message || '文件上传失败');
    } finally {
      setIsLoading(false);
    }
  };

  const abortStream = () => {
    streamAbortController?.abort();
    setStreamAbortController(null);
    setMessages((m) =>
      m.map((x) =>
        x.streamId ? { ...x, content: x.content + '\n\n❌ 流式输出已中断', streamId: undefined } : x,
      ),
    );
  };

  return {
    messages,
    isLoading,
    file,
    fileInputRef,
    streamAbortController,
    chatContainerRef,
    loadMessages,
    sendText,
    sendDeepThink,
    uploadFile,
    abortStream,
    createConversation,
  };
}