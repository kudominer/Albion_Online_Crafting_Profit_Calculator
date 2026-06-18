import React, { useState } from 'react';
import { ChevronRight, ChevronDown, Search } from 'lucide-react';
import { destinyBoardData, rawCategories } from '../data/destinyBoardData';
import { useStore } from '../store/useStore';
import { fetchMarketPrices } from '../utils/api';
import { calculateProfit } from '../utils/calculations';

const formatSilver = (amount) => {
  if (amount === undefined || amount === null || amount === 0) return '--';
  return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
};

const DestinyNode = ({ node, level = 0 }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const marketData = useStore(state => state.marketData);
  const setSelectedItem = useStore(state => state.setSelectedItem);
  const selectedItem = useStore(state => state.selectedItem);
  const searchQuery = useStore(state => state.searchQuery);
  
  const globalRrr = useStore(state => state.globalRrr);
  const globalTax = useStore(state => state.globalTax);
  const globalCraftFee = useStore(state => state.globalCraftFee);
  const globalCity = useStore(state => state.globalCity);
  const customPrices = useStore(state => state.customPrices);
  
  const hasChildren = node.children && node.children.length > 0;

  // Search logic
  if (searchQuery && hasChildren) {
    // If it's a parent node, we only render it if any of its children match
    const hasMatchingChild = (n) => {
      if (!n.children || n.children.length === 0) {
        return n.name.toLowerCase().includes(searchQuery.toLowerCase());
      }
      return n.children.some(hasMatchingChild);
    };
    if (!hasMatchingChild(node)) return null;
  }
  
  if (searchQuery && !hasChildren && !node.name.toLowerCase().includes(searchQuery.toLowerCase())) {
    return null;
  }
  
  // Auto-expand if searching
  const expanded = searchQuery ? true : isExpanded;

  const handleToggle = (e) => {
    e.stopPropagation();
    const nextState = !isExpanded;
    setIsExpanded(nextState);
    
    if (nextState && hasChildren) {
      const itemsToFetch = [];
      const gatherLeaves = (n) => {
        if (!n.children || n.children.length === 0) {
          if (n.uniqueName) itemsToFetch.push(n.uniqueName);
          if (n.resources) {
            n.resources.forEach(res => itemsToFetch.push(res.uniqueName));
          }
        } else {
          n.children.forEach(gatherLeaves);
        }
      };
      
      node.children.forEach(gatherLeaves);
      
      const uniqueNamesToFetch = [...new Set(itemsToFetch)];
      if (uniqueNamesToFetch.length > 0) {
        fetchMarketPrices(uniqueNamesToFetch);
      }
    }
  };

  const handleSelect = (e) => {
    e.stopPropagation();
    if (!hasChildren) {
      setSelectedItem(node);
    } else {
      handleToggle(e);
    }
  };

  let sellPrice = 0;
  let buyPrice = 0;
  let profitPercent = 0;
  let isProfitCalculated = false;

  if (!hasChildren && node.uniqueName && marketData[node.uniqueName]) {
    const cityData = marketData[node.uniqueName];
    let targetCityData = cityData;
    if (globalCity && cityData[globalCity]) {
      targetCityData = { [globalCity]: cityData[globalCity] };
    } else if (globalCity) {
      targetCityData = {};
    }

    const sells = Object.values(targetCityData).map(d => d.sellPriceMin).filter(p => p > 0);
    sellPrice = sells.length > 0 ? Math.min(...sells) : 0;
    
    const buys = Object.values(targetCityData).map(d => d.buyPriceMax).filter(p => p > 0);
    buyPrice = buys.length > 0 ? Math.max(...buys) : 0;

    // Heatmap Calculation
    if (sellPrice > 0 && node.resources) {
      const mockItem = {
        rrr: globalRrr,
        tax: globalTax,
        craftFee: globalCraftFee,
        sellPrice: sellPrice,
        materials: node.resources.map(res => {
          let resPrice = 0;
          if (customPrices[res.uniqueName]) {
            resPrice = Number(customPrices[res.uniqueName]);
          } else {
            const resCityData = marketData[res.uniqueName] || {};
            let targetResCityData = resCityData;
            if (globalCity && resCityData[globalCity]) {
              targetResCityData = { [globalCity]: resCityData[globalCity] };
            } else if (globalCity) {
              targetResCityData = {};
            }
            const resSells = Object.values(targetResCityData).map(d => d.sellPriceMin).filter(p => p > 0);
            resPrice = resSells.length > 0 ? Math.min(...resSells) : 0;
          }
          return { quantity: res.qty, unitPrice: resPrice };
        })
      };

      const calcs = calculateProfit(mockItem);
      profitPercent = calcs.profitPercent;
      isProfitCalculated = calcs.totalMaterialCost > 0;
    }
  }

  // Profit Heatmap Colors
  let heatmapClass = 'border-transparent bg-surface-card';
  if (!hasChildren && isProfitCalculated) {
    if (profitPercent < 0) {
      heatmapClass = 'border-trading-down/50 bg-trading-down/5';
    } else if (profitPercent <= 10) {
      heatmapClass = 'border-primary/70 bg-primary/5'; // Yellow
    } else if (profitPercent <= 20) {
      heatmapClass = 'border-trading-up/50 bg-trading-up/10'; // Light green
    } else {
      heatmapClass = 'border-trading-up shadow-[0_0_15px_rgba(14,203,129,0.3)] bg-trading-up/20'; // Green glow
    }
  } else if (!hasChildren) {
    heatmapClass = 'border-hairline bg-surface-card';
  }

  const isSelected = selectedItem?.uniqueName === node.uniqueName;
  if (isSelected && !hasChildren) {
    heatmapClass += ' ring-2 ring-primary';
  }

  return (
    <div className="w-full">
      <div 
        className={`flex items-center gap-3 py-2 px-3 my-1 rounded-lg cursor-pointer transition-all duration-200 border
          ${hasChildren ? 'border-transparent hover:bg-surface-elevated' : heatmapClass}
          ${hasChildren && level === 0 && 'bg-surface-elevated'}
        `}
        style={{ paddingLeft: `${level * 1.5 + 0.75}rem` }}
        onClick={handleSelect}
      >
        {level > 0 && (
          <div className="absolute left-0 w-4 h-px bg-hairline" style={{ left: `${level * 1.5 - 0.5}rem` }}></div>
        )}

        <div className="flex-shrink-0 w-5 h-5 flex items-center justify-center text-muted">
          {hasChildren ? (
            expanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />
          ) : (
            <div className={`w-1.5 h-1.5 rounded-full ${profitPercent > 0 ? 'bg-trading-up' : 'bg-primary'} glow`}></div>
          )}
        </div>
        
        {!hasChildren && node.uniqueName && (
          <div className="relative w-12 h-12 bg-canvas rounded-md border border-hairline overflow-hidden flex-shrink-0 transition-colors shadow-sm">
            <img 
              src={`https://render.albiononline.com/v1/item/${node.uniqueName}.png`} 
              alt={node.name}
              className="w-full h-full object-contain p-1"
              onError={(e) => { e.target.style.display = 'none'; }}
            />
          </div>
        )}

        {!hasChildren ? (
          <div className="flex flex-col flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-strong truncate">{node.name}</span>
              {isProfitCalculated && (
                <span className={`text-[10px] font-bold px-1.5 rounded ${profitPercent > 0 ? 'text-trading-up bg-trading-up/20' : 'text-trading-down bg-trading-down/20'}`}>
                  {profitPercent > 0 ? '+' : ''}{profitPercent.toFixed(1)}%
                </span>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-2 mt-1 text-xs">
              <div className="bg-canvas px-2 py-0.5 rounded flex items-center gap-1 border border-hairline">
                <span className="text-muted">Bán min:</span>
                <span className="text-trading-up font-plex">{formatSilver(sellPrice)}</span>
              </div>
              <div className="bg-canvas px-2 py-0.5 rounded flex items-center gap-1 border border-hairline">
                <span className="text-muted">Mua max:</span>
                <span className="text-trading-down font-plex">{formatSilver(buyPrice)}</span>
              </div>
            </div>
          </div>
        ) : (
          <span className="text-sm transition-colors text-body font-medium">{node.name}</span>
        )}
      </div>

      {hasChildren && expanded && (
        <div className="relative">
          <div className="absolute top-0 bottom-0 w-px bg-hairline" style={{ left: `${level * 1.5 + 1.3}rem` }}></div>
          {node.children.map(child => (
            <DestinyNode 
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

export function DestinyBoard() {
  const selectedRootId = useStore(state => state.selectedRootId);
  const setSelectedRootId = useStore(state => state.setSelectedRootId);
  const searchQuery = useStore(state => state.searchQuery);
  const setSearchQuery = useStore(state => state.setSearchQuery);

  return (
    <div className="h-full flex flex-col w-full">
      {/* Search Header */}
      <div className="p-4 border-b border-hairline bg-surface-elevated/20 sticky top-0 z-20 flex gap-4 items-center">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={18} className="text-muted" />
          </div>
          <input
            type="text"
            placeholder="Tìm kiếm vật phẩm (VD: Cleric Cowl)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-hairline rounded-xl bg-surface-card text-strong placeholder-muted focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-colors text-sm"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 md:p-6 custom-scrollbar bg-canvas rounded-b-2xl relative">
        {!selectedRootId && !searchQuery ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {rawCategories.map(root => (
              <div 
                key={root.id}
                onClick={() => setSelectedRootId(root.id)}
                className="bg-surface-card border border-hairline rounded-2xl p-6 flex flex-col items-center justify-center gap-4 cursor-pointer hover:bg-surface-elevated hover:border-primary/50 transition-all group shadow-sm"
              >
                <div className="w-24 h-24 bg-canvas rounded-full flex items-center justify-center p-3 group-hover:scale-110 transition-transform shadow-inner">
                  <img 
                    src={`https://render.albiononline.com/v1/item/${root.iconName}.png`}
                    alt={root.name}
                    className="w-full h-full object-contain"
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                </div>
                <span className="text-strong font-bold text-lg text-center">{root.name}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-6">
            {!searchQuery && (
              <div className="flex items-center justify-between border-b border-hairline pb-4 sticky top-0 bg-canvas z-10">
                <button 
                  onClick={() => setSelectedRootId(null)}
                  className="flex items-center gap-2 px-3 py-1.5 text-body hover:text-strong hover:bg-surface-elevated rounded-md transition-colors text-sm font-semibold"
                >
                  ← Trở lại danh mục chính
                </button>
                <h2 className="text-lg font-bold text-strong">
                  {rawCategories.find(r => r.id === selectedRootId)?.name}
                </h2>
              </div>
            )}
            
            <div className="space-y-1">
              {searchQuery 
                ? destinyBoardData.map(category => (
                    <DestinyNode 
                      key={category.id} 
                      node={category} 
                    />
                  ))
                : destinyBoardData.find(r => r.id === selectedRootId)?.children.map(category => (
                    <DestinyNode 
                      key={category.id} 
                      node={category} 
                    />
                  ))
              }
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
