/**
 * useFolders Hook
 * Manages folder state with API integration
 */

import { useState, useEffect, useCallback } from 'react';
import { folderService } from '@/lib/api';
import type { FolderData } from '@/lib/api/services/folder.service';

export function useFolders() {
  const [folders, setFolders] = useState<FolderData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Fetch folders from API
  const fetchFolders = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await folderService.getFolders();
      setFolders(data);
    } catch (err) {
      setError(err as Error);
      console.error('Failed to fetch folders:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Create folder
  const createFolder = useCallback(async (name: string) => {
    try {
      const newFolder = await folderService.createFolder(name);
      setFolders((prev) => [...prev, newFolder]);
      return newFolder;
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  }, []);

  // Update folder
  const updateFolder = useCallback(async (id: string, updates: Partial<FolderData>) => {
    try {
      const updated = await folderService.updateFolder(id, updates);
      setFolders((prev) => prev.map((f) => (f.id === id ? updated : f)));
      return updated;
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  }, []);

  // Delete folder
  const deleteFolder = useCallback(async (id: string) => {
    try {
      await folderService.deleteFolder(id);
      setFolders((prev) => prev.filter((f) => f.id !== id));
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  }, []);

  // Toggle favorite
  const toggleFavorite = useCallback(async (id: string) => {
    try {
      const updated = await folderService.toggleFavorite(id);
      setFolders((prev) => prev.map((f) => (f.id === id ? updated : f)));
      return updated;
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  }, []);

  useEffect(() => {
    fetchFolders();
  }, [fetchFolders]);

  return {
    folders,
    loading,
    error,
    createFolder,
    updateFolder,
    deleteFolder,
    toggleFavorite,
    refetch: fetchFolders,
  };
}
