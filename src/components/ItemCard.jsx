import React from 'react';
import { Trash2, Copy, Plus } from 'lucide-react';
import { MaterialRow } from './MaterialRow';
import { ProfitSummary } from './ProfitSummary';
import { calculateProfit } from '../utils/calculations';

export function ItemCard({ item, onUpdate, onDelete, onDuplicate }) {
  const handleFieldChange = (field, value) => {
    onUpdate({ ...item, [field]: value });
  };

  const handleMaterialChange = (materialId, field, value) => {
    const newMaterials = item.materials.map(m => 
      m.id === materialId ? { ...m, [field]: value } : m
    );
    onUpdate({ ...item, materials: newMaterials });
  };

  const handleAddMaterial = () => {
    const newMaterial = {
      id: crypto.randomUUID(),
      name: '',
      quantity: '',
      unitPrice: ''
    };
    onUpdate({ ...item, materials: [...item.materials, newMaterial] });
  };

  const handleRemoveMaterial = (materialId) => {
    const newMaterials = item.materials.filter(m => m.id !== materialId);
    onUpdate({ ...item, materials: newMaterials });
  };

  const calculations = calculateProfit(item);

  return (
    <div className="bg-zinc-900 border border-zinc-700/80 rounded-xl overflow-hidden shadow-lg mb-6 flex flex-col">
      {/* Header */}
      <div className="bg-zinc-800/80 p-4 border-b border-zinc-700/80 flex items-center justify-between">
        <input
          type="text"
          placeholder="Tên Vật phẩm (VD: Áo Lính đánh thuê T4.1)"
          className="bg-transparent text-xl font-semibold text-zinc-100 focus:outline-none w-full mr-4 placeholder-zinc-600"
          value={item.name}
          onChange={(e) => handleFieldChange('name', e.target.value)}
        />
        <div className="flex gap-2">
          <button
            onClick={() => onDuplicate(item.id)}
            className="p-2 text-zinc-400 hover:text-indigo-400 hover:bg-zinc-700 rounded transition-colors"
            title="Nhân bản Vật phẩm"
          >
            <Copy size={18} />
          </button>
          <button
            onClick={() => onDelete(item.id)}
            className="p-2 text-zinc-400 hover:text-red-400 hover:bg-zinc-700 rounded transition-colors"
            title="Xóa Vật phẩm"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>

      <div className="p-4 flex-1">
        {/* Global Item Settings */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <div>
            <label className="block text-xs text-zinc-400 mb-1">Tỷ lệ Hoàn trả (RRR %)</label>
            <input
              type="number"
              placeholder="VD: 15.2"
              className="w-full bg-zinc-950 border border-zinc-700 rounded p-2 text-sm text-zinc-200 focus:outline-none focus:border-indigo-500"
              value={item.rrr}
              onChange={(e) => handleFieldChange('rrr', e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs text-zinc-400 mb-1">Phí Chế tạo</label>
            <input
              type="number"
              placeholder="Phí"
              className="w-full bg-zinc-950 border border-zinc-700 rounded p-2 text-sm text-zinc-200 focus:outline-none focus:border-indigo-500"
              value={item.craftFee}
              onChange={(e) => handleFieldChange('craftFee', e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs text-zinc-400 mb-1">Giá Bán</label>
            <input
              type="number"
              placeholder="Giá"
              className="w-full bg-zinc-950 border border-zinc-700 rounded p-2 text-sm text-zinc-200 focus:outline-none focus:border-indigo-500"
              value={item.sellPrice}
              onChange={(e) => handleFieldChange('sellPrice', e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs text-zinc-400 mb-1">Thuế (%)</label>
            <input
              type="number"
              placeholder="VD: 6.5"
              className="w-full bg-zinc-950 border border-zinc-700 rounded p-2 text-sm text-zinc-200 focus:outline-none focus:border-indigo-500"
              value={item.tax}
              onChange={(e) => handleFieldChange('tax', e.target.value)}
            />
          </div>
        </div>

        {/* Materials List */}
        <div className="mb-2">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">Nguyên liệu</h3>
            <button
              onClick={handleAddMaterial}
              className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 transition-colors bg-indigo-500/10 hover:bg-indigo-500/20 px-2 py-1 rounded"
            >
              <Plus size={14} /> Thêm Nguyên liệu
            </button>
          </div>
          <div className="space-y-2">
            {item.materials.map(mat => (
              <MaterialRow
                key={mat.id}
                material={mat}
                onChange={handleMaterialChange}
                onRemove={handleRemoveMaterial}
              />
            ))}
            {item.materials.length === 0 && (
              <div className="text-center py-4 text-zinc-500 text-sm border border-dashed border-zinc-700 rounded-lg">
                Chưa có nguyên liệu nào. Nhấn "Thêm Nguyên liệu" để bắt đầu.
              </div>
            )}
          </div>
        </div>

        {/* Profit Summary */}
        <ProfitSummary calculations={calculations} />
      </div>
    </div>
  );
}
