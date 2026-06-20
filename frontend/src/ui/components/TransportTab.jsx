import React, { useState, useEffect } from 'react';
import { ArrowLeftRight, RefreshCw, TrendingUp, Package, Loader2 } from 'lucide-react';
import { useStore } from '../../cache/marketStore';
import { ApiService } from '../../services/apiService';
import { CraftingService } from '../../services/craftingService';
import { ItemService } from '../../services/itemService';
import RECIPES from '../../data/recipes.json';

const CITIES = ['Caerleon', 'Martlock', 'Bridgewatch', 'Lymhurst', 'Fort Sterling', 'Thetford'];

const POPULAR_ITEMS = [
  'T4_BAG', 'T5_BAG', 'T6_BAG', 'T7_BAG', 'T8_BAG',
  'T4_PLANKS', 'T5_PLANKS', 'T6_PLANKS', 'T7_PLANKS', 'T8_PLANKS',
  'T4_METALBAR', 'T5_METALBAR', 'T6_METALBAR', 'T7_METALBAR', 'T8_METALBAR',
  'T4_CLOTH', 'T5_CLOTH', 'T6_CLOTH', 'T7_CLOTH', 'T8_CLOTH',
  'T4_LEATHER', 'T5_LEATHER', 'T6_LEATHER', 'T7_LEATHER', 'T8_LEATHER',
];

export function TransportTab() {
  const globalLanguage = useStore(s => s.globalLanguage);
  const globalTax      = useStore(s => s.globalTax);
  const transportFrom  = useStore(s => s.transportFrom);
  const transportTo    = useStore(s => s.transportTo);
  const setTransportFrom = useStore(s => s.setTransportFrom);
  const setTransportTo   = useStore(s => s.setTransportTo);
  const transportResults  = useStore(s => s.transportResults);
  const setTransportResults = useStore(s => s.setTransportResults);
  const transportLoading  = useStore(s => s.transportLoading);
  const setTransportLoading = useStore(s => s.setTransportLoading);

  const [itemSet, setItemSet] = useState('popular');
  const [minProfit, setMinProfit] = useState('1000');
  const [sortBy, setSortBy] = useState('profit');

  const runTransport = async () => {
    setTransportLoading(true);
    try {
      const ids = itemSet === 'popular' ? POPULAR_ITEMS : RECIPES.slice(0, 150).map(r => r.id).filter(Boolean);
      // Use backend batch transport
      const results = await ApiService.fetchTransportProfit(ids, transportFrom, transportTo);
      setTransportResults(results || []);
    } finally {
      setTransportLoading(false);
    }
  };

  const swapCities = () => {
    setTransportFrom(transportTo);
    setTransportTo(transportFrom);
  };

  const filtered = (transportResults || [])
    .filter(r => r.profit >= (parseInt(minProfit) || 0))
    .sort((a, b) => {
      if (sortBy === 'profit') return b.profit - a.profit;
      if (sortBy === 'percent') return b.profitPercent - a.profitPercent;
      return 0;
    });

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Config bar */}
      <div className="flex-shrink-0 p-4 border-b border-hairline bg-surface-elevated/10">
        <div className="flex flex-wrap items-center gap-3">
          {/* From city */}
          <div className="flex items-center gap-2 bg-surface-card border border-hairline rounded-xl px-3 py-2">
            <span className="text-[10px] text-muted uppercase tracking-wide font-bold">From</span>
            <select
              value={transportFrom}
              onChange={e => setTransportFrom(e.target.value)}
              className="bg-transparent text-sm text-strong font-semibold outline-none"
            >
              {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          {/* Swap */}
          <button onClick={swapCities} className="p-2 text-muted hover:text-primary hover:bg-primary/10 rounded-lg border border-hairline transition-colors">
            <ArrowLeftRight size={16} />
          </button>

          {/* To city */}
          <div className="flex items-center gap-2 bg-surface-card border border-hairline rounded-xl px-3 py-2">
            <span className="text-[10px] text-muted uppercase tracking-wide font-bold">To</span>
            <select
              value={transportTo}
              onChange={e => setTransportTo(e.target.value)}
              className="bg-transparent text-sm text-strong font-semibold outline-none"
            >
              {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          {/* Item set */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-muted">Items:</span>
            <select
              value={itemSet}
              onChange={e => setItemSet(e.target.value)}
              className="bg-surface-card border border-hairline rounded px-2 py-1 text-xs text-strong focus:outline-none focus:border-primary"
            >
              <option value="popular">Popular (Resources + Bags)</option>
              <option value="recipes">Craftable Items (Top 150)</option>
            </select>
          </div>

          {/* Min profit filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-muted">Min Profit:</span>
            <input
              type="number"
              value={minProfit}
              onChange={e => setMinProfit(e.target.value)}
              className="w-24 bg-surface-card border border-hairline rounded px-2 py-1 text-xs text-strong focus:outline-none focus:border-primary font-plex"
            />
          </div>

          {/* Sort */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-muted">Sort:</span>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              className="bg-surface-card border border-hairline rounded px-2 py-1 text-xs text-strong focus:outline-none focus:border-primary"
            >
              <option value="profit">By Profit (Silver)</option>
              <option value="percent">By Profit %</option>
            </select>
          </div>

          <button
            onClick={runTransport}
            disabled={transportLoading}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-ink rounded-xl text-sm font-bold hover:bg-primary-active transition-colors disabled:opacity-50 ml-auto"
          >
            {transportLoading ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
            {transportLoading ? 'Calculating…' : 'Calculate'}
          </button>
        </div>

        {filtered.length > 0 && (
          <p className="text-xs text-muted mt-2">{filtered.length} profitable routes found</p>
        )}
      </div>

      {/* Results */}
      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
        {!transportLoading && filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center h-40 text-muted gap-2">
            <ArrowLeftRight size={36} className="opacity-20" />
            <p className="text-sm">Set your cities and click Calculate to find transport opportunities</p>
          </div>
        )}

        {transportLoading && (
          <div className="flex items-center justify-center h-40 gap-2 text-muted">
            <Loader2 size={20} className="animate-spin text-primary" />
            <span className="text-sm">Fetching prices from backend…</span>
          </div>
        )}

        {!transportLoading && filtered.length > 0 && (
          <div className="space-y-2">
            {/* Header */}
            <div className="grid grid-cols-[auto_1fr_repeat(4,_minmax(80px,_auto))] gap-3 px-3 py-1 text-[10px] text-muted uppercase tracking-wider font-bold">
              <div></div>
              <div>Item</div>
              <div className="text-right">Buy ({transportFrom})</div>
              <div className="text-right">Sell ({transportTo})</div>
              <div className="text-right">Profit</div>
              <div className="text-right">Margin</div>
            </div>

            {filtered.map((r, i) => (
              <div
                key={`${r.itemId}-${i}`}
                className="grid grid-cols-[auto_1fr_repeat(4,_minmax(80px,_auto))] gap-3 items-center px-3 py-2.5 bg-surface-card border border-hairline rounded-xl hover:bg-surface-elevated transition-colors"
              >
                <div className="w-8 h-8 rounded border border-hairline overflow-hidden bg-canvas">
                  <img loading="lazy" src={`https://render.albiononline.com/v1/item/${r.itemId}.png`} alt={r.itemId} className="w-full h-full object-contain p-0.5" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-strong">{ItemService.getItemName(r.itemId, globalLanguage)}</div>
                  <div className="text-[10px] text-muted font-mono">{r.itemId}</div>
                </div>
                <div className="text-xs text-right font-plex text-body">{CraftingService.formatSilver(r.buyPrice) || '--'}</div>
                <div className="text-xs text-right font-plex text-body">{CraftingService.formatSilver(r.sellPrice) || '--'}</div>
                <div className={`text-xs text-right font-bold font-plex ${r.profit > 0 ? 'text-trading-up' : 'text-trading-down'}`}>
                  {r.profit > 0 ? '+' : ''}{CraftingService.formatSilver(r.profit)}
                </div>
                <div className={`text-xs text-right font-bold ${r.profitPercent > 0 ? 'text-trading-up' : 'text-trading-down'}`}>
                  {r.profitPercent > 0 ? '+' : ''}{r.profitPercent?.toFixed(1)}%
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
