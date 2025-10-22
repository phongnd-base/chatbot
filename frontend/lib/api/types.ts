/**
 * Shared API Types
 */

export type Provider = 'OPENAI' | 'GOOGLE' | 'ANTHROPIC';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt?: string;
}

export interface Session {
  id: string;
  title: string;
  model?: string;
  provider?: Provider;
  createdAt?: string;
  updatedAt?: string;
}

export interface ModelInfo {
  id: string;
  label?: string;
  provider: Provider;
}

export interface ProviderModels {
  provider: Provider;
  models: ModelInfo[];
}

export interface ModelsResponse {
  modelsByProvider: ProviderModels[];
}

export interface CreateSessionRequest {
  title: string;
}

export interface UpdateSessionRequest {
  model?: string;
  provider?: Provider;
}

export interface SendMessageRequest {
  sessionId: string;
  prompt: string;
}
