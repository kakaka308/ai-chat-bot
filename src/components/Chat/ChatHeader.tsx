"use client";

import Link from "next/link";
import { Settings, MessageSquare, PanelLeft } from "lucide-react";

interface ChatHeaderProps {
  onToggleSidebar?: () => void;
}

export const ChatHeader = ({ onToggleSidebar }: ChatHeaderProps) => {
  return (
    <header className="bg-white border-b shadow-sm">
      <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {onToggleSidebar && (
            <button
              onClick={onToggleSidebar}
              className="p-1.5 rounded-md hover:bg-gray-100 text-gray-600 transition-colors"
              title="切换侧边栏"
            >
              <PanelLeft size={20} />
            </button>
          )}
          <div className="flex items-center gap-2 text-blue-600">
            <MessageSquare size={20} />
            <span className="font-bold tracking-widest text-sm hidden sm:inline">
              A I C H A T B O T
            </span>
          </div>
        </div>
        <h1 className="font-bold text-gray-800 absolute left-1/2 -translate-x-1/2">
          智 能 助 手
        </h1>
        <nav className="flex items-center gap-4">
          <Link 
            href="/admin" 
            className="flex items-center gap-1 text-sm text-gray-600 hover:text-blue-500 transition-colors py-1 px-2 rounded-md hover:bg-gray-100"
            title="管理后台"
          >
            <Settings size={18} />
            <span className="hidden md:inline">知识库管理</span>
          </Link>
        </nav>
      </div>
    </header>
  );
};