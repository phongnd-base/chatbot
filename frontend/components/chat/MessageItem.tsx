"use client";

import React from "react";
import { User, Bot } from "lucide-react";

type MessageItemProps = {
  message: {
    id: string;
    role: "user" | "assistant";
    content: string;
  };
};

export function MessageItem({ message }: MessageItemProps) {
  const isUser = message.role === "user";

  return (
    <div className={`flex gap-4 ${isUser ? "flex-row-reverse" : "flex-row"}`}>
      {/* Avatar */}
      <div
        className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
          isUser
            ? "bg-gradient-to-br from-purple-500 to-pink-500"
            : "bg-gradient-to-br from-emerald-500 to-teal-500"
        }`}
      >
        {isUser ? (
          <User className="w-5 h-5 text-white" />
        ) : (
          <Bot className="w-5 h-5 text-white" />
        )}
      </div>

      {/* Message Content */}
      <div className={`flex-1 max-w-[80%] ${isUser ? "text-right" : "text-left"}`}>
        <div
          className={`inline-block px-4 py-3 rounded-2xl ${
            isUser
              ? "bg-gradient-to-br from-purple-600 to-pink-600 text-white"
              : "bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
          }`}
        >
          <div className="text-sm whitespace-pre-wrap break-words">
            {message.content}
          </div>
        </div>
      </div>
    </div>
  );
}
