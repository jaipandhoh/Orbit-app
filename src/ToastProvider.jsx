import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
};

const ICONS = {
  success: CheckCircle,
  error: AlertCircle,
  info: Info,
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback((message, { type = 'info', durationMs = 3500 } = {}) => {
    const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    const createdAt = Date.now();
    setToasts((prev) => [...prev, { id, message, type, createdAt }]);
    window.setTimeout(() => dismiss(id), durationMs);
  }, [dismiss]);

  const value = useMemo(() => ({ toast, dismiss }), [toast, dismiss]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 w-[360px] max-w-[calc(100vw-2rem)]">
        {toasts.map((t) => {
          const Icon = ICONS[t.type] || Info;
          const ring =
            t.type === 'success'
              ? 'border-success/30'
              : t.type === 'error'
                ? 'border-danger/30'
                : 'border-border';
          return (
            <div key={t.id} className={`card border ${ring} shadow-lg`}>
              <div className="flex items-start gap-3">
                <div className="mt-0.5">
                  <Icon size={18} className={t.type === 'success' ? 'text-success' : t.type === 'error' ? 'text-danger' : 'text-primary'} />
                </div>
                <div className="flex-1 text-body text-text">{t.message}</div>
                <button onClick={() => dismiss(t.id)} className="text-mutedText hover:text-text">
                  <X size={16} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

