/**
 * Shared API Types
 */

export type Provider = 'OPENAI' | 'GOOGLE' | 'ANTHROPIC';

// ============= Folder Types =============
export interface Folder {
  id: string;
  name: string;
  userId: string;
  isFavorite?: boolean;
  createdAt: string;
}

export interface CreateFolderRequest {
  name: string;
}

export interface UpdateFolderRequest {
  name?: string;
  isFavorite?: boolean;
}

// ============= Message Types =============
export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt?: string;
}

export interface SendMessageRequest {
  sessionId: string;
  prompt: string;
}

// ============= Session Types =============
export interface Session {
  id: string;
  title: string;
  model?: string;
  provider?: Provider;
  folderId?: string | null;
  isFavorite?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateSessionRequest {
  title?: string;
  folderId?: string;
  model?: string;
  provider?: Provider;
}

export interface UpdateSessionRequest {
  title?: string;
  model?: string;
  provider?: Provider;
  folderId?: string | null;
  isFavorite?: boolean;
}

export interface ExportData {
  session: Session;
  messages: Array<{ role: string; content: string; createdAt: string }>;
}

// ============= Model Types =============
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
