import { NextResponse } from "next/server";
import { addMessageToSession, ChatMessage } from "@/lib/db-operations";

// 添加消息到指定会话
export async function POST(req: Request) {
  try {
    const { sessionId, role, content } = await req.json();

    if (!sessionId || !role || !content) {
      return NextResponse.json({ error: "参数不完整" }, { status: 400 });
    }

    const message: ChatMessage = { role, content, timestamp: new Date() };
    await addMessageToSession(sessionId, message);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("添加消息失败:", error);
    return NextResponse.json({ error: "添加失败" }, { status: 500 });
  }
}
