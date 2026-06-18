import React from 'react';
import { Trash2 } from 'lucide-react';
import { formatSilver } from '../utils/calculations';

export function MaterialRow({ material, onChange, onRemove }) {
  const handleNameChange = (e) => onChange(material.id, 'name', e.target.value);
  const handleQuantityChange = (e) => onChange(material.id, 'quantity', e.target.value);
  const handleUnitPriceChange = (e) => onChange(material.id, 'unitPrice', e.target.value);

  const cost = (Number(material.quantity) || 0) * (Number(material.unitPrice) || 0);

  return (
    <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 mb-3 p-3 bg-canvas border border-hairline rounded-lg transition-colors">
      <div className="flex-1 min-w-[200px]">
        <input
          type="text"
          placeholder="Tên Nguyên liệu"
          className="w-full bg-transparent text-sm text-strong focus:outline-none placeholder-muted transition-colors"
          value={material.name}
          onChange={handleNameChange}
        />
      </div>
      <div className="flex gap-2 w-full sm:w-auto">
        <input
          type="number"
          placeholder="SL"
          className="w-full bg-surface-card border border-hairline rounded p-2 text-sm text-body font-plex focus:outline-none focus:ring-1 focus:ring-info-ring transition-colors"
          value={material.quantity}
          onChange={handleQuantityChange}
        />
        <input
          type="number"
          placeholder="Đơn giá"
          className="w-full bg-surface-card border border-hairline rounded p-2 text-sm text-body font-plex focus:outline-none focus:ring-1 focus:ring-info-ring transition-colors"
          value={material.unitPrice}
          onChange={handleUnitPriceChange}
        />
        <div className="w-full sm:w-24 text-right flex flex-col justify-center">
          <span className="text-xs text-muted mb-1">Thành tiền</span>
          <span className="text-sm font-semibold text-strong font-plex transition-colors">{formatSilver(cost)}</span>
        </div>
        <button
          onClick={() => onRemove(material.id)}
          className="p-2 text-muted hover:text-trading-down hover:bg-surface-elevated rounded transition-colors"
          title="Xóa nguyên liệu"
        >
          <Trash2 size={18} />
        </button>
      </div>
    </div>
  );
}
