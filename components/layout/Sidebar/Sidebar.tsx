'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/components/hooks/useAuth';
import { useConversation } from '@/components/hooks/useConversation';
import { Conversation } from '@/types';
import { Menu, Item, useContextMenu } from 'react-contexify';
import 'react-contexify/dist/ReactContexify.css';

// 右键菜单样式
const menuStyles = {
  backgroundColor: '#fff',
  border: '1px solid #e5e7eb',
  borderRadius: '0.375rem',
  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  padding: '0.25rem 0',
  fontSize: '0.875rem',
};

const itemStyles = {
  padding: '0.5rem 1rem',
  cursor: 'pointer',
  '&:hover': {
    backgroundColor: '#f3f4f6',
    color: '#1f2937',
  },
};

const dangerItemStyles = {
  ...itemStyles,
  '&:hover': {
    backgroundColor: '#fee2e2',
    color: '#dc2626',
  },
};

// 头像组件
const Avatar = ({ user }: { user: any }) => {
  const [showProfile, setShowProfile] = useState(false);
  const avatarRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const { logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        avatarRef.current && !avatarRef.current.contains(event.target as Node) &&
        menuRef.current && !menuRef.current.contains(event.target as Node)
      ) {
        setShowProfile(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const goToProfile = () => {
    router.push('/profile');
    setShowProfile(false);
  };

  return (
    <div className="relative" ref={avatarRef}>
      <div
        onMouseEnter={() => setShowProfile(true)}
        onClick={() => setShowProfile(!showProfile)}
        className="flex items-center gap-2 w-full p-2 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
        aria-label="用户菜单"
      >
        <div className="w-8 h-8 rounded-full overflow-hidden border border-gray-200">
          <img
            src={user?.avatar || 'https://via.placeholder.com/100'}
            alt={user?.nickname || user?.username || '用户'}
            className="w-full h-full object-cover"
          />
        </div>
        <span className="truncate text-sm text-gray-700">
          {user?.nickname || user?.username || '未命名用户'}
        </span>
      </div>
      
      {showProfile && (
        <div 
          ref={menuRef}
          onMouseEnter={() => setShowProfile(true)}
          className="absolute bottom-full left-0 mb-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-50 animate-fadeIn"
        >
          <div className="p-4 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full overflow-hidden border border-gray-200">
                <img
                  src={user?.avatar || 'https://via.placeholder.com/100'}
                  alt={user?.nickname || user?.username || '用户'}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <div className="font-medium text-gray-800">{user?.nickname || user?.username || '未命名用户'}</div>
                <div className="text-xs text-gray-500">{user?.email || '无邮箱绑定'}</div>
              </div>
            </div>
          </div>
          <div className="p-2 space-y-1">
            <button
              onClick={goToProfile}
              className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-teal-50 rounded-lg transition-colors flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              个人中心
            </button>
            <button
              onClick={logout}
              className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 11-6 0v-1m6 4H7" />
              </svg>
              退出登录
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

interface SidebarProps {
  isSidebarOpen?: boolean;
  toggleSidebar?: () => void;
  isSmallScreen?: boolean;
}

// 确保 SafeConversation 完全兼容 Conversation 类型
interface SafeConversation extends Conversation {
  id: string;
  title: string;
  userId: string;
}

// 适配后端返回格式：可能是直接返回 Conversation，或 { success: true, data: Conversation }
type CreateConversationResponse = Conversation | { success: boolean; data: unknown };

export default function Sidebar({ 
  isSidebarOpen = true, 
  toggleSidebar, 
  isSmallScreen = false 
}: SidebarProps) {
  const { user, isLoggedIn, loading: authLoading } = useAuth();
  const { 
    createConversation, 
    getConversations, 
    renameConversation, 
    deleteConversation, 
    batchDeleteConversations,
    loading: convLoading 
  } = useConversation();
  const router = useRouter();
  const pathname = usePathname();
  const [conversations, setConversations] = useState<SafeConversation[]>([]);
  const [renameTitle, setRenameTitle] = useState('');
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [currentConvId, setCurrentConvId] = useState('');
  const [showDeleteAllConfirm, setShowDeleteAllConfirm] = useState(false);

  const currentConversationId = pathname.split('/').pop() || '';
  const { show: showContextMenu, hideAll } = useContextMenu({ id: 'conversation-context-menu' });

  // 加载对话列表
  useEffect(() => {
    if (isLoggedIn && !authLoading) {
      fetchConversations();
    }
  }, [isLoggedIn, authLoading]);

  const fetchConversations = async () => {
    try {
      const rawData = await getConversations();
      // 严格过滤有效对话
      const validConversations: SafeConversation[] = (Array.isArray(rawData) ? rawData : [])
        .filter((item): item is SafeConversation => {
          return (
            typeof item?.id === 'string' && 
            typeof item?.title === 'string' && 
            typeof item?.userId === 'string'
          );
        });
      setConversations(validConversations);
    } catch (error) {
      console.error('加载对话失败:', error);
      setConversations([]);
      alert('加载对话失败，请重试！');
    }
  };

  // 🔥 修复所有 TS 错误：新建对话函数
  const handleNewConversation = async () => {
    if (convLoading) return;
    try {
      const createRes = await createConversation();
      console.log('创建对话接口返回:', createRes);

      // 步骤1：解析后端返回格式，添加类型守卫（修复错误1：unknown 类型分配问题）
      let newConvData: Conversation | null = null;
      if (typeof createRes === 'object' && createRes !== null) {
        // 情况1：后端返回 { success: true, data: Conversation }
        if ('success' in createRes && createRes.success && 'data' in createRes) {
          // 类型断言 + 类型守卫，确保 data 是 Conversation 类型
          const data = createRes.data as Conversation;
          if (data && typeof data.id === 'string') {
            newConvData = data;
          }
        } 
        // 情况2：后端直接返回 Conversation 对象
        else if ('id' in createRes && typeof createRes.id === 'string') {
          newConvData = createRes as Conversation;
        }
      }

      // 步骤2：严格校验对话数据有效性
      if (!newConvData || typeof newConvData.id !== 'string' || newConvData.id.trim() === '') {
        throw new Error(
          `创建对话失败：未返回有效 ID（响应格式异常）\n` +
          `后端返回内容：${JSON.stringify(createRes)}`
        );
      }

      // 步骤3：转换为 SafeConversation 类型（修复错误2-4：重复属性覆盖问题）
      // 先扩张 newConvData，再覆盖需要强制设置的属性，避免重复定义
      const newConv: SafeConversation = {
        ...newConvData, // 先继承所有属性
        id: newConvData.id.trim(), // 仅覆盖 id（确保非空）
        title: newConvData.title?.trim() || '新对话', // 覆盖 title（默认值）
        userId: newConvData.userId || user?.id || '', // 覆盖 userId（默认值）
      };

      // 步骤4：跳转至新对话动态路由
      const newConvId = newConv.id;
      router.push(`/chat/${newConvId}`);

      // 小屏幕自动关闭侧边栏
      if (isSmallScreen && toggleSidebar) toggleSidebar();

      // 刷新对话列表（添加新对话到列表）
      setConversations(prev => [newConv, ...prev]);

    } catch (error) {
      console.error('创建对话失败:', error);
      const errorMsg = error instanceof Error 
        ? error.message 
        : '创建对话失败，请检查网络或后端服务！';
      alert(errorMsg);
    }
  };

  // 右键菜单触发
  const handleContextMenu = (e: React.MouseEvent, conv: SafeConversation) => {
    e.preventDefault();
    setCurrentConvId(conv.id);
    setRenameTitle(conv.title);
    showContextMenu({ event: e });
  };

  // 重命名对话
  const handleRename = async () => {
    if (!renameTitle.trim() || !currentConvId || convLoading) return;
    try {
      await renameConversation(currentConvId, renameTitle);
      setConversations(prev => 
        prev.map(conv => conv.id === currentConvId ? { ...conv, title: renameTitle } : conv)
      );
      setShowRenameModal(false);
      hideAll();
    } catch (error) {
      console.error('重命名失败:', error);
      alert('重命名失败，请重试！');
    }
  };

  // 删除单个对话
  const handleDelete = async () => {
    if (!currentConvId || convLoading) return;
    if (window.confirm('确定要删除这个对话吗？删除后不可恢复！')) {
      try {
        await deleteConversation(currentConvId);
        const remainingConvs = conversations.filter(conv => conv.id !== currentConvId);
        if (currentConversationId === currentConvId) {
          router.push(remainingConvs.length > 0 ? `/chat/${remainingConvs[0].id}` : '/chat');
        }
        setConversations(remainingConvs);
        hideAll();
      } catch (error) {
        console.error('删除失败:', error);
        alert('删除失败，请重试！');
      }
    }
  };

  // 批量删除对话
  const handleBatchDelete = async () => {
    if (conversations.length === 0 || convLoading) return;
    if (window.confirm('确定要删除所有对话吗？删除后不可恢复！')) {
      try {
        const convIds = conversations.map(conv => conv.id);
        await batchDeleteConversations(convIds);
        setConversations([]);
        router.push('/chat');
        setShowDeleteAllConfirm(false);
      } catch (error) {
        console.error('批量删除失败:', error);
        alert('批量删除失败，请重试！');
      }
    }
  };

  // 侧边栏样式
  const getSidebarClasses = () => {
    if (isSmallScreen) {
      return `
        fixed left-0 top-0 h-full z-50 transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        w-64 bg-white border-r border-gray-200 shadow-xl
      `;
    } else {
      return `
        relative transition-all duration-300 ease-in-out overflow-hidden
        ${isSidebarOpen ? 'w-64' : 'w-16'} bg-white border-r border-gray-200 h-screen shrink-0
      `;
    }
  };

  // 遮罩层样式
  const getOverlayClasses = () => {
    return `
      fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300 ease-in-out
      ${isSmallScreen && isSidebarOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'}
    `;
  };

  const shouldShowText = isSidebarOpen || isSmallScreen;

  // 加载中状态
  if (authLoading) {
    return (
      <div className={getSidebarClasses()}>
        <div className="flex items-center justify-center h-full">
          <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className={getOverlayClasses()} onClick={toggleSidebar} aria-hidden="true"></div>
      
      <div className={getSidebarClasses()}>
        {isSmallScreen && isSidebarOpen && toggleSidebar && (
          <button 
            onClick={toggleSidebar}
            className="absolute right-4 top-4 z-10 p-1 bg-gray-100 rounded-full hover:bg-gray-200"
            aria-label="关闭侧边栏"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
        
        <div className={`h-full ${isSmallScreen ? 'pt-12' : 'p-4'} flex flex-col`}>
          <div className="mb-6">
            <h2 className={`text-xl font-bold text-teal-700 mb-4 flex items-center ${!shouldShowText && 'justify-center'}`}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              {shouldShowText && 'AI 聊天'}
            </h2>
            
            <button
              onClick={handleNewConversation}
              disabled={convLoading}
              className={`w-full py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                !shouldShowText && 'h-10 w-10 p-0 rounded-full'
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              {shouldShowText && '新建对话'}
            </button>
          </div>

          <div className="flex-1 overflow-y-auto">
            {shouldShowText && (
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-sm font-medium text-gray-500">我的对话</h3>
                <div className="flex gap-1">
                  <button
                    onClick={fetchConversations}
                    disabled={convLoading}
                    className="text-xs text-gray-400 hover:text-teal-600 transition-colors p-1"
                    title="刷新对话列表"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  </button>
                  <button
                    onClick={() => setShowDeleteAllConfirm(true)}
                    disabled={convLoading || conversations.length === 0}
                    className="text-xs text-red-400 hover:text-red-600 transition-colors p-1"
                    title="删除所有对话"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            )}
            
            {convLoading ? (
              <div className="text-center py-8 text-gray-400">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-teal-500 border-t-transparent"></div>
                {shouldShowText && <p className="mt-2">加载中...</p>}
              </div>
            ) : conversations.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-2 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
                {shouldShowText && <p>暂无对话</p>}
                {shouldShowText && <p className="text-xs mt-1">点击"新建对话"开始聊天</p>}
              </div>
            ) : (
              <div className="space-y-1">
                {conversations.map((conv) => (
                  <button
                    key={conv.id}
                    onClick={() => {
                      router.push(`/chat/${conv.id}`);
                      if (isSmallScreen && toggleSidebar) toggleSidebar();
                    }}
                    onContextMenu={(e) => handleContextMenu(e, conv)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center gap-2 ${
                      currentConversationId === conv.id
                        ? 'bg-teal-100 text-teal-700 font-medium'
                        : 'hover:bg-gray-100 text-gray-700'
                    }`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 ${currentConversationId === conv.id ? 'text-teal-600' : 'text-gray-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    {shouldShowText && <span className="truncate">{conv.title}</span>}
                  </button>
                ))}
              </div>
            )}
          </div>
          
          {isLoggedIn && user && (
            <div className="mt-auto pt-4 border-t border-gray-200">
              <Avatar user={user} />
            </div>
          )}
        </div>
      </div>

      <Menu id="conversation-context-menu" style={menuStyles}>
        <Item onClick={() => setShowRenameModal(true)} style={itemStyles}>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
          </svg>
          重命名
        </Item>
        <Item onClick={handleDelete} style={dangerItemStyles}>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          删除
        </Item>
      </Menu>

      {/* 重命名模态框 */}
      {showRenameModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">重命名对话</h3>
            <input
              type="text"
              value={renameTitle}
              onChange={(e) => setRenameTitle(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-teal-500 text-black"
              placeholder="输入新名称..."
              autoFocus
            />
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowRenameModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleRename}
                className="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors"
              >
                确认
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 批量删除确认框 */}
      {showDeleteAllConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-red-600 mb-2">确认删除所有对话</h3>
            <p className="text-gray-600 mb-6">此操作将删除所有对话及消息，删除后不可恢复，请谨慎操作！</p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteAllConfirm(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleBatchDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                确认删除
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}