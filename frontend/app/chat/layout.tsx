"use client";

import { Sidebar } from "@/components/sidebar/Sidebar";
import { useSessions, useFolders } from "@/hooks";

export default function ChatLayout({ children }: { children: React.ReactNode }) {
  // Fetch sessions and folders once at layout level
  useSessions();
  useFolders();

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-hidden">{children}</main>
    </div>
  );
}
