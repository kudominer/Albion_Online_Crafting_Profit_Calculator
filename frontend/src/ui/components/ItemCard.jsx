import React, { useState } from 'react';
import { Trash2, Copy, Plus, ChevronDown, ChevronUp } from 'lucide-react';
import { MaterialRow } from './MaterialRow';
import { ProfitSummary } from './ProfitSummary';
import { calculateProfit } from '../utils/calculations';

export function ItemCard({ item, onUpdate, onDelete, onDuplicate }) {
  const [isExpanded, setIsExpanded] = useState(false);

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
    <div className="bg-surface-card border border-hairline rounded-xl overflow-hidden mb-6 flex flex-col transition-colors">
      {/* Header */}
      <div 
        className={`bg-surface-card p-4 flex items-center justify-between cursor-pointer hover:bg-surface-elevated transition-colors ${isExpanded ? 'border-b border-hairline' : ''}`}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center flex-1 gap-3">
          <button className="text-muted hover:text-strong">
            {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </button>
          <input
            type="text"
            placeholder="Tên Vật phẩm (VD: Áo Lính đánh thuê T4.1)"
            className="bg-transparent text-xl font-semibold text-strong focus:outline-none w-full placeholder-muted"
            value={item.name}
            onChange={(e) => handleFieldChange('name', e.target.value)}
            onClick={(e) => e.stopPropagation()}
          />
        </div>
        <div className="flex items-center gap-4">
          {!isExpanded && (
            <div className="hidden sm:block text-right mr-2">
              <div className="text-xs text-muted-strong uppercase">Lợi nhuận</div>
              <div className={`font-plex font-medium ${calculations.profitPercent > 0 ? 'text-trading-up' : calculations.profitPercent < 0 ? 'text-trading-down' : 'text-body'}`}>
                {calculations.profitPercent.toFixed(2)}%
              </div>
            </div>
          )}
          <div className="flex gap-2">
            <button
              onClick={(e) => { e.stopPropagation(); onDuplicate(item.id); }}
              className="p-2 text-muted hover:text-primary hover:bg-surface-elevated rounded transition-colors"
              title="Nhân bản Vật phẩm"
            >
              <Copy size={18} />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onDelete(item.id); }}
              className="p-2 text-muted hover:text-trading-down hover:bg-surface-elevated rounded transition-colors"
              title="Xóa Vật phẩm"
            >
              <Trash2 size={18} />
            </button>
          </div>
        </div>
      </div>

      {isExpanded && (
        <div className="p-4 flex-1">
        {/* Global Item Settings */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <div>
            <label className="block text-xs text-muted mb-1">Tỷ lệ Hoàn trả (RRR %)</label>
            <input
              type="number"
              placeholder="VD: 15.2"
              className="w-full bg-canvas border border-hairline rounded-md p-2 text-sm text-body font-plex focus:outline-none focus:ring-2 focus:ring-info-ring transition-colors"
              value={item.rrr}
              onChange={(e) => handleFieldChange('rrr', e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs text-muted mb-1">Phí Chế tạo</label>
            <input
              type="number"
              placeholder="Phí"
              className="w-full bg-canvas border border-hairline rounded-md p-2 text-sm text-body font-plex focus:outline-none focus:ring-2 focus:ring-info-ring transition-colors"
              value={item.craftFee}
              onChange={(e) => handleFieldChange('craftFee', e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs text-muted mb-1">Giá Bán</label>
            <input
              type="number"
              placeholder="Giá"
              className="w-full bg-canvas border border-hairline rounded-md p-2 text-sm text-body font-plex focus:outline-none focus:ring-2 focus:ring-info-ring transition-colors"
              value={item.sellPrice}
              onChange={(e) => handleFieldChange('sellPrice', e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs text-muted mb-1">Thuế (%)</label>
            <input
              type="number"
              placeholder="VD: 6.5"
              className="w-full bg-canvas border border-hairline rounded-md p-2 text-sm text-body font-plex focus:outline-none focus:ring-2 focus:ring-info-ring transition-colors"
              value={item.tax}
              onChange={(e) => handleFieldChange('tax', e.target.value)}
            />
          </div>
        </div>

        {/* Materials List */}
        <div className="mb-2">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm font-semibold text-muted uppercase tracking-wider">Nguyên liệu</h3>
            <button
              onClick={handleAddMaterial}
              className="flex items-center gap-1 text-xs text-primary hover:text-primary-active transition-colors bg-primary/10 hover:bg-primary/20 px-2 py-1 rounded"
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
              <div className="text-center py-4 text-muted text-sm border border-dashed border-hairline rounded-lg">
                Chưa có nguyên liệu nào. Nhấn "Thêm Nguyên liệu" để bắt đầu.
              </div>
            )}
          </div>
        </div>

        {/* Profit Summary */}
        <ProfitSummary calculations={calculations} />
      </div>
      )}
    </div>
  );
}
