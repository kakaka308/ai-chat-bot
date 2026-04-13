import { NextResponse } from "next/server";;
import { getFullContext } from "@/lib/rag";
import { getSystemPrompt } from "@/lib/prompts";
export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    const userQuery = messages[messages.length - 1].content;
    // 1. 获取增强背景
  const context = await getFullContext(userQuery);
  
  // 2. 组装消息
  const fullMessages = [
    { role: "system", content: getSystemPrompt(context.text) },
    ...messages
  ];

  // 3. 请求 DeepSeek 并返回流
    const response =  await fetch("https://api.deepseek.com/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.DEEPSEEK_API_KEY}`
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: fullMessages,
        stream: true,
      }),
    });
    if (!response.ok) {
      const error = await response.json();
      return NextResponse.json(
        { error: `DeepSeek API 错误: ${error.error?.message || '未知错误'}` },
        { status: response.status }
      );
    }
    return new NextResponse(response.body, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch(error) {
    console.error("API 调用失败:", error);
    return NextResponse.json(
      {error: "AI 接口调用失败"},
      {status: 500}
    )
  }
}
