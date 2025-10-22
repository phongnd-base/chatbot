/**
 * API Client - Centralized HTTP client
 * Handles all API calls with automatic error handling
 */

const BFF_BASE = '/api/bff';

class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public data?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new ApiError(
      errorData.message || `HTTP ${response.status}`,
      response.status,
      errorData
    );
  }
  
  return response.json();
}

export const apiClient = {
  async get<T>(path: string): Promise<T> {
    const response = await fetch(`${BFF_BASE}/${path}`);
    return handleResponse<T>(response);
  },

  async post<T>(path: string, data?: any): Promise<T> {
    const response = await fetch(`${BFF_BASE}/${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: data ? JSON.stringify(data) : undefined,
    });
    return handleResponse<T>(response);
  },

  async put<T>(path: string, data: any): Promise<T> {
    const response = await fetch(`${BFF_BASE}/${path}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse<T>(response);
  },

  async patch<T>(path: string, data: any): Promise<T> {
    const response = await fetch(`${BFF_BASE}/${path}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse<T>(response);
  },

  async delete<T>(path: string): Promise<T> {
    const response = await fetch(`${BFF_BASE}/${path}`, {
      method: 'DELETE',
    });
    return handleResponse<T>(response);
  },
};

export { ApiError };
