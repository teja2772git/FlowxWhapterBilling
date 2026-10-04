import React, { useState } from 'react';
import { Plus, Search, Utensils } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { CategoryManager } from '../components/menu/CategoryManager';
import { MenuItemTable } from '../components/menu/MenuItemTable';
import { ItemFormModal } from '../components/menu/ItemFormModal';
import type { MenuItem } from '../types/menu';

export const MenuAdminPage: React.FC = () => {
  const { menu, categories } = useApp();

  const [selectedCatId, setSelectedCatId] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [itemToEdit, setItemToEdit] = useState<MenuItem | null>(null);

  const filteredItems = menu.filter((item) => {
    const matchesSearch = item.itemName.toLowerCase().includes(searchQuery.toLowerCase());
    if (searchQuery.trim() !== '') {
      return matchesSearch;
    }
    if (selectedCatId !== 'ALL') {
      return item.categoryId === selectedCatId;
    }
    return true;
  });

  const handleCreateNew = () => {
    setItemToEdit(null);
    setIsFormOpen(true);
  };

  const handleEdit = (item: MenuItem) => {
    setItemToEdit(item);
    setIsFormOpen(true);
  };

  return (
    <div className="flex-1 p-4 md:p-6 space-y-6 max-w-7xl mx-auto w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-3">
            <Utensils className="w-7 h-7 text-[#ffd400]" />
            <h1 className="text-3xl font-black text-white uppercase font-display tracking-wide">
              MENU MANAGEMENT
            </h1>
          </div>
          <p className="text-xs text-white/90 font-bold uppercase tracking-wider mt-0.5">
            Prices, items, and categories update Excel persistence immediately.
          </p>
        </div>

        <button
          onClick={handleCreateNew}
          className="bg-[#ffd400] hover:bg-[#ffe24d] text-[#00247d] font-black px-5 py-3 rounded-2xl flex items-center space-x-2 transition-transform active:scale-95 shadow-xl border-2 border-white text-xs uppercase tracking-wider font-display"
        >
          <Plus className="w-5 h-5 stroke-[3]" />
          <span>+ ADD MENU ITEM</span>
        </button>
      </div>

      <CategoryManager />

      <div className="bg-[#00247d] border-2 border-[#ffd400]/60 p-4 rounded-3xl flex flex-col md:flex-row gap-3 items-center justify-between shadow-xl">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-[#ffd400] absolute left-3.5 top-3.5" />
          <input
            type="text"
            placeholder="Search items by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#001b63] border border-[#ffd400]/40 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-white font-bold placeholder-white/50 focus:outline-none focus:border-[#ffd400]"
          />
        </div>

        <div className="flex items-center space-x-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <span className="text-xs text-[#ffd400] font-black uppercase shrink-0">FILTER CATEGORY:</span>
          <select
            value={selectedCatId}
            onChange={(e) => setSelectedCatId(e.target.value)}
            className="bg-[#001b63] border border-[#ffd400]/40 text-white font-bold text-xs rounded-2xl px-3.5 py-2.5 focus:outline-none focus:border-[#ffd400]"
          >
            <option value="ALL">ALL CATEGORIES ({menu.length} Items)</option>
            {categories.map((c) => (
              <option key={c.categoryId} value={c.categoryId}>
                {c.categoryName} ({menu.filter((m) => m.categoryId === c.categoryId).length})
              </option>
            ))}
          </select>
        </div>
      </div>

      <MenuItemTable items={filteredItems} onEditItem={handleEdit} />

      {isFormOpen && (
        <ItemFormModal
          itemToEdit={itemToEdit}
          onClose={() => setIsFormOpen(false)}
        />
      )}
    </div>
  );
};
