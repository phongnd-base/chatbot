/**
 * useModels Hook
 * Manages AI models state
 */

import { useState, useEffect, useMemo } from 'react';
import { modelService, type ProviderModels, type Provider } from '@/lib/api';

export function useModels() {
  const [modelsByProvider, setModelsByProvider] = useState<ProviderModels[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchModels() {
      try {
        setLoading(true);
        setError(null);
        const data = await modelService.getModels();
        setModelsByProvider(data.modelsByProvider || []);
      } catch (err) {
        setError(err as Error);
        console.error('Failed to fetch models:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchModels();
  }, []);

  return {
    modelsByProvider,
    loading,
    error,
  };
}

/**
 * Get models for a specific provider
 */
export function useProviderModels(provider: Provider, modelsByProvider: ProviderModels[] | null) {
  return useMemo(() => {
    if (!modelsByProvider) return [];
    return modelsByProvider.find((p) => p.provider === provider)?.models ?? [];
  }, [modelsByProvider, provider]);
}
