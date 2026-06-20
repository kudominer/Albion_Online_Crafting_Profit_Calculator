import React, { useEffect, useMemo, useState } from 'react';
import { Search, ChevronRight, ChevronDown, Filter } from 'lucide-react';
import { useStore } from '../../cache/marketStore';
import { ApiService } from '../../services/apiService';
import { CraftingService } from '../../services/craftingService';
import { ItemService } from '../../services/itemService';

export function CraftTab() {
  const globalLanguage = useStore(s => s.globalLanguage);
  const marketplaceData = useMemo(() => ItemService.generateMarketplaceBoard(globalLanguage), [globalLanguage]);

  const marketData      = useStore(s => s.marketData);
  const selectedItem    = useStore(s => s.selectedItem);
  const setSelectedItem = useStore(s => s.setSelectedItem);
  const marketCategory  = useStore(s => s.marketCategory);
  const setMarketCategory = useStore(s => s.setMarketCategory);
  const marketSubcategory = useStore(s => s.marketSubcategory);
  const setMarketSubcategory = useStore(s => s.setMarketSubcategory);
  const marketItemFamily = useStore(s => s.marketItemFamily);
  const setMarketItemFamily = useStore(s => s.setMarketItemFamily);
  const marketTier      = useStore(s => s.marketTier);
  const setMarketTier   = useStore(s => s.setMarketTier);
  const marketEnchantment = useStore(s => s.marketEnchantment);
  const setMarketEnchantment = useStore(s => s.setMarketEnchantment);
  const searchQuery     = useStore(s => s.searchQuery);
  const setSearchQuery  = useStore(s => s.setSearchQuery);
  const globalRrr       = useStore(s => s.globalRrr);
  const globalTax       = useStore(s => s.globalTax);
  const globalCraftFee  = useStore(s => s.globalCraftFee);
  const globalCity      = useStore(s => s.globalCity);
  const customPrices    = useStore(s => s.customPrices);

  useEffect(() => {
    if (!marketCategory && marketplaceData.length > 0) {
      setMarketCategory(marketplaceData[0].id);
    }
  }, [marketCategory, marketplaceData]);

  const displayedItems = useMemo(() => {
    let items = [];
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
    if (marketTier !== 'All') items = items.filter(i => i.tier === parseInt(marketTier));
    if (marketEnchantment !== 'All') items = items.filter(i => i.enchantment === parseInt(marketEnchantment));
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      items = items.filter(i => i.name.toLowerCase().includes(q));
    }
    return items;
  }, [marketCategory, marketSubcategory, marketItemFamily, marketTier, marketEnchantment, searchQuery, marketplaceData]);

  useEffect(() => {
    if (displayedItems.length === 0) return;
    const ids = new Set();
    displayedItems.forEach(item => {
      ids.add(item.uniqueName);
      item.resources.forEach(r => ids.add(r.uniqueName));
    });
    ApiService.fetchMarketPrices([...ids]);
  }, [displayedItems]);

  const getPriceForItem = (uniqueName, type = 'sell') => {
    const data = marketData[uniqueName];
    if (!data) return 0;
    let cityData = globalCity && data[globalCity] ? { [globalCity]: data[globalCity] } : data;
    if (globalCity && !data[globalCity]) return 0;
    const prices = Object.values(cityData).map(d => type === 'sell' ? d.sellPriceMin : d.buyPriceMax).filter(p => p > 0);
    if (prices.length === 0) return 0;
    return type === 'sell' ? Math.min(...prices) : Math.max(...prices);
  };

  const renderProfitBadge = (item) => {
    const sellPrice = getPriceForItem(item.uniqueName, 'sell');
    if (!sellPrice) return null;

    const materials = item.resources.map(res => ({
      quantity: res.qty,
      unitPrice: customPrices[res.uniqueName]
        ? Number(customPrices[res.uniqueName])
        : getPriceForItem(res.uniqueName, 'sell')
    }));

    const calcs = CraftingService.calculateProfit({ rrr: globalRrr, tax: globalTax, craftFee: globalCraftFee, sellPrice, materials });
    if (calcs.trueCostPerItem <= 0) return null;

    return (
      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${calcs.profit > 0 ? 'bg-trading-up/15 text-trading-up' : 'bg-trading-down/15 text-trading-down'}`}>
        {calcs.profit > 0 ? '+' : ''}{calcs.profitPercent.toFixed(1)}%
      </span>
    );
  };

  return (
    <div className="flex h-full overflow-hidden">
      {/* Left sidebar */}
      <div className="w-56 flex-shrink-0 border-r border-hairline overflow-y-auto custom-scrollbar bg-surface-card">
        <div className="p-3 border-b border-hairline sticky top-0 bg-surface-card z-10 flex items-center gap-2">
          <Filter size={14} className="text-muted" />
          <h2 className="text-xs font-bold text-strong uppercase tracking-wider">Categories</h2>
        </div>
        <div className="p-2 space-y-0.5">
          {marketplaceData.map(cat => {
            const isExpanded = marketCategory === cat.id;
            return (
              <div key={cat.id}>
                <div
                  onClick={() => setMarketCategory(isExpanded ? null : cat.id)}
                  className={`flex items-center justify-between px-2 py-1.5 rounded-lg cursor-pointer text-xs font-semibold transition-colors
                    ${isExpanded ? 'bg-primary/10 text-primary' : 'text-body hover:bg-surface-elevated'}`}
                >
                  <span>{cat.name}</span>
                  {isExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                </div>

                {isExpanded && (
                  <div className="ml-3 mt-0.5 pl-2 border-l border-hairline space-y-0.5">
                    {cat.children.map(sub => {
                      const isSubSel = marketSubcategory === sub.id;
                      return (
                        <div key={sub.id}>
                          <div
                            onClick={() => setMarketSubcategory(isSubSel ? null : sub.id)}
                            className={`px-2 py-1 rounded cursor-pointer text-xs transition-colors
                              ${isSubSel ? 'font-bold text-strong bg-surface-elevated' : 'text-muted hover:text-strong hover:bg-surface-elevated/50'}`}
                          >{sub.name}</div>
                          {isSubSel && (
                            <div className="ml-2 mt-0.5 pl-2 border-l border-hairline space-y-0.5">
                              {sub.families.map(fam => {
                                const isFamSel = marketItemFamily === fam.id;
                                return (
                                  <div
                                    key={fam.id}
                                    onClick={() => setMarketItemFamily(isFamSel ? null : fam.id)}
                                    className={`px-1.5 py-0.5 rounded cursor-pointer text-[11px] transition-colors
                                      ${isFamSel ? 'text-primary font-bold' : 'text-muted hover:text-strong'}`}
                                  >{fam.name}</div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Filters */}
        <div className="flex items-center gap-3 px-4 py-2 border-b border-hairline bg-surface-elevated/10 flex-shrink-0">
          <div className="relative flex-1 max-w-xs">
            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted" />
            <input
              type="text"
              placeholder="Search items…"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-surface-card border border-hairline rounded-lg text-strong placeholder-muted focus:outline-none focus:border-primary transition-colors"
            />
          </div>
          {[
            { label: 'Tier', value: marketTier, setter: setMarketTier, opts: ['All', 4, 5, 6, 7, 8].map(v => ({ v, l: v === 'All' ? 'All' : `T${v}` })) },
            { label: 'Ench', value: marketEnchantment, setter: setMarketEnchantment, opts: ['All', 0, 1, 2, 3, 4].map(v => ({ v, l: v === 'All' ? 'All' : `.${v}` })) },
          ].map(({ label, value, setter, opts }) => (
            <div key={label} className="flex items-center gap-1.5">
              <span className="text-[11px] text-muted font-semibold">{label}</span>
              <select
                value={value}
                onChange={e => setter(e.target.value)}
                className="bg-surface-card border border-hairline rounded-lg px-2 py-1 text-xs text-strong focus:outline-none focus:border-primary"
              >
                {opts.map(({ v, l }) => <option key={v} value={v}>{l}</option>)}
              </select>
            </div>
          ))}
          <span className="text-[11px] text-muted ml-auto">{displayedItems.length} items</span>
        </div>

        {/* Item list */}
        <div className="flex-1 overflow-y-auto p-3 custom-scrollbar">
          <div className="grid gap-1.5">
            {displayedItems.map(item => {
              const isSelected = selectedItem?.uniqueName === item.uniqueName;
              const sellPrice = getPriceForItem(item.uniqueName, 'sell');
              const buyPrice = getPriceForItem(item.uniqueName, 'buy');
              return (
                <div
                  key={item.uniqueName}
                  onClick={() => setSelectedItem(item)}
                  className={`flex items-center gap-3 p-2.5 rounded-xl border cursor-pointer transition-all hover:bg-surface-elevated group
                    ${isSelected ? 'border-primary bg-primary/5' : 'border-hairline bg-surface-card'}`}
                >
                  <div className="w-10 h-10 rounded-lg border border-hairline overflow-hidden flex-shrink-0 bg-canvas group-hover:scale-105 transition-transform">
                    <img loading="lazy" src={`https://render.albiononline.com/v1/item/${item.uniqueName}.png`} alt={item.name} className="w-full h-full object-contain p-0.5" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-semibold text-strong truncate">{item.name}</span>
                      {renderProfitBadge(item)}
                    </div>
                    <span className="text-[10px] text-muted font-mono bg-canvas px-1 rounded">T{item.tier}.{item.enchantment}</span>
                  </div>

                  <div className="flex items-center gap-4 flex-shrink-0 text-right">
                    <div>
                      <div className="text-[9px] text-muted uppercase mb-0.5">Sell</div>
                      <div className="text-xs font-bold font-plex text-trading-up">{CraftingService.formatSilver(sellPrice) || '--'}</div>
                    </div>
                    <div>
                      <div className="text-[9px] text-muted uppercase mb-0.5">Buy</div>
                      <div className="text-xs font-bold font-plex text-trading-down">{CraftingService.formatSilver(buyPrice) || '--'}</div>
                    </div>
                  </div>
                </div>
              );
            })}

            {displayedItems.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 text-muted">
                <Search size={40} className="opacity-20 mb-3" />
                <p className="text-sm font-semibold">No items found</p>
                <p className="text-xs">Adjust your filters or search query</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
