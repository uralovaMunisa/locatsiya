import React from 'react';
import { 
  X, 
  Search, 
  MapPin, 
  Navigation, 
  Compass, 
  Sparkles, 
  Building2, 
  Trees, 
  Landmark, 
  Check 
} from 'lucide-react';
import { useLanguage } from '../i18n';

// Preset famous landmarks for 1-click exploration
const POPULAR_LANDMARKS = [
  {
    name: 'Toshkent City Park',
    displayName: 'Tashkent City Park, Shayxontohur tumani, Toshkent, O‘zbekiston',
    subtitle: 'Shayxontohur tumani, Toshkent',
    lat: 41.3149,
    lng: 69.2488,
    categoryKey: 'park',
  },
  {
    name: 'Chorsu Bozori',
    displayName: 'Chorsu bozori, Beruniy ko‘chasi, Toshkent, O‘zbekiston',
    subtitle: 'Eski shahar, Toshkent',
    lat: 41.3274,
    lng: 69.2355,
    categoryKey: 'shop',
  },
  {
    name: 'Registon Maydoni',
    displayName: 'Registon maydoni, Samarqand, O‘zbekiston',
    subtitle: 'Samarqand shahri',
    lat: 39.6548,
    lng: 66.9757,
    categoryKey: 'attraction',
  },
  {
    name: 'Amir Temur Xiyoboni',
    displayName: 'Amir Temur xiyoboni, Mirobod tumani, Toshkent, O‘zbekiston',
    subtitle: 'Toshkent markazi',
    lat: 41.3113,
    lng: 69.2796,
    categoryKey: 'park',
  },
  {
    name: 'Minor Masjidi',
    displayName: 'Minor masjidi, Kichik halqa yo‘li, Toshkent, O‘zbekiston',
    subtitle: 'Yunusobod tumani, Toshkent',
    lat: 41.3327,
    lng: 69.2829,
    categoryKey: 'attraction',
  }
];

export function HowItWorks({ isOpen, onClose, onSelectLandmark, onStartTour }) {
  const { t } = useLanguage();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200/80 dark:border-slate-800/80 overflow-hidden max-h-[90vh] flex flex-col">
        {/* Top Header */}
        <div className="flex items-center justify-between p-6 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-primary-100 dark:bg-primary-950 flex items-center justify-center text-primary-600">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white">
                {t.howItWorks.title}
              </h3>
              <p className="text-xs sm:text-sm text-slate-500">
                {t.howItWorks.subtitle}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            type="button"
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content body */}
        <div className="p-6 space-y-6 overflow-y-auto">
          {/* 3 Step Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Step 1 */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 hover:border-primary-300 transition-colors">
              <div className="w-9 h-9 rounded-xl bg-primary-600 text-white flex items-center justify-center font-bold text-sm mb-3 shadow-md shadow-primary-500/20">
                <Search className="w-4 h-4" />
              </div>
              <h4 className="font-bold text-sm text-slate-900 dark:text-white mb-1">
                {t.howItWorks.step1Title}
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                {t.howItWorks.step1Desc}
              </p>
            </div>

            {/* Step 2 */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 hover:border-primary-300 transition-colors">
              <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-sm mb-3 shadow-md shadow-indigo-500/20">
                <MapPin className="w-4 h-4" />
              </div>
              <h4 className="font-bold text-sm text-slate-900 dark:text-white mb-1">
                {t.howItWorks.step2Title}
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                {t.howItWorks.step2Desc}
              </p>
            </div>

            {/* Step 3 */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 hover:border-primary-300 transition-colors">
              <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-sm mb-3 shadow-md shadow-emerald-500/20">
                <Navigation className="w-4 h-4" />
              </div>
              <h4 className="font-bold text-sm text-slate-900 dark:text-white mb-1">
                {t.howItWorks.step3Title}
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                {t.howItWorks.step3Desc}
              </p>
            </div>
          </div>

          {/* Popular Landmarks Section */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
              <Compass className="w-4 h-4 text-primary-500" />
              <span>{t.quickSuggestions}</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {POPULAR_LANDMARKS.map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    onSelectLandmark(item);
                    onClose();
                  }}
                  className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 hover:bg-primary-50/70 dark:bg-slate-800/50 dark:hover:bg-primary-950/40 border border-slate-200/60 dark:border-slate-700/60 hover:border-primary-300 transition-all text-left group"
                >
                  <div className="w-9 h-9 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-primary-600 shrink-0 group-hover:scale-105 transition-transform">
                    <Landmark className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      {item.name}
                    </p>
                    <p className="text-[11px] text-slate-400 truncate">
                      {item.subtitle}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-6 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
          {onStartTour && (
            <button
              onClick={() => {
                onClose();
                onStartTour();
              }}
              type="button"
              className="text-xs font-bold text-primary-600 dark:text-primary-400 hover:underline"
            >
              Interaktiv sayohatni boshlash
            </button>
          )}

          <button
            onClick={onClose}
            type="button"
            className="px-5 py-2.5 rounded-2xl bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-primary-500/25 transition-colors ml-auto"
          >
            {t.howItWorks.gotIt}
          </button>
        </div>
      </div>
    </div>
  );
}

