import React from 'react';
import { X, Bookmark, Trash2, MapPin, Navigation, ArrowRight } from 'lucide-react';
import { useLanguage } from '../i18n';
import { formatCoordinates } from '../utils/helpers';

export function FavoritesDrawer({ 
  isOpen, 
  onClose, 
  favorites = [], 
  onSelectFavorite, 
  onRemoveFavorite,
  onClearAllFavorites,
}) {
  const { t } = useLanguage();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md h-full bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950/50 flex items-center justify-center text-amber-500">
              <Bookmark className="w-5 h-5 fill-amber-500" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                {t.favorites}
              </h3>
              <p className="text-xs text-slate-400">
                {favorites.length} {favorites.length === 1 ? 'joy saqlangan' : 'joylar saqlangan'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {favorites.length > 0 && (
              <button
                onClick={onClearAllFavorites}
                type="button"
                title={t.clearAll}
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

        {/* Favorites List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
          {favorites.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
              <div className="w-16 h-16 rounded-3xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-3 text-slate-300 dark:text-slate-600">
                <Bookmark className="w-8 h-8" />
              </div>
              <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                {t.noFavorites}
              </p>
              <p className="text-xs text-slate-400 mt-1 max-w-xs">
                {t.noFavoritesHint}
              </p>
            </div>
          ) : (
            favorites.map((place) => (
              <div
                key={place.id}
                className="group relative flex items-start justify-between gap-3 p-3.5 rounded-2xl bg-slate-50 hover:bg-primary-50/60 dark:bg-slate-800/50 dark:hover:bg-primary-950/40 border border-slate-200/70 dark:border-slate-700/70 hover:border-primary-300 transition-all cursor-pointer"
                onClick={() => {
                  onSelectFavorite(place);
                  onClose();
                }}
              >
                <div className="flex items-start gap-3 min-w-0 flex-1">
                  <div className="w-9 h-9 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-primary-600 shrink-0 mt-0.5">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      {place.name}
                    </h4>
                    <p className="text-[11px] text-slate-400 truncate mt-0.5">
                      {place.subtitle || place.displayName}
                    </p>
                    <span className="font-mono text-[10px] text-slate-400 mt-1 block">
                      {formatCoordinates(place.lat, place.lng)}
                    </span>
                  </div>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveFavorite(place.id);
                  }}
                  type="button"
                  title={t.removeFromFavorites}
                  className="p-2 text-slate-400 hover:text-rose-500 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

