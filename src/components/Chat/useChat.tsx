"use client";

import { useState, useRef, useEffect } from 'react';
// import { createRoot } from 'react-dom/client';
// import ThreeScene from '../Three/ThreeScene';
import { parseAIStream } from "@/lib/chat-stream";
export interface Message {
  id: number;
  role: 'user' | 'assistant';
  content: string;
}

export const useChat = () => {
  // 消息列表状态
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, role: "assistant", content: "你好！我是你的 AI 助手，有什么可以帮你的吗？" },
  ]);
  // 输入框状态
  const [input, setInput] = useState("");
  // 记录 AI 是否正在说话
  const [isLoading, setIsLoading] = useState(false);
  // 输入框
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // 输入框自动高度
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
    }
  }, [input]);

  // 发送消息时，添加新消息到 messages && 流式
  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    const userContent = input;
    setInput("");
    setIsLoading(true);

    const userMessage: Message = { id: Date.now(), role: "user", content: userContent };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    const aiMessageId = Date.now() + 1;
    const aiMessage: Message = { id: aiMessageId, role: "assistant", content: "" };
    setMessages((prev) => [...prev, aiMessage]);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: updatedMessages.map(({ role, content }) => ({ role, content })),
        }),
      });

      if (!response.ok) throw new Error("请求后端 API失败");
      
      let fullContent = ""; // 闭包变量，记录累计内容

      await parseAIStream(response, (deltaContent) => {
        fullContent += deltaContent;
        
        setMessages((prev) => {
          const newMessages = [...prev];
          const lastIndex = newMessages.length - 1;
          
          // 确保更新的是对应的 AI 消息 ID
          if (newMessages[lastIndex].id === aiMessageId) {
            newMessages[lastIndex] = {
              ...newMessages[lastIndex],
              content: fullContent,
            };
          }
          return newMessages;
        });
      });

    } catch(error) {
      console.error("出错啦:", error);
      const errorMsg = error instanceof Error ? error.message : "未知错误";    
      setMessages((prev) => {
        const newMessages = [...prev];
        const lastIndex = newMessages.length - 1;
        if (newMessages[lastIndex].id === aiMessageId) {
          newMessages[lastIndex] = {
            ...newMessages[lastIndex],
            content: `错误: ${errorMsg}`,
          };
        }
        return newMessages;
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    messages,
    input,
    setInput,
    isLoading,
    handleSend,
    textareaRef,
  };
};


