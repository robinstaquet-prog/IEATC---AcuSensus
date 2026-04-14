'use client';

import { ReactNode, createContext, useContext } from 'react';

const ToastContext = createContext<null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  return (
    <ToastContext.Provider value={null}>
      {children}
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
