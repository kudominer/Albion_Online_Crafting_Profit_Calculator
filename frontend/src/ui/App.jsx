import React, { useEffect } from 'react';
import { Sun, Moon, Settings } from 'lucide-react';
import { DestinyBoard } from './components/DestinyBoard';
import { DetailPanel } from './components/DetailPanel';
import { SettingsSidebar } from './components/SettingsSidebar';
import { LeftNavigationBar } from './components/LeftNavigationBar';
import { Watchlist } from './components/Watchlist';
import { useStore } from '../cache/marketStore';

function App() {
  const [isDarkMode, setIsDarkMode] = React.useState(() => {
    const saved = localStorage.getItem('theme');
    if (saved) return saved === 'dark';
    return true; // Default dark
  });
  
  const selectedItem = useStore(state => state.selectedItem);
  const isFetching = useStore(state => state.isFetching);
  const isSettingsOpen = useStore(state => state.isSettingsOpen);
  const setIsSettingsOpen = useStore(state => state.setIsSettingsOpen);
  const activeTab = useStore(state => state.activeTab);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  // Tính toán chiều rộng của DestinyBoard dựa trên việc mở các panel khác
  let mainWidthClass = 'w-full';
  if (isSettingsOpen && selectedItem) {
    mainWidthClass = 'hidden xl:block xl:w-2/4'; // Chỉ hiện trên màn hình rất lớn nếu mở cả 2 bên
  } else if (isSettingsOpen) {
    mainWidthClass = 'hidden md:block md:w-2/3 lg:w-3/4'; // Hiện Destiny board nếu chỉ mở Left Sidebar
  } else if (selectedItem) {
    mainWidthClass = 'hidden md:block md:w-2/3 lg:w-3/4'; // Hiện Destiny board nếu chỉ mở Right Sidebar
  }

  return (
    <div className="h-screen bg-canvas transition-colors duration-300 flex overflow-hidden">
      <LeftNavigationBar />
      
      <div className="flex-1 flex flex-col min-w-0">
        <header className="flex-shrink-0 px-4 md:px-6 py-3 md:py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-hairline bg-surface-elevated/20 z-10 shadow-sm">
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-xl font-bold text-strong transition-colors">Albion Crafting Profit</h1>
              <p className="text-xs text-muted transition-colors">Auto-calculating real-time profits</p>
            </div>
            {isFetching && (
              <div className="hidden sm:flex items-center gap-2 text-xs text-info ml-4 bg-info/10 px-3 py-1.5 rounded-full border border-info/20">
                <div className="w-3 h-3 rounded-full border-2 border-info border-t-transparent animate-spin"></div>
                Đang tải giá thị trường...
              </div>
            )}
          </div>
          <div className="flex gap-2">
            {isFetching && (
              <div className="sm:hidden flex items-center gap-2 text-xs text-info bg-info/10 px-3 py-1.5 rounded-full border border-info/20">
                <div className="w-3 h-3 rounded-full border-2 border-info border-t-transparent animate-spin"></div>
              </div>
            )}
            <button
              onClick={toggleTheme}
              className="p-2 bg-surface-card hover:bg-surface-elevated text-body rounded-lg transition-colors border border-hairline shadow-sm"
              title={isDarkMode ? "Chuyển sang Giao diện Sáng" : "Chuyển sang Giao diện Tối"}
            >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-hidden flex flex-row relative">
          {/* Left Settings Sidebar */}
          {isSettingsOpen && (
            <div className="absolute inset-y-0 left-0 z-30 md:relative md:z-0 w-full md:w-1/3 lg:w-1/4 md:min-w-[320px] md:max-w-[400px] h-full shadow-2xl md:shadow-none bg-canvas animate-in slide-in-from-left-10 duration-300 border-r border-hairline">
              <SettingsSidebar />
            </div>
          )}

          {/* Main Content Area */}
          <div className={`h-full transition-all duration-300 ${mainWidthClass}`}>
            {activeTab === 'destiny' ? <DestinyBoard /> : <Watchlist />}
          </div>

          {/* Right Detail Panel */}
          {selectedItem && (
            <div className="absolute inset-y-0 right-0 z-20 md:relative md:z-0 w-full md:w-1/3 lg:w-1/4 md:min-w-[320px] md:max-w-[400px] h-full shadow-2xl md:border-l border-hairline bg-canvas animate-in slide-in-from-bottom-10 md:slide-in-from-right-10 duration-300">
              <DetailPanel />
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
