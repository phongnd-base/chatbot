export async function sendMessage(sessionId: string, content: string) {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001';
  const res = await fetch(`${baseUrl}/messages`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sessionId, content })
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}
