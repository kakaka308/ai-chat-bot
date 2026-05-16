import { connectToDatabase } from "./mongodb";
import { ObjectId } from "mongodb"; 

// 集合名称常量
export const COLLECTIONS = {
  CHAT_HISTORY: "chat_history",      
  USER_PREFERENCES: "user_preferences", 
  FILES: "files",                    
} as const;

// ============ 聊天记录操作 ============
export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export interface ChatSession {
  _id?: ObjectId | string;
  userId: string;
  title: string;
  messages: ChatMessage[];
  createdAt: Date;
  updatedAt: Date;
}

// 保存聊天会话
export async function saveChatSession(session: Omit<ChatSession, "_id">) {
  const { db } = await connectToDatabase();
  const result = await db.collection<ChatSession>(COLLECTIONS.CHAT_HISTORY).insertOne({
    ...session,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  return result.insertedId;
}

// 获取聊天会话列表(ALL)
export async function getChatSessions(userId: string) {
  const { db } = await connectToDatabase();
  return db.collection<ChatSession>(COLLECTIONS.CHAT_HISTORY)
    .find({ userId })
    .sort({ updatedAt: -1 })
    .toArray();
}

// 获取单个聊天会话
export async function getChatSession(sessionId: string) {
  const { db } = await connectToDatabase();
  return db.collection<ChatSession>(COLLECTIONS.CHAT_HISTORY).findOne({ _id: new ObjectId(sessionId) });
}

// 消息输入类型（不含 timestamp，由服务器生成）
interface MessageInput {
  role: "user" | "assistant";
  content: string;
}

// 添加消息到会话
export async function addMessageToSession(sessionId: string, message: MessageInput) {
  const { db } = await connectToDatabase();
  return db.collection<ChatSession>(COLLECTIONS.CHAT_HISTORY).updateOne(
    { _id: new ObjectId(sessionId) },
    {
      $push: { messages: { ...message, timestamp: new Date() } },
      $set: { updatedAt: new Date() },
    }
  );
}

// 删除聊天会话
export async function deleteChatSession(sessionId: string) {
  const { db } = await connectToDatabase();
  return db.collection(COLLECTIONS.CHAT_HISTORY).deleteOne({ _id: new ObjectId(sessionId) });
}

// ============ 文件元数据操作 ============
export interface FileMetadata {
  _id?: ObjectId | string;
  filename: string;
  size: number;
  mimeType: string;
  collectionName: string;
  chunkCount: number;
  uploadedAt: Date;
}

// 保存文件元数据
export async function saveFileMetadata(file: Omit<FileMetadata, "_id">) {
  const { db } = await connectToDatabase();
  return db.collection<FileMetadata>(COLLECTIONS.FILES).insertOne({
    ...file,
    uploadedAt: new Date(),
  });
}

// 获取文件元数据列表(ALL)
export async function getFileList() {
  const { db } = await connectToDatabase();
  return db.collection<FileMetadata>(COLLECTIONS.FILES)
    .find({})
    .sort({ uploadedAt: -1 })
    .toArray();
}

// 获取单个文件元数据
export async function deleteFileMetadata(fileId: string) {
  const { db } = await connectToDatabase();
  return db.collection(COLLECTIONS.FILES).deleteOne({ _id: new ObjectId(fileId) });
}