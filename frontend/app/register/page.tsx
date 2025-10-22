"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { authService, sessionService } from "@/lib/api";

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      // Register
      await authService.register({ email, password });
      
      // Auto-login after registration
      const tokens = await authService.login({ email, password });
      await authService.setTokens(tokens);
      
      // Create first session and redirect
      try {
        const newSession = await sessionService.createSession({ title: "New Chat" });
        window.location.href = `/chat/${newSession.id}`;
      } catch {
        router.replace("/");
      }
    } catch (err: any) {
      setError(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950 px-4">
      <div className="w-full max-w-sm bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-6 shadow-sm">
        <h1 className="text-xl font-semibold mb-4">Create account</h1>
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
            {loading ? "Creating…" : "Create account"}
          </button>
        </form>
        <div className="mt-4 text-sm text-zinc-600 dark:text-zinc-300">
          Already have an account? <a href="/login" className="text-emerald-600 hover:underline">Sign in</a>
        </div>
      </div>
    </div>
  );
}
