"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronLeft, Database, Send, CheckCircle2, AlertCircle } from "lucide-react";

export default function AdminPage() {
  const [text, setText] = useState("");
  const [target, setTarget] = useState("diary_assistant");
  const [status, setStatus] = useState<{ type: 'idle' | 'loading' | 'success' | 'error', msg: string }>({
    type: 'idle',
    msg: ''
  });

  const handleIngest = async () => {
    if (!text.trim()) return;

    setStatus({ type: 'loading', msg: "正在录入知识库..." });

    try {
      const res = await fetch("/api/ingest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          text: text.trim(), 
          collectionName: target 
        }),
      });

      if (res.ok) {
        setStatus({ type: 'success', msg: `成功存入 [${target}] 库！` });
        setText(""); // 清空输入框
      } else {
        throw new Error("录入失败");
      }
    } catch (error) {
      setStatus({ type: 'error', msg: "录入失败，请确保 Chroma 和 Ollama 已启动。" });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-10 text-black">
      <div className="max-w-3xl mx-auto space-y-6">
        
        {/* 顶部导航 */}
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-blue-600 hover:underline">
            <ChevronLeft size={20} /> 返回聊天
          </Link>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Database className="text-blue-500" /> 知识库管理后台
          </h1>
        </div>

        <div className="bg-white rounded-xl shadow-sm border p-6 space-y-6">
          {/* 选择库 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">选择存储目标 (Collection)</label>
            <select 
              value={target} 
              onChange={(e) => setTarget(e.target.value)}
              className="w-full p-3 border rounded-lg bg-gray-50 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            >
              <option value="diary_assistant">📔 个人日记库 (Diary)</option>
              <option value="my_3d_knowledge">🧊 3D 指令库 (Three.js Docs)</option>
              <option value="general_knowledge">🌐 通用百科库 (General)</option>
            </select>
            <p className="mt-2 text-xs text-gray-400">
              * 不同类型的知识存入对应的库，AI 检索时会更加精准。
            </p>
          </div>

          {/* 输入框 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">录入内容</label>
            <textarea
              className="w-full h-64 p-4 border rounded-lg bg-gray-50 focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none"
              placeholder="在这里输入你想让 AI 记住的内容..."
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
          </div>

          {/* 按钮与状态 */}
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="flex items-center gap-2">
              {status.type === 'success' && <CheckCircle2 className="text-green-500" size={20} />}
              {status.type === 'error' && <AlertCircle className="text-red-500" size={20} />}
              <span className={`text-sm ${
                status.type === 'success' ? 'text-green-600' : 
                status.type === 'error' ? 'text-red-600' : 'text-gray-500'
              }`}>
                {status.msg}
              </span>
            </div>
            
            <button 
              onClick={handleIngest}
              disabled={status.type === 'loading' || !text.trim()}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-bold text-white transition-all ${
                status.type === 'loading' || !text.trim() 
                ? 'bg-gray-300 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700 shadow-md active:scale-95'
              }`}
            >
              {status.type === 'loading' ? '处理中...' : <><Send size={18} /> 存入数据库</>}
            </button>
          </div>
        </div>

        {/* 使用提示 */}
        <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 text-sm text-blue-800">
          <strong>💡 小技巧：</strong> 
          为了获得最佳效果，建议每次录入的内容不要太长（建议 500 字以内）。如果是长文章，可以分多次录入，或者在内容中明确包含日期和关键词。
        </div>
      </div>
    </div>
  );
}