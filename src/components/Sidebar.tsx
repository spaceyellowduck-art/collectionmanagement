import React from 'react';
import {
  LayoutGrid,
  Archive,
  Heart,
  BarChart3,
  Settings,
  PlusCircle,
  Sun,
  Moon,
  Globe,
  X,
  Sparkles,
} from 'lucide-react';
import { PageTab, Language } from '../types';
import { useApp } from '../context/AppContext';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const {
    items,
    categories,
    activeTab,
    setActiveTab,
    openCreateForm,
    language,
    setLanguage,
    theme,
    setTheme,
    t,
  } = useApp();

  const totalCount = items.length;
  const favoriteCount = items.filter((i) => i.isFavorite).length;
  const categoryCount = categories.length;

  const navItems: { tab: PageTab; labelKey: string; icon: React.ElementType; badge?: number }[] = [
    { tab: 'overview', labelKey: 'navOverview', icon: LayoutGrid },
    { tab: 'inventory', labelKey: 'navInventory', icon: Archive, badge: totalCount },
    { tab: 'favorites', labelKey: 'navFavorites', icon: Heart, badge: favoriteCount },
    { tab: 'statistics', labelKey: 'navStatistics', icon: BarChart3 },
    { tab: 'valuation', labelKey: 'navValuation', icon: Sparkles },
    { tab: 'settings', labelKey: 'navSettings', icon: Settings, badge: categoryCount },
  ];

  const handleNavClick = (tab: PageTab) => {
    setActiveTab(tab);
    onClose();
  };

  const handleLanguageCycle = () => {
    const nextLang: Record<Language, Language> = {
      'zh-TW': 'en',
      en: 'zh-CN',
      'zh-CN': 'zh-TW',
    };
    setLanguage(nextLang[language]);
  };

  const getLangDisplayName = (lang: Language) => {
    switch (lang) {
      case 'zh-TW':
        return '繁體中文';
      case 'en':
        return 'English';
      case 'zh-CN':
        return '简体中文';
      default:
        return '繁中';
    }
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs transition-opacity lg:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex w-72 flex-col border-r border-[#E4DDD2] dark:border-[#363029] bg-[#F1ECE3] dark:bg-[#1C1A17] transition-transform duration-300 ease-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full lg:shadow-none'
        }`}
      >
        {/* Brand Header */}
        <div className="flex items-center justify-between border-b border-[#E4DDD2] dark:border-[#363029] p-6">
          <div
            onClick={() => handleNavClick('overview')}
            className="cursor-pointer group flex flex-col"
          >
            <div className="flex items-center gap-2">
              <span className="font-cinzel text-xl font-bold tracking-widest text-[#B85D19] dark:text-[#D77937]">
                ARCHIVIST
              </span>
              <span className="flex h-2 w-2 rounded-full bg-[#B85D19] dark:bg-[#D77937] animate-pulse" />
            </div>
            <p className="mt-0.5 font-serif-tc text-xs tracking-wider text-[#7E746A] dark:text-[#A3978B]">
              {t('appSubtitle')}
            </p>
          </div>

          {/* Mobile close button */}
          <button
            type="button"
            aria-label="Close Sidebar"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[#7E746A] hover:bg-[#E4DDD2]/60 dark:hover:bg-[#2C2824] lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Quick Add Action & Export Buttons */}
        <div className="px-4 pt-4 pb-2 space-y-2">
          <button
            type="button"
            onClick={() => {
              openCreateForm();
              onClose();
            }}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#B85D19] hover:bg-[#9E4E13] dark:bg-[#D77937] dark:hover:bg-[#E88949] py-2.5 px-4 font-serif-tc text-xs font-semibold tracking-wide text-white shadow-sm transition-all hover:shadow-md active:scale-[0.98]"
          >
            <PlusCircle className="h-4 w-4" />
            <span>{t('addNewItem')}</span>
          </button>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.tab;

            return (
              <button
                key={item.tab}
                type="button"
                onClick={() => handleNavClick(item.tab)}
                className={`group flex w-full items-center justify-between rounded-xl px-4 py-3 text-sm font-serif-tc transition-all duration-200 ${
                  isActive
                    ? 'bg-[#B85D19] text-white font-medium shadow-md shadow-[#B85D19]/25 dark:bg-[#D77937]'
                    : 'text-[#2A2521] dark:text-[#EDE6DE] hover:bg-[#E6DFD4]/70 dark:hover:bg-[#2A2622]'
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <Icon
                    className={`h-5 w-5 transition-transform group-hover:scale-110 ${
                      isActive
                        ? 'text-white'
                        : 'text-[#7E746A] dark:text-[#A3978B] group-hover:text-[#B85D19] dark:group-hover:text-[#D77937]'
                    }`}
                  />
                  <span className="tracking-wide">{t(item.labelKey)}</span>
                </div>

                {item.badge !== undefined && item.badge > 0 && (
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-sans font-medium ${
                      isActive
                        ? 'bg-white/25 text-white'
                        : 'bg-[#E4DDD2] text-[#7E746A] dark:bg-[#2C2824] dark:text-[#A3978B]'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Sidebar Footer (Preferences: Theme & Language) */}
        <div className="border-t border-[#E4DDD2] dark:border-[#363029] p-4 space-y-2">
          <div className="flex items-center justify-between gap-2">
            {/* Theme Toggle */}
            <button
              type="button"
              onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
              className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-[#E4DDD2] dark:border-[#363029] bg-white/70 dark:bg-[#221F1C] py-2 px-3 text-xs font-medium text-[#2A2521] dark:text-[#EDE6DE] hover:bg-white dark:hover:bg-[#2A2622] transition-colors"
            >
              {theme === 'light' ? (
                <>
                  <Moon className="h-3.5 w-3.5 text-[#B85D19]" />
                  <span>深色</span>
                </>
              ) : (
                <>
                  <Sun className="h-3.5 w-3.5 text-[#D77937]" />
                  <span>淺色</span>
                </>
              )}
            </button>

            {/* Language Selector */}
            <button
              type="button"
              onClick={handleLanguageCycle}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-[#E4DDD2] dark:border-[#363029] bg-white/70 dark:bg-[#221F1C] py-2 px-3 text-xs font-medium text-[#2A2521] dark:text-[#EDE6DE] hover:bg-white dark:hover:bg-[#2A2622] transition-colors"
            >
              <Globe className="h-3.5 w-3.5 text-[#7E746A] dark:text-[#A3978B]" />
              <span>{getLangDisplayName(language)}</span>
            </button>
          </div>

          <div className="pt-2 text-center">
            <span className="text-[11px] text-[#7E746A]/70 dark:text-[#A3978B]/60 font-sans tracking-wider">
              INDEXEDDB PERSISTENCE
            </span>
          </div>
        </div>
      </aside>
    </>
  );
};
