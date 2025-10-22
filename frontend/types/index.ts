/**
 * Frontend Domain Types
 * Separate from API types to allow different representations
 */

export interface Folder {
  id: string;
  name: string;
  isExpanded: boolean;
  sessionCount: number;
  isFavorite?: boolean;
}

export interface SessionWithFolder {
  id: string;
  name: string;
  folderId?: string | null;
}

export interface User {
  id: string;
  email: string;
  name?: string;
}
