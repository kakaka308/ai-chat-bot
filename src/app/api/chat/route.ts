import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    const response =  await fetch("https://api.deepseek.com/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.DEEPSEEK_API_KEY}`
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: messages,
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
