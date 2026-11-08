import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const ToastContainer: React.FC = () => {
  const { toasts, dismissToast } = useApp();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-70 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        const isSuccess = toast.type === 'success';
        const isError = toast.type === 'error';

        return (
          <div
            key={toast.id}
            className="pointer-events-auto flex items-center justify-between gap-3 rounded-xl border border-[#E4DDD2] dark:border-[#38322B] bg-white/95 dark:bg-[#221F1C]/95 p-4 shadow-xl backdrop-blur-md transition-all animate-slideInRight"
          >
            <div className="flex items-center gap-2.5">
              {isSuccess && (
                <CheckCircle2 className="h-5 w-5 text-[#B85D19] dark:text-[#D77937] shrink-0" />
              )}
              {isError && (
                <AlertCircle className="h-5 w-5 text-[#BA3D3D] dark:text-[#E05353] shrink-0" />
              )}
              {!isSuccess && !isError && (
                <Info className="h-5 w-5 text-[#7E746A] dark:text-[#A3978B] shrink-0" />
              )}
              <span className="font-serif-tc text-xs font-semibold text-[#2A2521] dark:text-[#EDE6DE] leading-snug">
                {toast.message}
              </span>
            </div>

            <button
              type="button"
              onClick={() => dismissToast(toast.id)}
              className="text-[#7E746A] hover:text-[#2A2521] dark:hover:text-[#EDE6DE] transition-colors p-1"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
