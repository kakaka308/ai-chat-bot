// src/components/ChatInterface.tsx
"use client";

import { ChatHeader, ChatMessageList, ChatInput, useChat } from "@/components/Chat";

interface ChatInterfaceProps {
  sessionId: string | null;
  onToggleSidebar: () => void;
}

export function ChatInterface({ sessionId, onToggleSidebar }: ChatInterfaceProps) {
  const {
    messages,
    input,
    setInput,
    isLoading,
    handleSend,
    textareaRef,
  } = useChat();

  return (
    <div className="flex flex-col h-full bg-gray-100">
      <ChatHeader onToggleSidebar={onToggleSidebar} />
      <ChatMessageList messages={messages} isLoading={isLoading} />
      <ChatInput
        input={input}
        setInput={setInput}
        isLoading={isLoading}
        handleSend={handleSend}
        textareaRef={textareaRef}
      />
    </div>
  );
}
