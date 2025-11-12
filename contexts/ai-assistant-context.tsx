'use client';

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode
} from 'react';

export type AIModule = 'general' | 'resume' | 'social' | 'insights' | 'analysis';

export interface AIRecommendation {
  id: string;
  title: string;
  description: string;
  prompt: string;
  tags?: string[];
  module?: AIModule;
}

export interface QueuedPrompt {
  id: string;
  prompt: string;
  module: AIModule;
  autoSend: boolean;
  meta?: Record<string, unknown>;
}

interface AIAssistantContextValue {
  activeModule: AIModule;
  setActiveModule: (module: AIModule) => void;
  recommendations: AIRecommendation[];
  setRecommendations: (items: AIRecommendation[], module?: AIModule) => void;
  queuePrompt: (
    prompt: string,
    options?: {
      module?: AIModule;
      autoSend?: boolean;
      meta?: Record<string, unknown>;
    }
  ) => void;
  queuedPrompt: QueuedPrompt | null;
  consumeQueuedPrompt: () => void;
}

const AIAssistantContext = createContext<AIAssistantContextValue | null>(null);

const createId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

export function AIAssistantProvider({ children }: { children: ReactNode }) {
  const [activeModule, setActiveModule] = useState<AIModule>('general');
  const [recommendations, setRecommendationsState] = useState<AIRecommendation[]>([]);
  const [queuedPrompt, setQueuedPrompt] = useState<QueuedPrompt | null>(null);

  const setRecommendations = useCallback(
    (items: AIRecommendation[], module?: AIModule) => {
      setRecommendationsState(items);
      if (module && module !== activeModule) {
        setActiveModule(module);
      }
    },
    [activeModule]
  );

  const queuePrompt = useCallback(
    (
      prompt: string,
      options?: {
        module?: AIModule;
        autoSend?: boolean;
        meta?: Record<string, unknown>;
      }
    ) => {
      const targetModule = options?.module ?? activeModule;
      setQueuedPrompt({
        id: createId(),
        prompt,
        module: targetModule,
        autoSend: options?.autoSend ?? true,
        meta: options?.meta
      });
      if (targetModule !== activeModule) {
        setActiveModule(targetModule);
      }
    },
    [activeModule]
  );

  const consumeQueuedPrompt = useCallback(() => {
    setQueuedPrompt(null);
  }, []);

  const value = useMemo<AIAssistantContextValue>(
    () => ({
      activeModule,
      setActiveModule,
      recommendations,
      setRecommendations,
      queuePrompt,
      queuedPrompt,
      consumeQueuedPrompt
    }),
    [activeModule, consumeQueuedPrompt, queuePrompt, recommendations, setRecommendations]
  );

  return <AIAssistantContext.Provider value={value}>{children}</AIAssistantContext.Provider>;
}

export function useAIAssistant() {
  const context = useContext(AIAssistantContext);
  if (!context) {
    throw new Error('useAIAssistant must be used within an AIAssistantProvider');
  }
  return context;
}

