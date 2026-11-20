import React from 'react';
import { Compass, Bookmark, History, HelpCircle, Navigation } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { LanguageSwitcher } from './LanguageSwitcher';
import { useLanguage } from '../i18n';

export function Navbar({ 
  onOpenHowItWorks, 
  onOpenFavorites, 
  onOpenRecent, 
  favoritesCount = 0,
  recentCount = 0,
  onResetView,
}) {
  const { t } = useLanguage();

  return (
    <header className="absolute top-3 left-3 right-3 sm:left-4 sm:right-4 z-30 pointer-events-none">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        {/* Brand / Logo */}
        <button
          onClick={onResetView}
          type="button"
          className="pointer-events-auto group flex items-center gap-2.5 px-3 py-2 sm:px-4 sm:py-2.5 
            rounded-2xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-slate-200/80 dark:border-slate-800/80 
            shadow-premium hover:shadow-lg transition-all duration-200 active:scale-95"
        >
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-primary-600 to-indigo-500 
            flex items-center justify-center text-white shadow-md shadow-primary-500/25 group-hover:rotate-12 transition-transform duration-300">
            <Compass className="w-5 h-5 text-white" />
          </div>
          <div className="text-left">
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-sm sm:text-base tracking-tight bg-gradient-to-r from-slate-900 via-primary-700 to-primary-600 dark:from-white dark:via-slate-100 dark:to-primary-400 bg-clip-text text-transparent">
                {t.appTitle}
              </span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-primary-100 dark:bg-primary-950/70 text-primary-700 dark:text-primary-300">
                PRO
              </span>
            </div>
            <p className="hidden md:block text-[11px] text-slate-500 dark:text-slate-400 font-medium -mt-0.5">
              {t.appSubtitle}
            </p>
          </div>
        </button>

        {/* Right Action Controls */}
        <div className="pointer-events-auto flex items-center gap-1.5 sm:gap-2">
          {/* Quick Guide / Help */}
          <button
            onClick={onOpenHowItWorks}
            type="button"
            title={t.howItWorks.viewGuide}
            aria-label="How it works guide"
            className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold
              bg-white/80 dark:bg-slate-900/80 backdrop-blur-md text-slate-700 dark:text-slate-200
              border border-slate-200/80 dark:border-slate-800/80 shadow-sm hover:bg-slate-100 dark:hover:bg-slate-800
              transition-all duration-200 active:scale-95"
          >
            <HelpCircle className="w-4 h-4 text-primary-500" />
            <span>{t.howItWorks.viewGuide}</span>
          </button>

          {/* Recent Searches */}
          <button
            onClick={onOpenRecent}
            type="button"
            title={t.recentSearches}
            aria-label="Recent searches"
            className="relative p-2 sm:px-3 sm:py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5
              bg-white/80 dark:bg-slate-900/80 backdrop-blur-md text-slate-700 dark:text-slate-200
              border border-slate-200/80 dark:border-slate-800/80 shadow-sm hover:bg-slate-100 dark:hover:bg-slate-800
              transition-all duration-200 active:scale-95"
          >
            <History className="w-4 h-4 text-slate-600 dark:text-slate-300" />
            <span className="hidden md:inline">{t.recentSearches}</span>
            {recentCount > 0 && (
              <span className="w-4 h-4 text-[10px] rounded-full bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 flex items-center justify-center font-bold">
                {recentCount}
              </span>
            )}
          </button>

          {/* Favorites Button */}
          <button
            onClick={onOpenFavorites}
            type="button"
            title={t.favorites}
            aria-label="Favorites"
            className="relative p-2 sm:px-3 sm:py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5
              bg-white/80 dark:bg-slate-900/80 backdrop-blur-md text-slate-700 dark:text-slate-200
              border border-slate-200/80 dark:border-slate-800/80 shadow-sm hover:bg-slate-100 dark:hover:bg-slate-800
              transition-all duration-200 active:scale-95"
          >
            <Bookmark className="w-4 h-4 text-amber-500 fill-amber-500/20" />
            <span className="hidden md:inline">{t.favorites}</span>
            {favoritesCount > 0 && (
              <span className="w-4 h-4 text-[10px] rounded-full bg-amber-500 text-white flex items-center justify-center font-bold">
                {favoritesCount}
              </span>
            )}
          </button>

          {/* Language Switcher */}
          <LanguageSwitcher />

          {/* Dark Mode Toggle */}
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}

