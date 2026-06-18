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
  let profitColor = 'text-body'; // Default / 0
  if (profitPercent > 0) {
    profitColor = 'text-trading-up';
  } else if (profitPercent < 0) {
    profitColor = 'text-trading-down';
  }

  return (
    <div className="bg-surface-elevated border border-hairline rounded-lg p-4 sm:p-5 mt-6 transition-colors">
      <div className="flex items-center justify-between mb-4 border-b border-hairline pb-3 transition-colors">
        <h3 className="font-semibold text-strong transition-colors">Tổng quan Lợi nhuận</h3>
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
        <div>
          <div className="text-xs text-muted mb-1">Chi phí Nguyên liệu Gốc</div>
          <div className="font-plex text-strong font-medium transition-colors">{formatSilver(totalMaterialCost)}</div>
        </div>
        <div>
          <div className="text-xs text-muted mb-1">Hệ số Sản xuất</div>
          <div className="font-plex text-strong font-medium transition-colors">x{multiplier.toFixed(4)}</div>
        </div>
        <div>
          <div className="text-xs text-muted mb-1">Chi phí Thực tế</div>
          <div className="font-plex text-strong font-medium transition-colors">{formatSilver(trueCostPerItem)}</div>
        </div>
        <div>
          <div className="text-xs text-muted mb-1">Giá Bán Thực nhận</div>
          <div className="font-plex text-strong font-medium transition-colors">{formatSilver(netSellPrice)}</div>
        </div>
      </div>

      <div className="border-t border-hairline pt-3 flex flex-col sm:flex-row justify-between items-center transition-colors">
        <div className="text-lg text-strong mb-2 sm:mb-0 transition-colors">
          Lợi nhuận Dự kiến: <span className={`font-plex font-bold ml-2 ${profitColor}`}>{formatSilver(profit)}</span>
        </div>
        <div className={`text-2xl font-plex font-bold tracking-tight ${profitColor}`}>
          {profitPercent.toFixed(2)}%
        </div>
      </div>
    </div>
  );
}
