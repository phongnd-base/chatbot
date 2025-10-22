"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001";

export default function LoginPage() {
  const router = useRouter();
  const sp = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // If redirected back with tokens (e.g., Google OAuth), set httpOnly cookies and bounce
  useEffect(() => {
    const at = sp.get("accessToken");
    const rt = sp.get("refreshToken");
    if (at) {
      fetch("/api/auth/set-tokens", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accessToken: at, refreshToken: rt || undefined }),
      }).finally(async () => {
        const from = sp.get("from");
        if (from && from.startsWith("/")) {
          // Hard navigation to ensure cookie is sent and middleware sees it
          window.location.href = from;
          return;
        }
        // No `from`: create a new session and go to chat
        try {
          const res = await fetch(`/api/bff/sessions`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ title: "New Chat" }),
          });
          if (res.ok) {
            const json = await res.json();
            window.location.href = `/chat/${json.id}`;
            return;
          }
        } catch {}
        // Fallback
        window.location.href = "/";
      });
    }
  }, [sp, router]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) throw new Error("Invalid credentials");
      const json = await res.json();
      await fetch("/api/auth/set-tokens", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accessToken: json.accessToken, refreshToken: json.refreshToken }),
      });
      const from = sp.get("from");
      if (from && from.startsWith("/")) {
        window.location.href = from;
      } else {
        // No `from`: create a new session and go to chat
        try {
          const rs = await fetch(`/api/bff/sessions`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ title: "New Chat" }),
          });
          if (rs.ok) {
            const j = await rs.json();
            window.location.href = `/chat/${j.id}`;
            return;
          }
        } catch {}
        router.replace("/");
      }
    } catch (err: any) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  function goGoogle() {
    // Simple redirect to backend Google OAuth endpoint
    window.location.href = `${API_BASE}/auth/google`;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950 px-4">
      <div className="w-full max-w-sm bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-6 shadow-sm">
        <h1 className="text-xl font-semibold mb-4">Sign in</h1>
        <form onSubmit={submit} className="space-y-3">
          <div>
            <label className="block text-sm text-zinc-600 dark:text-zinc-300 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm text-zinc-600 dark:text-zinc-300 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-500"
              required
            />
          </div>
          {error && <div className="text-sm text-red-600">{error}</div>}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-md px-4 py-2"
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>
        <div className="my-4 h-px bg-zinc-200 dark:bg-zinc-800" />
        <button
          onClick={goGoogle}
          className="w-full bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-zinc-800 dark:text-zinc-100 rounded-md px-4 py-2 hover:bg-zinc-50 dark:hover:bg-zinc-800/80"
        >
          Continue with Google
        </button>
      </div>
      <div className="mt-4 text-sm text-zinc-600 dark:text-zinc-300">
        New here? <a href="/register" className="text-emerald-600 hover:underline">Create an account</a>
      </div>
    </div>
  );
}
