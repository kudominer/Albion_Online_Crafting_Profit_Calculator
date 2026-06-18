import React from 'react';
import { Plus, LayoutGrid, List } from 'lucide-react';
import { useLocalStorage } from './hooks/useLocalStorage';
import { ItemCard } from './components/ItemCard';
import { calculateProfit } from './utils/calculations';

function App() {
  const [items, setItems] = useLocalStorage('albion-crafting-items', []);

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

  return (
    <div className="min-h-screen bg-zinc-950 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-6">
          <div>
            <h1 className="text-2xl font-bold text-zinc-100 mb-1">Máy tính Lợi nhuận Chế tạo Albion</h1>
            <p className="text-zinc-400 text-sm">Phân tích tỷ lệ hoàn trả và tối đa hóa lợi nhuận của bạn.</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleSortByProfit}
              className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg text-sm font-medium transition-colors border border-zinc-700/50"
            >
              Sắp xếp theo % Lợi nhuận
            </button>
            <button
              onClick={handleAddItem}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium transition-colors shadow-[0_0_15px_rgba(79,70,229,0.3)]"
            >
              <Plus size={18} /> Thêm Vật phẩm
            </button>
          </div>
        </header>

        <main>
          {items.length === 0 ? (
            <div className="text-center py-20 bg-zinc-900/50 border border-dashed border-zinc-700 rounded-2xl">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-zinc-800 mb-4">
                <Plus size={32} className="text-zinc-500" />
              </div>
              <h2 className="text-xl font-medium text-zinc-300 mb-2">Chưa có vật phẩm nào</h2>
              <p className="text-zinc-500 max-w-md mx-auto mb-6">
                Thêm vật phẩm chế tạo đầu tiên của bạn để bắt đầu tính toán lợi nhuận với mô hình Tỷ lệ Hoàn trả (RRR) chính xác.
              </p>
              <button
                onClick={handleAddItem}
                className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-medium transition-colors"
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
      </div>
    </div>
  );
}

export default App;
