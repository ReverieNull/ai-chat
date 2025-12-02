'use client'; // 客户端组件标记（动画需要客户端渲染）

export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-teal-50 to-cyan-50">
      {/* 加载动画：青蓝旋转图标 */}
      <div className="w-12 h-12 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin mb-4"></div>
      
      {/* 古风加载文案（贴合整体定位） */}
      <p className="text-xl text-teal-700 font-light tracking-wide">
        人世事繁多，天游正在思考...
      </p>
    </div>
  );
}