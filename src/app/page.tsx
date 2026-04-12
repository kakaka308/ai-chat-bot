"use client";

import { 
  ChatHeader, 
  ChatMessageList, 
  ChatInput, 
  useChat 
} from '@/components/Chat';
export default function ChatPage() {
  const {
    messages,
    input,
    setInput,
    isLoading,
    handleSend,
    textareaRef,
  } = useChat();

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <ChatHeader />
      
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