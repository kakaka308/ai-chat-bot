import { NextResponse } from "next/server";
import { getContext } from "@/lib/rag";

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    const userQuery = messages[messages.length - 1].content;
    const diaryData = await getContext(userQuery, "diary_assistant");
    const generalData = await getContext(userQuery, "general_knowledge");
    const threeData = await getContext(userQuery, "my_3d_knowledge");

    // 然后合并它们
    const context = `
      来自日记：${diaryData}
      来自通用库：${generalData}
      来自3D库：${threeData}
    `;
    const fullMessages = [
      {
        role: "system",
        content: `你是一个全能助手，现在拥有用户的“个人日记”和“本地知识”访问权限。
        
        # 已查找到的背景资料：
        ${context ? context : "未找到相关日记记录。"}
        # 你的任务：
        1. 如果背景资料中有相关内容，请结合背景资料友好地回答用户。
        2. 如果涉及 3D 指令，严格使用 :::three 格式,当用户要求画图时，直接输出 :::three ... ::: ,
        格式严禁将 :::three 包裹在 \`\`\` 代码块内！
        指令格式必须符合：# 形状 (颜色, 半径/大小)。
        例如：
          :::three
          # sphere (red, 1)
          :::,
        3. 不要直接说“根据背景资料”，要自然地像老朋友一样聊天。`
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
