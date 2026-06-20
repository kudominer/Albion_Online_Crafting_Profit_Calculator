import React, { useEffect, useState } from 'react';
import { BarChart2, Hammer, FlaskConical, TrendingUp, Radio, Loader2, RefreshCw, ChevronRight, Info } from 'lucide-react';
import { useStore } from '../../cache/marketStore';
import { ApiService } from '../../services/apiService';
import { CraftingService } from '../../services/craftingService';
import { ItemService } from '../../services/itemService';

const CITIES = ['Caerleon', 'Martlock', 'Bridgewatch', 'Lymhurst', 'Fort Sterling', 'Thetford'];

function StatCard({ label, value, sub, color = 'text-strong', tooltip }) {
  return (
    <div className="bg-surface-card border border-hairline rounded-xl p-4">
      <div className="text-[10px] text-muted uppercase tracking-wider mb-2 flex items-center gap-1">
        {label}
        {tooltip && (
          <div className="group relative flex items-center">
            <Info size={12} className="cursor-help text-muted hover:text-primary" />
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-48 p-2 bg-surface-elevated text-strong text-[10px] rounded-lg shadow-xl z-50 normal-case tracking-normal border border-hairline whitespace-normal text-center">
              {tooltip}
              <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px border-4 border-transparent border-t-surface-elevated"></div>
            </div>
          </div>
        )}
      </div>
      <div className={`text-xl font-bold font-plex ${color}`}>{value}</div>
      {sub && <div className="text-[11px] text-muted mt-1">{sub}</div>}
    </div>
  );
}

function TopProfitRow({ item, type, language, rank }) {
  const name = ItemService.getItemName(item.itemId, language);
  const profit = item.profit;
  const pct = item.profitPercent;
  const city = item.city;

  return (
    <div className="flex items-center gap-3 px-3 py-2.5 bg-surface-card border border-hairline rounded-xl hover:bg-surface-elevated transition-colors group">
      <div className="text-[10px] text-muted font-bold w-5 text-center flex-shrink-0">#{rank}</div>
      <div className="w-9 h-9 rounded border border-hairline overflow-hidden bg-canvas flex-shrink-0 group-hover:scale-105 transition-transform">
        <img loading="lazy" src={`https://render.albiononline.com/v1/item/${item.itemId}.png`} alt={item.itemId} className="w-full h-full object-contain p-0.5" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-xs font-semibold text-strong truncate">{name}</div>
        <div className="text-[10px] text-muted">{city || 'Best city'}</div>
      </div>
      <div className="text-right flex-shrink-0">
        <div className={`text-xs font-bold font-plex ${profit > 0 ? 'text-trading-up' : 'text-trading-down'}`}>
          {profit > 0 ? '+' : ''}{CraftingService.formatSilver(profit)}
        </div>
        <div className={`text-[10px] font-bold ${pct > 0 ? 'text-trading-up' : 'text-trading-down'}`}>
          {pct > 0 ? '+' : ''}{typeof pct === 'number' ? pct.toFixed(1) : pct}%
        </div>
      </div>
    </div>
  );
}

export function Dashboard() {
  const globalLanguage   = useStore(s => s.globalLanguage);
  const globalRrr        = useStore(s => s.globalRrr);
  const setGlobalRrr     = useStore(s => s.setGlobalRrr);
  const globalTax        = useStore(s => s.globalTax);
  const setGlobalTax     = useStore(s => s.setGlobalTax);
  const globalCity       = useStore(s => s.globalCity);
  const scannerStatus    = useStore(s => s.scannerStatus);
  const topProfitCraft   = useStore(s => s.topProfitCraft);
  const topProfitRefine  = useStore(s => s.topProfitRefine);
  const topProfitFlip    = useStore(s => s.topProfitFlip);
  const topProfitLoading = useStore(s => s.topProfitLoading);
  const setActiveMainTab = useStore(s => s.setActiveMainTab);

  const [city, setCity] = useState(globalCity || 'Caerleon');

  const loadAll = async () => {
    await Promise.all([
      ApiService.fetchTopProfit('craft', city, 10, globalRrr, globalTax),
      ApiService.fetchTopProfit('refine', city, 10, globalRrr),
      ApiService.fetchTopProfit('flip', city, 10),
    ]);
  };

  useEffect(() => { loadAll(); }, [city, globalRrr, globalTax]);

  const progress = scannerStatus
    ? Math.min(100, Math.round((scannerStatus.cachedItems / (scannerStatus.totalItems || 1)) * 100))
    : 0;

  return (
    <div className="h-full overflow-y-auto custom-scrollbar p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* ── Scanner Status ──────────────────────────── */}
        <div className="bg-surface-card border border-hairline rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-strong flex items-center gap-2">
              <Radio size={14} className={scannerStatus?.isRunning ? 'text-trading-up animate-pulse' : 'text-muted'} />
              Scanner Status
            </h2>
            <button
              onClick={() => ApiService.fetchScannerStatus()}
              className="p-1.5 text-muted hover:text-strong hover:bg-surface-elevated rounded transition-colors"
            >
              <RefreshCw size={13} />
            </button>
          </div>

          {scannerStatus ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
              <StatCard label="Cached Items" value={scannerStatus.cachedItems?.toLocaleString()} sub={`of ${scannerStatus.totalItems?.toLocaleString()} total`} color="text-primary" tooltip="Số lượng vật phẩm đã được tải giá từ API và lưu trong bộ nhớ tạm (Cache). Giá sẽ được dùng để tính toán lợi nhuận." />
              <StatCard label="Status" value={scannerStatus.isRunning ? '🟢 Scanning' : '🟡 Idle'} sub="Background crawler" tooltip="Trạng thái của trình thu thập dữ liệu ngầm. Nó sẽ quét liên tục các vật phẩm ưu tiên cao đến thấp để cập nhật giá." />
              <StatCard label="Requests/min" value={scannerStatus.requestsThisMinute ?? '--'} sub="API rate used" tooltip="Số lượng request API đã gửi trong phút hiện tại. Giới hạn của Albion API là 180 requests/phút. Crawler tự động điều chỉnh tốc độ." />
              <StatCard label="Errors" value={scannerStatus.errors ?? 0} color={scannerStatus.errors > 0 ? 'text-trading-down' : 'text-trading-up'} sub="Since startup" tooltip="Số lần request bị lỗi do quá tải hoặc API Albion từ chối. Sẽ tự động thử lại sau." />
            </div>
          ) : (
            <div className="flex items-center gap-2 text-muted text-sm py-2">
              <Loader2 size={16} className="animate-spin text-primary" />
              Connecting to backend…
            </div>
          )}

          {scannerStatus && (
            <div>
              <div className="flex justify-between text-[11px] text-muted mb-1">
                <span>Price coverage</span>
                <span>{progress}%</span>
              </div>
              <div className="h-2 bg-hairline rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-primary to-primary-active rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* ── City filter ─────────────────────────────── */}
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted">Showing data for:</span>
          <select
            value={city}
            onChange={e => setCity(e.target.value)}
            className="bg-surface-card border border-hairline rounded-lg px-2 py-1.5 text-sm text-strong font-semibold focus:outline-none focus:border-primary"
          >
            {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-muted">RRR:</span>
            <input type="number" value={globalRrr} onChange={e => setGlobalRrr(e.target.value)} className="w-16 px-1.5 py-0.5 text-xs text-primary font-bold bg-surface-elevated border border-hairline rounded focus:outline-none focus:border-primary font-plex" />
            <span className="text-xs text-muted">%</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-muted">Tax:</span>
            <input type="number" value={globalTax} onChange={e => setGlobalTax(e.target.value)} className="w-16 px-1.5 py-0.5 text-xs text-primary font-bold bg-surface-elevated border border-hairline rounded focus:outline-none focus:border-primary font-plex" />
            <span className="text-xs text-muted">%</span>
          </div>

          {topProfitLoading && (
            <div className="flex items-center gap-1.5 text-muted text-xs ml-auto">
              <Loader2 size={13} className="animate-spin text-primary" />
              Calculating…
            </div>
          )}
        </div>

        {/* ── 3-column top profit ─────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Top Craft */}
          <div className="bg-canvas border border-hairline rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-hairline flex items-center justify-between bg-surface-elevated/30">
              <h3 className="text-xs font-bold text-strong uppercase tracking-wider flex items-center gap-1.5">
                <Hammer size={13} className="text-primary" /> Top Craft Profit
              </h3>
              <button onClick={() => setActiveMainTab('craft')} className="text-[10px] text-muted hover:text-primary flex items-center gap-0.5 transition-colors">
                See all <ChevronRight size={11} />
              </button>
            </div>
            <div className="p-2 space-y-1.5">
              {topProfitCraft.slice(0, 8).map((item, i) => (
                <TopProfitRow key={item.itemId + i} item={item} type="craft" language={globalLanguage} rank={i + 1} />
              ))}
              {topProfitCraft.length === 0 && !topProfitLoading && (
                <p className="text-xs text-muted text-center py-6">Waiting for price data…</p>
              )}
            </div>
          </div>

          {/* Top Refine */}
          <div className="bg-canvas border border-hairline rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-hairline flex items-center justify-between bg-surface-elevated/30">
              <h3 className="text-xs font-bold text-strong uppercase tracking-wider flex items-center gap-1.5">
                <FlaskConical size={13} className="text-primary" /> Top Refine Profit
              </h3>
              <button onClick={() => setActiveMainTab('refine')} className="text-[10px] text-muted hover:text-primary flex items-center gap-0.5 transition-colors">
                See all <ChevronRight size={11} />
              </button>
            </div>
            <div className="p-2 space-y-1.5">
              {topProfitRefine.slice(0, 8).map((item, i) => (
                <TopProfitRow key={item.itemId + i} item={item} type="refine" language={globalLanguage} rank={i + 1} />
              ))}
              {topProfitRefine.length === 0 && !topProfitLoading && (
                <p className="text-xs text-muted text-center py-6">Waiting for price data…</p>
              )}
            </div>
          </div>

          {/* Top Flip */}
          <div className="bg-canvas border border-hairline rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-hairline flex items-center justify-between bg-surface-elevated/30">
              <h3 className="text-xs font-bold text-strong uppercase tracking-wider flex items-center gap-1.5">
                <TrendingUp size={13} className="text-primary" /> Top Flip Spread
              </h3>
              <button onClick={() => setActiveMainTab('flip')} className="text-[10px] text-muted hover:text-primary flex items-center gap-0.5 transition-colors">
                See all <ChevronRight size={11} />
              </button>
            </div>
            <div className="p-2 space-y-1.5">
              {topProfitFlip.slice(0, 8).map((item, i) => (
                <TopProfitRow key={item.itemId + item.city + i} item={{ ...item, profit: item.spread, profitPercent: item.spreadPercent }} type="flip" language={globalLanguage} rank={i + 1} />
              ))}
              {topProfitFlip.length === 0 && !topProfitLoading && (
                <p className="text-xs text-muted text-center py-6">Waiting for price data…</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
