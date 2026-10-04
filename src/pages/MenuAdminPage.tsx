import React, { useState } from 'react';
import { Plus, Search } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { CategoryManager } from '../components/menu/CategoryManager';
import { MenuItemTable } from '../components/menu/MenuItemTable';
import { ItemFormModal } from '../components/menu/ItemFormModal';
import type { MenuItem } from '../types/menu';

export const MenuAdminPage: React.FC = () => {
  const { menu } = useApp();

  const [searchQuery, setSearchQuery] = useState<string>('');

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [itemToEdit, setItemToEdit] = useState<MenuItem | null>(null);

  const filteredItems = menu.filter((item) => {
    return item.itemName.toLowerCase().includes(searchQuery.toLowerCase());
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
    <div className="flex-1 p-3 sm:p-4 md:p-6 space-y-5 max-w-7xl mx-auto w-full min-w-0 overflow-x-hidden">
      {/* Clean Page Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Menu Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-normal mt-0.5">
            Manage items, prices, and categories.
          </p>
        </div>

        <button
          onClick={handleCreateNew}
          className="bg-sky-500 hover:bg-sky-600 active:scale-95 text-white font-semibold px-4 py-2 rounded-lg flex items-center space-x-1.5 transition-all shadow-sm border border-sky-600 text-xs self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Menu Item</span>
        </button>
      </div>

      {/* Category Manager */}
      <CategoryManager />

      {/* Filter & Search Bar */}
      <div className="bg-white border border-slate-200 p-3.5 rounded-xl shadow-saas flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-sky-500 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search items by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg pl-10 pr-10 py-2 text-xs sm:text-sm text-slate-800 font-medium placeholder:text-slate-400 focus:outline-none focus:border-sky-500 focus:bg-white transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-2 text-xs text-sky-600 hover:text-sky-700 font-semibold"
            >
              Clear
            </button>
          )}
        </div>

        <div className="text-xs text-slate-500 font-medium shrink-0">
          Showing <strong className="text-slate-900">{filteredItems.length}</strong> items
        </div>
      </div>

      {/* Menu Table */}
      <MenuItemTable items={filteredItems} onEditItem={handleEdit} />

      {/* Item Form Modal */}
      {isFormOpen && (
        <ItemFormModal
          itemToEdit={itemToEdit}
          onClose={() => setIsFormOpen(false)}
        />
      )}
    </div>
  );
};
