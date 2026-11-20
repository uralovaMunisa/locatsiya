import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export function Toast({ toast, onClose }) {
  if (!toast) return null;

  const isError = toast.type === 'error';

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-slate-900/95 dark:bg-white/95 text-white dark:text-slate-900 shadow-2xl backdrop-blur-md border border-slate-800 dark:border-slate-200 animate-in fade-in slide-in-from-bottom-3 duration-200 text-xs sm:text-sm font-semibold max-w-sm sm:max-w-md">
      {isError ? (
        <AlertCircle className="w-4 h-4 text-rose-400 dark:text-rose-600 shrink-0" />
      ) : (
        <CheckCircle2 className="w-4 h-4 text-emerald-400 dark:text-emerald-600 shrink-0" />
      )}
      <span className="flex-1">{toast.message}</span>
      <button
        onClick={onClose}
        type="button"
        className="p-1 rounded-lg text-slate-400 hover:text-white dark:hover:text-slate-900 transition-colors ml-1"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

