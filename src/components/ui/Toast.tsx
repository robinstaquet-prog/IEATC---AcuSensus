'use client';

// ─── Toast simple (context + hook) ────────────────────────────────────────────
// Affiche un toast en bas à droite de l'écran. Usage :
//   const { show } = useToast();
//   show('Vote enregistré', 'success');

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import { cn } from '@/lib/utils';

type ToastKind = 'info' | 'success' | 'error';
interface ToastItem {
  id: string;
  message: string;
  kind: ToastKind;
}

interface ToastContextValue {
  show: (message: string, kind?: ToastKind) => void;
}

const ToastContext = createContext<ToastContextValue>({ show: () => {} });

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);

  const show = useCallback((message: string, kind: ToastKind = 'info') => {
    const id = `t-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    setItems((prev) => [...prev, { id, message, kind }]);
    setTimeout(() => {
      setItems((prev) => prev.filter((t) => t.id !== id));
    }, 2500);
  }, []);

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      <div className="fixed bottom-4 right-4 z-[200] space-y-2 pointer-events-none">
        {items.map((t) => (
          <div
            key={t.id}
            className={cn(
              'pointer-events-auto text-sm font-medium px-4 py-2 rounded-lg shadow-lg border animate-in fade-in slide-in-from-bottom-2',
              t.kind === 'success' && 'bg-emerald-600 text-white border-emerald-700',
              t.kind === 'error' && 'bg-red-600 text-white border-red-700',
              t.kind === 'info' && 'bg-slate-800 text-white border-slate-900',
            )}
          >
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}

// Hook "noop-safe" si utilisé hors provider (évite un crash en dev).
export function useSafeToast() {
  const ctx = useContext(ToastContext);
  useEffect(() => {
    // no-op
  }, []);
  return ctx;
}
