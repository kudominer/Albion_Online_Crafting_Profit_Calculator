import React from 'react';
import { Crosshair, Star, Settings } from 'lucide-react';
import { useStore } from '../../cache/marketStore';

export function LeftNavigationBar() {
  const activeTab = useStore(state => state.activeTab);
  const setActiveTab = useStore(state => state.setActiveTab);
  const isSettingsOpen = useStore(state => state.isSettingsOpen);
  const setIsSettingsOpen = useStore(state => state.setIsSettingsOpen);

  return (
    <div className="w-16 h-full bg-surface-elevated/50 border-r border-hairline flex flex-col items-center py-4 gap-6 shrink-0 z-40">
      <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center mb-4">
        <span className="text-primary font-bold text-xl">A</span>
      </div>

      <nav className="flex flex-col gap-4 flex-1">
        <button
          onClick={() => {
            setActiveTab('destiny');
            setIsSettingsOpen(false);
          }}
          className={`relative p-3 rounded-xl transition-all group ${
            activeTab === 'destiny' && !isSettingsOpen
              ? 'bg-primary text-black shadow-lg shadow-primary/20'
              : 'text-muted hover:bg-surface-card hover:text-strong'
          }`}
          title="Destiny Board"
        >
          <Crosshair size={22} />
          {activeTab === 'destiny' && !isSettingsOpen && (
            <div className="absolute -left-4 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary rounded-r-full"></div>
          )}
        </button>

        <button
          onClick={() => {
            setActiveTab('watchlist');
            setIsSettingsOpen(false);
          }}
          className={`relative p-3 rounded-xl transition-all group ${
            activeTab === 'watchlist' && !isSettingsOpen
              ? 'bg-primary text-black shadow-lg shadow-primary/20'
              : 'text-muted hover:bg-surface-card hover:text-strong'
          }`}
          title="Danh sách theo dõi (Watchlist)"
        >
          <Star size={22} />
          {activeTab === 'watchlist' && !isSettingsOpen && (
            <div className="absolute -left-4 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary rounded-r-full"></div>
          )}
        </button>
      </nav>

      <div className="mt-auto">
        <button
          onClick={() => setIsSettingsOpen(!isSettingsOpen)}
          className={`relative p-3 rounded-xl transition-all group ${
            isSettingsOpen
              ? 'bg-surface-card text-strong border border-hairline'
              : 'text-muted hover:bg-surface-card hover:text-strong'
          }`}
          title="Cài đặt & Nguyên liệu"
        >
          <Settings size={22} className={isSettingsOpen ? 'animate-spin-slow text-primary' : ''} />
          {isSettingsOpen && (
            <div className="absolute -left-4 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary rounded-r-full"></div>
          )}
        </button>
      </div>
    </div>
  );
}
