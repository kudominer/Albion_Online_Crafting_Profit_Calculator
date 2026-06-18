import React, { useState } from 'react';
import { ChevronRight, ChevronDown, X, Crosshair } from 'lucide-react';
import { destinyBoardData, rawCategories } from '../data/destinyBoardData';

const DestinyNode = ({ node, level = 0, onSelectItem }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const hasChildren = node.children && node.children.length > 0;
  
  const handleToggle = (e) => {
    e.stopPropagation();
    setIsExpanded(!isExpanded);
  };

  const handleSelect = (e) => {
    e.stopPropagation();
    if (!hasChildren) {
      onSelectItem(node);
    } else {
      setIsExpanded(!isExpanded);
    }
  };

  return (
    <div className="w-full">
      <div 
        className={`flex items-center gap-3 py-2 px-3 my-1 rounded-lg cursor-pointer transition-all duration-200 border border-transparent
          ${hasChildren ? 'hover:bg-surface-elevated' : 'hover:bg-primary/10 hover:border-primary/30'}
        `}
        style={{ paddingLeft: `${level * 1.5 + 0.75}rem` }}
        onClick={handleSelect}
      >
        {/* Connection line indicator for nested items */}
        {level > 0 && (
          <div className="absolute left-0 w-4 h-px bg-hairline" style={{ left: `${level * 1.5 - 0.5}rem` }}></div>
        )}

        <div className="flex-shrink-0 w-5 h-5 flex items-center justify-center text-muted">
          {hasChildren ? (
            isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />
          ) : (
            <div className="w-1.5 h-1.5 rounded-full bg-primary glow"></div>
          )}
        </div>
        
        {/* Item Image if it's a leaf node */}
        {!hasChildren && node.uniqueName && (
          <div className="relative w-10 h-10 bg-surface-card rounded-md border border-hairline overflow-hidden flex-shrink-0 transition-colors">
            <img 
              src={`https://render.albiononline.com/v1/item/${node.uniqueName}.png`} 
              alt={node.name}
              className="w-full h-full object-contain p-1"
              onError={(e) => { e.target.style.display = 'none'; }}
            />
          </div>
        )}

        <span className={`text-sm transition-colors ${!hasChildren ? 'text-strong font-medium' : 'text-body'}`}>
          {node.name}
        </span>
      </div>

      {/* Render children recursively */}
      {hasChildren && isExpanded && (
        <div className="relative">
          {/* Vertical line connecting children */}
          <div className="absolute top-0 bottom-0 w-px bg-hairline" style={{ left: `${level * 1.5 + 1.3}rem` }}></div>
          {node.children.map(child => (
            <DestinyNode 
              key={child.id} 
              node={child} 
              level={level + 1} 
              onSelectItem={onSelectItem} 
            />
          ))}
        </div>
      )}
    </div>
  );
};

export function DestinyBoardModal({ isOpen, onClose, onSelectItem }) {
  const [selectedRootId, setSelectedRootId] = useState(null);

  const handleClose = () => {
    setSelectedRootId(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div 
        className="bg-surface-card border border-hairline rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden transition-colors"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-hairline bg-canvas transition-colors">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/20 rounded-lg text-primary">
              <Crosshair size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-strong transition-colors">Destiny Board</h2>
              <p className="text-xs text-muted transition-colors">Chọn vật phẩm để thêm vào máy tính</p>
            </div>
          </div>
          <button 
            onClick={handleClose}
            className="p-2 text-muted hover:text-strong hover:bg-surface-elevated rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body - Dynamic View */}
        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar bg-surface-elevated/20">
          {!selectedRootId ? (
            // Grid View
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {rawCategories.map(root => (
                <div 
                  key={root.id}
                  onClick={() => setSelectedRootId(root.id)}
                  className="bg-surface-card border border-hairline rounded-xl p-4 flex flex-col items-center justify-center gap-3 cursor-pointer hover:bg-surface-elevated hover:border-primary/50 transition-all group"
                >
                  <div className="w-16 h-16 bg-canvas rounded-full flex items-center justify-center p-2 group-hover:scale-110 transition-transform">
                    <img 
                      src={`https://render.albiononline.com/v1/item/${root.iconName}.png`}
                      alt={root.name}
                      className="w-full h-full object-contain"
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                  </div>
                  <span className="text-strong font-semibold text-center">{root.name}</span>
                </div>
              ))}
            </div>
          ) : (
            // Tree View
            <div className="space-y-4">
              <button 
                onClick={() => setSelectedRootId(null)}
                className="flex items-center gap-2 px-3 py-1.5 text-body hover:text-strong hover:bg-surface-elevated rounded-md transition-colors text-sm font-semibold mb-2"
              >
                ← Trở lại danh mục chính
              </button>
              <div className="space-y-1 bg-surface-card p-2 rounded-xl border border-hairline">
                {destinyBoardData.find(r => r.id === selectedRootId)?.children.map(category => (
                  <DestinyNode 
                    key={category.id} 
                    node={category} 
                    onSelectItem={(node) => {
                      onSelectItem(node);
                      handleClose();
                    }} 
                  />
                ))}
              </div>
            </div>
          )}
        </div>
        
        {/* Footer */}
        <div className="p-4 border-t border-hairline bg-canvas text-center transition-colors">
          <p className="text-xs text-muted">Mở các danh mục để tìm và chọn vật phẩm cụ thể.</p>
        </div>
      </div>
    </div>
  );
}
