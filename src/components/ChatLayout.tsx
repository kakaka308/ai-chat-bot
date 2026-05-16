// src/components/ChatLayout.tsx
"use client";

import { useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { ChatInterface } from "@/components/ChatInterface";

export interface SessionSummary {
  _id: string;
  userId: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messageCount: number;
}

interface ChatLayoutProps {
  initialSessions: SessionSummary[];
}

export function ChatLayout({ initialSessions }: ChatLayoutProps) {
  const [sessions, setSessions] = useState<SessionSummary[]>(initialSessions);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className="flex h-screen">
      {/* 侧边栏 */}
      {isSidebarOpen && (
        <Sidebar
          sessions={sessions}
          activeSessionId={activeSessionId}
          onSelectSession={setActiveSessionId}
          onDeleteSession={(id) => {
            setSessions(prev => prev.filter(s => s._id !== id));
          }}
        />
      )}
      
      {/* 主聊天区域 */}
      <div className="flex-1 flex flex-col">
        <ChatInterface 
          sessionId={activeSessionId}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        />
      </div>
    </div>
  );
}
