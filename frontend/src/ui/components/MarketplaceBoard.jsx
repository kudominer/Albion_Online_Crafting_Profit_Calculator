import React, { useEffect, useMemo, useState } from 'react';
import { Search, ChevronRight, ChevronDown, Filter } from 'lucide-react';
import { useStore } from '../../cache/marketStore';
import { ApiService } from '../../services/apiService';
import { CraftingService } from '../../services/craftingService';
import { ItemService } from '../../services/itemService';

const marketplaceData = ItemService.generateMarketplaceBoard();

const formatSilver = (amount) => {
  if (amount === undefined || amount === null || amount === 0) return '--';
  return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
};

export function MarketplaceBoard() {
  const marketData = useStore(state => state.marketData);
  const selectedItem = useStore(state => state.selectedItem);
  const setSelectedItem = useStore(state => state.setSelectedItem);
  
  const marketCategory = useStore(state => state.marketCategory);
  const setMarketCategory = useStore(state => state.setMarketCategory);
  const marketSubcategory = useStore(state => state.marketSubcategory);
  const setMarketSubcategory = useStore(state => state.setMarketSubcategory);
  const marketItemFamily = useStore(state => state.marketItemFamily);
  const setMarketItemFamily = useStore(state => state.setMarketItemFamily);
  const marketTier = useStore(state => state.marketTier);
  const setMarketTier = useStore(state => state.setMarketTier);
  const marketEnchantment = useStore(state => state.marketEnchantment);
  const setMarketEnchantment = useStore(state => state.setMarketEnchantment);
  const searchQuery = useStore(state => state.searchQuery);
  const setSearchQuery = useStore(state => state.setSearchQuery);

  const globalRrr = useStore(state => state.globalRrr);
  const globalTax = useStore(state => state.globalTax);
  const globalCraftFee = useStore(state => state.globalCraftFee);
  const globalCity = useStore(state => state.globalCity);
  const customPrices = useStore(state => state.customPrices);

  // Initialize with first category
  useEffect(() => {
    if (!marketCategory && marketplaceData.length > 0) {
      setMarketCategory(marketplaceData[0].id);
    }
  }, [marketCategory, setMarketCategory]);

  const displayedItems = useMemo(() => {
    let items = [];

    // Filter by Category/Subcategory/Family
    marketplaceData.forEach(cat => {
      if (!marketCategory || cat.id === marketCategory) {
        cat.children.forEach(sub => {
          if (!marketSubcategory || sub.id === marketSubcategory) {
            sub.families.forEach(fam => {
              if (!marketItemFamily || fam.id === marketItemFamily) {
                items = items.concat(fam.items);
              }
            });
          }
        });
      }
    });

    // Filter by Tier
    if (marketTier !== 'All') {
      items = items.filter(i => i.tier === parseInt(marketTier));
    }

    // Filter by Enchantment
    if (marketEnchantment !== 'All') {
      items = items.filter(i => i.enchantment === parseInt(marketEnchantment));
    }

    // Filter by Search
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      items = items.filter(i => i.name.toLowerCase().includes(q));
    }

    return items;
  }, [marketCategory, marketSubcategory, marketItemFamily, marketTier, marketEnchantment, searchQuery]);

  // Fetch prices for displayed items
  useEffect(() => {
    if (displayedItems.length === 0) return;
    
    const uniqueNamesToFetch = new Set();
    displayedItems.forEach(item => {
      uniqueNamesToFetch.add(item.uniqueName);
      item.resources.forEach(res => uniqueNamesToFetch.add(res.uniqueName));
    });

    ApiService.fetchMarketPrices([...uniqueNamesToFetch]);
  }, [displayedItems]);

  const renderProfitBadge = (item) => {
    let sellPrice = 0;
    let profitPercent = 0;
    let isProfitCalculated = false;

    if (marketData[item.uniqueName]) {
      const cityData = marketData[item.uniqueName];
      let targetCityData = cityData;
      if (globalCity && cityData[globalCity]) {
        targetCityData = { [globalCity]: cityData[globalCity] };
      } else if (globalCity) {
        targetCityData = {};
      }

      const sells = Object.values(targetCityData).map(d => d.sellPriceMin).filter(p => p > 0);
      sellPrice = sells.length > 0 ? Math.min(...sells) : 0;

      if (sellPrice > 0 && item.resources) {
        const mockItem = {
          rrr: globalRrr,
          tax: globalTax,
          craftFee: globalCraftFee,
          sellPrice: sellPrice,
          materials: item.resources.map(res => {
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

        const calcs = CraftingService.calculateProfit(mockItem);
        profitPercent = calcs.profitPercent;
        isProfitCalculated = calcs.totalMaterialCost > 0;
      }
    }

    if (!isProfitCalculated) return null;

    return (
      <span className={`text-[11px] font-bold px-2 py-0.5 rounded ${profitPercent > 0 ? 'text-trading-up bg-trading-up/20' : 'text-trading-down bg-trading-down/20'}`}>
        {profitPercent > 0 ? '+' : ''}{profitPercent.toFixed(1)}%
      </span>
    );
  };

  const renderPrice = (uniqueName, type = 'sell') => {
    if (!marketData[uniqueName]) return '--';
    const cityData = marketData[uniqueName];
    let targetCityData = cityData;
    if (globalCity && cityData[globalCity]) {
      targetCityData = { [globalCity]: cityData[globalCity] };
    } else if (globalCity) {
      targetCityData = {};
    }

    if (type === 'sell') {
      const sells = Object.values(targetCityData).map(d => d.sellPriceMin).filter(p => p > 0);
      return sells.length > 0 ? formatSilver(Math.min(...sells)) : '--';
    } else {
      const buys = Object.values(targetCityData).map(d => d.buyPriceMax).filter(p => p > 0);
      return buys.length > 0 ? formatSilver(Math.max(...buys)) : '--';
    }
  };

  return (
    <div className="flex h-full w-full bg-canvas overflow-hidden">
      {/* LEFT SIDEBAR - CATEGORIES */}
      <div className="w-64 flex-shrink-0 bg-surface-card border-r border-hairline overflow-y-auto custom-scrollbar flex flex-col">
        <div className="p-4 border-b border-hairline sticky top-0 bg-surface-card z-10">
          <h2 className="text-strong font-bold text-lg uppercase tracking-wider flex items-center gap-2">
            <Filter size={18} />
            Categories
          </h2>
        </div>
        
        <div className="p-2 space-y-1">
          {marketplaceData.map(cat => {
            const isExpanded = marketCategory === cat.id;
            return (
              <div key={cat.id}>
                <div 
                  className={`flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer font-semibold transition-colors
                    ${isExpanded ? 'bg-primary/10 text-primary' : 'text-strong hover:bg-surface-elevated'}
                  `}
                  onClick={() => setMarketCategory(isExpanded ? null : cat.id)}
                >
                  <span>{cat.name}</span>
                  {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                </div>
                
                {isExpanded && (
                  <div className="ml-4 mt-1 pl-2 border-l border-hairline space-y-1">
                    {cat.children.map(sub => {
                      const isSubSelected = marketSubcategory === sub.id;
                      return (
                        <div key={sub.id}>
                          <div
                            className={`px-3 py-1.5 rounded-md cursor-pointer text-sm transition-colors
                              ${isSubSelected ? 'bg-surface-elevated text-strong font-bold' : 'text-body hover:text-strong hover:bg-surface-elevated/50'}
                            `}
                            onClick={() => setMarketSubcategory(isSubSelected ? null : sub.id)}
                          >
                            {sub.name}
                          </div>
                          
                          {isSubSelected && (
                            <div className="ml-3 mt-1 pl-2 border-l border-hairline space-y-0.5">
                              {sub.families.map(fam => {
                                const isFamSelected = marketItemFamily === fam.id;
                                return (
                                  <div
                                    key={fam.id}
                                    className={`px-2 py-1 rounded cursor-pointer text-xs transition-colors
                                      ${isFamSelected ? 'text-primary font-bold bg-primary/10' : 'text-muted hover:text-strong hover:bg-surface-elevated'}
                                    `}
                                    onClick={() => setMarketItemFamily(isFamSelected ? null : fam.id)}
                                  >
                                    {fam.name}
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* RIGHT PANE - FILTERS & ITEMS */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-canvas">
        {/* TOP BAR FILTERS */}
        <div className="p-4 border-b border-hairline bg-surface-elevated/20 flex flex-wrap gap-4 items-center">
          <div className="relative flex-1 min-w-[200px]">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={18} className="text-muted" />
            </div>
            <input
              type="text"
              placeholder="Search items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-hairline rounded-xl bg-surface-card text-strong placeholder-muted focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-colors text-sm"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-muted">Tier:</span>
            <select 
              className="bg-surface-card border border-hairline rounded-lg px-3 py-2 text-sm text-strong outline-none focus:border-primary"
              value={marketTier}
              onChange={(e) => setMarketTier(e.target.value)}
            >
              <option value="All">All</option>
              <option value="4">Tier 4</option>
              <option value="5">Tier 5</option>
              <option value="6">Tier 6</option>
              <option value="7">Tier 7</option>
              <option value="8">Tier 8</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-muted">Enchantment:</span>
            <select 
              className="bg-surface-card border border-hairline rounded-lg px-3 py-2 text-sm text-strong outline-none focus:border-primary"
              value={marketEnchantment}
              onChange={(e) => setMarketEnchantment(e.target.value)}
            >
              <option value="All">All</option>
              <option value="0">0</option>
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="3">3</option>
              <option value="4">4</option>
            </select>
          </div>
        </div>

        {/* ITEM LIST */}
        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
          <div className="grid gap-2">
            {displayedItems.length > 0 ? displayedItems.map(item => {
              const isSelected = selectedItem?.uniqueName === item.uniqueName;
              return (
                <div 
                  key={item.uniqueName}
                  onClick={() => setSelectedItem(item)}
                  className={`flex flex-col sm:flex-row items-start sm:items-center p-3 rounded-xl border cursor-pointer transition-all hover:bg-surface-elevated group
                    ${isSelected ? 'border-primary bg-primary/5' : 'border-hairline bg-surface-card'}
                  `}
                >
                  {/* Avatar & Name */}
                  <div className="flex items-center gap-4 flex-1 w-full sm:w-auto">
                    <div className="relative w-14 h-14 bg-canvas rounded-lg border border-hairline overflow-hidden flex-shrink-0 group-hover:scale-105 transition-transform">
                      <img 
                        loading="lazy"
                        src={`https://render.albiononline.com/v1/item/${item.uniqueName}.png`} 
                        alt={item.name}
                        className="w-full h-full object-contain p-1"
                      />
                    </div>
                    <div className="flex flex-col flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-base font-bold text-strong truncate">{item.name}</span>
                        {renderProfitBadge(item)}
                      </div>
                      <div className="flex gap-3 text-xs text-muted mt-1 font-plex">
                        <span className="bg-canvas px-2 py-0.5 rounded border border-hairline shadow-sm">
                          T{item.tier}.{item.enchantment}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Prices */}
                  <div className="flex items-center gap-6 mt-3 sm:mt-0 w-full sm:w-auto justify-between sm:justify-end px-2 sm:px-0">
                    <div className="flex flex-col items-start sm:items-end">
                      <span className="text-[10px] uppercase text-muted font-bold tracking-wider mb-0.5">Sell Price</span>
                      <span className="text-trading-up font-bold font-plex">{renderPrice(item.uniqueName, 'sell')}</span>
                    </div>
                    <div className="flex flex-col items-start sm:items-end">
                      <span className="text-[10px] uppercase text-muted font-bold tracking-wider mb-0.5">Buy Price</span>
                      <span className="text-trading-down font-bold font-plex">{renderPrice(item.uniqueName, 'buy')}</span>
                    </div>
                  </div>
                </div>
              );
            }) : (
              <div className="flex flex-col items-center justify-center p-12 text-muted">
                <Search size={48} className="opacity-20 mb-4" />
                <p className="text-lg font-semibold">No items found</p>
                <p className="text-sm">Try adjusting your filters or search query.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
