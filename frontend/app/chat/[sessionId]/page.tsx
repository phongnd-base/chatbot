"use client";

import { useState, useCallback } from "react";
import { ChatHeader } from "@/components/chat/ChatHeader";
import { ChatMessages } from "@/components/chat/ChatMessages";
import { ChatInput } from "@/components/chat/ChatInput";
import { useSession, useMessages, useModels, useProviderModels, useChatStream } from "@/hooks";
import type { Provider } from "@/lib/api";

const PROVIDERS = [
  { value: "OPENAI" as Provider, label: "OpenAI" },
  { value: "GOOGLE" as Provider, label: "Google" },
  { value: "ANTHROPIC" as Provider, label: "Anthropic" },
];

export default function ChatSessionPage({
  params,
}: {
  params: { sessionId: string };
}) {
  const { sessionId } = params;

  // Hooks for data management
  const { session, updateSession } = useSession(sessionId);
  const { messages, addMessage, updateMessage, replaceMessageId, refetch: refetchMessages } = useMessages(sessionId);
  const { modelsByProvider, loading: modelsLoading } = useModels();

  // Get models for current provider
  const currentProviderModels = useProviderModels(
    session?.provider || "OPENAI",
    modelsByProvider
  );

  // Streaming functionality
  const { streamMessage } = useChatStream({
    sessionId,
    onMessageUpdate: (id, updates) => {
      updateMessage(id, {
        content: updates.content
          ? (messages.find((m) => m.id === id)?.content || "") + updates.content
          : undefined,
      });
    },
    onMessageComplete: (tempId, finalId) => {
      replaceMessageId(tempId, finalId);
      refetchMessages();
    },
    onError: (error) => {
      console.error("Stream error:", error);
      refetchMessages();
    },
  });

  // Handle provider change
  const handleProviderChange = useCallback(
    async (provider: string) => {
      await updateSession({ provider: provider as Provider, model: "" });
    },
    [updateSession]
  );

  // Handle model change
  const handleModelChange = useCallback(
    async (model: string) => {
      await updateSession({ model });
    },
    [updateSession]
  );

  // Handle send message
  const handleSendMessage = useCallback(
    async (prompt: string) => {
      if (!session?.model) return;

      // Add user message
      const tempUserId = `tmp_user_${Date.now()}`;
      addMessage({
        id: tempUserId,
        role: "user",
        content: prompt,
      });

      // Add placeholder assistant message
      const tempAssistantId = `tmp_assistant_${Date.now()}`;
      addMessage({
        id: tempAssistantId,
        role: "assistant",
        content: "",
      });

      // Start streaming
      await streamMessage(prompt, tempAssistantId);
    },
    [session?.model, addMessage, streamMessage]
  );

  return (
    <div className="h-full flex flex-col bg-neutral-50 dark:bg-neutral-900">
      <ChatHeader
        provider={session?.provider || "OPENAI"}
        model={session?.model || ""}
        availableProviders={PROVIDERS}
        availableModels={currentProviderModels}
        onProviderChange={handleProviderChange}
        onModelChange={handleModelChange}
        isLoadingModels={modelsLoading}
      />

      <ChatMessages messages={messages} />

      <ChatInput
        onSend={handleSendMessage}
        modelSelected={!!session?.model}
      />
    </div>
  );
}
