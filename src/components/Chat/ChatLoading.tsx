"use client";

import { Loader2 } from "lucide-react";

export const ChatLoading = () => {
  return (
    // AI 正在思考时的加载动画
    <div className='flex justify-start'>
      <div className='bg-white p-3 rounded-lg flex items-center gap-2 shadow-sm text-gray-500'>
        <Loader2 size={18} className='animate-spin' />
        <span>AI 正在思考……</span>
      </div>
    </div>
  );
};