import React from 'react';
import { Menu, Plus, Download, Sparkles } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface HeaderProps {
  onOpenSidebar: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenSidebar }) => {
  const { activeTab, openCreateForm, openExportModal, t } = useApp();

  const getPageTitle = () => {
    switch (activeTab) {
      case 'overview':
        return t('navOverview');
      case 'inventory':
        return t('navInventory');
      case 'favorites':
        return t('navFavorites');
      case 'statistics':
        return t('navStatistics');
      case 'settings':
        return t('navSettings');
      default:
        return t('navOverview');
    }
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-[#E4DDD2] dark:border-[#363029] bg-[#F8F5F0]/90 dark:bg-[#171513]/90 px-4 backdrop-blur-md lg:hidden">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onOpenSidebar}
          aria-label="Open menu"
          className="flex h-10 w-10 items-center justify-center rounded-lg border border-[#E4DDD2] dark:border-[#363029] bg-white/80 dark:bg-[#221F1C] text-[#2A2521] dark:text-[#EDE6DE] active:scale-95 transition-transform"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="flex flex-col">
          <span className="font-cinzel text-base font-bold tracking-wider text-[#B85D19] dark:text-[#D77937]">
            ARCHIVIST
          </span>
          <span className="text-xs text-[#7E746A] dark:text-[#A3978B] font-serif-tc">
            {getPageTitle()}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={openExportModal}
          title="匯出"
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#E4DDD2] dark:border-[#38322B] bg-white dark:bg-[#221F1C] text-[#2A2521] dark:text-[#EDE6DE] active:scale-95 transition-transform"
        >
          <Download className="h-4 w-4 text-[#B85D19] dark:text-[#D77937]" />
        </button>

        <button
          type="button"
          onClick={() => openCreateForm()}
          className="flex h-9 items-center gap-1.5 rounded-lg bg-[#B85D19] dark:bg-[#D77937] px-3 text-xs font-semibold text-white shadow-sm active:scale-95 transition-transform"
        >
          <Plus className="h-4 w-4" />
          <span>{t('addNewItem')}</span>
        </button>
      </div>
    </header>
  );
};
