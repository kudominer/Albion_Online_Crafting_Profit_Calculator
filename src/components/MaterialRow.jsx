import React from 'react';
import { Trash2 } from 'lucide-react';
import { formatSilver } from '../utils/calculations';

export function MaterialRow({ material, onChange, onRemove }) {
  const handleNameChange = (e) => onChange(material.id, 'name', e.target.value);
  const handleQuantityChange = (e) => onChange(material.id, 'quantity', e.target.value);
  const handleUnitPriceChange = (e) => onChange(material.id, 'unitPrice', e.target.value);

  const cost = (Number(material.quantity) || 0) * (Number(material.unitPrice) || 0);

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 mb-2 bg-zinc-800/50 p-2 rounded-lg border border-zinc-700/50 transition-colors hover:border-zinc-600">
      <div className="flex-1 w-full">
        <input
          type="text"
          placeholder="Tên Nguyên liệu"
          className="w-full bg-zinc-900 border border-zinc-700 rounded p-1.5 text-sm text-zinc-200 focus:outline-none focus:border-indigo-500 transition-colors"
          value={material.name}
          onChange={handleNameChange}
        />
      </div>
      <div className="flex gap-2 w-full sm:w-auto">
        <input
          type="number"
          placeholder="SL"
          min="0"
          className="w-20 bg-zinc-900 border border-zinc-700 rounded p-1.5 text-sm text-zinc-200 focus:outline-none focus:border-indigo-500 transition-colors"
          value={material.quantity}
          onChange={handleQuantityChange}
        />
        <input
          type="number"
          placeholder="Đơn giá"
          min="0"
          className="w-28 bg-zinc-900 border border-zinc-700 rounded p-1.5 text-sm text-zinc-200 focus:outline-none focus:border-indigo-500 transition-colors"
          value={material.unitPrice}
          onChange={handleUnitPriceChange}
        />
        <div className="flex items-center justify-between w-24 sm:w-28 px-2 text-sm text-zinc-400">
          <span>=</span>
          <span className="font-mono text-zinc-300">{formatSilver(cost)}</span>
        </div>
        <button
          onClick={() => onRemove(material.id)}
          className="p-1.5 text-zinc-500 hover:text-red-400 hover:bg-zinc-800 rounded transition-colors"
          title="Xóa Nguyên liệu"
        >
          <Trash2 size={18} />
        </button>
      </div>
    </div>
  );
}
