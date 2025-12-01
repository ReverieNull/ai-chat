// components/hooks/useConversation.ts
import { useCallback } from 'react';
import axiosInstance from '@/utils/axiosInstance';
import { Conversation, Message } from '@/types';

export function useConversation() {
  const loading = false; // 实际项目中可添加加载状态管理

  // 1. 获取所有对话
  const getConversations = useCallback(async (): Promise<Conversation[]> => {
    const res = await axiosInstance.get('/conversations');
    return res.data;
  }, []);

  // 2. 创建对话
  const createConversation = useCallback(async (): Promise<Conversation> => {
    const res = await axiosInstance.post('/conversations', { title: '新建对话' });
    return res.data;
  }, []);

  // 3. 获取单个对话的消息
  const getConversationMessages = useCallback(async (conversationId: string): Promise<Message[]> => {
    const res = await axiosInstance.get(`/conversations/${conversationId}/messages`);
    return res.data;
  }, []);

  // 4. 发送消息（支持文本/深度思考）
  const sendMessage = useCallback(async (
    conversationId: string,
    content: string,
    type: 'text' | 'deep_think' = 'text'
  ): Promise<Message> => {
    const res = await axiosInstance.post(`/conversations/${conversationId}/messages`, {
      content,
      type,
      role: 'user',
    });
    return res.data;
  }, []);

  // 5. 发送文件消息
  const sendFileMessage = useCallback(async (
    conversationId: string,
    formData: FormData
  ): Promise<Message> => {
    const res = await axiosInstance.post(`/conversations/${conversationId}/messages/file`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  }, []);

  // 6. 重命名对话
  const renameConversation = useCallback(async (
    conversationId: string,
    title: string
  ): Promise<void> => {
    await axiosInstance.patch(`/conversations/${conversationId}`, { title });
  }, []);

  // 7. 删除单个对话
  const deleteConversation = useCallback(async (conversationId: string): Promise<void> => {
    await axiosInstance.delete(`/conversations/${conversationId}`);
  }, []);

  // 8. 批量删除对话
  const batchDeleteConversations = useCallback(async (conversationIds: string[]): Promise<void> => {
    await axiosInstance.delete('/conversations/batch', { data: { ids: conversationIds } });
  }, []);

  // 9. 获取单个对话信息
  const getConversationById = useCallback(async (conversationId: string): Promise<Conversation> => {
    const res = await axiosInstance.get(`/conversations/${conversationId}`);
    return res.data;
  }, []);

  return {
    loading,
    getConversations,
    createConversation,
    getConversationMessages,
    sendMessage,
    sendFileMessage,
    renameConversation,
    deleteConversation,
    batchDeleteConversations,
    getConversationById,
  };
}