'use client';
import { v4 as uuidv4 } from 'uuid';
import { useRouter } from 'next/navigation';
import { useAuth } from './useAuth'; // 依赖 useAuth 钩子（之前提供过）
 import axiosInstance from '@/utils/axiosInstance';

export const useNewConversation = () => {
  const router = useRouter();
  const { user } = useAuth(); // 获取当前登录用户

  // 无参数（和 Sidebar.tsx 中的调用匹配，避免参数错误）
  const createNewConversation = async () => {
    if (!user) {
      // 未登录跳转登录页
      router.push('/login');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      // 调用后端接口创建对话（标题默认"新对话"）
      const response = await axios.post(
        'http://localhost:3001/auth/conversation/create',
        { title: '新对话' },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.status === 200) {
        const { conversation } = response.data.data;
        // 跳转到 /chat/[id] 动态路由（和你之前的逻辑一致）
        router.push(`/chat/${conversation.id}`);
      } else {
        alert('创建对话失败：' + (response.data.message || '网络错误'));
      }
    } catch (err: any) {
      alert('创建对话失败：' + (err.response?.data?.message || '请检查后端服务是否启动'));
    }
  };

  return { createNewConversation };
};