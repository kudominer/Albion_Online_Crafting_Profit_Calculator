import React, { useState, useMemo } from 'react';
import { ChevronRight, ChevronDown, Settings, X } from 'lucide-react';
import { useStore } from '../../cache/marketStore';
import { ItemService } from '../../services/itemService';
import { ApiService } from '../../services/apiService';
import { CraftingService } from '../../services/craftingService';

const API_SERVERS = [
  { id: 'east', name: 'Asia (East)' },
  { id: 'west', name: 'Americas (West)' },
  { id: 'europe', name: 'Europe' },
];

const CITIES = [
  { id: 'Caerleon', name: 'Caerleon' },
  { id: 'Martlock', name: 'Martlock' },
  { id: 'Bridgewatch', name: 'Bridgewatch' },
  { id: 'Lymhurst', name: 'Lymhurst' },
  { id: 'Fort Sterling', name: 'Fort Sterling' },
  { id: 'Thetford', name: 'Thetford' },
  { id: '', name: 'Best of All Cities' },
];

function MaterialNode({ node, level = 0 }) {
  const [expanded, setExpanded] = useState(false);
  const marketData   = useStore(s => s.marketData);
  const customPrices = useStore(s => s.customPrices);
  const setCustomPrice = useStore(s => s.setCustomPrice);
  const hasChildren  = node.children && node.children.length > 0;

  const handleToggle = (e) => {
    e.stopPropagation();
    if (!expanded && hasChildren) {
      const ids = [];
      const gather = (n) => {
        if (!n.children?.length && n.uniqueName) ids.push(n.uniqueName);
        else n.children?.forEach(gather);
      };
      node.children.forEach(gather);
      if (ids.length > 0) ApiService.fetchMarketPrices([...new Set(ids)]);
    }
    setExpanded(!expanded);
  };

  let apiPrice = 0;
  if (!hasChildren && node.uniqueName && marketData[node.uniqueName]) {
    const prices = Object.values(marketData[node.uniqueName]).map(d => d.sellPriceMin).filter(p => p > 0);
    apiPrice = prices.length > 0 ? Math.min(...prices) : 0;
  }

  const customPrice = customPrices[node.uniqueName] || '';

  return (
    <div className="w-full">
      <div
        className={`flex items-center gap-2 py-1.5 px-2 my-0.5 rounded-lg transition-all duration-150 border border-transparent
          ${hasChildren ? 'cursor-pointer hover:bg-surface-elevated' : 'bg-surface-card border-hairline'}`}
        style={{ paddingLeft: `${level * 1.5 + 0.5}rem` }}
        onClick={hasChildren ? handleToggle : undefined}
      >
        <div className="flex-shrink-0 w-4 h-4 flex items-center justify-center text-muted">
          {hasChildren
            ? (expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />)
            : <div className="w-1.5 h-1.5 rounded-full bg-primary" />}
        </div>

        {!hasChildren && node.uniqueName && (
          <div className="w-8 h-8 bg-surface-elevated rounded border border-hairline p-0.5 shrink-0">
            <img loading="lazy" src={`https://render.albiononline.com/v1/item/${node.uniqueName}.png`} alt={node.name} className="w-full h-full object-contain" onError={e => { e.target.style.display = 'none'; }} />
          </div>
        )}

        {!hasChildren ? (
          <div className="flex flex-col flex-1 min-w-0 gap-1">
            <div className="flex justify-between items-center">
              <span className="text-xs font-semibold text-strong truncate">{node.name}</span>
              <span className="text-[10px] text-muted">API: {apiPrice > 0 ? CraftingService.formatSilver(apiPrice) : '--'}</span>
            </div>
            <input
              type="number"
              placeholder="Custom price…"
              value={customPrice}
              onChange={e => setCustomPrice(node.uniqueName, e.target.value)}
              onClick={e => e.stopPropagation()}
              className="flex-1 bg-canvas border border-primary/30 focus:border-primary rounded px-2 py-0.5 text-xs font-plex text-strong outline-none transition-colors"
            />
          </div>
        ) : (
          <span className="text-sm text-body font-medium">{node.name}</span>
        )}
      </div>

      {hasChildren && expanded && (
        <div className="relative">
          <div className="absolute top-0 bottom-0 w-px bg-hairline" style={{ left: `${level * 1.5 + 1}rem` }} />
          {node.children.map(child => <MaterialNode key={child.id} node={child} level={level + 1} />)}
        </div>
      )}
    </div>
  );
}

export function SettingsSidebar() {
  const globalRrr      = useStore(s => s.globalRrr);
  const globalTax      = useStore(s => s.globalTax);
  const globalCraftFee = useStore(s => s.globalCraftFee);
  const globalCity     = useStore(s => s.globalCity);
  const globalServer   = useStore(s => s.globalServer);
  const globalLanguage = useStore(s => s.globalLanguage);
  const globalFocus    = useStore(s => s.globalFocus);

  const setGlobalRrr      = useStore(s => s.setGlobalRrr);
  const setGlobalTax      = useStore(s => s.setGlobalTax);
  const setGlobalCraftFee = useStore(s => s.setGlobalCraftFee);
  const setGlobalCity     = useStore(s => s.setGlobalCity);
  const setGlobalServer   = useStore(s => s.setGlobalServer);
  const setGlobalLanguage = useStore(s => s.setGlobalLanguage);
  const setGlobalFocus    = useStore(s => s.setGlobalFocus);
  const setIsSettingsOpen = useStore(s => s.setIsSettingsOpen);

  const materialsData = useMemo(() => ItemService.generateMaterialsTree(globalLanguage), [globalLanguage]);

  const focusRrr = CraftingService.getFocusRrr(globalRrr);

  return (
    <div className="w-full h-full bg-surface-card flex flex-col overflow-hidden">
      <div className="p-3 border-b border-hairline flex items-center justify-between bg-surface-elevated/50 flex-shrink-0">
        <h3 className="font-bold text-strong text-sm flex items-center gap-2">
          <Settings size={15} className="text-primary" /> Settings
        </h3>
        <button onClick={() => setIsSettingsOpen(false)} className="p-1 text-muted hover:text-strong hover:bg-surface-elevated rounded transition-colors">
          <X size={15} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-3 custom-scrollbar space-y-4">
        {/* Global settings */}
        <div className="bg-canvas border border-hairline rounded-xl p-3">
          <h5 className="text-[10px] font-bold text-muted uppercase tracking-wider mb-3">Global Defaults</h5>
          <div className="space-y-2.5">
            {/* Server */}
            <div>
              <label className="block text-[11px] text-muted mb-1">Server</label>
              <select value={globalServer} onChange={e => setGlobalServer(e.target.value)} className="w-full bg-surface-elevated border border-hairline rounded px-2 py-1.5 text-xs text-strong focus:outline-none focus:border-primary">
                {API_SERVERS.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            {/* Language */}
            <div>
              <label className="block text-[11px] text-muted mb-1">Language</label>
              <select value={globalLanguage} onChange={e => setGlobalLanguage(e.target.value)} className="w-full bg-surface-elevated border border-hairline rounded px-2 py-1.5 text-xs text-strong focus:outline-none focus:border-primary">
                <option value="vi">Tiếng Việt 🇻🇳</option>
                <option value="en">English 🇬🇧</option>
              </select>
            </div>
            {/* City */}
            <div>
              <label className="block text-[11px] text-muted mb-1">Default City</label>
              <select value={globalCity} onChange={e => setGlobalCity(e.target.value)} className="w-full bg-surface-elevated border border-hairline rounded px-2 py-1.5 text-xs text-strong focus:outline-none focus:border-primary">
                {CITIES.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            {/* RRR */}
            <div>
              <label className="block text-[11px] text-muted mb-1">
                RRR (%) — {globalFocus ? <span className="text-primary">Focus: {focusRrr}%</span> : `Base: ${globalRrr}%`}
              </label>
              <input type="number" value={globalRrr} onChange={e => setGlobalRrr(e.target.value)} className="w-full bg-surface-elevated border border-hairline rounded px-2 py-1.5 text-xs text-strong font-plex focus:outline-none focus:border-primary" />
            </div>
            {/* Focus toggle */}
            <div className="flex items-center justify-between py-1">
              <div>
                <span className="text-[11px] text-strong font-semibold">Focus Bonus</span>
                <p className="text-[10px] text-muted">~{focusRrr}% effective RRR with focus</p>
              </div>
              <button
                onClick={() => setGlobalFocus(!globalFocus)}
                className={`w-10 h-5 rounded-full transition-colors ${globalFocus ? 'bg-primary' : 'bg-hairline'}`}
              >
                <div className={`w-4 h-4 bg-white rounded-full shadow transition-transform mx-0.5 ${globalFocus ? 'translate-x-5' : 'translate-x-0'}`} />
              </button>
            </div>
            {/* Tax & Fee */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] text-muted mb-1">Tax (%)</label>
                <input type="number" value={globalTax} onChange={e => setGlobalTax(e.target.value)} className="w-full bg-surface-elevated border border-hairline rounded px-2 py-1.5 text-xs text-strong font-plex focus:outline-none focus:border-primary" />
              </div>
              <div>
                <label className="block text-[11px] text-muted mb-1">Craft Fee</label>
                <input type="number" value={globalCraftFee} onChange={e => setGlobalCraftFee(e.target.value)} placeholder="0" className="w-full bg-surface-elevated border border-hairline rounded px-2 py-1.5 text-xs text-strong font-plex focus:outline-none focus:border-primary" />
              </div>
            </div>
          </div>
        </div>

        {/* Custom material prices */}
        <div>
          <h5 className="text-[10px] font-bold text-muted uppercase tracking-wider mb-2">Custom Material Prices</h5>
          <p className="text-[10px] text-muted mb-2">Override API prices for calculation.</p>
          <div className="space-y-0.5">
            {materialsData.map(cat => <MaterialNode key={cat.id} node={cat} />)}
          </div>
        </div>
      </div>
    </div>
  );
}
