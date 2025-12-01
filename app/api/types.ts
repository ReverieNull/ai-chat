/**
 * 前后端统一接口类型定义
 * 说明：前端所有接口请求/响应均遵循此类型，后端同步保持一致
 */

// 1. 通用响应类型（所有接口返回格式统一）
export interface ApiResponse<T = any> {
  code: number; // 状态码：200成功，400参数错误，401未授权，409冲突，500服务器错误
  message: string; // 提示信息
  data: T; // 响应数据（泛型，根据接口动态变化）
}

// 2. 用户模块接口类型
// 注册请求参数
export interface RegisterDto {
  username: string; // 用户名（唯一）
  password: string; // 密码（前端需加密后传输，此处为明文类型示例）
}

// 用户信息响应数据
export interface User {
  id: number; // 用户ID
  username: string; // 用户名
  createdAt: string; // 创建时间（ISO格式字符串：YYYY-MM-DDTHH:mm:ss.sssZ）
}

// 3. 聊天模块接口类型
// 发送消息请求参数
export interface SendMessageDto {
  userId: number; // 发送用户ID
  content: string; // 消息内容
  role: 'user' | 'ai'; // 角色：用户/AI
}

// 聊天消息响应数据
export interface ChatMessage extends SendMessageDto {
  id: number; // 消息ID
  createdAt: string; // 发送时间（ISO格式字符串）
}

// 4. 健康检查接口类型
export interface HealthCheckData {
  status: 'ok' | 'error'; // 服务状态
  message: string; // 状态描述
}