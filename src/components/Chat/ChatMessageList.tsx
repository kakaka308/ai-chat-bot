"use client";

import { useEffect, useRef } from 'react';
import { ChatMessage } from './ChatMessage';
import { ChatLoading } from './ChatLoading';
import type { Message } from './useChat';

interface ChatMessageListProps {
  messages: Message[];
  isLoading: boolean;
}

export const ChatMessageList = ({ messages, isLoading }: ChatMessageListProps) => {
  const scrollEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const lastMessageCount = useRef(messages.length);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const isNewMessageSent = messages.length > lastMessageCount.current;
    const isAtBottom = container.scrollHeight - container.scrollTop <= container.clientHeight + 100;
    lastMessageCount.current = messages.length;
    if (isNewMessageSent || (isAtBottom || messages.length === 0)) {
      scrollEndRef.current?.scrollIntoView({ 
        behavior: isLoading ? "auto" : "smooth",
        block: "end",
      });
    }
    
  }, [messages, isLoading]);
  return (
    // 消息滚动区
    <main className='flex-1 overflow-y-auto p-4 space-y-4' ref={containerRef} 
      style={{ scrollBehavior: 'auto' }}>
      {messages.map((msg) => (
        <ChatMessage key={msg.id} message={msg} />
      ))}
      {isLoading && <ChatLoading />}
      <div ref={scrollEndRef} className='h-2'></div>
    </main>
  );
};