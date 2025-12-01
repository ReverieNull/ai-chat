'use client';
import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import axiosInstance from '@/utils/axiosInstance';
import { Message, CreateConversationResponse, MessageData } from '@/types';
import { buildChatContext } from '@/utils/chat';

// 适配后端统一响应格式（ApiRes）
interface ApiRes<T = any> {
  code: number;
  message: string;
  data: T;
  accessToken?: string;
  tokenExpires?: number;
}

export function useChat(conversationId: string | undefined, userId: string) {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [streamAbortController, setStreamAbortController] = useState<AbortController | null>(null);
  const [enableStream, setEnableStream] = useState(false);

  /* 修复1：正确解析后端ApiRes格式的历史消息 */
  const loadMessages = async (cid: string) => {
    if (!cid) return; // 空ID直接返回
    setIsLoading(true);
    try {
      const res = await axiosInstance.get<ApiRes<Message[]>>(`/conversations/${cid}/messages`);
      // 核心修复：取ApiRes的data字段（后端返回的真实消息列表）
      const messageList = res.data?.code === 200 ? res.data.data : [];
      console.log('加载消息成功：', messageList.length, '条');

      // 过滤有效角色的消息
      const validMessages = messageList.filter((m: Message) => ['user', 'assistant'].includes(m.role));
      setMessages(validMessages);
    } catch (error: any) {
      const errMsg = error.response?.data?.message || error.message || '加载消息失败';
      console.error('加载消息失败:', errMsg, error);
      alert(errMsg);
      router.push('/chat');
    } finally {
      setIsLoading(false);
    }
  };

  /* 修复2：简化新建对话逻辑，去掉重复跳转 */
  const createConversation = async (title = '新对话') => {
    try {
      const res = await axiosInstance.post<ApiRes<CreateConversationResponse>>('/conversations', { title });
      console.log('创建对话响应:', res.data);

      // 兼容后端两种返回格式
      let conversationData: CreateConversationResponse;
      if (res.data?.code === 200 && res.data?.data) {
        conversationData = res.data.data;
      } else {
        conversationData = res.data as CreateConversationResponse;
      }

      if (!conversationData?.id) {
        throw new Error('创建对话失败：未获取到有效对话 ID');
      }

      console.log('创建对话成功，ID:', conversationData.id);
      // 仅一次跳转，避免重复
      router.push(`/chat/${conversationData.id}`);
      return conversationData.id; // 返回新ID，供发送消息使用
    } catch (error: any) {
      const errMsg = error.message || '创建对话失败';
      console.error('创建对话失败:', errMsg, error);
      alert(errMsg);
      throw error;
    }
  };

  /* 流式发送 - 保留逻辑，强化cid绑定 */
  const sendStreamMessage = async (cid: string, content: string, model: string) => {
    // 先添加用户消息（即时渲染）
    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      type: 'text',
      content,
      conversationId: cid,
      userId,
      createdAt: new Date().toISOString(),
    };
    setMessages(prev => [...prev, userMsg]);

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
    setMessages(prev => [...prev, assistantMsg]);

    const ctrl = new AbortController();
    setStreamAbortController(ctrl);

    try {
      const stream = await axiosInstance.post('/ai/chat/stream', {
        userId,
        conversationId: cid, // 强绑定新对话ID
        chatContext: [...buildChatContext(messages), { role: 'user', content }],
        model,
        stream: true,
      }, {
        responseType: 'stream',
        signal: ctrl.signal,
        headers: { Accept: 'text/event-stream' },
      });

      let full = '';
      stream.data.on('data', (chunk: Buffer) => {
        try {
          const lines = chunk.toString().split('\n').filter(l => l.startsWith('data:') && l !== 'data:');
          for (const line of lines) {
            const dt = line.replace('data:', '').trim();
            if (dt === '[DONE]') {
              setMessages(m => m.map(x => x.streamId === assistantMsg.streamId ? { ...x, streamId: undefined } : x));
              return;
            }
            const { content: delta } = JSON.parse(dt);
            full += delta;
            setMessages(m => m.map(x => x.streamId === assistantMsg.streamId ? { ...x, content: full } : x));
          }
        } catch (err) {
          console.error('流式数据解析失败:', err);
        }
      });

      stream.data.on('end', () => setStreamAbortController(null));
      stream.data.on('error', (err: any) => {
        console.error('流式请求失败:', err);
        setStreamAbortController(null);
        setMessages(m => m.map(x => x.streamId === assistantMsg.streamId ? { ...x, content: x.content + '\n\n❌ 流式输出异常', streamId: undefined } : x));
      });
    } catch (error: any) {
      const errMsg = error.message || '流式发送失败';
      console.error('流式发送失败:', errMsg);
      setStreamAbortController(null);
      setMessages(m => m.map(x => x.streamId === assistantMsg.streamId ? { ...x, content: errMsg, streamId: undefined } : x));
    }
  };

  /* 同步发送 - 保留逻辑，强化cid绑定 */
  const sendSyncMessage = async (cid: string, content: string, model: string) => {
    // 先添加用户消息（即时渲染）
    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      type: 'text',
      content,
      conversationId: cid,
      userId,
      createdAt: new Date().toISOString(),
    };
    setMessages(prev => [...prev, userMsg]);

    try {
      const res = await axiosInstance.post<ApiRes<string>>('/ai/chat', {
        userId,
        conversationId: cid, // 强绑定新对话ID
        model,
        chatContext: [...buildChatContext(messages), { role: 'user', content }],
        stream: false,
      });

      const assistantMsg: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        type: 'text',
        content: res.data?.data || 'AI 未返回有效回复',
        conversationId: cid,
        userId: 'ai',
        createdAt: new Date().toISOString(),
      };
      setMessages(prev => [...prev, assistantMsg]);
    } catch (error: any) {
      const errMsg = error.message || '同步发送失败';
      console.error('同步发送失败:', errMsg);
      setMessages(prev => [...prev, {
        id: crypto.randomUUID(),
        role: 'assistant',
        type: 'text',
        content: errMsg,
        conversationId: cid,
        userId: 'ai',
        createdAt: new Date().toISOString(),
      }]);
    }
  };

  /* 修复3：调整发送逻辑，先拿cid再发送，避免状态丢失 */
  const sendText = async (text: string, model: string) => {
    if (!text.trim()) return;
    setIsLoading(true); // 全局loading，避免重复点击
    try {
      // 先获取对话ID（已有则用，无则新建）
      const cid = conversationId || (await createConversation());
      // 再发送消息（绑定新cid）
      if (enableStream) {
        await sendStreamMessage(cid, text, model);
      } else {
        await sendSyncMessage(cid, text, model);
      }
    } catch (error) {
      console.error('发送消息失败:', error);
    } finally {
      setIsLoading(false);
    }
  };

  /* 深度思考 - 保留逻辑 */
  const sendDeepThink = (text: string, model: string) =>
    sendText(`[深度思考模式] ${text}`, model);

  /* 文件上传 - 保留逻辑，强化cid校验 */
  const uploadFile = async (f: File, model: string) => {
    const cid = conversationId || (await createConversation()); // 无对话则新建
    setIsLoading(true);
    try {
      const body = new FormData();
      body.append('file', f);
      body.append('conversationId', cid);
      const res = await axiosInstance.post<ApiRes<Message>>('/ai/chat/file', body, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setMessages(prev => [...prev, res.data.data]);
      setFile(null);
    } catch (error: any) {
      const errMsg = error.message || '文件上传失败';
      console.error('文件上传失败:', errMsg);
      alert(errMsg);
    } finally {
      setIsLoading(false);
    }
  };

  /* 中断流式 - 保留逻辑 */
  const abortStream = () => {
    streamAbortController?.abort();
    setStreamAbortController(null);
    setMessages(m =>
      m.map(x =>
        x.streamId ? { ...x, content: x.content + '\n\n❌ 流式输出已中断', streamId: undefined } : x
      )
    );
  };

  return {
    messages,
    isLoading,
    file,
    fileInputRef,
    enableStream,
    setEnableStream,
    streamAbortController,
    loadMessages,
    sendText,
    sendDeepThink,
    uploadFile,
    abortStream,
    createConversation, // 暴露给Sidebar使用
    sendSyncMessage
  };
}