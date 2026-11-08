import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { OverviewView } from './components/OverviewView';
import { InventoryView } from './components/InventoryView';
import { FavoritesView } from './components/FavoritesView';
import { StatisticsView } from './components/StatisticsView';
import { SettingsView } from './components/SettingsView';
import { ValuationView } from './components/ValuationView';
import { ItemDetailModal } from './components/ItemDetailModal';
import { ItemFormModal } from './components/ItemFormModal';
import { DeleteConfirmModal } from './components/DeleteConfirmModal';
import { CategoryModal } from './components/CategoryModal';
import { CategoryFieldEditorModal } from './components/CategoryFieldEditorModal';
import { ExportModal } from './components/ExportModal';
import { ToastContainer } from './components/Toast';

const MainContent: React.FC = () => {
  const { activeTab, loading } = useApp();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#F8F5F0] dark:bg-[#171513] text-[#2A2521] dark:text-[#EDE6DE] flex flex-col antialiased">
      {/* Left Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Mobile Header */}
      <Header onOpenSidebar={() => setSidebarOpen(true)} />

      {/* Main Content Area (offset by sidebar width on large displays) */}
      <main className="flex-1 lg:pl-72 transition-all duration-300">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-8 sm:py-10">
          {loading ? (
            <div className="flex h-96 flex-col items-center justify-center space-y-3">
              <div className="h-10 w-10 animate-spin rounded-full border-3 border-[#B85D19] border-t-transparent dark:border-[#D77937]" />
              <span className="font-serif-tc text-xs font-medium text-[#7E746A] dark:text-[#A3978B] tracking-wider">
                正在自 IndexedDB 讀取典藏庫...
              </span>
            </div>
          ) : (
            <>
              {activeTab === 'overview' && <OverviewView />}
              {activeTab === 'inventory' && <InventoryView />}
              {activeTab === 'favorites' && <FavoritesView />}
              {activeTab === 'statistics' && <StatisticsView />}
              {activeTab === 'valuation' && <ValuationView />}
              {activeTab === 'settings' && <SettingsView />}
            </>
          )}
        </div>
      </main>

      {/* Modals & Overlays */}
      <ItemDetailModal />
      <ItemFormModal />
      <DeleteConfirmModal />
      <CategoryModal />
      <CategoryFieldEditorModal />
      <ExportModal />
      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
}
