"use client";

import { ChatMessage } from './ChatMessage';
import { ChatLoading } from './ChatLoading';
import type { Message } from './useChat';

interface ChatMessageListProps {
  messages: Message[];
  isLoading: boolean;
}

export const ChatMessageList = ({ messages, isLoading }: ChatMessageListProps) => {
  return (
    // 消息滚动区
    <main className='flex-1 overflow-y-auto p-4 space-y-4'>
      {messages.map((msg) => (
        <ChatMessage key={msg.id} message={msg} />
      ))}
      {isLoading && <ChatLoading />}
    </main>
  );
};