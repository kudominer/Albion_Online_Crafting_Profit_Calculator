import React, { useState, useEffect } from 'react';
import { Plus, LayoutGrid, List, Crosshair, Sun, Moon } from 'lucide-react';
import { useLocalStorage } from './hooks/useLocalStorage';
import { ItemCard } from './components/ItemCard';
import { calculateProfit } from './utils/calculations';
import { DestinyBoardModal } from './components/DestinyBoard';

function App() {
  const [items, setItems] = useLocalStorage('albion-crafting-items', []);
  const [isDestinyBoardOpen, setIsDestinyBoardOpen] = useState(false);

  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('theme');
    if (saved) return saved === 'dark';
    return true; // Default dark
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const createNewItem = () => {
    return {
      id: crypto.randomUUID(),
      name: '',
      rrr: '15.2', // Default base RRR without focus
      craftFee: '',
      sellPrice: '',
      tax: '6.5', // Default premium tax with setup fee
      materials: [
        { id: crypto.randomUUID(), name: '', quantity: '', unitPrice: '' }
      ]
    };
  };

  const handleAddItem = () => {
    setItems([createNewItem(), ...items]);
  };

  const handleUpdateItem = (updatedItem) => {
    setItems(items.map(item => item.id === updatedItem.id ? updatedItem : item));
  };

  const handleDeleteItem = (id) => {
    setItems(items.filter(item => item.id !== id));
  };

  const handleDuplicateItem = (id) => {
    const itemToDuplicate = items.find(item => item.id === id);
    if (!itemToDuplicate) return;

    const newItem = {
      ...itemToDuplicate,
      id: crypto.randomUUID(),
      name: `${itemToDuplicate.name} (Bản sao)`,
      materials: itemToDuplicate.materials.map(m => ({ ...m, id: crypto.randomUUID() }))
    };

    const insertIndex = items.findIndex(item => item.id === id);
    const newItems = [...items];
    newItems.splice(insertIndex + 1, 0, newItem);
    setItems(newItems);
  };

  const handleSortByProfit = () => {
    const sorted = [...items].sort((a, b) => {
      const profitA = calculateProfit(a).profitPercent;
      const profitB = calculateProfit(b).profitPercent;
      return profitB - profitA;
    });
    setItems(sorted);
  };

  const handleSelectFromDestinyBoard = (node) => {
    const newItem = createNewItem();
    newItem.name = node.name;
    setItems([newItem, ...items]);
    setIsDestinyBoardOpen(false);
  };

  return (
    <div className="min-h-screen bg-canvas p-4 md:p-8 transition-colors duration-300">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-hairline pb-6">
          <div>
            <h1 className="text-2xl font-bold text-strong mb-1 transition-colors">Máy tính Lợi nhuận Chế tạo</h1>
            <p className="text-muted text-sm transition-colors">Phân tích tỷ lệ hoàn trả và tối đa hóa lợi nhuận của bạn.</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-2 bg-surface-card hover:bg-surface-elevated text-body rounded-lg transition-colors border border-hairline"
              title={isDarkMode ? "Chuyển sang Giao diện Sáng" : "Chuyển sang Giao diện Tối"}
            >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button
              onClick={handleSortByProfit}
              className="px-4 py-2 bg-surface-card hover:bg-surface-elevated text-body rounded-lg text-sm font-semibold transition-colors border border-hairline"
            >
              Sắp xếp theo % Lợi nhuận
            </button>
            <button
              onClick={() => setIsDestinyBoardOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-surface-card hover:bg-surface-elevated text-body rounded-lg text-sm font-semibold transition-colors border border-hairline"
            >
              <Crosshair size={18} /> Destiny Board
            </button>
            <button
              onClick={handleAddItem}
              className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-active text-black rounded-lg text-sm font-bold transition-colors"
            >
              <Plus size={18} /> Thêm Tự do
            </button>
          </div>
        </header>

        <main>
          {items.length === 0 ? (
            <div className="text-center py-20 bg-surface-card border border-dashed border-hairline rounded-2xl transition-colors">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-surface-elevated mb-4 transition-colors">
                <Plus size={32} className="text-muted" />
              </div>
              <h2 className="text-xl font-semibold text-strong mb-2 transition-colors">Chưa có vật phẩm nào</h2>
              <p className="text-muted max-w-md mx-auto mb-6 transition-colors">
                Thêm vật phẩm chế tạo đầu tiên của bạn để bắt đầu tính toán lợi nhuận với mô hình Tỷ lệ Hoàn trả (RRR) chính xác.
              </p>
              <button
                onClick={handleAddItem}
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary-active text-black rounded-lg font-bold transition-colors"
              >
                <Plus size={20} /> Thêm Vật phẩm Chế tạo
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {items.map(item => (
                <ItemCard
                  key={item.id}
                  item={item}
                  onUpdate={handleUpdateItem}
                  onDelete={handleDeleteItem}
                  onDuplicate={handleDuplicateItem}
                />
              ))}
            </div>
          )}
        </main>

        <DestinyBoardModal
          isOpen={isDestinyBoardOpen}
          onClose={() => setIsDestinyBoardOpen(false)}
          onSelectItem={handleSelectFromDestinyBoard}
        />
      </div>
    </div>
  );
}

export default App;
