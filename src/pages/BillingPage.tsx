import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { CategoryBar } from '../components/billing/CategoryBar';
import { MenuItemCard } from '../components/billing/MenuItemCard';
import { CartPanel } from '../components/billing/CartPanel';
import { ReceiptModal } from '../components/common/ReceiptModal';
import type { Order } from '../types/order';

export const BillingPage: React.FC = () => {
  const { menu, activeCategory } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [recentOrder, setRecentOrder] = useState<Order | null>(null);

  const filteredItems = menu.filter((item) => {
    const matchesSearch = item.itemName.toLowerCase().includes(searchQuery.toLowerCase());
    if (searchQuery.trim() !== '') {
      return matchesSearch;
    }
    return item.categoryId === activeCategory;
  });

  return (
    <div className="flex-1 p-4 md:p-6 flex flex-col md:flex-row gap-6 max-w-7xl mx-auto w-full">
      {/* Left Column: Category Navigation & Menu Tiles */}
      <div className="flex-1 flex flex-col space-y-4">
        {/* Search Input Bar (Section 33 Requirement) */}
        <div className="relative">
          <Search className="w-5 h-5 text-[#0089e8] absolute left-3.5 top-3.5" />
          <input
            type="text"
            placeholder="🔍 Search burgers, momos, mojitos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border-2 border-[#0089e8]/30 rounded-2xl pl-11 pr-12 py-3 text-sm text-slate-900 font-bold placeholder-slate-400 focus:outline-none focus:border-[#0089e8] shadow-sm"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3.5 top-3 text-xs text-[#0089e8] hover:text-[#0077cd] font-extrabold uppercase"
            >
              Clear
            </button>
          )}
        </div>

        {/* Category Selector Buttons */}
        {!searchQuery && <CategoryBar />}

        {/* Menu Items POS Tiles Grid */}
        <div className="flex-1 overflow-y-auto min-h-[340px]">
          {filteredItems.length === 0 ? (
            <div className="bg-[#00247d] border-2 border-[#ffd400]/40 rounded-3xl p-12 text-center text-white my-4 shadow-xl">
              <p className="font-display text-xl text-[#ffd400] uppercase">NO MENU ITEMS FOUND</p>
              <p className="text-xs text-white/80 font-bold mt-1">Try selecting another category or adjusting your search query.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 pb-2">
              {filteredItems.map((item) => (
                <MenuItemCard key={item.itemId} item={item} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right Column: Cart Panel */}
      <div className="w-full md:w-96 shrink-0">
        <CartPanel onOrderPlaced={(order) => setRecentOrder(order)} />
      </div>

      {/* Printable Receipt Modal */}
      {recentOrder && (
        <ReceiptModal order={recentOrder} onClose={() => setRecentOrder(null)} />
      )}
    </div>
  );
};
