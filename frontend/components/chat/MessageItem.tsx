"use client";
import React from "react";
import { Streamdown } from 'streamdown';
import clsx from "clsx";

export type Message = { id: string; role: "user" | "assistant"; content: string };

export function MessageItem({ message }: { message: Message }) {
  return (
    <div
      className={clsx(
        "rounded-lg px-4 py-3",
        message.role === "user"
          ? "bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800"
          : "bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-900/40"
      )}
    >
      <div className="text-xs uppercase tracking-wide mb-1 text-zinc-500">{message.role}</div>
      <div className="prose prose-zinc dark:prose-invert max-w-none">
		<Streamdown>{message.content || ""}</Streamdown>
      </div>
    </div>
  );
}
