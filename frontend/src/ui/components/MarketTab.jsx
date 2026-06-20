import React, { useEffect, useState } from 'react';
import { LineChart, RefreshCw, Search, Loader2 } from 'lucide-react';
import { useStore } from '../../cache/marketStore';
import { ApiService } from '../../services/apiService';
import { CraftingService } from '../../services/craftingService';
import { ItemService } from '../../services/itemService';

const CITIES = ['Caerleon', 'Martlock', 'Bridgewatch', 'Lymhurst', 'Fort Sterling', 'Thetford', 'Black Market'];

export function MarketTab() {
  const globalLanguage = useStore(s => s.globalLanguage);
  const marketData     = useStore(s => s.marketData);
  const isFetching     = useStore(s => s.isFetching);

  const [search, setSearch] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [sortField, setSortField] = useState('sellPriceMin');
  const [sortDir, setSortDir] = useState('asc');

  // Build flat list from marketData
  const allRows = [];
  for (const [itemId, cityMap] of Object.entries(marketData)) {
    const name = ItemService.getItemName(itemId, globalLanguage);
    if (search && !name.toLowerCase().includes(search.toLowerCase()) && !itemId.toLowerCase().includes(search.toLowerCase())) continue;

    for (const [city, prices] of Object.entries(cityMap)) {
      if (selectedCity && city !== selectedCity) continue;
      if (prices.sellPriceMin > 0 || prices.buyPriceMax > 0) {
        allRows.push({ itemId, name, city, sellPriceMin: prices.sellPriceMin || 0, buyPriceMax: prices.buyPriceMax || 0, updatedAt: prices.updatedAt });
      }
    }
  }

  const sorted = [...allRows].sort((a, b) => {
    const av = a[sortField] || 0, bv = b[sortField] || 0;
    return sortDir === 'asc' ? av - bv : bv - av;
  });

  const toggleSort = (field) => {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('asc'); }
  };

  const sortIcon = (field) => {
    if (sortField !== field) return '↕';
    return sortDir === 'asc' ? '↑' : '↓';
  };

  const refresh = () => {
    const ids = [...new Set(allRows.map(r => r.itemId))].slice(0, 200);
    if (ids.length > 0) ApiService.fetchMarketPrices(ids);
  };

  const timeSince = (ts) => {
    if (!ts) return '--';
    const diff = Math.floor((Date.now() - ts) / 60000);
    if (diff < 1) return 'just now';
    if (diff < 60) return `${diff}m ago`;
    return `${Math.floor(diff / 60)}h ago`;
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Toolbar */}
      <div className="flex-shrink-0 flex items-center gap-3 px-4 py-2 border-b border-hairline bg-surface-elevated/10">
        <div className="relative flex-1 max-w-xs">
          <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted" />
          <input
            type="text"
            placeholder="Search items…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-surface-card border border-hairline rounded-lg text-strong placeholder-muted focus:outline-none focus:border-primary transition-colors"
          />
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-xs text-muted">City:</span>
          <select
            value={selectedCity}
            onChange={e => setSelectedCity(e.target.value)}
            className="bg-surface-card border border-hairline rounded px-2 py-1 text-xs text-strong focus:outline-none focus:border-primary"
          >
            <option value="">All Cities</option>
            {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <button
          onClick={refresh}
          disabled={isFetching}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-surface-card border border-hairline rounded-lg text-xs text-muted hover:text-strong hover:bg-surface-elevated transition-colors disabled:opacity-50"
        >
          {isFetching ? <Loader2 size={13} className="animate-spin" /> : <RefreshCw size={13} />}
          Refresh
        </button>

        <span className="text-[11px] text-muted ml-auto">{sorted.length.toLocaleString()} entries</span>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <table className="w-full text-xs">
          <thead className="sticky top-0 bg-surface-card border-b border-hairline z-10">
            <tr>
              <th className="text-left px-3 py-2 text-muted font-semibold uppercase tracking-wider w-8"></th>
              <th className="text-left px-3 py-2 text-muted font-semibold uppercase tracking-wider">Item</th>
              <th className="text-left px-3 py-2 text-muted font-semibold uppercase tracking-wider">City</th>
              <th
                onClick={() => toggleSort('sellPriceMin')}
                className="text-right px-3 py-2 text-muted font-semibold uppercase tracking-wider cursor-pointer hover:text-strong"
              >Sell Min {sortIcon('sellPriceMin')}</th>
              <th
                onClick={() => toggleSort('buyPriceMax')}
                className="text-right px-3 py-2 text-muted font-semibold uppercase tracking-wider cursor-pointer hover:text-strong"
              >Buy Max {sortIcon('buyPriceMax')}</th>
              <th className="text-right px-3 py-2 text-muted font-semibold uppercase tracking-wider">Spread</th>
              <th className="text-right px-3 py-2 text-muted font-semibold uppercase tracking-wider">Updated</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-hairline">
            {sorted.slice(0, 300).map((row, i) => {
              const spread = row.sellPriceMin > 0 && row.buyPriceMax > 0 ? row.sellPriceMin - row.buyPriceMax : null;
              const spreadPct = spread !== null && row.buyPriceMax > 0 ? (spread / row.buyPriceMax * 100) : null;
              return (
                <tr key={i} className="hover:bg-surface-elevated/50 transition-colors">
                  <td className="px-3 py-1.5">
                    <div className="w-7 h-7 rounded border border-hairline overflow-hidden bg-canvas">
                      <img loading="lazy" src={`https://render.albiononline.com/v1/item/${row.itemId}.png`} alt={row.itemId} className="w-full h-full object-contain p-0.5" />
                    </div>
                  </td>
                  <td className="px-3 py-1.5">
                    <div className="text-strong font-medium truncate max-w-[160px]">{row.name}</div>
                    <div className="text-muted font-mono text-[10px]">{row.itemId}</div>
                  </td>
                  <td className="px-3 py-1.5 text-muted">{row.city}</td>
                  <td className="px-3 py-1.5 text-right font-plex font-semibold text-trading-up">{CraftingService.formatSilver(row.sellPriceMin) || '--'}</td>
                  <td className="px-3 py-1.5 text-right font-plex font-semibold text-trading-down">{CraftingService.formatSilver(row.buyPriceMax) || '--'}</td>
                  <td className="px-3 py-1.5 text-right">
                    {spreadPct !== null ? (
                      <span className={`font-bold ${spread > 0 ? 'text-trading-up' : 'text-trading-down'}`}>
                        {spread > 0 ? '+' : ''}{spreadPct.toFixed(1)}%
                      </span>
                    ) : '--'}
                  </td>
                  <td className="px-3 py-1.5 text-right text-muted">{timeSince(row.updatedAt)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {sorted.length === 0 && (
          <div className="flex flex-col items-center justify-center h-40 text-muted gap-2">
            <LineChart size={36} className="opacity-20" />
            <p className="text-sm">No data yet. Backend is loading prices…</p>
          </div>
        )}
      </div>
    </div>
  );
}
