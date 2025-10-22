"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Global fetch interceptor for handling 401 errors
    const originalFetch = window.fetch;
    
    window.fetch = async (...args) => {
      const response = await originalFetch(...args);
      
      // Check for 401 and X-Auth-Required header
      if (response.status === 401) {
        const authRequired = response.headers.get('X-Auth-Required') === 'true';
        
        if (authRequired) {
          console.warn("Session expired (401 + X-Auth-Required), redirecting to login...");
          
          // Clear tokens
          try {
            await originalFetch('/api/auth/clear-tokens', { method: 'POST' });
          } catch (e) {
            console.error("Failed to clear tokens:", e);
          }
          
          // Redirect to login
          const returnUrl = encodeURIComponent(pathname);
          window.location.href = `/login?from=${returnUrl}&expired=1`;
        }
      }
      
      return response;
    };

    return () => {
      // Restore original fetch
      window.fetch = originalFetch;
    };
  }, [router, pathname]);

  return <>{children}</>;
}

