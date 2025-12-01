'use client';
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function ErrorPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [errorMsg, setErrorMsg] = useState('页面出错啦～');

  // 从URL参数获取自定义错误信息（比如 /error?msg=页面不存在）
  useEffect(() => {
    const msg = searchParams.get('msg');
    if (msg) setErrorMsg(msg);
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-teal-50 flex items-center justify-center p-4 font-sans">

      <div className="w-full max-w-md bg-white rounded-2xl shadow-md p-8 border border-teal-100 text-center transform transition-all hover:shadow-lg">

        <div className="w-20 h-20 bg-teal-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="text-4xl text-teal-500">⚠️</span>
        </div>


        <h2 className="text-2xl font-bold text-teal-700 mb-3">出错了</h2>
        <p className="text-gray-500 mb-8">{errorMsg}</p>


        <div className="flex flex-col sm:flex-row gap-4 justify-center">

          <button
            onClick={() => router.push('/')}
            className="flex-1 py-3 bg-teal-500 text-white rounded-xl font-medium hover:bg-teal-600 transition-colors shadow-sm"
          >
            返回首页
          </button>

          <button
            onClick={() => window.history.back()}
            className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
          >
            返回上一页
          </button>
        </div>

        <div className="mt-6 text-sm text-gray-500">
          如需帮助？{' '}
          <button
            onClick={() => router.push('/login')}
            className="text-teal-700 hover:text-teal-900 hover:underline transition-colors"
          >
            登录后重试
          </button>
        </div>
      </div>
    </div>
  );
}