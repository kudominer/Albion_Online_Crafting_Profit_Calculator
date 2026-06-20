import React, { useState, useCallback } from 'react';
import { Search, ChevronDown, ChevronRight, GitBranch, Loader2 } from 'lucide-react';
import { useStore } from '../../cache/marketStore';
import { ApiService } from '../../services/apiService';
import { CraftingService } from '../../services/craftingService';
import { ItemService } from '../../services/itemService';

const REFINE_ITEMS = {
  planks:     ['T4_PLANKS', 'T5_PLANKS', 'T6_PLANKS', 'T7_PLANKS', 'T8_PLANKS'],
  metalbar:   ['T4_METALBAR', 'T5_METALBAR', 'T6_METALBAR', 'T7_METALBAR', 'T8_METALBAR'],
  cloth:      ['T4_CLOTH', 'T5_CLOTH', 'T6_CLOTH', 'T7_CLOTH', 'T8_CLOTH'],
  leather:    ['T4_LEATHER', 'T5_LEATHER', 'T6_LEATHER', 'T7_LEATHER', 'T8_LEATHER'],
  stoneblock: ['T4_STONEBLOCK', 'T5_STONEBLOCK', 'T6_STONEBLOCK', 'T7_STONEBLOCK', 'T8_STONEBLOCK'],
};

const RESOURCE_LABELS = {
  planks: '🪵 Gỗ Ván (Planks)',
  metalbar: '⚙️ Thỏi Kim Loại (Metalbar)',
  cloth: '🧵 Vải (Cloth)',
  leather: '🐄 Da (Leather)',
  stoneblock: '🪨 Khối Đá (Stoneblock)',
};

const CITIES = ['Caerleon', 'Martlock', 'Bridgewatch', 'Lymhurst', 'Fort Sterling', 'Thetford'];

function RefineBreakdownNode({ node, depth = 0 }) {
  const [expanded, setExpanded] = useState(depth < 1);
  const language = useStore(s => s.globalLanguage);
  if (!node) return null;

  const hasChildren = node.breakdown && node.breakdown.length > 0;
  const indent = depth * 16;

  return (
    <div>
      <div
        className={`flex items-center gap-2 py-1.5 px-2 rounded transition-colors ${hasChildren ? 'cursor-pointer hover:bg-surface-elevated/50' : ''}`}
        style={{ paddingLeft: `${8 + indent}px` }}
        onClick={() => hasChildren && setExpanded(!expanded)}
      >
        <div className="flex-shrink-0 w-4 text-muted">
          {hasChildren ? (expanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />) : (
            <div className="w-1.5 h-1.5 rounded-full bg-muted/40 mx-auto" />
          )}
        </div>

        <div className="w-7 h-7 rounded border border-hairline bg-canvas overflow-hidden flex-shrink-0">
          <img loading="lazy" src={`https://render.albiononline.com/v1/item/${node.itemId}.png`} alt={node.itemId} className="w-full h-full object-contain p-0.5" />
        </div>

        <div className="flex-1 min-w-0">
          <span className="text-xs text-strong font-medium truncate block">
            {ItemService.getItemName(node.itemId, language)}
            {node.count && <span className="text-muted ml-1">×{node.count}</span>}
          </span>
          {node.isRaw && (
            <span className="text-[10px] text-muted">Raw — {CraftingService.formatSilver(node.marketPrice)}/ea</span>
          )}
        </div>

        <div className="text-right flex-shrink-0">
          <div className="text-xs font-plex font-bold text-strong">{CraftingService.formatSilver(Math.round(node.totalCost || node.cost || 0))}</div>
          {node.unitCost > 0 && <div className="text-[10px] text-muted">@{CraftingService.formatSilver(Math.round(node.unitCost))}</div>}
        </div>
      </div>

      {expanded && hasChildren && (
        <div className="border-l border-hairline ml-6">
          {node.breakdown.map((child, i) => (
            <RefineBreakdownNode key={i} node={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

export function RefineTab() {
  const globalLanguage = useStore(s => s.globalLanguage);
  const globalRrr      = useStore(s => s.globalRrr);
  const globalCity     = useStore(s => s.globalCity);

  const [selectedResource, setSelectedResource] = useState('planks');
  const [selectedItem, setSelectedItem] = useState('T5_PLANKS');
  const [city, setCity] = useState(globalCity || 'Caerleon');
  const [loading, setLoading] = useState(false);
  const [chainData, setChainData] = useState(null);
  const [error, setError] = useState(null);

  const fetchChain = useCallback(async (itemId, cityVal) => {
    setLoading(true);
    setError(null);
    setChainData(null);
    try {
      const data = await ApiService.fetchRefineChain(itemId, cityVal, globalRrr);
      if (!data || data.error) throw new Error(data?.error || 'No data');
      setChainData(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [globalRrr]);

  const handleSelect = (itemId) => {
    setSelectedItem(itemId);
    fetchChain(itemId, city);
  };

  const handleCityChange = (c) => {
    setCity(c);
    if (selectedItem) fetchChain(selectedItem, c);
  };

  const profitColor = chainData?.profit > 0 ? 'text-trading-up' : 'text-trading-down';

  return (
    <div className="flex h-full overflow-hidden">
      {/* Left — resource selector */}
      <div className="w-52 flex-shrink-0 border-r border-hairline bg-surface-card overflow-y-auto custom-scrollbar">
        <div className="p-3 border-b border-hairline">
          <h2 className="text-xs font-bold text-strong uppercase tracking-wider flex items-center gap-2">
            <GitBranch size={13} className="text-primary" /> Refine Items
          </h2>
        </div>

        {Object.entries(REFINE_ITEMS).map(([resKey, items]) => (
          <div key={resKey}>
            <div
              onClick={() => setSelectedResource(selectedResource === resKey ? null : resKey)}
              className="flex items-center justify-between px-3 py-2 cursor-pointer hover:bg-surface-elevated text-xs font-semibold text-muted uppercase tracking-wider transition-colors"
            >
              <span>{RESOURCE_LABELS[resKey]}</span>
              {selectedResource === resKey ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
            </div>

            {selectedResource === resKey && (
              <div className="ml-2 space-y-0.5 pb-1">
                {items.map(id => (
                  <div
                    key={id}
                    onClick={() => handleSelect(id)}
                    className={`flex items-center gap-2 px-2 py-1.5 rounded-lg cursor-pointer text-xs transition-all
                      ${selectedItem === id ? 'bg-primary/10 text-primary font-bold' : 'text-body hover:bg-surface-elevated'}`}
                  >
                    <img src={`https://render.albiononline.com/v1/item/${id}.png`} alt={id} className="w-6 h-6 object-contain" />
                    <span>{ItemService.getItemName(id, globalLanguage)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Right — chain viewer */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Config bar */}
        <div className="flex items-center gap-3 px-4 py-2 border-b border-hairline bg-surface-elevated/10 flex-shrink-0">
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-muted font-semibold">City:</span>
            <select
              value={city}
              onChange={e => handleCityChange(e.target.value)}
              className="bg-surface-card border border-hairline rounded px-2 py-1 text-xs text-strong focus:outline-none focus:border-primary"
            >
              {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-muted font-semibold">RRR:</span>
            <span className="text-xs text-primary font-bold">{globalRrr}%</span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
          {loading && (
            <div className="flex items-center justify-center h-40 text-muted gap-2">
              <Loader2 size={20} className="animate-spin text-primary" />
              <span className="text-sm">Loading refine chain…</span>
            </div>
          )}

          {error && (
            <div className="flex items-center justify-center h-40">
              <div className="text-center">
                <p className="text-sm text-trading-down font-semibold">{error}</p>
                <p className="text-xs text-muted mt-1">Select an item from the left or wait for scanner to fetch prices</p>
              </div>
            </div>
          )}

          {!loading && !error && !chainData && (
            <div className="flex items-center justify-center h-40 text-muted flex-col gap-2">
              <GitBranch size={36} className="opacity-20" />
              <p className="text-sm">Select a refined resource to view chain</p>
            </div>
          )}

          {chainData && (
            <div className="space-y-4 max-w-2xl">
              {/* Summary card */}
              <div className="bg-surface-card border border-hairline rounded-xl p-4">
                <div className="flex items-center gap-3 mb-4">
                  <img src={`https://render.albiononline.com/v1/item/${chainData.itemId}.png`} alt={chainData.itemId} className="w-12 h-12 object-contain border border-hairline rounded-lg p-0.5 bg-canvas" />
                  <div>
                    <h3 className="font-bold text-strong">{ItemService.getItemName(chainData.itemId, globalLanguage)}</h3>
                    <p className="text-xs text-muted font-mono">{chainData.itemId}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { label: 'Sell Price', value: CraftingService.formatSilver(chainData.sellPrice), color: 'text-trading-up' },
                    { label: 'Refine Cost', value: CraftingService.formatSilver(chainData.refineCost), color: 'text-strong' },
                    { label: 'Profit', value: chainData.profit > 0 ? `+${CraftingService.formatSilver(chainData.profit)}` : CraftingService.formatSilver(chainData.profit), color: chainData.profit > 0 ? 'text-trading-up' : 'text-trading-down' },
                    { label: 'Margin', value: chainData.profitPercent ? `${chainData.profitPercent}%` : '--', color: chainData.profitPercent > 0 ? 'text-trading-up' : 'text-trading-down' },
                  ].map(({ label, value, color }) => (
                    <div key={label} className="bg-canvas rounded-lg p-3 border border-hairline text-center">
                      <div className="text-[10px] text-muted uppercase tracking-wide mb-1">{label}</div>
                      <div className={`text-sm font-bold font-plex ${color}`}>{value || '--'}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Refine chain tree */}
              <div className="bg-surface-card border border-hairline rounded-xl overflow-hidden">
                <div className="px-4 py-3 border-b border-hairline flex items-center gap-2">
                  <GitBranch size={14} className="text-primary" />
                  <h4 className="text-xs font-bold text-strong uppercase tracking-wider">Refine Chain Breakdown</h4>
                </div>
                <div className="p-2">
                  {chainData.breakdown?.map((node, i) => (
                    <RefineBreakdownNode key={i} node={node} depth={0} />
                  ))}
                  {(!chainData.breakdown || chainData.breakdown.length === 0) && (
                    <p className="text-xs text-muted p-3">No breakdown data available (prices may not be loaded yet)</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
