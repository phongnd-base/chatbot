"use client";

import { useEffect, useMemo, useState } from "react";
import { ChatHeader } from "@/components/chat/ChatHeader";
import { ChatMessages } from "@/components/chat/ChatMessages";
import { ChatInput } from "@/components/chat/ChatInput";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt?: string;
};

type SessionDetail = {
  id: string;
  model?: string;
  provider?: "OPENAI" | "GOOGLE" | "ANTHROPIC";
};

type ModelInfo = {
  id: string;
  label?: string;
  provider: "OPENAI" | "GOOGLE" | "ANTHROPIC";
};

type ProviderModels = {
  provider: "OPENAI" | "GOOGLE" | "ANTHROPIC";
  models: ModelInfo[];
};

const PROVIDERS = [
  { value: "OPENAI", label: "OpenAI" },
  { value: "GOOGLE", label: "Google" },
  { value: "ANTHROPIC", label: "Anthropic" },
];

export default function ChatSessionPage({
  params,
}: {
  params: { sessionId: string };
}) {
  const { sessionId } = params;
  const [messages, setMessages] = useState<Message[]>([]);
  const [sessionDetail, setSessionDetail] = useState<SessionDetail | null>(null);
  const [modelsByProvider, setModelsByProvider] = useState<ProviderModels[] | null>(null);

  // Get current provider's models
  const currentProviderModels = useMemo(() => {
    if (!modelsByProvider) return [] as ModelInfo[];
    const provider = sessionDetail?.provider || "OPENAI";
    return modelsByProvider.find((p) => p.provider === provider)?.models ?? [];
  }, [modelsByProvider, sessionDetail?.provider]);

  // Fetch session details
  useEffect(() => {
    (async () => {
      const res = await fetch(`/api/bff/sessions/${sessionId}`);
      if (res.ok) setSessionDetail(await res.json());
    })();
  }, [sessionId]);

  // Fetch message history
  useEffect(() => {
    (async () => {
      const res = await fetch(`/api/bff/messages/${sessionId}`);
      if (res.ok) setMessages(await res.json());
    })();
  }, [sessionId]);

  // Load available models
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`/api/bff/ai/models`);
        if (res.ok) {
          const json = await res.json();
          setModelsByProvider(json.modelsByProvider || null);
        }
      } catch (error) {
        console.error("Failed to load models:", error);
      }
    })();
  }, []);

  // Handle provider change
  const handleProviderChange = async (provider: string) => {
    setSessionDetail((prev) =>
      prev ? { ...prev, provider: provider as any, model: "" } : prev
    );

    await fetch(`/api/bff/sessions/${sessionId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ provider, model: "" }),
    });
  };

  // Handle model change
  const handleModelChange = async (model: string) => {
    setSessionDetail((prev) => (prev ? { ...prev, model } : prev));

    await fetch(`/api/bff/sessions/${sessionId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ model }),
    });
  };

  // Stream message via HTTP
  const streamMessage = async (prompt: string) => {
    // Add user message optimistically
    const tempUserId = `tmp_user_${Date.now()}`;
    setMessages((prev) => [
      ...prev,
      { id: tempUserId, role: "user", content: prompt },
    ]);

    // Add placeholder for assistant response
    const tempAssistantId = `tmp_assistant_${Date.now()}`;
    setMessages((prev) => [
      ...prev,
      { id: tempAssistantId, role: "assistant", content: "" },
    ]);

    const res = await fetch(`/api/bff/messages/stream`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId, prompt }),
    });

    if (!res.ok || !res.body) {
      // Fallback: refresh history
      const list = await fetch(`/api/bff/messages/${sessionId}`);
      if (list.ok) setMessages(await list.json());
      return;
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    let finalId: string | null = null;

    try {
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        let idx: number;

        while ((idx = buffer.indexOf("\n")) !== -1) {
          const line = buffer.slice(0, idx).trim();
          buffer = buffer.slice(idx + 1);
          if (!line) continue;

          try {
            const obj = JSON.parse(line);
            if (obj.delta !== undefined) {
              const delta = String(obj.delta);
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === tempAssistantId
                    ? { ...m, content: (m.content || "") + delta }
                    : m
                )
              );
            }
            if (obj.done) {
              finalId = obj.messageId || null;
            }
          } catch {
            // Ignore malformed line
          }
        }
      }
    } finally {
      reader.releaseLock();
    }

    // Update with final ID
    if (finalId) {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === tempAssistantId ? { ...m, id: finalId as string } : m
        )
      );
    }

    // Sync with server
    const syncRes = await fetch(`/api/bff/messages/${sessionId}`);
    if (syncRes.ok) setMessages(await syncRes.json());
  };

  return (
    <div className="h-full flex flex-col bg-neutral-50 dark:bg-neutral-900">
      <ChatHeader
        provider={sessionDetail?.provider || "OPENAI"}
        model={sessionDetail?.model || ""}
        availableProviders={PROVIDERS}
        availableModels={currentProviderModels}
        onProviderChange={handleProviderChange}
        onModelChange={handleModelChange}
        isLoadingModels={!modelsByProvider}
      />

      <ChatMessages messages={messages} />

      <ChatInput
        onSend={streamMessage}
        modelSelected={!!sessionDetail?.model}
      />
    </div>
  );
}
