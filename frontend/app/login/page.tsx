"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { authService, sessionService } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const sp = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sessionExpired, setSessionExpired] = useState(false);

  // Check if session expired
  useEffect(() => {
    if (sp.get("expired") === "1") {
      setSessionExpired(true);
      setError("Your session has expired. Please login again.");
    }
  }, [sp]);

  // If redirected back with tokens (e.g., Google OAuth), set httpOnly cookies and bounce
  useEffect(() => {
    const at = sp.get("accessToken");
    const rt = sp.get("refreshToken");
    if (at) {
      authService.setTokens({ 
        accessToken: at, 
        refreshToken: rt || undefined 
      }).finally(async () => {
        const from = sp.get("from");
        if (from && from.startsWith("/")) {
          window.location.href = from;
          return;
        }
        // No `from`: create a new session and go to chat
        try {
          const newSession = await sessionService.createSession({ title: "New Chat" });
          window.location.href = `/chat/${newSession.id}`;
          return;
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
      const tokens = await authService.login({ email, password });
      await authService.setTokens(tokens);
      
      const from = sp.get("from");
      if (from && from.startsWith("/")) {
        window.location.href = from;
      } else {
        // No `from`: create a new session and go to chat
        try {
          const newSession = await sessionService.createSession({ title: "New Chat" });
          window.location.href = `/chat/${newSession.id}`;
          return;
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
    window.location.href = authService.getGoogleAuthUrl();
  }

  return (
    <div className="h-full flex items-center justify-center bg-zinc-50 dark:bg-zinc-950 px-4 py-8">
      <div className="w-full max-w-sm space-y-4">
        {sessionExpired && (
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-amber-600 dark:text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
                Session Expired
              </p>
            </div>
            <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
              Your session has expired. Please login again to continue.
            </p>
          </div>
        )}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-6 shadow-sm">
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
        <div className="text-center text-sm text-zinc-600 dark:text-zinc-300">
          New here? <a href="/register" className="text-emerald-600 hover:underline">Create an account</a>
        </div>
      </div>
    </div>
  );
}
