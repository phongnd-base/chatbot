/**
 * Model Service
 * Handles AI model-related API calls
 */

import { apiClient } from '../client';
import type { ModelsResponse } from '../types';

export const modelService = {
  /**
   * Get available AI models grouped by provider
   */
  async getModels(): Promise<ModelsResponse> {
    return apiClient.get<ModelsResponse>('ai/models');
  },
};
