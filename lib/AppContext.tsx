'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

interface AppContextValue {
  hasResults: boolean;
  setHasResults: (v: boolean) => void;
  onNewAnalysis: () => void;
  setOnNewAnalysis: (fn: () => void) => void;
}

const AppContext = createContext<AppContextValue>({
  hasResults: false,
  setHasResults: () => {},
  onNewAnalysis: () => {},
  setOnNewAnalysis: () => {},
});

export function AppProvider({ children }: { children: ReactNode }) {
  const [hasResults, setHasResults] = useState(false);
  const [onNewAnalysis, setOnNewAnalysisState] = useState<() => void>(() => () => {});

  const setOnNewAnalysis = (fn: () => void) => {
    setOnNewAnalysisState(() => fn);
  };

  return (
    <AppContext.Provider value={{ hasResults, setHasResults, onNewAnalysis, setOnNewAnalysis }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  return useContext(AppContext);
}
