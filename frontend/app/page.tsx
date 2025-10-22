"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001";

export default function HomePage() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [authed, setAuthed] = useState<boolean>(false);

  useEffect(() => {
    // Handle Google redirect tokens in URL (e.g., /?accessToken=...&refreshToken=...)
    try {
      const sp = new URLSearchParams(window.location.search);
      const at = sp.get("accessToken");
      const rt = sp.get("refreshToken");
      if (at) {
        localStorage.setItem("accessToken", at);
        if (rt) localStorage.setItem("refreshToken", rt);
        // Clean URL
        router.replace("/");
        return;
      }
    } catch {}

    // Fallback localStorage check (until we fully migrate to httpOnly cookie guard everywhere)
    const token = localStorage.getItem("accessToken");
    setAuthed(!!token);
  }, [router]);

  async function newChat() {
    setBusy(true);
    const res = await fetch(`/api/bff/sessions`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ title: "New Chat" }) });
    const json = await res.json();
    localStorage.setItem("sessionId", json.id);
    router.replace(`/chat/${json.id}`);
  }

  function signIn() {
    router.push("/login");
  }

  function signOut() {
    fetch('/api/auth/clear-tokens', { method: 'POST' }).finally(() => setAuthed(false));
  }

  return (
    <div className="h-screen flex items-center justify-center bg-gradient-to-b from-emerald-50 to-white dark:from-zinc-950 dark:to-zinc-900">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-semibold">Chatbot</h1>
        <p className="text-zinc-600 dark:text-zinc-400">
          {authed ? "Start a new conversation" : "Sign in to start chatting"}
        </p>
        {authed ? (
          <div className="flex items-center gap-3 justify-center">
            <button onClick={newChat} disabled={busy} className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded px-4 py-2">New Chat</button>
            <button onClick={signOut} className="bg-zinc-200 hover:bg-zinc-300 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-900 dark:text-zinc-100 rounded px-4 py-2">Sign out</button>
          </div>
        ) : (
          <button onClick={signIn} className="bg-zinc-900 hover:bg-black text-white rounded px-4 py-2">Sign in</button>
        )}
      </div>
    </div>
  );
}
