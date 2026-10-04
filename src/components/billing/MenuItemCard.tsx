import React from 'react';
import { Plus, Info } from 'lucide-react';
import type { MenuItem } from '../../types/menu';
import { useApp } from '../../context/AppContext';
import { formatCurrency } from '../../utils/formatting';

interface MenuItemCardProps {
  item: MenuItem;
}

export const MenuItemCard: React.FC<MenuItemCardProps> = ({ item }) => {
  const { addToCart, cart, settings } = useApp();

  const cartItem = cart.find((c) => c.item.itemId === item.itemId);
  const qtyInCart = cartItem ? cartItem.quantity : 0;

  return (
    <div
      onClick={() => item.available && addToCart(item)}
      className={`relative group bg-white border-2 rounded-2xl p-4 md:p-5 flex flex-col justify-between transition-all duration-200 cursor-pointer shadow-sm ${
        item.available
          ? 'border-slate-200 hover:border-[#0089e8] hover:shadow-xl hover:-translate-y-1'
          : 'border-slate-200 opacity-60 cursor-not-allowed bg-slate-50'
      }`}
    >
      {/* Top Header: Title & Cart Quantity Badge */}
      <div>
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-extrabold text-[#0089e8] text-base md:text-lg leading-snug group-hover:text-[#0077cd] transition-colors">
            {item.itemName}
          </h3>

          {qtyInCart > 0 && (
            <span className="bg-[#ffd400] text-[#00569e] font-extrabold text-xs px-2.5 py-1 rounded-full shrink-0 shadow-sm border border-[#ffd400]">
              {qtyInCart} in cart
            </span>
          )}
        </div>

        {item.note && (
          <div className="flex items-center space-x-1.5 text-xs text-slate-500 mt-1.5 font-bold italic">
            <Info className="w-3.5 h-3.5 shrink-0 text-[#0089e8]" />
            <span>{item.note}</span>
          </div>
        )}
      </div>

      {/* Bottom Pricing & Large + ADD Button */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
        <div className="text-xl md:text-2xl font-extrabold text-amber-500 tracking-tight">
          {formatCurrency(item.price, settings.currencySymbol)}
        </div>

        {item.available ? (
          <button
            onClick={(e) => {
              e.stopPropagation();
              addToCart(item);
            }}
            className="bg-[#0089e8] hover:bg-[#0077cd] text-white px-4 py-2 rounded-xl font-extrabold text-xs uppercase tracking-wider flex items-center space-x-1.5 transition-all active:scale-95 shadow-md border border-[#0077cd]"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>+ ADD</span>
          </button>
        ) : (
          <span className="text-xs text-red-600 font-bold bg-red-50 border border-red-200 px-2.5 py-1 rounded-lg">
            UNAVAILABLE
          </span>
        )}
      </div>
    </div>
  );
};
