// src/components/Sidebar.tsx
"use client";

import { SessionSummary } from "@/components/ChatLayout";
import { formatDistanceToNow } from "date-fns";
import { zhCN } from "date-fns/locale";

interface SidebarProps {
  sessions: SessionSummary[];
  activeSessionId: string | null;
  onSelectSession: (id: string) => void;
  onDeleteSession: (id: string) => void;
}

export function Sidebar({ sessions, activeSessionId, onSelectSession, onDeleteSession }: SidebarProps) {
  return (
    <div className="w-64 bg-gray-900 text-white flex flex-col h-full">
      {/* 顶部标题 */}
      <div className="p-4 border-b border-gray-700">
        <h2 className="text-xl font-bold">聊天记录</h2>
        <button 
          className="mt-2 w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded"
          onClick={() => {
            // TODO: 创建新会话
          }}
        >
          + 新建聊天
        </button>
      </div>

      {/* Sessions 列表 */}
      <div className="flex-1 overflow-y-auto">
        {sessions.length === 0 ? (
          <div className="p-4 text-gray-400 text-center">
            暂无聊天记录
          </div>
        ) : (
          <ul className="p-2 space-y-1">
            {sessions.map((session) => (
              <li key={session._id}>
                <div
                  className={`group flex items-center justify-between p-3 rounded-lg cursor-pointer hover:bg-gray-800 ${
                    activeSessionId === session._id ? "bg-gray-800" : ""
                  }`}
                  onClick={() => onSelectSession(session._id)}
                >
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">
                      {session.title}
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      {formatDistanceToNow(new Date(session.updatedAt), {
                        addSuffix: true,
                        locale: zhCN,
                      })}
                    </div>
                  </div>
                  
                  {/* 删除按钮 */}
                  <button
                    className="opacity-0 group-hover:opacity-100 ml-2 p-1 hover:bg-gray-700 rounded"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteSession(session._id);
                    }}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
