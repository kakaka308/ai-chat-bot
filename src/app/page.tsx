// "use client";

// import { useState, useRef, useEffect } from 'react'
// import { Send, Bot, User, Loader2 } from "lucide-react";
// import { parseMarkdown } from 'markdown-three-parser';
// import 'katex/dist/katex.min.css';
// import 'prismjs/themes/prism-tomorrow.css';
// import { createRoot } from 'react-dom/client';
// import ThreeScene from '../components/Three/ThreeScene';

// export default function ChatPage() {
//   // 消息列表状态
//   const [messages, setMessages] = useState([
//     {id: 1, role: "assistant", content: "你好！我是你的 AI 助手，有什么可以帮你的吗？"},
//   ]);
//   // 输入框状态
//   const [input, setInput] = useState("");
//   const textareaRef = useRef<HTMLTextAreaElement>(null);
//   // 记录 AI 是否正在说话
//   const [isLoading, setIsLoading] = useState(false);

//   // 输入框高度
//   useEffect(() => {
//     const textarea = textareaRef.current;
//     if (textarea) {
//       textarea.style.height = "auto";
//       textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
//     }
//   }, [input])

//   // 在聊天消息中自动查找并渲染 3D 预览内容
//   useEffect(() => {
//     // 找到所有生成的 3D 占位符
//     const containers = document.querySelectorAll('.three-preview:not([data-rendered])');
//     containers.forEach(container => {
//       container.setAttribute('data-rendered', 'true');
//       const root = createRoot(container);
//       root.render(<ThreeScene container={container as HTMLElement} />);
//     });
//   }, [messages]);


//   // 发送消息时，添加新消息到 messages
//   const handleSend = async () => {
//     if (!input.trim() || isLoading) return;
//     const useContent = input;
//     setInput("");
//     setIsLoading(true);
//     const newMessage = {id: Date.now(), role: "user",  content: useContent };
//     const updateMessage = [...messages, newMessage];
//     setMessages(updateMessage);
    
//     try {
//       const response = await fetch("api/chat", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           messages: updateMessage.map(({role, content}) => ({
//             role,content
//           })),
//         }),
//       });

//       if (!response.ok)  throw new Error("请求后端 API失败");
//       const aiMessage = await response.json();
//       setMessages((prev) => [
//         ...prev,
//         { id: Date.now() + 1, role: "assistant", content: aiMessage.content },
//       ])
//     } catch(error) {
//       console.error("出错啦:", error);
//       setMessages((prev) => [
//         ...prev,
//         { id: Date.now() + 1, role: "assistant", content: "抱歉，我刚才走神了，请稍后再试。" },
//       ]);
//     } finally {
//       setIsLoading(false);
//     };

//   };
//   return (
//     <div className="flex flex-col h-screen bg-gray-100">
//       {/* 顶部标题栏 */}
//       <header className="bg-white p-4 text-center font-bold border-b shadow-sm">
//         A I  C H A T  B O T
//       </header>

//       {/* 消息滚动区 */}
//       <main className='flex-1 overflow-y-auto p-4 space-y-4'>
//         {messages.map((msg) => (
//           <div key={msg.id} className={`flex ${msg.role === "user" ? 'justify-end' : 'justify-start'}`}>
//             <div className={`p-3 rounded-lg flex items-center gap-2 max-w-[80%] ${msg.role === "user" ? 'bg-blue-500 text-white' :  'bg-white text-gray-800'}`} >
//               {msg.role ===  'user' ? <User size={18}></User> : <Bot size={18}></Bot>}
//               <div className='markdown-body text-black' dangerouslySetInnerHTML={{ __html: parseMarkdown(msg.content) }}></div>
//             </div>
//           </div>
//         ))}
//         {/* AI 正在思考时的加载动画 */}
//         {isLoading && (
//           <div className='flex justify-start'>
//             <div className='bg-white p-3 rounded-lg flex items-center gap-2 shadow-sm text-gray-500'>
//               <Loader2 size={18} className='animate-spin'></Loader2>
//               <span>AI 正在思考……</span>
//             </div>
//           </div>
//         )}
//       </main>

//       {/* 底部输入框 */}
//       <footer className='p-4 bg-white border-t'>
//         <div className="flex gap-2 max-w-4xl mx-auto items-end">
//           <textarea 
//             ref={textareaRef}  
//             className='flex-1 border p-2 rounded-lg outline-none focus: ring-2 focus:ring-blue-400 text-black' 
//             rows={1}
//             value = {input}
//             onChange={(e) => setInput(e.target.value)} 
//             onKeyDown={(e) => {
//               if (e.key === 'Enter' && !e.shiftKey) {
//                 e.preventDefault(); // 阻止默认的换行行为
//                 handleSend();
//               }
//             }} 
//             placeholder= {isLoading ? "AI 正在回复中" : "请输入消息……"}/>
//           <button onClick={handleSend} className='bg-blue-500 text-white p-2 rounded-lg'>
//             <Send size={18} />
//           </button>
//         </div>
        
//       </footer>
//     </div>
//   );

// }

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