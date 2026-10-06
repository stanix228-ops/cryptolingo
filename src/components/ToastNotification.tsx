import React, { useEffect } from 'react';
import { Zap, Check, AlertCircle, Sparkles, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  title: string;
  subtitle?: string;
  xpAmount?: number;
  type?: 'xp' | 'success' | 'info' | 'warning';
}

interface ToastNotificationProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastNotification: React.FC<ToastNotificationProps> = ({ toasts, onDismiss }) => {
  return (
    <div className="fixed top-14 right-3 left-3 md:left-auto md:right-4 z-50 flex flex-col gap-2 max-w-sm pointer-events-none select-none font-mono">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
};

const ToastItem: React.FC<{ toast: ToastMessage; onDismiss: (id: string) => void }> = ({
  toast,
  onDismiss,
}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(toast.id);
    }, 3000);
    return () => clearTimeout(timer);
  }, [toast.id, onDismiss]);

  return (
    <div className="pointer-events-auto bg-black border border-white/40 shadow-2xl p-3 flex items-center justify-between gap-3 animate-slideIn text-white">
      <div className="flex items-center gap-2.5 min-w-0">
        <div className="w-7 h-7 bg-white text-black flex items-center justify-center font-bold shrink-0">
          {toast.xpAmount ? (
            <Zap className="w-4 h-4 fill-black text-black" />
          ) : (
            <Check className="w-4 h-4 stroke-[3]" />
          )}
        </div>

        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-1.5">
            {toast.xpAmount && (
              <span className="bg-white text-black font-black text-[10px] px-1 py-0.2 shrink-0">
                +{toast.xpAmount} XP
              </span>
            )}
            <span className="text-xs font-black uppercase text-white truncate tracking-wider">
              {toast.title}
            </span>
          </div>

          {toast.subtitle && (
            <span className="text-[10px] text-neutral-400 font-sans truncate leading-tight mt-0.5">
              {toast.subtitle}
            </span>
          )}
        </div>
      </div>

      <button
        onClick={() => onDismiss(toast.id)}
        className="text-neutral-500 hover:text-white p-1 shrink-0 cursor-pointer"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
