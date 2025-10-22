"use client";
import React from "react";

export type Session = { id: string; title: string; isFavorite?: boolean };

export function SessionItem({ session, active, onClick }: { session: Session; active?: boolean; onClick?: (id: string) => void }) {
  return (
    <button
      onClick={() => onClick?.(session.id)}
      className={
        "w-full text-left px-3 py-2 rounded border flex items-center justify-between " +
        (active ? "bg-emerald-100 dark:bg-emerald-900/30 border-emerald-300 dark:border-emerald-800" : "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800")
      }
    >
      <span className="truncate text-sm text-zinc-800 dark:text-zinc-100">{session.title || "Untitled"}</span>
      {session.isFavorite ? <span aria-label="favorite">⭐</span> : null}
    </button>
  );
}
