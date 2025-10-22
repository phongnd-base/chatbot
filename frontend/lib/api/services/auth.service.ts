/**
 * Auth Service
 * Handles authentication-related operations
 */

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  name?: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken?: string;
}

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001';

export const authService = {
  /**
   * Login with email and password
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || 'Login failed');
    }

    return response.json();
  },

  /**
   * Register new user
   */
  async register(credentials: RegisterCredentials): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || 'Registration failed');
    }

    return response.json();
  },

  /**
   * Set tokens in httpOnly cookies
   */
  async setTokens(tokens: AuthResponse): Promise<void> {
    const response = await fetch('/api/auth/set-tokens', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(tokens),
    });

    if (!response.ok) {
      throw new Error('Failed to set tokens');
    }
  },

  /**
   * Clear authentication tokens
   */
  async logout(): Promise<void> {
    await fetch('/api/auth/clear-tokens', { method: 'POST' });
  },

  /**
   * Get Google OAuth URL
   */
  getGoogleAuthUrl(): string {
    return `${API_BASE}/auth/google`;
  },
};
