// src/app/page.tsx
import { getChatSessions } from "@/lib/db-operations";
import { ChatLayout } from "@/components/ChatLayout";

export default async function ChatPage() {
  const sessions = await getChatSessions("default_user");
  
  // 序列化 sessions 数据（处理 ObjectId 和 Date）
  const serializedSessions = sessions.map(session => ({
    _id: session._id?.toString(),
    userId: session.userId,
    title: session.title,
    createdAt: session.createdAt.toISOString(),
    updatedAt: session.updatedAt.toISOString(),
    messageCount: session.messages.length,
  }));

  return <ChatLayout initialSessions={serializedSessions} />;
}
