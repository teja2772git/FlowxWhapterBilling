import React from 'react';
import { Plus, Minus, Info } from 'lucide-react';
import type { MenuItem } from '../../types/menu';
import { useApp } from '../../context/AppContext';
import { formatCurrency } from '../../utils/formatting';

interface MenuItemCardProps {
  item: MenuItem;
}

export const MenuItemCard: React.FC<MenuItemCardProps> = ({ item }) => {
  const { addToCart, updateCartQuantity, removeFromCart, cart, settings } = useApp();

  const cartItem = cart.find((c) => c.item.itemId === item.itemId);
  const qtyInCart = cartItem ? cartItem.quantity : 0;

  return (
    <div
      className={`relative group bg-white border-2 rounded-2xl p-4 md:p-5 flex flex-col justify-between transition-all duration-200 shadow-sm ${
        item.available
          ? 'border-slate-200 hover:border-[#0089e8] hover:shadow-md'
          : 'border-slate-200 opacity-60 bg-slate-50'
      }`}
    >
      {/* Top Header: Title & Cart Quantity Badge */}
      <div>
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-extrabold text-[#0089e8] text-base md:text-lg leading-snug group-hover:text-[#0077cd] transition-colors">
            {item.itemName}
          </h3>

          {qtyInCart > 0 && (
            <span className="bg-[#ffd400] text-[#00569e] font-extrabold text-xs px-2.5 py-0.5 rounded-full shrink-0 shadow-sm border border-[#ffd400]">
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

      {/* Bottom Pricing & Direct Quantity Controls */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
        <div className="text-xl md:text-2xl font-extrabold text-amber-500 tracking-tight shrink-0">
          {formatCurrency(item.price, settings.currencySymbol)}
        </div>

        {item.available ? (
          qtyInCart === 0 ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                addToCart(item);
              }}
              aria-label={`Add ${item.itemName} to cart`}
              className="bg-[#0089e8] hover:bg-[#0077cd] text-white px-4 py-2.5 rounded-xl font-extrabold text-xs uppercase tracking-wider flex items-center space-x-1.5 transition-all active:scale-95 shadow-md border border-[#0077cd] touch-manipulation"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>ADD</span>
            </button>
          ) : (
            <div className="flex items-center bg-[#0089e8] text-white rounded-xl shadow-md border border-[#0077cd] overflow-hidden">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (qtyInCart === 1) {
                    removeFromCart(item.itemId);
                  } else {
                    updateCartQuantity(item.itemId, qtyInCart - 1);
                  }
                }}
                aria-label={`Decrease ${item.itemName} quantity`}
                className="px-3 py-2 text-white hover:bg-[#0077cd] active:scale-95 transition-all flex items-center justify-center font-black min-w-[38px] min-h-[38px] touch-manipulation select-none"
              >
                <Minus className="w-4 h-4 stroke-[3]" />
              </button>

              <span
                className="px-3 py-1 font-extrabold text-sm text-white bg-[#0077cd] min-w-[28px] text-center select-none"
                aria-live="polite"
              >
                {qtyInCart}
              </span>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  updateCartQuantity(item.itemId, qtyInCart + 1);
                }}
                aria-label={`Increase ${item.itemName} quantity`}
                className="px-3 py-2 text-white hover:bg-[#0077cd] active:scale-95 transition-all flex items-center justify-center font-black min-w-[38px] min-h-[38px] touch-manipulation select-none"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
              </button>
            </div>
          )
        ) : (
          <span className="text-xs text-red-600 font-bold bg-red-50 border border-red-200 px-2.5 py-1 rounded-lg">
            UNAVAILABLE
          </span>
        )}
      </div>
    </div>
  );
};
