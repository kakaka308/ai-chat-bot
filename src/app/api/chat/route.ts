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
      }),
    });
    const data = await response.json();
    return NextResponse.json(data.choices[0].message);
  } catch(error) {
    console.error("API 调用失败:", error);
    return NextResponse.json(
      {error: "AI 接口调用失败"},
      {status: 500}
    )
  };
}