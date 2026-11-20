import React, { useState } from 'react';
import { 
  X, 
  MapPin, 
  Copy, 
  Check, 
  Share2, 
  ExternalLink, 
  Navigation, 
  Bookmark, 
  Car, 
  Footprints, 
  Clock, 
  Compass, 
  Route 
} from 'lucide-react';
import { useLanguage } from '../i18n';
import { 
  formatCoordinates, 
  copyToClipboard, 
  sharePlace, 
  calculateDistance, 
  formatDistance, 
  formatDuration, 
  estimateTravelTimes 
} from '../utils/helpers';

export function PlaceCard({
  place,
  userLocation,
  isFavorite,
  onToggleFavorite,
  onClose,
  onGetDirections,
  onShowToast,
  className = '',
}) {
  const { lang, t } = useLanguage();
  const [copied, setCopied] = useState(false);

  if (!place) return null;

  const CategoryIcon = place.categoryInfo?.icon || MapPin;
  const coordsStr = formatCoordinates(place.lat, place.lng);

  // Distance & time estimates
  let distanceMeters = null;
  let estimates = null;
  if (userLocation) {
    distanceMeters = calculateDistance(userLocation.lat, userLocation.lng, place.lat, place.lng);
    if (distanceMeters != null) {
      estimates = estimateTravelTimes(distanceMeters);
    }
  }

  const handleCopyCoords = async () => {
    const success = await copyToClipboard(coordsStr);
    if (success) {
      setCopied(true);
      onShowToast?.(t.coordsCopied);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleShare = async () => {
    const res = await sharePlace(place);
    if (res.copied) {
      onShowToast?.(t.shareSuccess);
    }
  };

  const openGoogleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${place.lat},${place.lng}`;

  return (
    <div 
      className={`fixed sm:absolute bottom-0 left-0 right-0 sm:bottom-auto sm:top-24 sm:left-4 sm:right-auto 
        w-full sm:w-96 max-h-[85vh] sm:max-h-[calc(100vh-120px)] overflow-y-auto 
        bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl 
        border-t sm:border border-slate-200/90 dark:border-slate-800/90 
        rounded-t-3xl sm:rounded-3xl shadow-2xl p-5 z-30 transition-all duration-300 animate-in slide-in-from-bottom-5 sm:slide-in-from-left-5 ${className}`}
    >
      {/* Mobile drag handle indicator */}
      <div className="w-12 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full mx-auto mb-3 sm:hidden" />

      {/* Top Header Row */}
      <div className="flex items-start justify-between gap-3">
        {/* Category Badge */}
        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold border ${place.categoryInfo?.color || 'text-primary-600 bg-primary-50 dark:bg-primary-950 border-primary-200'}`}>
            <CategoryIcon className="w-3.5 h-3.5" />
            <span>{t.categories[place.categoryKey] || place.categoryKey}</span>
          </span>

          {distanceMeters != null && (
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
              {formatDistance(distanceMeters, lang)} {t.away}
            </span>
          )}
        </div>

        {/* Favorite & Close Buttons */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => onToggleFavorite(place)}
            type="button"
            title={isFavorite ? t.removeFromFavorites : t.addToFavorites}
            className={`p-2 rounded-xl transition-all duration-200 ${
              isFavorite 
                ? 'bg-rose-50 dark:bg-rose-950/50 text-rose-500 hover:bg-rose-100 dark:hover:bg-rose-900/50' 
                : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Bookmark className={`w-5 h-5 ${isFavorite ? 'fill-rose-500 text-rose-500' : ''}`} />
          </button>

          <button
            onClick={onClose}
            type="button"
            title="Yopish"
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Place Title */}
      <h2 className="mt-3 text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-snug">
        {place.name}
      </h2>

      {/* Address */}
      <p className="mt-1 text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
        {place.subtitle || place.displayName}
      </p>

      {/* Travel Time Estimates Banner (if user location is active) */}
      {estimates && (
        <div className="mt-4 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
            {t.estimatedTime}
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center gap-2 p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
              <Car className="w-4 h-4 text-primary-500" />
              <div>
                <span className="text-[10px] text-slate-400 block">{t.driving}</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {formatDuration(estimates.drivingSeconds, lang)}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2 p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
              <Footprints className="w-4 h-4 text-emerald-500" />
              <div>
                <span className="text-[10px] text-slate-400 block">{t.walking}</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {formatDuration(estimates.walkingSeconds, lang)}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Coordinates Box */}
      <div className="mt-4 flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60">
        <div className="flex items-center gap-2">
          <Compass className="w-4 h-4 text-slate-400" />
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              {t.coordinates}
            </span>
            <span className="font-mono text-xs font-semibold text-slate-700 dark:text-slate-300">
              {coordsStr}
            </span>
          </div>
        </div>

        <button
          onClick={handleCopyCoords}
          type="button"
          title={t.copyCoords}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors shadow-sm active:scale-95"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copied ? "Nusxalandi" : "Nusxa"}</span>
        </button>
      </div>

      {/* Primary Action: Get Directions (Tour target) */}
      <button
        id="directions-tour-target"
        onClick={() => onGetDirections(place)}
        type="button"
        className="mt-4 w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl 
          bg-primary-600 hover:bg-primary-700 active:scale-[0.98] 
          text-white font-bold text-sm shadow-lg shadow-primary-500/30 
          transition-all duration-200"
      >
        <Navigation className="w-4 h-4" />
        <span>{t.getDirections}</span>
      </button>

      {/* Secondary Actions: Share & Google Maps */}
      <div className="mt-2.5 grid grid-cols-2 gap-2">
        <button
          onClick={handleShare}
          type="button"
          className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-2xl 
            bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 
            text-slate-700 dark:text-slate-200 text-xs font-semibold 
            transition-colors active:scale-95"
        >
          <Share2 className="w-3.5 h-3.5" />
          <span>{t.shareLocation}</span>
        </button>

        <a
          href={openGoogleMapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-2xl 
            bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 
            text-slate-700 dark:text-slate-200 text-xs font-semibold 
            transition-colors active:scale-95"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          <span>Google Xarita</span>
        </a>
      </div>
    </div>
  );
}

