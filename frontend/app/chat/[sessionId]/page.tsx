"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { MessageItem } from "../../../components/chat/MessageItem";
import { SessionItem } from "../../../components/chat/SessionItem";

type Msg = { id: string; role: "user" | "assistant"; content: string; createdAt?: string };
type Sess = { id: string; title: string; isFavorite?: boolean; model?: string; provider?: 'OPENAI' | 'GOOGLE' | 'ANTHROPIC' };
type SessionDetail = Sess & { id: string; model?: string; provider?: 'OPENAI' | 'GOOGLE' | 'ANTHROPIC' };
type ModelInfo = { id: string; label?: string; provider: 'OPENAI' | 'GOOGLE' | 'ANTHROPIC' };
type ProviderModels = { provider: 'OPENAI' | 'GOOGLE' | 'ANTHROPIC'; models: ModelInfo[] };

export default function ChatSessionPage({ params }: { params: { sessionId: string } }) {
	const { sessionId } = params;
	const [messages, setMessages] = useState<Msg[]>([]);
	const [input, setInput] = useState("");
	const [loading, setLoading] = useState(false);
	const bottomRef = useRef<HTMLDivElement | null>(null);
	const [sessions, setSessions] = useState<Sess[]>([]);
		const [sessionDetail, setSessionDetail] = useState<SessionDetail | null>(null);
	const [modelsByProvider, setModelsByProvider] = useState<ProviderModels[] | null>(null);
	const currentProviderModels = useMemo(() => {
		if (!modelsByProvider) return [] as ModelInfo[];
		const prov = sessionDetail?.provider || 'OPENAI';
		return modelsByProvider.find(p => p.provider === prov)?.models ?? [];
	}, [modelsByProvider, sessionDetail?.provider]);

	// Auto scroll on new messages
	useEffect(() => {
		bottomRef.current?.scrollIntoView({ behavior: "smooth" });
	}, [messages]);

	// Fetch history using BFF (cookie-auth)
	useEffect(() => {
		(async () => {
			const res = await fetch(`/api/bff/messages/${sessionId}`);
			if (res.ok) setMessages(await res.json());
		})();
			(async () => {
				const r = await fetch(`/api/bff/sessions/${sessionId}`);
				if (r.ok) setSessionDetail(await r.json());
			})();
	}, [sessionId]);

	// Load curated models list
	useEffect(() => {
		(async () => {
			try {
				const r = await fetch(`/api/bff/ai/models`);
				if (r.ok) {
					const json = await r.json();
					setModelsByProvider(json.modelsByProvider || null);
				}
			} catch {}
		})();
	}, []);

	// Fetch sessions for sidebar
	useEffect(() => {
		(async () => {
			const res = await fetch(`/api/bff/sessions`);
			if (res.ok) setSessions(await res.json());
		})();
	}, []);

	// HTTP streaming helper (NDJSON over POST via BFF)
	async function streamViaHttp(prompt: string) {
		// Create placeholder assistant message locally
		const tempAssistantId = `tmp_assistant_${Date.now()}`;
		setMessages((prev) => [...prev, { id: tempAssistantId, role: "assistant", content: "" } as any]);

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
								prev.map((m) => (m.id === tempAssistantId ? { ...m, content: (m.content || "") + delta } : m))
							);
						}
						if (obj.done) {
							finalId = obj.messageId || null;
						}
					} catch {
						// ignore malformed line
					}
				}
			}
		} finally {
			reader.releaseLock();
		}

		if (finalId) {
			setMessages((prev) => prev.map((m) => (m.id === tempAssistantId ? { ...m, id: finalId as string } : m)));
		}

		const syncRes = await fetch(`/api/bff/messages/${sessionId}`);
		if (syncRes.ok) setMessages(await syncRes.json());
	}

	async function send() {
		if (!input.trim()) return;
		// Require a model to be selected before sending
		if (!sessionDetail?.model) {
			return;
		}
		setLoading(true);
		const prompt = input;
		setInput("");
		// Optimistically show user's message
		const tempUserId = `tmp_user_${Date.now()}`;
		setMessages((prev) => [...prev, { id: tempUserId, role: "user", content: prompt } as any]);
		await streamViaHttp(prompt);
		setLoading(false);
	}

	async function newSession() {
		const res = await fetch(`/api/bff/sessions`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ title: "New Chat" }),
		});
		if (!res.ok) return;
		const json = await res.json();
		window.location.href = `/chat/${json.id}`;
	}

	function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
		if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault();
			if (!loading) void send();
		}
	}

	return (
		<div className="flex h-full w-full bg-zinc-50 dark:bg-zinc-950">
			{/* Sidebar */}
			<aside className="hidden md:flex md:w-64 flex-col border-r border-zinc-200 dark:border-zinc-800 p-4 gap-2">
				<button onClick={newSession} className="bg-emerald-600 hover:bg-emerald-700 text-white rounded px-3 py-2 text-sm">New Chat</button>
				<div className="text-xs text-zinc-500">Sessions</div>
				<div className="flex-1 overflow-auto text-sm text-zinc-700 dark:text-zinc-300 space-y-2">
					{sessions.map((s) => (
						<SessionItem key={s.id} session={s} active={s.id === sessionId} onClick={(id: string) => (window.location.href = `/chat/${id}`)} />
					))}
				</div>
			</aside>

			{/* Main */}
			<main className="flex-1 flex flex-col">
				{/* Header */}
						<div className="h-14 flex items-center justify-between px-4 border-b border-zinc-200 dark:border-zinc-800 gap-3">
							<div className="font-medium">Chat</div>
							<div className="flex items-center gap-2 text-xs text-zinc-700 dark:text-zinc-300">
								<select
									className="border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 rounded px-2 py-1 text-sm"
									value={sessionDetail?.provider || 'OPENAI'}
									onChange={async (e) => {
										const provider = e.target.value as 'OPENAI' | 'GOOGLE' | 'ANTHROPIC';
										setSessionDetail((s) => (s ? { ...s, provider, model: '' } : s));
										// clear model when provider changes
										await fetch(`/api/bff/sessions/${sessionId}`, {
											method: 'PATCH',
											headers: { 'Content-Type': 'application/json' },
											body: JSON.stringify({ provider, model: '' }),
										});
									}}
								>
									<option value="OPENAI">OpenAI</option>
									<option value="GOOGLE">Google</option>
									<option value="ANTHROPIC">Anthropic</option>
								</select>
								<select
									className="w-56 border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 rounded px-2 py-1 text-sm"
									value={sessionDetail?.model || ''}
									onChange={async (e) => {
										const model = e.target.value;
										setSessionDetail((s) => (s ? { ...s, model } : s));
										await fetch(`/api/bff/sessions/${sessionId}`, {
											method: 'PATCH',
											headers: { 'Content-Type': 'application/json' },
											body: JSON.stringify({ model }),
										});
									}}
									disabled={!modelsByProvider}
								>
									<option value="" disabled>{!modelsByProvider ? 'Loading models...' : 'Select a model'}</option>
									{currentProviderModels.map((m) => (
										<option key={m.id} value={m.id}>{m.label || m.id}</option>
									))}
								</select>
							</div>
						</div>

				{/* Messages */}
				<div className="flex-1 overflow-y-auto p-4">
					<div className="mx-auto max-w-3xl space-y-4">
						{messages.map((m) => (
							<MessageItem key={m.id} message={{ id: m.id, role: m.role, content: m.content || "" }} />
						))}
						<div ref={bottomRef} />
					</div>
				</div>

				{/* Composer */}
				<div className="border-t border-zinc-200 dark:border-zinc-800 p-4">
					<div className="mx-auto max-w-3xl flex items-center gap-2">
						<textarea
							value={input}
							onChange={(e) => setInput(e.target.value)}
							onKeyDown={onKeyDown}
							placeholder="Send a message..."
							className="flex-1 resize-none rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-500 min-h-[44px]"
						/>
						<button onClick={send} disabled={loading || !sessionDetail?.model} className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded px-4 py-2">
							Send
						</button>
					</div>
					<div className="mx-auto max-w-3xl text-[11px] text-zinc-500 mt-2">
						Shift+Enter for newline • Enter to send {(!sessionDetail?.model) ? '• Select a model to start' : ''}
					</div>
				</div>
			</main>
		</div>
	);
}
