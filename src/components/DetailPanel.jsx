import React from 'react';
import { X, Calculator, Star } from 'lucide-react';
import { useStore } from '../store/useStore';
import { formatSilver, calculateProfit } from '../utils/calculations';

const formatResourceName = (uniqueName) => {
  const match = uniqueName.match(/^T(\d)_([A-Z]+)(?:_LEVEL\d@(\d))?$/);
  if (match) {
    const tier = match[1];
    const type = match[2];
    const enchant = match[3] || '0';
    return `${type} T${tier}.${enchant}`;
  }
  return uniqueName;
};

export function DetailPanel() {
  const selectedItem = useStore(state => state.selectedItem);
  const setSelectedItem = useStore(state => state.setSelectedItem);
  const marketData = useStore(state => state.marketData);
  const customPrices = useStore(state => state.customPrices);
  const watchlist = useStore(state => state.watchlist);
  const toggleWatchlist = useStore(state => state.toggleWatchlist);

  // Global Settings linked
  const globalRrr = useStore(state => state.globalRrr);
  const setGlobalRrr = useStore(state => state.setGlobalRrr);
  const globalTax = useStore(state => state.globalTax);
  const setGlobalTax = useStore(state => state.setGlobalTax);
  const globalCraftFee = useStore(state => state.globalCraftFee);
  const setGlobalCraftFee = useStore(state => state.setGlobalCraftFee);

  if (!selectedItem) return null;

  // Lấy giá vật phẩm chính
  const itemPrices = marketData[selectedItem.uniqueName] || {};
  const sells = Object.values(itemPrices).map(d => d.sellPriceMin).filter(p => p > 0);
  const buys = Object.values(itemPrices).map(d => d.buyPriceMax).filter(p => p > 0);
  const minSell = sells.length > 0 ? Math.min(...sells) : 0;
  const maxBuy = buys.length > 0 ? Math.max(...buys) : 0;

  // Chuẩn bị dữ liệu nguyên liệu (Ưu tiên Custom Price)
  const resourceDetails = selectedItem.resources?.map(res => {
    let unitPrice = 0;
    const isCustomPrice = !!customPrices[res.uniqueName];

    if (isCustomPrice) {
      unitPrice = Number(customPrices[res.uniqueName]);
    } else {
      const resPrices = marketData[res.uniqueName] || {};
      const resSells = Object.values(resPrices).map(d => d.sellPriceMin).filter(p => p > 0);
      unitPrice = resSells.length > 0 ? Math.min(...resSells) : 0;
    }
    
    return {
      ...res,
      unitPrice,
      totalCost: unitPrice * res.qty,
      isCustomPrice
    };
  }) || [];

  // Tính toán lợi nhuận sử dụng helper function và Global Settings
  const mockItem = {
    rrr: globalRrr,
    tax: globalTax,
    craftFee: globalCraftFee,
    sellPrice: minSell,
    materials: resourceDetails.map(res => ({
      quantity: res.qty,
      unitPrice: res.unitPrice
    }))
  };

  const calcs = calculateProfit(mockItem);
  const profitColor = calcs.profit > 0 ? 'text-trading-up' : calcs.profit < 0 ? 'text-trading-down' : 'text-body';
  const isWatchlisted = watchlist.includes(selectedItem.uniqueName);

  return (
    <div className="w-full h-full bg-surface-card border-l border-hairline flex flex-col shadow-lg overflow-hidden">
      <div className="p-4 border-b border-hairline flex items-center justify-between bg-surface-elevated/50">
        <h3 className="font-bold text-strong flex items-center gap-2">
          <Calculator size={18} className="text-primary" />
          Chi tiết Vật phẩm
        </h3>
        <div className="flex items-center gap-1">
          <button 
            onClick={() => toggleWatchlist(selectedItem.uniqueName)}
            className={`p-1.5 rounded transition-colors ${isWatchlisted ? 'text-primary bg-primary/10' : 'text-muted hover:text-strong hover:bg-surface-elevated'}`}
            title={isWatchlisted ? "Bỏ theo dõi" : "Theo dõi vật phẩm"}
          >
            <Star size={18} fill={isWatchlisted ? "currentColor" : "none"} />
          </button>
          <button 
            onClick={() => setSelectedItem(null)}
            className="p-1.5 text-muted hover:text-strong hover:bg-surface-elevated rounded transition-colors"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
        {/* Item Header */}
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 bg-surface-elevated rounded-lg border border-hairline p-1 shadow-sm shrink-0">
            <img 
              src={`https://render.albiononline.com/v1/item/${selectedItem.uniqueName}.png`} 
              alt={selectedItem.name}
              className="w-full h-full object-contain"
              onError={(e) => { e.target.style.display = 'none'; }}
            />
          </div>
          <div>
            <h4 className="font-bold text-lg text-strong">{selectedItem.name}</h4>
            <p className="text-xs text-muted font-mono">{selectedItem.uniqueName}</p>
          </div>
        </div>

        {/* Market Prices */}
        <div className="bg-canvas border border-hairline rounded-xl p-4 mb-6">
          <h5 className="text-xs font-semibold text-muted uppercase tracking-wider mb-3">Giá Thị trường (Tốt nhất)</h5>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-xs text-muted mb-1">Giá Bán (Min Sell)</div>
              <div className="font-plex text-trading-up font-bold text-lg">{minSell > 0 ? formatSilver(minSell) : '--'}</div>
            </div>
            <div>
              <div className="text-xs text-muted mb-1">Giá Mua (Max Buy)</div>
              <div className="font-plex text-trading-down font-bold text-lg">{maxBuy > 0 ? formatSilver(maxBuy) : '--'}</div>
            </div>
          </div>
        </div>

        {/* Form Nhập Thông số */}
        <div className="bg-canvas border border-hairline rounded-xl p-4 mb-6">
          <h5 className="text-xs font-semibold text-muted uppercase tracking-wider mb-3">Thông số Chế tạo (Đồng bộ Toàn cục)</h5>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-[10px] text-muted mb-1">RRR (%)</label>
              <input
                type="number"
                value={globalRrr}
                onChange={(e) => setGlobalRrr(e.target.value)}
                className="w-full bg-surface-elevated border border-hairline rounded px-2 py-1.5 text-sm text-strong font-plex focus:outline-none focus:border-primary transition-colors"
              />
            </div>
            <div>
              <label className="block text-[10px] text-muted mb-1">Thuế chợ (%)</label>
              <input
                type="number"
                value={globalTax}
                onChange={(e) => setGlobalTax(e.target.value)}
                className="w-full bg-surface-elevated border border-hairline rounded px-2 py-1.5 text-sm text-strong font-plex focus:outline-none focus:border-primary transition-colors"
              />
            </div>
            <div>
              <label className="block text-[10px] text-muted mb-1">Phí Craft</label>
              <input
                type="number"
                value={globalCraftFee}
                onChange={(e) => setGlobalCraftFee(e.target.value)}
                placeholder="0"
                className="w-full bg-surface-elevated border border-hairline rounded px-2 py-1.5 text-sm text-strong font-plex focus:outline-none focus:border-primary transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Nguyên liệu */}
        <div className="bg-canvas border border-hairline rounded-xl p-4 mb-6">
          <h5 className="text-xs font-semibold text-muted uppercase tracking-wider mb-3">Nguyên liệu Chế tạo</h5>
          {resourceDetails.length > 0 ? (
            <div className="space-y-3">
              {resourceDetails.map((res, idx) => (
                <div key={idx} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-3">
                    <div className="relative w-8 h-8 bg-surface-elevated rounded p-0.5 border border-hairline shrink-0">
                      <img 
                        src={`https://render.albiononline.com/v1/item/${res.uniqueName}.png`} 
                        alt="Resource"
                        className="w-full h-full object-contain"
                        onError={(e) => { e.target.style.display = 'none'; }}
                      />
                    </div>
                    <div>
                      <div className="text-strong font-medium text-xs flex items-center gap-1">
                        {formatResourceName(res.uniqueName)}
                        {res.isCustomPrice && <span className="text-[9px] bg-primary/20 text-primary px-1 rounded">CUSTOM</span>}
                      </div>
                      <div className="text-muted text-[10px]">{res.qty}x</div>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className={`font-plex text-xs font-semibold ${res.isCustomPrice ? 'text-primary' : 'text-strong'}`}>
                      {res.totalCost > 0 ? formatSilver(res.totalCost) : '--'}
                    </div>
                    <div className="text-[10px] text-muted">@{res.unitPrice > 0 ? formatSilver(res.unitPrice) : '--'}/ea</div>
                  </div>
                </div>
              ))}
              <div className="pt-3 mt-3 border-t border-hairline flex flex-col gap-1">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-muted">Tổng chi phí NL gốc:</span>
                  <span className="font-plex text-strong">{calcs.totalMaterialCost > 0 ? formatSilver(calcs.totalMaterialCost) : '--'}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-muted">Chi phí Thực tế (Sau RRR):</span>
                  <span className="font-plex font-bold text-strong">{calcs.trueCostPerItem > 0 ? formatSilver(calcs.trueCostPerItem) : '--'}</span>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted">Không có thông tin nguyên liệu.</p>
          )}
        </div>

        {/* Lợi nhuận */}
        <div className="bg-surface-elevated border border-hairline rounded-xl p-4">
          <h5 className="text-xs font-semibold text-muted uppercase tracking-wider mb-1">Lợi nhuận dự kiến</h5>
          <div className="flex justify-between items-end mt-2">
            <div className={`font-plex font-bold text-2xl ${profitColor}`}>
              {calcs.profit > 0 ? '+' : ''}{calcs.profit !== 0 ? formatSilver(calcs.profit) : '--'}
            </div>
            <div className={`font-plex font-bold text-lg ${profitColor}`}>
              {calcs.profitPercent !== 0 ? calcs.profitPercent.toFixed(2) + '%' : '--'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
