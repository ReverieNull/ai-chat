'use client';
import { useState, useRef, ChangeEvent, KeyboardEvent, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/hooks/useAuth';
import axiosInstance from '@/utils/chatHttp';

interface UserProfile {
  id: string;
  email: string;
  username: string;
  nickname: string;
  avatar: string | null;
  createdAt: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const { user, loading, updateUser, logout } = useAuth();
  const fileRef = useRef<HTMLInputElement>(null);

  const [nick, setNick] = useState('');
  const [editNick, setEditNick] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (user) setNick(user.nickname);
  }, [user?.id]);

  if (loading) {
    return (
      // 适配暗背景的加载样式
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-900/98 to-teal-800/95">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-400 mb-4"></div>
          <p className="text-teal-200">加载中...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      // 适配暗背景的未登录样式
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-900/98 to-teal-800/95">
        <p className="text-teal-200">用户未登录或数据加载失败</p>
      </div>
    );
  }

  const uploadAvatar = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const body = new FormData();
    body.append('avatar', file);
    try {
      await axiosInstance.post('/api/avatar', body, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const { data } = await axiosInstance.get<{ data: UserProfile }>('/user/profile');
      updateUser(data.data);
      alert('头像已更新');
    } catch (error: any) {
      console.error('头像上传失败:', error);
      alert(`上传失败: ${error.response?.data?.message || '请检查文件格式'}`);
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const saveNick = async () => {
    if (!nick.trim() || nick === user.nickname) return;
    try {
      await axiosInstance.put('/user/nickname', { nickname: nick.trim() });
      const { data } = await axiosInstance.get<{ data: UserProfile }>('/user/profile');
      updateUser(data.data);
      alert('昵称已保存');
    } catch {
      alert('保存失败');
    }
    setEditNick(false);
  };

  const onKeyDownNick = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') saveNick();
    if (e.key === 'Escape') setEditNick(false);
  };

  return (
    // 外层背景：和Chat页面一致的暗青色渐变
    <div className="min-h-screen bg-gradient-to-br from-teal-900/98 to-teal-800/95">
      <div className="max-w-4xl mx-auto p-6">
        {/* 顶部操作栏：适配暗背景文字 */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-teal-100">个人中心</h1>
          <button
            onClick={logout}
            className="px-4 py-2 bg-teal-600/90 text-white rounded-lg hover:bg-teal-700 transition-all shadow-lg shadow-teal-900/20"
          >
            退出登录
          </button>
        </div>

        {/* 头像卡片：Chat页面同款毛玻璃样式 */}
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl shadow-lg shadow-teal-900/5 border border-teal-700/20 p-6 mb-6">
          <div className="flex items-center gap-6">
            <label
              className="relative block w-24 h-24 rounded-full overflow-hidden ring-4 ring-teal-300/40 hover:ring-teal-400 transition cursor-pointer"
              title="点击更换头像"
            >
              <img
                src={user.avatar || '/avatar.png'}
                alt={user.nickname}
                className="object-cover w-full h-full"
              />
              {uploading && (
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center text-white text-xs">
                  上传中…
                </div>
              )}
              <input
                type="file"
                ref={fileRef}
                className="hidden"
                accept="image/*"
                onChange={uploadAvatar}
                disabled={uploading}
              />
            </label>

            <div className="flex-1">
              <p className="text-sm text-teal-300">昵称</p>
              {editNick ? (
                <input
                  value={nick}
                  onChange={(e) => setNick(e.target.value)}
                  onKeyDown={onKeyDownNick}
                  onBlur={saveNick}
                  className="w-full text-lg font-semibold text-teal-100 border-b border-teal-400/50 outline-none bg-transparent placeholder:text-teal-300/70"
                  autoFocus
                />
              ) : (
                <div
                  onClick={() => setEditNick(true)}
                  className="text-lg font-semibold text-teal-100 cursor-pointer hover:text-teal-200 transition-colors"
                >
                  {user.nickname}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 基本信息卡片：Chat页面同款毛玻璃样式 */}
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl shadow-lg shadow-teal-900/5 border border-teal-700/20 p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-teal-300">邮箱</p>
            <p className="text-base text-teal-100">{user.email}</p>
          </div>
          <div>
            <p className="text-sm text-teal-300">用户名</p>
            <p className="text-base text-teal-100">{user.username}</p>
          </div>
          <div>
            <p className="text-sm text-teal-300">注册时间</p>
            <p className="text-base text-teal-100">
              {new Date(user.createdAt).toLocaleString('zh-CN')}
            </p>
          </div>
          <div>
            <p className="text-sm text-teal-300">用户ID</p>
            <p className="text-base text-teal-200 font-mono">{user.id}</p>
          </div>
        </div>

        {/* 返回按钮：适配暗背景的毛玻璃样式 */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={() => router.back()}
            className="px-4 py-2 border border-teal-700/30 text-teal-200 rounded-lg hover:bg-white/10 transition-all shadow-lg shadow-teal-900/10"
          >
            返回
          </button>
        </div>
      </div>
    </div>
  );
}