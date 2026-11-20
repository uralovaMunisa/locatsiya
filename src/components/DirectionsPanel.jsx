import React, { useState } from 'react';
import { 
  X, 
  Car, 
  Footprints, 
  Bike, 
  Navigation, 
  MapPin, 
  CornerUpRight, 
  CornerUpLeft, 
  ArrowUp, 
  RotateCw, 
  CheckCircle2, 
  Loader2, 
  Clock, 
  AlertCircle 
} from 'lucide-react';
import { useLanguage } from '../i18n';
import { formatDistance, formatDuration } from '../utils/helpers';

export function DirectionsPanel({
  destination,
  userLocation,
  routeData,
  currentMode,
  onChangeMode,
  isLoadingRoute,
  routeError,
  onClose,
  onStepClick,
  className = '',
}) {
  const { lang, t } = useLanguage();
  const [activeStepIdx, setActiveStepIdx] = useState(null);

  if (!destination) return null;

  const MODES = [
    { id: 'driving', label: t.driving, icon: Car },
    { id: 'walking', label: t.walking, icon: Footprints },
    { id: 'cycling', label: t.cycling, icon: Bike },
  ];

  const handleStepClick = (step, idx) => {
    setActiveStepIdx(idx);
    if (step.location) {
      onStepClick?.(step.location);
    }
  };

  const getManeuverIcon = (step) => {
    const type = step.type || '';
    const modifier = step.modifier || '';

    if (type === 'arrive') return CheckCircle2;
    if (type === 'roundabout') return RotateCw;
    if (modifier.includes('right')) return CornerUpRight;
    if (modifier.includes('left')) return CornerUpLeft;
    return ArrowUp;
  };

  return (
    <div 
      className={`fixed sm:absolute bottom-0 left-0 right-0 sm:bottom-auto sm:top-24 sm:left-4 sm:right-auto 
        w-full sm:w-96 max-h-[85vh] sm:max-h-[calc(100vh-120px)] flex flex-col 
        bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl 
        border-t sm:border border-slate-200/90 dark:border-slate-800/90 
        rounded-t-3xl sm:rounded-3xl shadow-2xl p-5 z-30 transition-all duration-300 animate-in slide-in-from-bottom-5 sm:slide-in-from-left-5 ${className}`}
    >
      {/* Mobile drag handle */}
      <div className="w-12 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full mx-auto mb-3 sm:hidden" />

      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-primary-50 dark:bg-primary-950 flex items-center justify-center text-primary-600">
            <Navigation className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white">
              {t.directionsTitle}
            </h3>
            <p className="text-[11px] text-slate-500 truncate max-w-[200px]">
              {destination.name}
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          type="button"
          title={t.closeDirections}
          className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Mode Switcher Tabs */}
      <div className="grid grid-cols-3 gap-1.5 p-1 mt-3 rounded-2xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
        {MODES.map((mode) => {
          const Icon = mode.icon;
          const isActive = currentMode === mode.id;
          return (
            <button
              key={mode.id}
              onClick={() => onChangeMode(mode.id)}
              type="button"
              className={`flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold transition-all
                ${isActive 
                  ? 'bg-white dark:bg-slate-900 text-primary-600 dark:text-primary-400 shadow-sm' 
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
            >
              <Icon className="w-4 h-4" />
              <span>{mode.label}</span>
            </button>
          );
        })}
      </div>

      {/* Origin -> Destination Indicator */}
      <div className="mt-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/50 dark:border-slate-700/50 flex flex-col gap-2 text-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-emerald-200 dark:ring-emerald-900 shrink-0" />
          <span className="text-slate-600 dark:text-slate-300 font-medium truncate">
            {userLocation ? t.routeFromUser : t.customStart}
          </span>
        </div>
        <div className="ml-1.5 border-l-2 border-dashed border-slate-300 dark:border-slate-700 h-2" />
        <div className="flex items-center gap-2.5">
          <div className="w-3 h-3 rounded-full bg-primary-600 ring-2 ring-primary-200 dark:ring-primary-900 shrink-0" />
          <span className="font-bold text-slate-900 dark:text-white truncate">
            {destination.name}
          </span>
        </div>
      </div>

      {/* Loading state */}
      {isLoadingRoute && (
        <div className="py-8 flex flex-col items-center justify-center text-center">
          <Loader2 className="w-8 h-8 text-primary-500 animate-spin mb-2" />
          <p className="text-xs font-semibold text-slate-500">
            {t.searching}
          </p>
        </div>
      )}

      {/* Route Error */}
      {routeError && !isLoadingRoute && (
        <div className="mt-3 p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-start gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{routeError || t.routeNotFound}</span>
        </div>
      )}

      {/* Route Summary Stats (Distance & Duration) */}
      {routeData && !isLoadingRoute && (
        <div className="mt-3 grid grid-cols-2 gap-2">
          <div className="p-3 rounded-2xl bg-primary-50 dark:bg-primary-950/50 border border-primary-200 dark:border-primary-800/50">
            <span className="text-[10px] font-bold uppercase tracking-wider text-primary-700 dark:text-primary-300 block">
              {t.distance}
            </span>
            <span className="text-lg font-extrabold text-primary-900 dark:text-primary-100">
              {formatDistance(routeData.distance, lang)}
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/50">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300 block">
              {t.duration}
            </span>
            <span className="text-lg font-extrabold text-emerald-900 dark:text-emerald-100">
              {formatDuration(routeData.duration, lang)}
            </span>
          </div>
        </div>
      )}

      {/* Step-by-step turn-by-turn list */}
      {routeData && routeData.steps && routeData.steps.length > 0 && !isLoadingRoute && (
        <div className="mt-4 flex-1 overflow-y-auto pr-1">
          <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
            {t.steps} ({routeData.steps.length})
          </h4>
          <div className="space-y-1.5">
            {routeData.steps.map((step, idx) => {
              const ManeuverIcon = getManeuverIcon(step);
              const isActive = activeStepIdx === idx;

              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleStepClick(step, idx)}
                  className={`w-full flex items-start gap-3 p-2.5 rounded-2xl text-left transition-all
                    ${isActive 
                      ? 'bg-primary-50 dark:bg-primary-950/60 border border-primary-200 dark:border-primary-800' 
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800/60 border border-transparent'}`}
                >
                  <div className={`p-2 rounded-xl shrink-0 mt-0.5 ${isActive ? 'bg-primary-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'}`}>
                    <ManeuverIcon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 leading-snug">
                      {step.instruction}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-400">
                      <span>{formatDistance(step.distance, lang)}</span>
                      {step.duration > 0 && (
                        <>
                          <span>•</span>
                          <span>{formatDuration(step.duration, lang)}</span>
                        </>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

