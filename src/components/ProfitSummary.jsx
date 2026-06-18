import React from 'react';
import { formatSilver } from '../utils/calculations';

export function ProfitSummary({ calculations }) {
  const {
    totalMaterialCost,
    multiplier,
    trueCostPerItem,
    netSellPrice,
    profit,
    profitPercent
  } = calculations;

  // Determine profit color
  let profitColor = 'text-zinc-400'; // Default / 0
  let profitBg = 'bg-zinc-800/50';
  let profitBorder = 'border-zinc-700';

  if (profitPercent < 10 && profitPercent !== 0) {
    profitColor = 'text-red-400';
    profitBg = 'bg-red-500/10';
    profitBorder = 'border-red-500/30';
  } else if (profitPercent >= 10 && profitPercent < 20) {
    profitColor = 'text-yellow-400';
    profitBg = 'bg-yellow-500/10';
    profitBorder = 'border-yellow-500/30';
  } else if (profitPercent >= 20 && profitPercent < 30) {
    profitColor = 'text-green-400';
    profitBg = 'bg-green-500/10';
    profitBorder = 'border-green-500/30';
  } else if (profitPercent >= 30) {
    profitColor = 'text-emerald-400 font-bold';
    profitBg = 'bg-emerald-500/15 shadow-[0_0_15px_rgba(16,185,129,0.2)]';
    profitBorder = 'border-emerald-500/50';
  }

  return (
    <div className={`mt-4 p-4 rounded-xl border transition-all duration-300 ${profitBg} ${profitBorder}`}>
      <h3 className="text-sm font-semibold text-zinc-400 mb-3 uppercase tracking-wider">Tổng quan Lợi nhuận</h3>
      
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
        <div>
          <div className="text-xs text-zinc-500 mb-1">Chi phí Nguyên liệu Gốc</div>
          <div className="font-mono text-zinc-300">{formatSilver(totalMaterialCost)}</div>
        </div>
        <div>
          <div className="text-xs text-zinc-500 mb-1">Hệ số Sản xuất</div>
          <div className="font-mono text-zinc-300">x{multiplier.toFixed(4)}</div>
        </div>
        <div>
          <div className="text-xs text-zinc-500 mb-1">Chi phí Thực tế</div>
          <div className="font-mono text-zinc-300">{formatSilver(trueCostPerItem)}</div>
        </div>
        <div>
          <div className="text-xs text-zinc-500 mb-1">Giá Bán Thực nhận</div>
          <div className="font-mono text-zinc-300">{formatSilver(netSellPrice)}</div>
        </div>
      </div>

      <div className="border-t border-zinc-700/50 pt-3 flex flex-col sm:flex-row justify-between items-center">
        <div className="text-lg text-zinc-300 mb-2 sm:mb-0">
          Lợi nhuận Dự kiến: <span className={`font-mono ml-2 ${profitColor}`}>{formatSilver(profit)}</span>
        </div>
        <div className={`text-2xl tracking-tight ${profitColor}`}>
          {profitPercent.toFixed(2)}%
        </div>
      </div>
    </div>
  );
}
