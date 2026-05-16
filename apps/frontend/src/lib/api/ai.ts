import type { AiImproveResponse } from '@blog/types';
import { apiClient } from './client';

export const aiApi = {
  improveContent: (content: string, instruction: string) =>
    apiClient<AiImproveResponse>('/ai/improve-content', {
      method: 'POST',
      body: JSON.stringify({ content, instruction }),
    }),
};
