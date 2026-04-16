import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

export interface ExploreIntent {
  catKey: string;
  catLabel: string;
  dimQueue: number[];
  dimNames: Record<number, string>;
}

interface ExploreContextType {
  exploreIntent: ExploreIntent | null;
  startExplore: (intent: ExploreIntent) => void;
  clearExplore: () => void;
  advanceQueue: () => void;
}

const Ctx = createContext<ExploreContextType>({
  exploreIntent: null,
  startExplore: () => {},
  clearExplore: () => {},
  advanceQueue: () => {},
});

export function ExploreProvider({ children }: { children: ReactNode }) {
  const [exploreIntent, setExploreIntent] = useState<ExploreIntent | null>(null);

  const startExplore = useCallback((intent: ExploreIntent) => {
    setExploreIntent(intent);
  }, []);

  const clearExplore = useCallback(() => {
    setExploreIntent(null);
  }, []);

  const advanceQueue = useCallback(() => {
    setExploreIntent(prev => {
      if (!prev || prev.dimQueue.length <= 1) return null;
      return { ...prev, dimQueue: prev.dimQueue.slice(1) };
    });
  }, []);

  return (
    <Ctx.Provider value={{ exploreIntent, startExplore, clearExplore, advanceQueue }}>
      {children}
    </Ctx.Provider>
  );
}

export function useExplore() {
  return useContext(Ctx);
}
