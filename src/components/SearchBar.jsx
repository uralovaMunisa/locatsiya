import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  X, 
  Loader2, 
  MapPin, 
  History, 
  CornerDownLeft, 
  Compass, 
  Utensils, 
  Pill, 
  HeartPulse, 
  Trees, 
  Fuel, 
  Landmark, 
  Coffee 
} from 'lucide-react';
import { useLanguage } from '../i18n';
import { useDebounce } from '../hooks/useDebounce';
import { searchPlaces } from '../services/nominatim';
import { CATEGORY_CONFIG } from '../utils/categories';
import { calculateDistance, formatDistance } from '../utils/helpers';

// Preset quick search categories
const QUICK_FILTERS = [
  { id: 'restaurant', icon: Utensils, labelKey: 'restaurant', query: 'restoran' },
  { id: 'pharmacy', icon: Pill, labelKey: 'pharmacy', query: 'dorixona' },
  { id: 'hospital', icon: HeartPulse, labelKey: 'hospital', query: 'shifoxona' },
  { id: 'park', icon: Trees, labelKey: 'park', query: 'park' },
  { id: 'cafe', icon: Coffee, labelKey: 'cafe', query: 'qahvaxona' },
  { id: 'attraction', icon: Landmark, labelKey: 'attraction', query: 'diqqatga sazovor' },
  { id: 'fuel', icon: Fuel, labelKey: 'fuel', query: 'zapravka' },
];

export function SearchBar({
  onSelectPlace,
  userLocation,
  recentSearches = [],
  onSelectRecent,
  onClearRecent,
  className = '',
  selectedCategory,
  onCategoryFilter,
}) {
  const { lang, t } = useLanguage();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [error, setError] = useState(null);

  const debouncedQuery = useDebounce(query, 400);
  const containerRef = useRef(null);
  const inputRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch search suggestions when debouncedQuery changes
  useEffect(() => {
    const trimmed = debouncedQuery.trim();
    if (trimmed.length < 2) {
      setResults([]);
      setLoading(false);
      setError(null);
      return;
    }

    let isMounted = true;
    setLoading(true);
    setError(null);

    searchPlaces(trimmed, { lang, limit: 8 })
      .then((data) => {
        if (!isMounted) return;
        setResults(data);
        setIsOpen(true);
        setSelectedIndex(-1);
        setLoading(false);
      })
      .catch((err) => {
        if (!isMounted) return;
        console.error('Search error:', err);
        setError(err.message || 'Error fetching search results');
        setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [debouncedQuery, lang]);

  // Keyboard navigation
  const handleKeyDown = (e) => {
    if (!isOpen) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev < results.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev > 0 ? prev - 1 : results.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0 && results[selectedIndex]) {
        handleSelect(results[selectedIndex]);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  const handleSelect = (place) => {
    setQuery(place.name);
    setIsOpen(false);
    onSelectPlace(place);
  };

  const handleClear = () => {
    setQuery('');
    setResults([]);
    setIsOpen(false);
    inputRef.current?.focus();
  };

  const handleQuickFilterClick = (filter) => {
    const term = t.categories[filter.labelKey] || filter.query;
    setQuery(term);
    if (onCategoryFilter) {
      onCategoryFilter(filter.id);
    }
    inputRef.current?.focus();
  };

  return (
    <div 
      id="search-bar-tour-target" 
      ref={containerRef} 
      className={`relative w-full max-w-xl mx-auto transition-all duration-300 ${className}`}
    >
      {/* Search Input Box with Glassmorphism */}
      <div 
        className={`relative flex items-center w-full rounded-2xl transition-all duration-200
          bg-white/95 dark:bg-slate-900/95 backdrop-blur-md 
          border ${isOpen ? 'border-primary-500 shadow-glow' : 'border-slate-200/90 dark:border-slate-800/90 shadow-premium'} 
          hover:border-slate-300 dark:hover:border-slate-700`}
      >
        <div className="pl-4 pr-2 text-slate-400 dark:text-slate-500 flex items-center justify-center">
          <Search className="w-5 h-5 text-primary-600 dark:text-primary-400" />
        </div>

        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => {
            if (query.trim().length >= 2 || recentSearches.length > 0) {
              setIsOpen(true);
            }
          }}
          onKeyDown={handleKeyDown}
          placeholder={t.searchPlaceholder}
          aria-label={t.searchPlaceholder}
          className="w-full py-3.5 pr-2 bg-transparent text-sm sm:text-base font-medium 
            text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 
            focus:outline-none"
        />

        {/* Loading Spinner / Clear Button */}
        <div className="pr-3 flex items-center gap-1.5">
          {loading && (
            <Loader2 className="w-5 h-5 text-primary-500 animate-spin" />
          )}

          {query && !loading && (
            <button
              onClick={handleClear}
              type="button"
              title="Tozalash"
              className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Quick Category Chips Filter Bar */}
      <div className="mt-2 flex items-center gap-1.5 overflow-x-auto py-1 px-1 no-scrollbar pointer-events-auto">
        {QUICK_FILTERS.map((filter) => {
          const Icon = filter.icon;
          const isSelected = selectedCategory === filter.id;
          return (
            <button
              key={filter.id}
              onClick={() => handleQuickFilterClick(filter)}
              type="button"
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap 
                transition-all duration-150 backdrop-blur-md shadow-sm active:scale-95
                ${isSelected 
                  ? 'bg-primary-600 text-white shadow-primary-500/25' 
                  : 'bg-white/85 dark:bg-slate-900/85 text-slate-700 dark:text-slate-300 border border-slate-200/70 dark:border-slate-800/70 hover:bg-white dark:hover:bg-slate-800'}`}
            >
              <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-primary-500'}`} />
              <span>{t.categories[filter.labelKey] || filter.labelKey}</span>
            </button>
          );
        })}
      </div>

      {/* Dropdown Suggestions Menu */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1.5 rounded-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200/90 dark:border-slate-800/90 shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150 max-h-[420px] overflow-y-auto">
          {/* Autocomplete Results */}
          {results.length > 0 && (
            <div className="py-2">
              <div className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                {t.quickSuggestions}
              </div>
              {results.map((place, idx) => {
                const CategoryIcon = place.categoryInfo?.icon || MapPin;
                const isSelected = idx === selectedIndex;
                
                // Calculate distance from user if available
                let distText = null;
                if (userLocation) {
                  const distMeters = calculateDistance(userLocation.lat, userLocation.lng, place.lat, place.lng);
                  if (distMeters != null) {
                    distText = formatDistance(distMeters, lang);
                  }
                }

                return (
                  <button
                    key={place.id || idx}
                    type="button"
                    onClick={() => handleSelect(place)}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    className={`w-full flex items-start gap-3 px-3.5 py-2.5 text-left transition-colors
                      ${isSelected 
                        ? 'bg-primary-50 dark:bg-primary-950/60' 
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800/60'}`}
                  >
                    <div className={`p-2 rounded-xl mt-0.5 shrink-0 ${place.categoryInfo?.color || 'text-primary-500 bg-primary-50 dark:bg-primary-950'}`}>
                      <CategoryIcon className="w-4 h-4" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                          {place.name}
                        </span>
                        {distText && (
                          <span className="text-xs font-bold text-primary-600 dark:text-primary-400 shrink-0">
                            {distText}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                        {place.subtitle || place.displayName}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* Empty State when Query is typed but no results */}
          {query.trim().length >= 2 && !loading && results.length === 0 && (
            <div className="p-6 text-center">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-2 text-slate-400">
                <Compass className="w-6 h-6" />
              </div>
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                {t.noResults}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs mx-auto">
                {t.noResultsHint}
              </p>
            </div>
          )}

          {/* Recent Searches Fallback in dropdown when input is empty or newly focused */}
          {query.trim().length < 2 && recentSearches.length > 0 && (
            <div className="py-2">
              <div className="flex items-center justify-between px-3.5 py-1.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
                  <History className="w-3.5 h-3.5" />
                  {t.recentSearches}
                </span>
                {onClearRecent && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onClearRecent();
                    }}
                    type="button"
                    className="text-[11px] font-semibold text-slate-400 hover:text-rose-500 transition-colors"
                  >
                    {t.clearRecent}
                  </button>
                )}
              </div>

              {recentSearches.slice(0, 5).map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    if (typeof item === 'object') {
                      handleSelect(item);
                    } else {
                      setQuery(item);
                    }
                  }}
                  className="w-full flex items-center justify-between px-3.5 py-2 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors text-left"
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <History className="w-4 h-4 text-slate-400 shrink-0" />
                    <span className="text-sm text-slate-700 dark:text-slate-300 font-medium truncate">
                      {typeof item === 'object' ? item.name : item}
                    </span>
                  </div>
                  <CornerDownLeft className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

