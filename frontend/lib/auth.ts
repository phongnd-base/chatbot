"use client";

// Global auth event handlers
const authEventHandlers: Array<() => void> = [];

export function onAuthRequired(handler: () => void) {
  authEventHandlers.push(handler);
  return () => {
    const index = authEventHandlers.indexOf(handler);
    if (index > -1) {
      authEventHandlers.splice(index, 1);
    }
  };
}

export function triggerAuthRequired() {
  authEventHandlers.forEach((handler) => handler());
}

// Fetch wrapper that handles auth errors
export async function authFetch(url: string, options?: RequestInit) {
  const response = await fetch(url, options);

  // Check if auth is required
  if (response.status === 401) {
    const authRequired = response.headers.get('X-Auth-Required') === 'true';
    
    if (authRequired) {
      // Clear tokens and trigger logout
      await fetch('/api/auth/clear-tokens', { method: 'POST' });
      triggerAuthRequired();
      
      // Redirect to login
      const currentPath = window.location.pathname + window.location.search;
      window.location.href = `/login?from=${encodeURIComponent(currentPath)}`;
      
      throw new Error('Session expired. Please login again.');
    }
  }

  return response;
}
