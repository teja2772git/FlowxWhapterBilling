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
    <div className="w-full max-w-none p-3 sm:p-4 md:p-6 flex flex-col lg:flex-row gap-5 min-w-0 overflow-x-hidden">
      {/* Left Column: Full-Width Menu & Products Area (70-75% of content width) */}
      <div className="flex-1 min-w-0 flex flex-col space-y-4">
        {/* Full-Width Search Input Bar */}
        <div className="relative w-full">
          <Search className="w-4 h-4 sm:w-5 sm:h-5 text-sky-500 absolute left-3.5 top-3 sm:top-3.5" />
          <input
            type="text"
            placeholder="🔍 Search burgers, momos, mojitos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-xl pl-10 sm:pl-11 pr-12 py-2.5 sm:py-3 text-xs sm:text-sm text-slate-800 font-medium placeholder:text-slate-400 focus:outline-none focus:border-sky-500 shadow-saas"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3.5 top-2.5 sm:top-3 text-xs text-sky-600 hover:text-sky-700 font-semibold"
            >
              Clear
            </button>
          )}
        </div>

        {/* Category Selector Buttons */}
        {!searchQuery && <CategoryBar />}

        {/* Menu Items Responsive Product Grid (4+ columns on wide screens) */}
        <div className="flex-1 min-h-[300px]">
          {filteredItems.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-xl p-8 sm:p-12 text-center text-slate-800 my-2 shadow-saas">
              <p className="font-semibold text-lg text-slate-800">No menu items found</p>
              <p className="text-xs text-slate-500 font-normal mt-1">Try selecting another category or adjusting your search query.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3.5 sm:gap-4 pb-4">
              {filteredItems.map((item) => (
                <MenuItemCard key={item.itemId} item={item} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right Column: Sticky Current Order Panel (25-30% of content width) */}
      <div className="w-full lg:w-[360px] xl:w-[390px] shrink-0 min-w-0 lg:sticky lg:top-4 self-start lg:max-h-[calc(100vh-80px)] overflow-y-auto">
        <CartPanel onOrderPlaced={(order) => setRecentOrder(order)} />
      </div>

      {/* Printable Receipt Modal */}
      {recentOrder && (
        <ReceiptModal order={recentOrder} onClose={() => setRecentOrder(null)} />
      )}
    </div>
  );
};
