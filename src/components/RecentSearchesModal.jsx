import React from 'react';
import { X, History, Trash2, ArrowRight } from 'lucide-react';
import { useLanguage } from '../i18n';

export function RecentSearchesModal({ 
  isOpen, 
  onClose, 
  recentSearches = [], 
  onSelectRecent, 
  onRemoveRecent, 
  onClearAll 
}) {
  const { t } = useLanguage();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                {t.recentSearches}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {recentSearches.length > 0 && (
              <button
                onClick={onClearAll}
                type="button"
                className="text-xs font-semibold text-rose-500 hover:text-rose-600 px-2 py-1"
              >
                {t.clearAll}
              </button>
            )}
            <button
              onClick={onClose}
              type="button"
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {recentSearches.length === 0 ? (
            <div className="p-8 text-center text-slate-400">
              <History className="w-10 h-10 mx-auto mb-2 text-slate-300 dark:text-slate-600" />
              <p className="text-sm font-semibold">Tarix bo'sh</p>
            </div>
          ) : (
            recentSearches.map((item, idx) => {
              const name = typeof item === 'object' ? item.name : item;
              const subtitle = typeof item === 'object' ? item.subtitle : null;

              return (
                <div
                  key={idx}
                  onClick={() => {
                    onSelectRecent(item);
                    onClose();
                  }}
                  className="group flex items-center justify-between p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/60 dark:hover:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <History className="w-4 h-4 text-slate-400 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                        {name}
                      </p>
                      {subtitle && (
                        <p className="text-[11px] text-slate-400 truncate">
                          {subtitle}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemoveRecent(idx);
                      }}
                      type="button"
                      className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

