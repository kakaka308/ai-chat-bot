"use client";

import { User, Bot } from "lucide-react";
import { parseMarkdown } from 'markdown-three-parser';
import 'katex/dist/katex.min.css';
import 'prismjs/themes/prism-tomorrow.css';
import type { Message } from './useChat';

interface ChatMessageProps {
  message: Message;
}

export const ChatMessage = ({ message }: ChatMessageProps) => {
  const isUser = message.role === "user";
  
  return (
    // 单条消息
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`p-3 rounded-lg flex items-center gap-2 max-w-[80%] ${
        isUser ? 'bg-blue-500 text-white' : 'bg-white text-gray-800'
      }`}>
        {isUser ? <User size={18} /> : <Bot size={18} />}
        <div 
          className='markdown-body text-black' 
          dangerouslySetInnerHTML={{ __html: parseMarkdown(message.content) }}
        />
      </div>
    </div>
  );
};