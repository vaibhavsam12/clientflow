import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
}

interface ToastContextType {
  toast: (options: { type?: ToastType; title?: string; message: string; duration?: number }) => void;
  success: (message: string, title?: string) => void;
  error: (message: string, title?: string) => void;
  info: (message: string, title?: string) => void;
  warning: (message: string, title?: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const toast = useCallback(
    ({ type = 'info', title, message, duration = 4000 }: { type?: ToastType; title?: string; message: string; duration?: number }) => {
      const id = Math.random().toString(36).substring(2, 9);
      const newToast: Toast = { id, type, title, message };

      setToasts(prev => [...prev, newToast]);

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }
    },
    [removeToast]
  );

  const success = useCallback((message: string, title = 'Success') => toast({ type: 'success', title, message }), [toast]);
  const error = useCallback((message: string, title = 'Error') => toast({ type: 'error', title, message, duration: 6000 }), [toast]);
  const info = useCallback((message: string, title = 'Notice') => toast({ type: 'info', title, message }), [toast]);
  const warning = useCallback((message: string, title = 'Warning') => toast({ type: 'warning', title, message }), [toast]);

  return (
    <ToastContext.Provider value={{ toast, success, error, info, warning }}>
      {children}
      {/* Toast Render Container with ARIA Live Region for Screen Readers */}
      <aside
        aria-label="Notifications"
        aria-live="polite"
        aria-atomic="true"
        className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-md w-full pointer-events-none px-4 sm:px-0"
      >
        {toasts.map(t => {
          const isSuccess = t.type === 'success';
          const isError = t.type === 'error';
          const isWarning = t.type === 'warning';

          return (
            <div
              key={t.id}
              role={isError ? 'alert' : 'status'}
              aria-atomic="true"
              className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl shadow-lg border backdrop-blur-sm transition-all animate-slide-in ${
                isSuccess
                  ? 'bg-emerald-50/95 border-emerald-200 text-emerald-950'
                  : isError
                  ? 'bg-rose-50/95 border-rose-200 text-rose-950'
                  : isWarning
                  ? 'bg-amber-50/95 border-amber-200 text-amber-950'
                  : 'bg-white/95 border-slate-200 text-slate-900 shadow-slate-200/50'
              }`}
            >
              <div className="flex-shrink-0 mt-0.5">
                {isSuccess && <CheckCircle2 className="w-5 h-5 text-emerald-600" aria-hidden="true" />}
                {isError && <AlertCircle className="w-5 h-5 text-rose-600" aria-hidden="true" />}
                {isWarning && <AlertTriangle className="w-5 h-5 text-amber-600" aria-hidden="true" />}
                {t.type === 'info' && <Info className="w-5 h-5 text-indigo-600" aria-hidden="true" />}
              </div>

              <div className="flex-1 text-sm">
                {t.title && <div className="font-semibold mb-0.5">{t.title}</div>}
                <div className="text-slate-700 leading-snug">{t.message}</div>
              </div>

              <button
                type="button"
                onClick={() => removeToast(t.id)}
                aria-label="Dismiss notification"
                className="flex-shrink-0 text-slate-400 hover:text-slate-600 p-1 rounded-md hover:bg-slate-100 transition focus-visible:ring-2 focus-visible:ring-brand-500"
              >
                <X className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>
          );
        })}
      </aside>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
