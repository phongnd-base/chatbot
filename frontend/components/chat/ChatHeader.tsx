"use client";

import React from "react";

type ChatHeaderProps = {
  provider: string;
  model: string;
  availableProviders: Array<{ value: string; label: string }>;
  availableModels: Array<{ id: string; label?: string }>;
  onProviderChange: (provider: string) => void;
  onModelChange: (model: string) => void;
  isLoadingModels: boolean;
};

export function ChatHeader({
  provider,
  model,
  availableProviders,
  availableModels,
  onProviderChange,
  onModelChange,
  isLoadingModels,
}: ChatHeaderProps) {
  return (
    <header className="h-14 flex items-center justify-between px-6 border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950">
      <h1 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
        Chat
      </h1>
      
      <div className="flex items-center gap-3">
        {/* Provider Selector */}
        <select
          value={provider}
          onChange={(e) => onProviderChange(e.target.value)}
          className="px-3 py-1.5 text-sm rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
        >
          {availableProviders.map((p) => (
            <option key={p.value} value={p.value}>
              {p.label}
            </option>
          ))}
        </select>

        {/* Model Selector */}
        <select
          value={model}
          onChange={(e) => onModelChange(e.target.value)}
          disabled={isLoadingModels || availableModels.length === 0}
          className="min-w-[200px] px-3 py-1.5 text-sm rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <option value="" disabled>
            {isLoadingModels ? "Loading models..." : "Select a model"}
          </option>
          {availableModels.map((m) => (
            <option key={m.id} value={m.id}>
              {m.label || m.id}
            </option>
          ))}
        </select>
      </div>
    </header>
  );
}
