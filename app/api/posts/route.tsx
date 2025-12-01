// app/api/posts/route.ts （注意文件路径：必须在app目录下，且文件名是route.ts）
import { NextRequest, NextResponse } from "next/server";

// 无需自定义requestProps，直接使用NextRequest
export async function POST(request: NextRequest) {
  try {
    // 解析JSON格式的请求体（依赖Postman设置Content-Type: application/json）
    const article = await request.json();

    return NextResponse.json(
      {
        id: Math.random().toString(36).slice(-8),
        data: article, // 返回接收的请求体数据
      },
      { status: 201 }
    );
  } catch (error) {
    // 捕获解析错误（比如非JSON格式请求体）
    return NextResponse.json(
      { message: "请求体格式错误，需为JSON" },
      { status: 400 }
    );
  }
}