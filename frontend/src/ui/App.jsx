import React, { useEffect, useState } from 'react';
import { Sun, Moon, Settings, BarChart2, Hammer, FlaskConical, ArrowLeftRight, LineChart, TrendingUp, Radio, X } from 'lucide-react';
import { useStore } from '../cache/marketStore';
import { ApiService } from '../services/apiService';

import { Dashboard }    from './components/Dashboard';
import { CraftTab }     from './components/CraftTab';
import { RefineTab }    from './components/RefineTab';
import { TransportTab } from './components/TransportTab';
import { MarketTab }    from './components/MarketTab';
import { FlipTab }      from './components/FlipTab';
import { SettingsSidebar } from './components/SettingsSidebar';
import { DetailPanel }  from './components/DetailPanel';

const TABS = [
  { id: 'dashboard',  label: 'Dashboard',  Icon: BarChart2,      shortLabel: 'Dash' },
  { id: 'craft',      label: 'Craft',       Icon: Hammer,         shortLabel: 'Craft' },
  { id: 'refine',     label: 'Refine',      Icon: FlaskConical,   shortLabel: 'Refine' },
  { id: 'transport',  label: 'Transport',   Icon: ArrowLeftRight, shortLabel: 'Trans' },
  { id: 'market',     label: 'Market',      Icon: LineChart,      shortLabel: 'Market' },
  { id: 'flip',       label: 'Flip',        Icon: TrendingUp,     shortLabel: 'Flip' },
];

const CONTENT_MAP = {
  dashboard: Dashboard,
  craft:     CraftTab,
  refine:    RefineTab,
  transport: TransportTab,
  market:    MarketTab,
  flip:      FlipTab,
};

function App() {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved ? saved === 'dark' : true;
  });

  const activeMainTab   = useStore(s => s.activeMainTab);
  const setActiveMainTab = useStore(s => s.setActiveMainTab);
  const isSettingsOpen  = useStore(s => s.isSettingsOpen);
  const setIsSettingsOpen = useStore(s => s.setIsSettingsOpen);
  const selectedItem    = useStore(s => s.selectedItem);
  const setSelectedItem = useStore(s => s.setSelectedItem);
  const scannerStatus   = useStore(s => s.scannerStatus);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkMode);
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  // Poll scanner status every 10s
  useEffect(() => {
    ApiService.fetchScannerStatus();
    const interval = setInterval(() => ApiService.fetchScannerStatus(), 10000);
    return () => clearInterval(interval);
  }, []);

  const ActiveContent = CONTENT_MAP[activeMainTab] || Dashboard;
  const cachedItems = scannerStatus?.cachedItems || 0;
  const totalItems = scannerStatus?.totalItems || 0;
  const scanProgress = totalItems > 0 ? Math.min(100, Math.round((cachedItems / totalItems) * 100)) : 0;

  return (
    <div className="h-screen bg-canvas flex flex-col overflow-hidden transition-colors duration-300">
      {/* ── TOP HEADER ─────────────────────────────────────── */}
      <header className="flex-shrink-0 z-20 flex items-center justify-between px-4 py-2 border-b border-hairline bg-surface-card shadow-sm">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-sm font-bold text-strong leading-none tracking-wide">
              ✦ Albion Trading
            </h1>
            <p className="text-[9px] text-muted tracking-widest uppercase mt-0.5">
              Full System
            </p>
          </div>

          {/* Scanner pill */}
          {scannerStatus && (
            <div className="hidden sm:flex items-center gap-1.5 px-2 py-1 rounded-full bg-surface-elevated border border-hairline text-[10px]">
              <Radio size={10} className={scannerStatus.isRunning ? 'text-trading-up animate-pulse' : 'text-muted'} />
              <span className="text-muted">{cachedItems}/{totalItems}</span>
              <div className="w-16 h-1 bg-hairline rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${scanProgress}%` }} />
              </div>
              <span className="text-primary font-semibold">{scanProgress}%</span>
            </div>
          )}
        </div>

        {/* Tabs Navigation */}
        <nav className="flex items-center gap-0.5">
          {TABS.map(({ id, label, Icon, shortLabel }) => {
            const active = activeMainTab === id;
            return (
              <button
                key={id}
                onClick={() => setActiveMainTab(id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150
                  ${active
                    ? 'bg-primary/15 text-primary shadow-sm'
                    : 'text-muted hover:text-strong hover:bg-surface-elevated'
                  }`}
              >
                <Icon size={13} />
                <span className="hidden sm:inline">{label}</span>
                <span className="sm:hidden">{shortLabel}</span>
              </button>
            );
          })}
        </nav>

        {/* Right controls */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setIsSettingsOpen(!isSettingsOpen)}
            className={`p-1.5 rounded-lg transition-colors border
              ${isSettingsOpen
                ? 'bg-primary/10 text-primary border-primary/30'
                : 'text-muted hover:text-strong bg-surface-card hover:bg-surface-elevated border-hairline'
              }`}
          >
            <Settings size={16} />
          </button>
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="p-1.5 text-muted hover:text-strong bg-surface-card hover:bg-surface-elevated rounded-lg border border-hairline transition-colors"
          >
            {isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
          </button>
        </div>
      </header>

      {/* ── MAIN AREA ───────────────────────────────────────── */}
      <div className="flex-1 flex overflow-hidden">
        {/* Settings sidebar */}
        {isSettingsOpen && (
          <div className="w-80 flex-shrink-0 border-r border-hairline overflow-hidden">
            <SettingsSidebar />
          </div>
        )}

        {/* Active content */}
        <div className="flex-1 overflow-hidden">
          <ActiveContent />
        </div>

        {/* Detail panel */}
        {selectedItem && (
          <div className="w-80 flex-shrink-0 border-l border-hairline overflow-hidden">
            <DetailPanel />
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
