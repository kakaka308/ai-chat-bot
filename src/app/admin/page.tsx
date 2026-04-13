// src/app/admin/page.tsx (部分核心代码)
"use client";
import { useState, useRef } from "react";
import { Upload, FileText, CheckCircle, MessageSquare} from "lucide-react";
import Link from "next/link";
export default function AdminPage() {
  const [file, setFile] = useState<File | null>(null);
  const [text, setText] = useState("");
  const [target, setTarget] = useState("diary_assistant");
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async () => {
    setLoading(true);
    const formData = new FormData();
    if (file) formData.append("file", file);
    if (text) formData.append("text", text);
    formData.append("collectionName", target);

    try {
      const res = await fetch("/api/ingest", { method: "POST", body: formData });
      if (res.ok) {
        alert("录入成功！");
        setFile(null);
        setText("");
      }
    } catch (e) {
      alert("上传失败");
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6 text-black">
      <h1 className="text-2xl font-bold">知识库录入后台</h1>
      <nav className="flex items-center gap-4">
        <Link href="/" className="flex items-center gap-1 text-sm text-gray-600 hover:text-blue-500 transition-colors py-1 px-2 rounded-md hover:bg-gray-100">
          <MessageSquare size={18} />
          <span className="hidden md:inline">返回聊天</span>
        </Link>
      </nav>
      <div className="grid grid-cols-2 gap-6">
        {/* 左侧：文件上传区 */}
        <div 
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-blue-200 rounded-xl p-10 flex flex-col items-center justify-center cursor-pointer hover:bg-blue-50 transition-all"
        >
          <input 
            type="file" 
            ref={fileInputRef} 
            hidden 
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            accept=".txt,.md,.pdf"
          />
          <Upload className="text-blue-400 mb-2" size={40} />
          <p className="text-sm text-gray-600">{file ? file.name : "点击或拖拽上传文件 (.pdf, .txt, .md)"}</p>
        </div>

        {/* 右侧：手动输入区 */}
        <textarea
          className="border rounded-xl p-4 h-40 focus:ring-2 focus:ring-blue-400 outline-none"
          placeholder="或者在这里直接粘贴文本内容..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
      </div>

      <div className="flex items-center gap-4">
        <select 
          value={target} 
          onChange={(e) => setTarget(e.target.value)}
          className="border p-2 rounded-lg flex-1"
        >
          <option value="diary_assistant"> 个人日记库</option>
          <option value="my_3d_knowledge">3D 指令库</option>
          <option value="general_knowledge"> 通用百科</option>
        </select>
        
        <button 
          onClick={handleUpload}
          disabled={loading || (!file && !text)}
          className="bg-blue-600 text-white px-8 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
        >
          {loading ? "正在录入知识..." : "立即同步到向量库"}
        </button>
      </div>
    </div>
  );
}