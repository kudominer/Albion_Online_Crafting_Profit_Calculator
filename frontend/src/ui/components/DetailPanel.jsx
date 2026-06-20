import React from 'react';
import { X, Calculator, Star } from 'lucide-react';
import { useStore } from '../../cache/marketStore';
import { CraftingService } from '../../services/craftingService';
import { ItemService } from '../../services/itemService';

export function DetailPanel() {
  const globalLanguage = useStore(s => s.globalLanguage);
  const selectedItem   = useStore(s => s.selectedItem);
  const setSelectedItem = useStore(s => s.setSelectedItem);
  const marketData     = useStore(s => s.marketData);
  const customPrices   = useStore(s => s.customPrices);
  const watchlist      = useStore(s => s.watchlist);
  const toggleWatchlist = useStore(s => s.toggleWatchlist);
  const globalRrr      = useStore(s => s.globalRrr);
  const setGlobalRrr   = useStore(s => s.setGlobalRrr);
  const globalTax      = useStore(s => s.globalTax);
  const setGlobalTax   = useStore(s => s.setGlobalTax);
  const globalCraftFee = useStore(s => s.globalCraftFee);
  const setGlobalCraftFee = useStore(s => s.setGlobalCraftFee);
  const globalCity     = useStore(s => s.globalCity);
  const globalFocus    = useStore(s => s.globalFocus);

  if (!selectedItem) return null;

  const effectiveRrr = globalFocus ? CraftingService.getFocusRrr(globalRrr) : globalRrr;

  // Get prices with city preference
  const getPrices = (itemId) => {
    const data = marketData[itemId];
    if (!data) return { sell: 0, buy: 0, sellCity: '', buyCity: '', sellFallback: false, buyFallback: false };

    let sell = 0;
    let buy = 0;
    let sellCity = '';
    let buyCity = '';
    let sellFallback = false;
    let buyFallback = false;

    // 1. Try globalCity
    if (globalCity && data[globalCity]) {
      if (data[globalCity].sellPriceMin > 0) {
        sell = data[globalCity].sellPriceMin;
        sellCity = globalCity;
      }
      if (data[globalCity].buyPriceMax > 0) {
        buy = data[globalCity].buyPriceMax;
        buyCity = globalCity;
      }
    }

    // 2. Fallback for sell
    if (sell === 0) {
      const sells = Object.entries(data)
        .filter(([key]) => key !== 'lastScannedAt' && key !== 'updatedAt')
        .map(([city, d]) => ({ city, val: d.sellPriceMin }))
        .filter(item => item.val > 0);

      if (sells.length > 0) {
        sells.sort((a, b) => a.val - b.val); // Min price is best
        sell = sells[0].val;
        sellCity = sells[0].city;
        sellFallback = globalCity ? true : false;
      }
    }

    // 3. Fallback for buy
    if (buy === 0) {
      const buys = Object.entries(data)
        .filter(([key]) => key !== 'lastScannedAt' && key !== 'updatedAt')
        .map(([city, d]) => ({ city, val: d.buyPriceMax }))
        .filter(item => item.val > 0);

      if (buys.length > 0) {
        buys.sort((a, b) => b.val - a.val); // Max price is best
        buy = buys[0].val;
        buyCity = buys[0].city;
        buyFallback = globalCity ? true : false;
      }
    }

    return { sell, buy, sellCity, buyCity, sellFallback, buyFallback };
  };

  const sellDetails = getPrices(selectedItem.uniqueName);
  const minSell = sellDetails.sell;
  const maxBuy = sellDetails.buy;

  const resourceDetails = (selectedItem.resources || []).map(res => {
    const isCustom = !!customPrices[res.uniqueName];
    const unitPrice = isCustom ? Number(customPrices[res.uniqueName]) : getPrices(res.uniqueName).sell;
    return { ...res, unitPrice, totalCost: unitPrice * res.qty, isCustomPrice: isCustom };
  });

  const calcs = CraftingService.calculateProfit({
    rrr: effectiveRrr,
    tax: globalTax,
    craftFee: globalCraftFee,
    sellPrice: minSell,
    materials: resourceDetails.map(r => ({ quantity: r.qty, unitPrice: r.unitPrice }))
  });

  const isWatchlisted = watchlist.includes(selectedItem.uniqueName);

  return (
    <div className="w-full h-full bg-surface-card flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex-shrink-0 p-3 border-b border-hairline flex items-center justify-between bg-surface-elevated/50">
        <h3 className="font-bold text-strong text-sm flex items-center gap-2">
          <Calculator size={14} className="text-primary" /> Craft Detail
        </h3>
        <div className="flex items-center gap-1">
          <button
            onClick={() => toggleWatchlist(selectedItem.uniqueName)}
            className={`p-1.5 rounded transition-colors ${isWatchlisted ? 'text-primary bg-primary/10' : 'text-muted hover:text-strong hover:bg-surface-elevated'}`}
          >
            <Star size={15} fill={isWatchlisted ? 'currentColor' : 'none'} />
          </button>
          <button onClick={() => setSelectedItem(null)} className="p-1.5 text-muted hover:text-strong hover:bg-surface-elevated rounded transition-colors">
            <X size={15} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3 custom-scrollbar space-y-3">
        {/* Item header */}
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 bg-surface-elevated rounded-lg border border-hairline p-1 shrink-0">
            <img loading="lazy" src={`https://render.albiononline.com/v1/item/${selectedItem.uniqueName}.png`} alt={selectedItem.name} className="w-full h-full object-contain" />
          </div>
          <div>
            <h4 className="font-bold text-base text-strong">{ItemService.getItemName(selectedItem.uniqueName, globalLanguage)}</h4>
            <p className="text-[10px] text-muted font-mono">{selectedItem.uniqueName}</p>
            <span className="text-[10px] text-muted bg-canvas px-1.5 py-0.5 rounded border border-hairline">T{selectedItem.tier}.{selectedItem.enchantment}</span>
          </div>
        </div>

        {/* Market prices */}
        <div className="bg-canvas border border-hairline rounded-xl p-3">
          <h5 className="text-[10px] text-muted uppercase tracking-wider font-bold mb-2">Market Prices{globalCity && ` — ${globalCity}`}</h5>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="text-[10px] text-muted mb-0.5">Min Sell</div>
              <div className="text-sm font-plex font-bold text-trading-up">
                {minSell ? CraftingService.formatSilverFull(minSell) : '--'}
                {sellDetails.sellFallback && <span className="text-[9px] text-muted block font-sans font-normal">({sellDetails.sellCity})</span>}
              </div>
            </div>
            <div>
              <div className="text-[10px] text-muted mb-0.5">Max Buy Order</div>
              <div className="text-sm font-plex font-bold text-trading-down">
                {maxBuy ? CraftingService.formatSilverFull(maxBuy) : '--'}
                {sellDetails.buyFallback && <span className="text-[9px] text-muted block font-sans font-normal">({sellDetails.buyCity})</span>}
              </div>
            </div>
          </div>
        </div>

        {/* Craft params */}
        <div className="bg-canvas border border-hairline rounded-xl p-3">
          <h5 className="text-[10px] text-muted uppercase tracking-wider font-bold mb-2">Craft Parameters</h5>
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: `RRR${globalFocus ? ' (Focus)' : ''} %`, value: effectiveRrr, set: setGlobalRrr },
              { label: 'Tax %', value: globalTax, set: setGlobalTax },
              { label: 'Fee', value: globalCraftFee, set: setGlobalCraftFee, placeholder: '0' },
            ].map(({ label, value, set, placeholder }) => (
              <div key={label}>
                <label className="block text-[9px] text-muted mb-0.5">{label}</label>
                <input
                  type="number"
                  value={value}
                  onChange={e => set(e.target.value)}
                  placeholder={placeholder}
                  readOnly={globalFocus && label.includes('RRR')}
                  className="w-full bg-surface-elevated border border-hairline rounded px-2 py-1 text-xs text-strong font-plex focus:outline-none focus:border-primary transition-colors"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Materials */}
        <div className="bg-canvas border border-hairline rounded-xl p-3">
          <h5 className="text-[10px] text-muted uppercase tracking-wider font-bold mb-2">Materials</h5>
          <div className="space-y-2">
            {resourceDetails.map((res, i) => (
              <div key={i} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-surface-elevated rounded border border-hairline p-0.5 shrink-0">
                    <img loading="lazy" src={`https://render.albiononline.com/v1/item/${res.uniqueName}.png`} alt={res.uniqueName} className="w-full h-full object-contain" />
                  </div>
                  <div>
                    <div className="text-strong font-medium text-[11px] flex items-center gap-1">
                      {ItemService.getItemName(res.uniqueName, globalLanguage)}
                      {res.isCustomPrice && <span className="text-[9px] bg-primary/20 text-primary px-1 rounded">CUSTOM</span>}
                    </div>
                    <div className="text-muted text-[10px]">{res.qty}×</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`font-plex text-xs font-bold ${res.isCustomPrice ? 'text-primary' : 'text-strong'}`}>
                    {CraftingService.formatSilver(res.totalCost) || '--'}
                  </div>
                  <div className="text-[10px] text-muted">@{CraftingService.formatSilver(res.unitPrice) || '--'}/ea</div>
                </div>
              </div>
            ))}
            <div className="pt-2 mt-1 border-t border-hairline space-y-1">
              <div className="flex justify-between text-[11px]">
                <span className="text-muted">Raw material cost:</span>
                <span className="font-plex text-strong">{CraftingService.formatSilver(calcs.totalMaterialCost) || '--'}</span>
              </div>
              <div className="flex justify-between text-[11px]">
                <span className="text-muted">After RRR ({effectiveRrr}%):</span>
                <span className="font-plex font-bold text-strong">{CraftingService.formatSilver(calcs.trueCostPerItem) || '--'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Profit */}
        <div className="bg-surface-elevated border border-hairline rounded-xl p-4">
          <h5 className="text-[10px] text-muted uppercase tracking-wider font-bold mb-1">Estimated Profit</h5>
          <div className="flex justify-between items-end mt-2">
            <div className={`font-plex font-bold text-2xl ${CraftingService.profitColor(calcs.profit)}`}>
              {calcs.profit > 0 ? '+' : ''}{calcs.profit !== 0 ? CraftingService.formatSilverFull(calcs.profit) : '--'}
            </div>
            <div className={`font-plex font-bold text-lg ${CraftingService.profitColor(calcs.profit)}`}>
              {calcs.profitPercent !== 0 ? calcs.profitPercent.toFixed(1) + '%' : '--'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
