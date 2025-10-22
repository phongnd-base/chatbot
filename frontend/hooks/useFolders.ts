/**
 * useFolders Hook
 * Điều phối logic và side effects cho folders
 * Sử dụng Zustand store + Service API layer
 */

import { useEffect, useCallback } from 'react';
import { folderService } from '@/lib/api';
import { useFolderStore } from '@/store/folderStore';
import type { CreateFolderRequest, UpdateFolderRequest } from '@/lib/api/types';

export function useFolders() {
  // Get state and actions from Zustand store
  const { folders, loading, error, setFolders, addFolder, updateFolder: updateFolderInStore, removeFolder, setLoading, setError } = useFolderStore();

  // Fetch all folders
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
  }, [setFolders, setLoading, setError]);

  // Create folder
  const createFolder = useCallback(async (data: CreateFolderRequest) => {
    try {
      const newFolder = await folderService.createFolder(data);
      addFolder(newFolder);
      return newFolder;
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  }, [addFolder, setError]);

  // Update folder
  const updateFolder = useCallback(async (id: string, updates: UpdateFolderRequest) => {
    try {
      const updated = await folderService.updateFolder(id, updates);
      updateFolderInStore(id, updated);
      return updated;
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  }, [updateFolderInStore, setError]);

  // Delete folder
  const deleteFolder = useCallback(async (id: string) => {
    try {
      await folderService.deleteFolder(id);
      removeFolder(id);
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  }, [removeFolder, setError]);

  // Toggle favorite
  const toggleFavorite = useCallback(async (id: string, isFavorite: boolean) => {
    try {
      const updated = await folderService.toggleFavorite(id, isFavorite);
      updateFolderInStore(id, updated);
      return updated;
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  }, [updateFolderInStore, setError]);

  // Auto-fetch on mount
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
