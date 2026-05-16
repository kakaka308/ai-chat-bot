import { NextResponse } from "next/server";
import {
  saveChatSession,
  getChatSessions,
} from "@/lib/db-operations";

// 获取所有聊天会话
export async function GET() {
  try {
    const userId = "default_user"; // TODO: 替换为实际的用户认证
    const sessions = await getChatSessions(userId);
    return NextResponse.json(sessions);
  } catch (error) {
    console.error("获取聊天记录失败:", error);
    return NextResponse.json({ error: "获取失败" }, { status: 500 });
  }
}

// 创建新聊天会话
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { title = "新对话", messages = [] } = body;
    const userId = "default_user";

    const sessionId = await saveChatSession({
      userId,
      title,
      messages,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    return NextResponse.json({ success: true, sessionId: sessionId.toString() });
  } catch (error) {
    console.error("创建聊天会话失败:", error);
    return NextResponse.json({ error: "创建失败" }, { status: 500 });
  }
}
