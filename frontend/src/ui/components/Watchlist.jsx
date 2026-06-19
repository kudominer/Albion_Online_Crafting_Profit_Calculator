import React, { useEffect, useState, useMemo } from 'react';
import { useStore } from '../../cache/marketStore';
import { ApiService } from '../../services/apiService';
import { ItemService } from '../../services/itemService';

export function Watchlist() {
  const globalLanguage = useStore(state => state.globalLanguage);
  const marketplaceData = useMemo(() => ItemService.generateMarketplaceBoard(globalLanguage), [globalLanguage]);

  const watchlist = useStore(state => state.watchlist);
  const marketData = useStore(state => state.marketData);
  const setSelectedItem = useStore(state => state.setSelectedItem);
  const [watchlistNodes, setWatchlistNodes] = useState([]);

  useEffect(() => {
    const nodes = [];
    
    // Find node details from marketplaceData
    watchlist.forEach(uniqueName => {
      let foundNode = null;
      marketplaceData.forEach(cat => {
        if (foundNode) return;
        cat.children.forEach(sub => {
          if (foundNode) return;
          sub.families.forEach(fam => {
            if (foundNode) return;
            const match = fam.items.find(i => i.uniqueName === uniqueName);
            if (match) foundNode = match;
          });
        });
      });
      if (foundNode) {
        nodes.push(foundNode);
      }
    });

    setWatchlistNodes(nodes);

    // Fetch prices for watchlist items
    if (watchlist.length > 0) {
      const itemsToFetch = [];
      nodes.forEach(n => {
        itemsToFetch.push(n.uniqueName);
        if (n.resources) {
          n.resources.forEach(r => itemsToFetch.push(r.uniqueName));
        }
      });
      ApiService.fetchMarketPrices([...new Set(itemsToFetch)]);
    }
  }, [watchlist, marketplaceData]);
  


  if (watchlist.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-center bg-canvas rounded-2xl border border-hairline shadow-sm">
        <div className="text-muted mb-4">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
          </svg>
        </div>
        <h2 className="text-xl font-bold text-strong mb-2">Chưa có vật phẩm theo dõi</h2>
        <p className="text-sm text-muted">Hãy click vào biểu tượng Ngôi sao (⭐) trong Bảng chi tiết vật phẩm để thêm vào danh sách này.</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col w-full">
      <div className="flex-1 overflow-y-auto p-4 md:p-6 custom-scrollbar bg-canvas rounded-2xl border border-hairline shadow-sm">
        <h2 className="text-xl font-bold text-strong mb-6 flex items-center gap-2">
          <span className="text-primary">⭐</span> Danh sách Yêu thích
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {watchlistNodes.map(node => (
            <div 
              key={node.uniqueName}
              onClick={() => setSelectedItem(node)}
              className="bg-surface-card border border-hairline rounded-xl p-4 flex items-center gap-4 cursor-pointer hover:bg-surface-elevated hover:border-primary/50 transition-all shadow-sm"
            >
              <div className="w-12 h-12 bg-surface-elevated rounded-lg border border-hairline p-1 shrink-0">
                <img 
                  loading="lazy"
                  src={`https://render.albiononline.com/v1/item/${node.uniqueName}.png`}
                  alt={node.name}
                  className="w-full h-full object-contain"
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
              </div>
              <div className="min-w-0">
                <h4 className="font-bold text-sm text-strong truncate">{node.name}</h4>
                <p className="text-xs text-muted font-mono truncate">{node.uniqueName}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
