import React, { useState, useMemo } from 'react';
import { ChevronRight, ChevronDown, Settings, X, Save } from 'lucide-react';
import { useStore } from '../../cache/marketStore';
import { ItemService } from '../../services/itemService';
import { ApiService } from '../../services/apiService';
import { CraftingService } from '../../services/craftingService';
import { API_SERVERS } from '../../core/config';

const MaterialNode = ({ node, level = 0 }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const marketData = useStore(state => state.marketData);
  const customPrices = useStore(state => state.customPrices);
  const setCustomPrice = useStore(state => state.setCustomPrice);
  
  const hasChildren = node.children && node.children.length > 0;

  const handleToggle = (e) => {
    e.stopPropagation();
    const nextState = !isExpanded;
    setIsExpanded(nextState);
    
    if (nextState && hasChildren) {
      const itemsToFetch = [];
      const gatherLeaves = (n) => {
        if (!n.children || n.children.length === 0) {
          if (n.uniqueName) itemsToFetch.push(n.uniqueName);
        } else {
          n.children.forEach(gatherLeaves);
        }
      };
      
      node.children.forEach(gatherLeaves);
      
      const uniqueNamesToFetch = [...new Set(itemsToFetch)];
      if (uniqueNamesToFetch.length > 0) {
        ApiService.fetchMarketPrices(uniqueNamesToFetch);
      }
    }
  };

  let apiPrice = 0;
  if (!hasChildren && node.uniqueName && marketData[node.uniqueName]) {
    const cityData = marketData[node.uniqueName];
    const sells = Object.values(cityData).map(d => d.sellPriceMin).filter(p => p > 0);
    apiPrice = sells.length > 0 ? Math.min(...sells) : 0;
  }

  const customPrice = customPrices[node.uniqueName] || '';

  return (
    <div className="w-full">
      <div 
        className={`flex items-center gap-2 py-2 px-2 my-1 rounded-lg transition-all duration-200 border border-transparent
          ${hasChildren ? 'cursor-pointer hover:bg-surface-elevated' : 'bg-surface-card border-hairline'}
        `}
        style={{ paddingLeft: `${level * 1.5 + 0.5}rem` }}
        onClick={hasChildren ? handleToggle : undefined}
      >
        {level > 0 && (
          <div className="absolute left-0 w-4 h-px bg-hairline" style={{ left: `${level * 1.5 - 0.5}rem` }}></div>
        )}

        <div className="flex-shrink-0 w-4 h-4 flex items-center justify-center text-muted">
          {hasChildren ? (
            isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />
          ) : (
            <div className="w-1.5 h-1.5 rounded-full bg-primary glow"></div>
          )}
        </div>
        
        {!hasChildren && node.uniqueName && (
          <div className="w-10 h-10 bg-surface-elevated rounded-lg p-1 shrink-0 flex items-center justify-center border border-hairline">
            <img 
              loading="lazy"
              src={`https://render.albiononline.com/v1/item/${node.uniqueName}.png`} 
              alt={node.name}
              className="w-full h-full object-contain p-0.5"
              onError={(e) => { e.target.style.display = 'none'; }}
            />
          </div>
        )}

        {!hasChildren ? (
          <div className="flex flex-col flex-1 min-w-0 gap-1">
            <div className="flex justify-between items-center">
              <span className="text-xs font-semibold text-strong truncate">{node.name}</span>
              <span className="text-[10px] text-muted">API: {apiPrice > 0 ? CraftingService.formatSilver(apiPrice) : '--'}</span>
            </div>
            <div className="flex items-center gap-2">
              <input 
                type="number"
                placeholder="Nhập giá..."
                value={customPrice}
                onChange={(e) => setCustomPrice(node.uniqueName, e.target.value)}
                className="flex-1 w-full bg-canvas border border-primary/30 focus:border-primary rounded px-2 py-1 text-xs font-plex text-strong outline-none transition-colors"
              />
            </div>
          </div>
        ) : (
          <span className="text-sm transition-colors text-body font-medium">{node.name}</span>
        )}
      </div>

      {hasChildren && isExpanded && (
        <div className="relative">
          <div className="absolute top-0 bottom-0 w-px bg-hairline" style={{ left: `${level * 1.5 + 1}rem` }}></div>
          {node.children.map(child => (
            <MaterialNode 
              key={child.id} 
              node={child} 
              level={level + 1} 
            />
          ))}
        </div>
      )}
    </div>
  );
};

export function SettingsSidebar() {
  const globalRrr = useStore(state => state.globalRrr);
  const globalTax = useStore(state => state.globalTax);
  const globalCraftFee = useStore(state => state.globalCraftFee);
  const globalCity = useStore(state => state.globalCity);
  const globalServer = useStore(state => state.globalServer);
  const globalLanguage = useStore(state => state.globalLanguage);
  
  const setGlobalRrr = useStore(state => state.setGlobalRrr);
  const setGlobalTax = useStore(state => state.setGlobalTax);
  const setGlobalCraftFee = useStore(state => state.setGlobalCraftFee);
  const setGlobalCity = useStore(state => state.setGlobalCity);
  const setGlobalServer = useStore(state => state.setGlobalServer);
  const setGlobalLanguage = useStore(state => state.setGlobalLanguage);
  const setIsSettingsOpen = useStore(state => state.setIsSettingsOpen);

  const materialsData = useMemo(() => ItemService.generateMaterialsTree(globalLanguage), [globalLanguage]);

  const CITIES = [
    { id: '', name: 'Tất cả thành phố (Min/Max)' },
    { id: 'Caerleon', name: 'Caerleon' },
    { id: 'Bridgewatch', name: 'Bridgewatch' },
    { id: 'Martlock', name: 'Martlock' },
    { id: 'Thetford', name: 'Thetford' },
    { id: 'Fort Sterling', name: 'Fort Sterling' },
    { id: 'Lymhurst', name: 'Lymhurst' },
    { id: 'Brecilien', name: 'Brecilien' }
  ];

  return (
    <div className="w-full h-full bg-surface-card border-r border-hairline flex flex-col shadow-lg overflow-hidden">
      <div className="p-4 border-b border-hairline flex items-center justify-between bg-surface-elevated/50">
        <h3 className="font-bold text-strong flex items-center gap-2">
          <Settings size={18} className="text-primary" />
          Cài đặt Toàn cục
        </h3>
        <button 
          onClick={() => setIsSettingsOpen(false)}
          className="p-1.5 md:hidden text-muted hover:text-strong hover:bg-surface-elevated rounded transition-colors"
        >
          <X size={18} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar flex flex-col gap-6">
        {/* Global Settings Form */}
        <div className="bg-canvas border border-hairline rounded-xl p-4">
          <h5 className="text-xs font-semibold text-muted uppercase tracking-wider mb-3">Mặc định (Áp dụng cho mọi SP)</h5>
          <div className="space-y-3">
            <div>
              <label className="block text-xs text-muted mb-1">Máy chủ (Server)</label>
              <select
                value={globalServer}
                onChange={(e) => setGlobalServer(e.target.value)}
                className="w-full bg-surface-elevated border border-hairline rounded px-3 py-2 text-sm text-strong font-semibold focus:outline-none focus:border-primary transition-colors appearance-none"
              >
                {API_SERVERS.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-muted mb-1">Ngôn ngữ (Language)</label>
              <select
                value={globalLanguage}
                onChange={(e) => setGlobalLanguage(e.target.value)}
                className="w-full bg-surface-elevated border border-hairline rounded px-3 py-2 text-sm text-strong font-semibold focus:outline-none focus:border-primary transition-colors appearance-none"
              >
                <option value="vi">Tiếng Việt 🇻🇳</option>
                <option value="en">English 🇬🇧</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-muted mb-1">Thành phố (Lọc Giá API)</label>
              <select
                value={globalCity}
                onChange={(e) => setGlobalCity(e.target.value)}
                className="w-full bg-surface-elevated border border-hairline rounded px-3 py-2 text-sm text-strong font-semibold focus:outline-none focus:border-primary transition-colors appearance-none"
              >
                {CITIES.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-muted mb-1">Tỷ lệ hoàn trả - RRR (%)</label>
              <input
                type="number"
                value={globalRrr}
                onChange={(e) => setGlobalRrr(e.target.value)}
                className="w-full bg-surface-elevated border border-hairline rounded px-3 py-2 text-sm text-strong font-plex focus:outline-none focus:border-primary transition-colors"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-muted mb-1">Thuế chợ (%)</label>
                <input
                  type="number"
                  value={globalTax}
                  onChange={(e) => setGlobalTax(e.target.value)}
                  className="w-full bg-surface-elevated border border-hairline rounded px-3 py-2 text-sm text-strong font-plex focus:outline-none focus:border-primary transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs text-muted mb-1">Phí Craft</label>
                <input
                  type="number"
                  value={globalCraftFee}
                  onChange={(e) => setGlobalCraftFee(e.target.value)}
                  placeholder="0"
                  className="w-full bg-surface-elevated border border-hairline rounded px-3 py-2 text-sm text-strong font-plex focus:outline-none focus:border-primary transition-colors"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Materials Tree */}
        <div>
          <h5 className="text-xs font-semibold text-muted uppercase tracking-wider mb-3 flex items-center gap-2">
            Quản lý Giá Nguyên liệu
          </h5>
          <p className="text-[10px] text-muted mb-3">
            Nếu bạn nhập giá ở đây, hệ thống sẽ <strong>ưu tiên sử dụng giá này</strong> thay vì lấy giá tự động từ API khi tính lợi nhuận sản phẩm.
          </p>
          <div className="space-y-1">
            {materialsData.map(category => (
              <MaterialNode key={category.id} node={category} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
