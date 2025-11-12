import React from 'react';
import { useTranslation } from 'react-i18next';

const LanguageSwitcher = ({ className = '' }) => {
  const { i18n } = useTranslation();

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    try { localStorage.setItem('i18nextLng', lng); } catch (_) {}
  };

  const current = i18n.resolvedLanguage || i18n.language || 'en';

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <button
        onClick={() => changeLanguage('en')}
        className={`px-2 py-1 rounded-md text-sm border ${current.startsWith('en') ? 'bg-primary text-primary-foreground border-primary' : 'bg-card text-foreground border-border'}`}
        aria-pressed={current.startsWith('en')}
      >
        EN
      </button>
      <button
        onClick={() => changeLanguage('hi')}
        className={`px-2 py-1 rounded-md text-sm border ${current.startsWith('hi') ? 'bg-primary text-primary-foreground border-primary' : 'bg-card text-foreground border-border'}`}
        aria-pressed={current.startsWith('hi')}
      >
        HI
      </button>
    </div>
  );
};

export default LanguageSwitcher;
