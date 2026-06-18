import React, { useState } from 'react';
import { ChevronRight, ChevronDown } from 'lucide-react';
import { destinyBoardData, rawCategories } from '../data/destinyBoardData';
import { useStore } from '../store/useStore';
import { fetchMarketPrices } from '../utils/api';

const formatSilver = (amount) => {
  if (amount === undefined || amount === null || amount === 0) return '--';
  return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
};

const DestinyNode = ({ node, level = 0 }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const marketData = useStore(state => state.marketData);
  const setSelectedItem = useStore(state => state.setSelectedItem);
  
  const hasChildren = node.children && node.children.length > 0;
  
  const handleToggle = (e) => {
    e.stopPropagation();
    const nextState = !isExpanded;
    setIsExpanded(nextState);
    
    if (nextState && hasChildren) {
      // Find all leaf nodes and resources under this expanded node
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

  if (!hasChildren && node.uniqueName && marketData[node.uniqueName]) {
    const cityData = marketData[node.uniqueName];
    const sells = Object.values(cityData).map(d => d.sellPriceMin).filter(p => p > 0);
    sellPrice = sells.length > 0 ? Math.min(...sells) : 0;
    
    const buys = Object.values(cityData).map(d => d.buyPriceMax).filter(p => p > 0);
    buyPrice = buys.length > 0 ? Math.max(...buys) : 0;
  }

  return (
    <div className="w-full">
      <div 
        className={`flex items-center gap-3 py-2 px-3 my-1 rounded-lg cursor-pointer transition-all duration-200 border border-transparent
          ${hasChildren ? 'hover:bg-surface-elevated' : 'hover:bg-primary/10 hover:border-primary/30 bg-surface-card'}
        `}
        style={{ paddingLeft: `${level * 1.5 + 0.75}rem` }}
        onClick={handleSelect}
      >
        {level > 0 && (
          <div className="absolute left-0 w-4 h-px bg-hairline" style={{ left: `${level * 1.5 - 0.5}rem` }}></div>
        )}

        <div className="flex-shrink-0 w-5 h-5 flex items-center justify-center text-muted">
          {hasChildren ? (
            isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />
          ) : (
            <div className="w-1.5 h-1.5 rounded-full bg-primary glow"></div>
          )}
        </div>
        
        {!hasChildren && node.uniqueName && (
          <div className="relative w-12 h-12 bg-surface-elevated rounded-md border border-hairline overflow-hidden flex-shrink-0 transition-colors shadow-sm">
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
            <span className="text-sm font-semibold text-strong truncate">{node.name}</span>
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

      {hasChildren && isExpanded && (
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

  return (
    <div className="h-full flex flex-col w-full">
      <div className="flex-1 overflow-y-auto p-4 md:p-6 custom-scrollbar bg-canvas rounded-2xl border border-hairline shadow-sm relative">
        {!selectedRootId ? (
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
            
            <div className="space-y-1">
              {destinyBoardData.find(r => r.id === selectedRootId)?.children.map(category => (
                <DestinyNode 
                  key={category.id} 
                  node={category} 
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
