import { Provider } from '@prisma/client';

export type ModelInfo = { id: string; label?: string; provider: Provider };
export type ProviderModels = { provider: Provider; models: ModelInfo[] };

export const MODEL_REGISTRY: ProviderModels[] = [
  {
    provider: Provider.OPENAI,
    models: [
      { id: 'gpt-4o', label: 'GPT-4o', provider: Provider.OPENAI },
      { id: 'gpt-4o-mini', label: 'GPT-4o Mini', provider: Provider.OPENAI },
      { id: 'gpt-4.1', label: 'GPT-4.1', provider: Provider.OPENAI },
      { id: 'gpt-4.1-mini', label: 'GPT-4.1 Mini', provider: Provider.OPENAI },
      { id: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo', provider: Provider.OPENAI },
    ],
  },
  {
    provider: Provider.GOOGLE,
    models: [
      { id: 'gemini-1.5-pro', label: 'Gemini 1.5 Pro', provider: Provider.GOOGLE },
      { id: 'gemini-1.5-flash', label: 'Gemini 1.5 Flash', provider: Provider.GOOGLE },
      { id: 'gemini-1.5-flash-lite', label: 'Gemini 1.5 Flash Lite', provider: Provider.GOOGLE },
      { id: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash', provider: Provider.GOOGLE },
    ],
  },
  {
    provider: Provider.ANTHROPIC,
    models: [
      { id: 'claude-3-5-sonnet-20240620', label: 'Claude 3.5 Sonnet (2024-06-20)', provider: Provider.ANTHROPIC },
      { id: 'claude-3-opus-20240229', label: 'Claude 3 Opus (2024-02-29)', provider: Provider.ANTHROPIC },
      { id: 'claude-3-haiku-20240307', label: 'Claude 3 Haiku (2024-03-07)', provider: Provider.ANTHROPIC },
    ],
  },
];
