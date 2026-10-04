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
      className={`relative group bg-white border border-slate-200 rounded-xl p-4 flex flex-col justify-between transition-all duration-200 shadow-saas hover:shadow-saas-hover min-w-0 ${
        item.available ? 'hover:border-sky-300' : 'opacity-60 bg-slate-50'
      }`}
    >
      {/* Top Header: Title & Cart Quantity Badge */}
      <div>
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-slate-900 text-sm sm:text-base leading-snug group-hover:text-sky-600 transition-colors truncate">
            {item.itemName}
          </h3>

          {qtyInCart > 0 && (
            <span className="bg-sky-50 text-sky-700 font-semibold text-xs px-2.5 py-0.5 rounded-full shrink-0 border border-sky-200">
              {qtyInCart} in cart
            </span>
          )}
        </div>

        {item.note && (
          <div className="flex items-center space-x-1.5 text-xs text-slate-500 mt-1 font-normal italic">
            <Info className="w-3.5 h-3.5 shrink-0 text-sky-500" />
            <span className="truncate">{item.note}</span>
          </div>
        )}
      </div>

      {/* Bottom Pricing & Direct Quantity Controls */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
        <div className="text-base sm:text-lg font-bold text-slate-900 tracking-tight shrink-0">
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
              className="bg-sky-500 hover:bg-sky-600 text-white px-3.5 py-2 rounded-lg font-semibold text-xs uppercase tracking-wider flex items-center space-x-1.5 transition-all active:scale-95 shadow-sm border border-sky-600 touch-manipulation"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>ADD</span>
            </button>
          ) : (
            <div className="flex items-center bg-sky-500 text-white rounded-lg shadow-sm border border-sky-600 overflow-hidden">
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
                className="px-2.5 py-1.5 text-white hover:bg-sky-600 active:scale-95 transition-all flex items-center justify-center font-bold min-w-[34px] min-h-[34px] touch-manipulation select-none"
              >
                <Minus className="w-3.5 h-3.5 stroke-[2.5]" />
              </button>

              <span
                className="px-2.5 py-0.5 font-bold text-xs text-white bg-sky-600 min-w-[24px] text-center select-none"
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
                className="px-2.5 py-1.5 text-white hover:bg-sky-600 active:scale-95 transition-all flex items-center justify-center font-bold min-w-[34px] min-h-[34px] touch-manipulation select-none"
              >
                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              </button>
            </div>
          )
        ) : (
          <span className="text-[11px] text-slate-500 font-medium bg-slate-100 border border-slate-200 px-2 py-1 rounded-md">
            Unavailable
          </span>
        )}
      </div>
    </div>
  );
};
