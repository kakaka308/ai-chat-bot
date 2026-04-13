"use client";

import { Send } from "lucide-react";
import { RefObject } from "react";

interface ChatInputProps {
  input: string;
  setInput: (value: string) => void;
  isLoading: boolean;
  handleSend: () => void;
  textareaRef: RefObject<HTMLTextAreaElement | null>;
}

export const ChatInput = ({ 
  input, 
  setInput, 
  isLoading, 
  handleSend, 
  textareaRef 
}: ChatInputProps) => {
  return (
    //  底部输入框 
    <footer className='p-4 bg-white border-t'>
      <div className="flex gap-2 max-w-4xl mx-auto items-end">
        <textarea 
          ref={textareaRef}  
          className='flex-1 border p-2 rounded-lg outline-none focus:ring-2 focus:ring-blue-400 text-black' 
          rows={1}
          value={input}
          onChange={(e) => setInput(e.target.value)} 
          onKeyDown={(e) => {
            if (e.nativeEvent.isComposing) return;
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSend();
              if (textareaRef.current) {
                textareaRef.current.style.height = "auto";
              }
            }
          }} 
          placeholder={isLoading ? "AI 正在回复中" : "请输入消息……"}
          disabled={isLoading}
        />
        <button 
          onClick={handleSend} 
          className='bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50'
          disabled={isLoading || !input.trim()}
        >
          <Send size={18} />
        </button>
      </div>
    </footer>
  );
};