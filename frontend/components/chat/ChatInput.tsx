"use client";

import React, { useState } from "react";
import { Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

type ChatInputProps = {
  onSend: (message: string) => Promise<void>;
  disabled?: boolean;
  placeholder?: string;
  modelSelected: boolean;
};

export function ChatInput({
  onSend,
  disabled = false,
  placeholder = "Send a message...",
  modelSelected,
}: ChatInputProps) {
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim() || isLoading || !modelSelected) return;

    setIsLoading(true);
    const message = input;
    setInput("");

    try {
      await onSend(message);
    } catch (error) {
      console.error("Failed to send message:", error);
      setInput(message); // Restore input on error
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="border-t border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950">
      <div className="max-w-3xl mx-auto px-4 py-4">
        {/* Input Area */}
        <div className="flex items-end gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled || isLoading || !modelSelected}
            rows={1}
            className="flex-1 resize-none rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-4 py-3 text-sm text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-500 dark:placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all max-h-32 overflow-y-auto"
            style={{
              minHeight: "44px",
              height: "auto",
            }}
            onInput={(e) => {
              const target = e.target as HTMLTextAreaElement;
              target.style.height = "44px";
              target.style.height = `${Math.min(target.scrollHeight, 128)}px`;
            }}
          />

          <Button
            onClick={handleSend}
            disabled={!input.trim() || disabled || isLoading || !modelSelected}
            size="icon"
            className="h-11 w-11 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </Button>
        </div>

        {/* Helper Text */}
        <div className="mt-2 text-xs text-neutral-500 dark:text-neutral-400 text-center">
          {!modelSelected ? (
            <span className="text-amber-600 dark:text-amber-400 font-medium">
              ⚠️ Select a model to start chatting
            </span>
          ) : (
            <>
              <kbd className="px-1.5 py-0.5 rounded bg-neutral-200 dark:bg-neutral-800 font-mono text-[10px]">
                Shift + Enter
              </kbd>
              {" "}for new line •{" "}
              <kbd className="px-1.5 py-0.5 rounded bg-neutral-200 dark:bg-neutral-800 font-mono text-[10px]">
                Enter
              </kbd>
              {" "}to send
            </>
          )}
        </div>
      </div>
    </div>
  );
}
