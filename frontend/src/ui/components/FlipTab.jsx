import React, { useEffect, useState } from 'react';
import { TrendingUp, RefreshCw, Loader2 } from 'lucide-react';
import { useStore } from '../../cache/marketStore';
import { ApiService } from '../../services/apiService';
import { CraftingService } from '../../services/craftingService';
import { ItemService } from '../../services/itemService';

const CITIES = ['', 'Caerleon', 'Martlock', 'Bridgewatch', 'Lymhurst', 'Fort Sterling', 'Thetford', 'Black Market'];

export function FlipTab() {
  const globalLanguage = useStore(s => s.globalLanguage);
  const topProfitFlip  = useStore(s => s.topProfitFlip);
  const topProfitLoading = useStore(s => s.topProfitLoading);
  const globalTax      = useStore(s => s.globalTax);

  const [city, setCity] = useState('');
  const [minSpread, setMinSpread] = useState('5');
  const [sortBy, setSortBy] = useState('spreadPercent');

  const load = async () => {
    await ApiService.fetchTopProfit('flip', city || undefined, 60);
  };

  useEffect(() => { load(); }, [city]);

  const filtered = topProfitFlip
    .filter(r => r.spreadPercent >= parseFloat(minSpread || 0))
    .sort((a, b) => {
      if (sortBy === 'spreadPercent') return b.spreadPercent - a.spreadPercent;
      if (sortBy === 'spread') return b.spread - a.spread;
      return 0;
    });

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Toolbar */}
      <div className="flex-shrink-0 flex items-center gap-3 px-4 py-3 border-b border-hairline bg-surface-elevated/10">
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-muted">City:</span>
          <select
            value={city}
            onChange={e => setCity(e.target.value)}
            className="bg-surface-card border border-hairline rounded px-2 py-1 text-xs text-strong focus:outline-none focus:border-primary"
          >
            {CITIES.map(c => <option key={c} value={c}>{c || 'All Cities'}</option>)}
          </select>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-xs text-muted">Min Spread %:</span>
          <input
            type="number"
            value={minSpread}
            onChange={e => setMinSpread(e.target.value)}
            className="w-16 bg-surface-card border border-hairline rounded px-2 py-1 text-xs text-strong focus:outline-none focus:border-primary font-plex"
          />
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-xs text-muted">Sort:</span>
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
            className="bg-surface-card border border-hairline rounded px-2 py-1 text-xs text-strong focus:outline-none focus:border-primary"
          >
            <option value="spreadPercent">By Spread %</option>
            <option value="spread">By Spread (Silver)</option>
          </select>
        </div>

        <button
          onClick={load}
          disabled={topProfitLoading}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-surface-card border border-hairline rounded-lg text-xs text-muted hover:text-strong hover:bg-surface-elevated transition-colors ml-auto disabled:opacity-50"
        >
          {topProfitLoading ? <Loader2 size={13} className="animate-spin" /> : <RefreshCw size={13} />}
          Refresh
        </button>
      </div>

      {/* Info banner */}
      <div className="flex-shrink-0 px-4 py-2 bg-primary/5 border-b border-primary/20">
        <p className="text-[11px] text-primary/80">
          💡 <strong>Flip:</strong> Buy at <span className="font-plex">buy_price_max</span> → sell at <span className="font-plex">sell_price_min</span>. Spread = profit before tax.
        </p>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {topProfitLoading && (
          <div className="flex items-center justify-center h-40 gap-2 text-muted">
            <Loader2 size={20} className="animate-spin text-primary" />
            <span className="text-sm">Loading flip opportunities…</span>
          </div>
        )}

        {!topProfitLoading && filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center h-40 text-muted gap-2">
            <TrendingUp size={36} className="opacity-20" />
            <p className="text-sm">No flip opportunities found yet</p>
            <p className="text-xs">Backend needs more cached prices. Check scanner status in the header.</p>
          </div>
        )}

        {!topProfitLoading && filtered.length > 0 && (
          <table className="w-full text-xs">
            <thead className="sticky top-0 bg-surface-card border-b border-hairline z-10">
              <tr>
                <th className="text-left px-3 py-2 text-muted font-semibold uppercase tracking-wider w-8"></th>
                <th className="text-left px-3 py-2 text-muted font-semibold uppercase tracking-wider">Item</th>
                <th className="text-left px-3 py-2 text-muted font-semibold uppercase tracking-wider">City</th>
                <th className="text-right px-3 py-2 text-muted font-semibold uppercase tracking-wider">Buy Order</th>
                <th className="text-right px-3 py-2 text-muted font-semibold uppercase tracking-wider">Sell Order</th>
                <th className="text-right px-3 py-2 text-muted font-semibold uppercase tracking-wider">Spread</th>
                <th className="text-right px-3 py-2 text-muted font-semibold uppercase tracking-wider">Spread %</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-hairline">
              {filtered.map((r, i) => (
                <tr key={i} className="hover:bg-surface-elevated/50 transition-colors">
                  <td className="px-3 py-1.5">
                    <div className="w-7 h-7 rounded border border-hairline overflow-hidden bg-canvas">
                      <img loading="lazy" src={`https://render.albiononline.com/v1/item/${r.itemId}.png`} alt={r.itemId} className="w-full h-full object-contain p-0.5" />
                    </div>
                  </td>
                  <td className="px-3 py-1.5">
                    <div className="text-strong font-medium truncate max-w-[160px]">{ItemService.getItemName(r.itemId, globalLanguage)}</div>
                    <div className="text-muted font-mono text-[10px]">{r.itemId}</div>
                  </td>
                  <td className="px-3 py-1.5 text-muted">{r.city}</td>
                  <td className="px-3 py-1.5 text-right font-plex font-semibold text-trading-down">{CraftingService.formatSilver(r.buyPriceMax)}</td>
                  <td className="px-3 py-1.5 text-right font-plex font-semibold text-trading-up">{CraftingService.formatSilver(r.sellPriceMin)}</td>
                  <td className="px-3 py-1.5 text-right font-plex font-bold text-trading-up">+{CraftingService.formatSilver(r.spread)}</td>
                  <td className="px-3 py-1.5 text-right">
                    <span className="px-1.5 py-0.5 rounded bg-trading-up/15 text-trading-up font-bold">+{r.spreadPercent?.toFixed(1)}%</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
