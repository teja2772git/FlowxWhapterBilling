import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { CategoryBar } from '../components/billing/CategoryBar';
import { MenuItemCard } from '../components/billing/MenuItemCard';
import { CartPanel } from '../components/billing/CartPanel';
import { ReceiptModal } from '../components/common/ReceiptModal';
import type { Order } from '../types/order';

export const BillingPage: React.FC = () => {
  const { menu, categories, activeCategory } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [recentOrder, setRecentOrder] = useState<Order | null>(null);

  const filteredItems = menu.filter((item) => {
    const matchesSearch = item.itemName.toLowerCase().includes(searchQuery.toLowerCase());
    if (searchQuery.trim() !== '') {
      return matchesSearch;
    }
    const targetCat = categories.find((c) => c.categoryId === activeCategory);
    return (
      item.categoryId === activeCategory ||
      item.categoryId?.replace(/-/g, '_') === activeCategory?.replace(/-/g, '_') ||
      (targetCat && item.categoryName?.toUpperCase() === targetCat.categoryName.toUpperCase())
    );
  });

  return (
    <div className="flex-1 p-3 sm:p-4 md:p-6 flex flex-col lg:flex-row gap-6 max-w-7xl mx-auto w-full min-w-0 overflow-x-hidden">
      {/* Left Column: Category Navigation & Menu Tiles */}
      <div className="flex-1 flex flex-col space-y-4 min-w-0">
        {/* Search Input Bar */}
        <div className="relative w-full">
          <Search className="w-4 h-4 sm:w-5 sm:h-5 text-[#0089e8] absolute left-3.5 top-3.5" />
          <input
            type="text"
            placeholder="🔍 Search burgers, momos, mojitos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border-2 border-[#0089e8]/30 rounded-2xl pl-10 sm:pl-11 pr-12 py-2.5 sm:py-3 text-xs sm:text-sm text-slate-900 font-bold placeholder-slate-400 focus:outline-none focus:border-[#0089e8] shadow-sm"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3.5 top-2.5 sm:top-3 text-xs text-[#0089e8] hover:text-[#0077cd] font-extrabold uppercase"
            >
              Clear
            </button>
          )}
        </div>

        {/* Category Selector Buttons */}
        {!searchQuery && <CategoryBar />}

        {/* Menu Items POS Tiles Grid */}
        <div className="flex-1 overflow-y-auto min-h-[300px]">
          {filteredItems.length === 0 ? (
            <div className="bg-[#00247d] border-2 border-[#ffd400]/40 rounded-3xl p-8 sm:p-12 text-center text-white my-4 shadow-xl">
              <p className="font-display text-lg sm:text-xl text-[#ffd400] uppercase">NO MENU ITEMS FOUND</p>
              <p className="text-xs text-white/80 font-bold mt-1">Try selecting another category or adjusting your search query.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3.5 sm:gap-4 pb-2">
              {filteredItems.map((item) => (
                <MenuItemCard key={item.itemId} item={item} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right Column: Cart Panel */}
      <div className="w-full lg:w-96 shrink-0 min-w-0">
        <CartPanel onOrderPlaced={(order) => setRecentOrder(order)} />
      </div>

      {/* Printable Receipt Modal */}
      {recentOrder && (
        <ReceiptModal order={recentOrder} onClose={() => setRecentOrder(null)} />
      )}
    </div>
  );
};
