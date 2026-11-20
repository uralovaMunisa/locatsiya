import React, { useState } from 'react';
import { 
  X, 
  Search, 
  Crosshair, 
  Navigation, 
  ArrowRight, 
  ArrowLeft, 
  Check 
} from 'lucide-react';
import { useLanguage } from '../i18n';

export function OnboardingModal({ isOpen, onClose }) {
  const { t } = useLanguage();
  const [step, setStep] = useState(0);

  if (!isOpen) return null;

  const STEPS = [
    {
      id: 'search',
      targetId: 'search-bar-tour-target',
      icon: Search,
      color: 'bg-primary-600 text-white',
      title: t.onboarding.step1Title,
      desc: t.onboarding.step1Desc,
    },
    {
      id: 'location',
      targetId: 'my-location-tour-target',
      icon: Crosshair,
      color: 'bg-indigo-600 text-white',
      title: t.onboarding.step2Title,
      desc: t.onboarding.step2Desc,
    },
    {
      id: 'directions',
      targetId: 'directions-tour-target',
      icon: Navigation,
      color: 'bg-emerald-600 text-white',
      title: t.onboarding.step3Title,
      desc: t.onboarding.step3Desc,
    },
  ];

  const current = STEPS[step];
  const Icon = current.icon;
  const isLast = step === STEPS.length - 1;

  const handleNext = () => {
    if (isLast) {
      onClose();
    } else {
      setStep(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    setStep(prev => (prev > 0 ? prev - 1 : 0));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/65 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-7 text-center">
        {/* Step indicator pills */}
        <div className="flex items-center justify-center gap-1.5 mb-5">
          {STEPS.map((_, idx) => (
            <div
              key={idx}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                idx === step 
                  ? 'w-8 bg-primary-600' 
                  : 'w-2 bg-slate-200 dark:bg-slate-700'
              }`}
            />
          ))}
        </div>

        {/* Big step icon */}
        <div className={`w-14 h-14 rounded-2xl mx-auto flex items-center justify-center shadow-xl shadow-primary-500/20 mb-4 ${current.color}`}>
          <Icon className="w-7 h-7" />
        </div>

        {/* Step Title & Description */}
        <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          {current.title}
        </h3>
        <p className="mt-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed max-w-sm mx-auto">
          {current.desc}
        </p>

        {/* Navigation Action Buttons */}
        <div className="mt-7 flex items-center justify-between gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          {step > 0 ? (
            <button
              onClick={handlePrev}
              type="button"
              className="flex items-center gap-1 px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>{t.onboarding.prev}</span>
            </button>
          ) : (
            <button
              onClick={onClose}
              type="button"
              className="text-xs font-semibold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              {t.onboarding.skip}
            </button>
          )}

          <button
            onClick={handleNext}
            type="button"
            className="flex items-center gap-1.5 px-6 py-2.5 rounded-2xl bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-primary-500/25 transition-all active:scale-95 ml-auto"
          >
            <span>{isLast ? t.onboarding.finish : t.onboarding.next}</span>
            {isLast ? <Check className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
}

