import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
// 引入 AuthProvider
import { AuthProvider } from '@/components/hooks/useAuth';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: '天游AI助手',
  description: '海纳百川，智汇人间',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body className={inter.className}>
        {/* 包裹所有页面，提供认证上下文 */}
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}