"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSidebarStore } from "@/store/sidebarStore";
import { useChatStore } from "@/store/chatStore";

export default function NewChatPage() {
  const router = useRouter();
  const addSession = useSidebarStore((state) => state.addSession);
  const setActive = useChatStore((state) => state.setActive);

  useEffect(() => {
    // Create new session
    const newSession = {
      id: crypto.randomUUID(),
      name: "New Chat",
      folderId: null,
    };
    
    addSession(newSession);
    setActive(newSession.id);
    
    // Redirect to the new chat
    router.push(`/chat/${newSession.id}`);
  }, [addSession, setActive, router]);

  return (
    <div className="h-full flex items-center justify-center">
      <div className="text-neutral-400">Creating new chat...</div>
    </div>
  );
}
