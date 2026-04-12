import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    const fullMessages = [
      {
        role: "system",
        content: `你是一个 3D 助手。当用户要求画图时，请严格使用以下格式：
        1. 当用户要求画图时，直接输出 :::three ... ::: 格式。
      2. 严禁将 :::three 包裹在 \`\`\` 代码块内！
      3. 指令格式必须符合：# 形状 (颜色, 半径/大小)。
      例如：
        :::three
        # sphere (red, 1)
        :::
        除此之外不要解释，直接输出代码块。`
      },
      ...messages
    ];
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
