"use client";

import {useState} from 'react'
import { Send, Bot, User } from "lucide-react";
import { handleBuildComplete } from 'next/dist/build/adapter/build-complete';

export default function ChatPage() {
  // 消息列表状态
  const [messages, setMessages] = useState([
    {id: 1, role: "assistant", content: "nihao,yousmky1bangnid1ma1?"},
    {id: 2, role: "user", content: "请帮我巴拉巴拉"},
  ]);
  // 输入框状态
  const [input, setInput] = useState("");
  // 发送消息时，添加新消息到 messages
  const handleSend = () => {
    if (!input.trim()) return;
    const newMessage = {id: Date.now(), role: "user",  content: input };
    setMessages([...messages, newMessage]);
    setInput("");
  };
  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* 顶部标题栏 */}
      <header className="bg-white p-4 text-center font-bold border-b shadow-sm">
        AI CHAT BOT
      </header>

      {/* 消息滚动区 */}
      <main className='flex-1 overflow-y-auto p-4 space-y-4'>
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === "user" ? 'justify-end' : 'justify-start'}`}>
            <div className={`p-3 rounded-lg flex items-center gap-2 max-w-[80%] ${msg.role === "user" ? 'bg-blue-500 text-white' :  'bg-white text-gray-800'}`} >
              {msg.role ===  'user' ? <User size={18}></User> : <Bot size={18}></Bot>}
              <span>{msg.content}</span>
            </div>
          </div>
        ))}
      </main>

      {/* 底部输入框 */}
      <footer className='p-4 bg-white border-t'>
        <div className="flex gap-2 max-w-4xl mx-auto">
          <input type="text"  
            className='flex-1 border p-2 rounded-lg outline-none focus: ring-2 focus:ring-blue-400 text-black' 
            value = 'input' 
            onChange={(e) => setInput(e.target.value)} 
            onKeyDown={(e) => e.key ===  'Enter' && handleSend()} 
            placeholder='hahhaha'/>
          <button onClick={handleSend} className='bg-blue-500 text-white p-2 rounded-lg'>
            <Send size={18} />
          </button>
        </div>
        
      </footer>
    </div>
  );

}