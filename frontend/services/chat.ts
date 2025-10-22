const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001';

export async function listSessions(token: string) {
  const res = await fetch(`${API_BASE}/sessions`, { headers: { Authorization: `Bearer ${token}` } });
  if (!res.ok) throw new Error('Failed to list sessions');
  return res.json();
}

export async function getMessages(token: string, sessionId: string) {
  const res = await fetch(`${API_BASE}/messages/${sessionId}`, { headers: { Authorization: `Bearer ${token}` } });
  if (!res.ok) throw new Error('Failed to list messages');
  return res.json();
}

export async function createSession(token: string, title?: string) {
  const res = await fetch(`${API_BASE}/sessions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ title })
  });
  if (!res.ok) throw new Error('Failed to create session');
  return res.json();
}

export async function createMessage(token: string, sessionId: string, content: string) {
  const res = await fetch(`${API_BASE}/messages`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ sessionId, role: 'user', content })
  });
  if (!res.ok) throw new Error('Failed to send message');
  return res.json();
}
