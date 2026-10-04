import React, { useState, useEffect } from 'react';
import { ShoppingCart, Plus, Minus, Trash2, Tag, AlertCircle, MessageSquare } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatCurrency } from '../../utils/formatting';
import type { Order } from '../../types/order';

interface CartPanelProps {
  onOrderPlaced: (order: Order) => void;
}

export const CartPanel: React.FC<CartPanelProps> = ({ onOrderPlaced }) => {
  const {
    cart,
    updateCartQuantity,
    removeFromCart,
    updateCartNotes,
    clearCart,
    placeOrder,
    settings,
  } = useApp();

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [discountInput, setDiscountInput] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isPlacing, setIsPlacing] = useState(false);

  const discount = Math.max(0, Number(discountInput) || 0);

  const subtotal = cart.reduce((sum, c) => sum + c.item.price * c.quantity, 0);
  const taxableSubtotal = Math.max(0, subtotal - discount);
  const taxRate = settings.taxEnabled ? settings.taxPercentage / 100 : 0;
  const taxAmount = Math.round(taxableSubtotal * taxRate);
  const grandTotal = Math.round(taxableSubtotal + taxAmount);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        if (cart.length > 0 && !isPlacing) {
          handlePlaceOrder();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [cart, customerName, customerPhone, discountInput, isPlacing]);

  const handlePlaceOrder = async () => {
    if (cart.length === 0) {
      setErrorMsg('Please select at least one item from the menu.');
      return;
    }
    setErrorMsg(null);
    setIsPlacing(true);
    try {
      const order = await placeOrder(customerName, customerPhone, discount);
      setCustomerName('');
      setCustomerPhone('');
      setDiscountInput('');
      onOrderPlaced(order);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to place order.');
    } finally {
      setIsPlacing(false);
    }
  };

  return (
    <div className="bg-white border-2 border-slate-200 rounded-2xl p-4 md:p-5 flex flex-col justify-between h-full shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between border-b-2 border-slate-100 pb-3">
        <div className="flex items-center space-x-2">
          <ShoppingCart className="w-5 h-5 text-[#0089e8]" />
          <h2 className="font-extrabold text-xl text-[#0089e8] uppercase tracking-wide">
            CURRENT ORDER
          </h2>
        </div>
        {cart.length > 0 && (
          <button
            onClick={clearCart}
            className="text-xs text-red-600 hover:text-red-700 flex items-center space-x-1 font-extrabold uppercase transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear</span>
          </button>
        )}
      </div>

      {/* Cart Items List */}
      <div className="flex-1 overflow-y-auto my-3 space-y-3 pr-1 scrollbar-thin scrollbar-thumb-[#0089e8] min-h-[200px] max-h-[380px]">
        {cart.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
            <ShoppingCart className="w-12 h-12 stroke-1 mb-2 text-[#0089e8]/40" />
            <p className="font-extrabold text-lg text-[#0089e8] uppercase">YOUR ORDER IS EMPTY</p>
            <p className="text-xs mt-1 text-slate-500 font-medium">Select items from the menu to start an order</p>
          </div>
        ) : (
          cart.map((cartItem) => {
            const itemTotal = cartItem.item.price * cartItem.quantity;
            return (
              <div
                key={cartItem.item.itemId}
                className="bg-sky-50/70 border border-sky-200 p-3.5 rounded-2xl space-y-2 shadow-sm"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-bold text-[#0089e8] text-sm uppercase">
                      {cartItem.item.itemName}
                    </h4>
                    <div className="text-xs text-slate-500 font-bold mt-0.5">
                      {formatCurrency(cartItem.item.price, settings.currencySymbol)} each
                    </div>
                  </div>

                  <div className="text-base font-extrabold text-[#0089e8]">
                    {formatCurrency(itemTotal, settings.currencySymbol)}
                  </div>
                </div>

                {/* Quantity Controls & Notes Input */}
                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center space-x-2 bg-white border border-sky-300 rounded-xl p-1 shadow-sm">
                    <button
                      onClick={() => updateCartQuantity(cartItem.item.itemId, cartItem.quantity - 1)}
                      className="p-1 text-[#0089e8] hover:bg-sky-100 rounded-lg font-bold"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="font-extrabold text-[#0089e8] px-3 text-sm">
                      {cartItem.quantity}
                    </span>
                    <button
                      onClick={() => updateCartQuantity(cartItem.item.itemId, cartItem.quantity + 1)}
                      className="p-1 text-[#0089e8] hover:bg-sky-100 rounded-lg font-bold"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>

                  <button
                    onClick={() => removeFromCart(cartItem.item.itemId)}
                    className="text-slate-400 hover:text-red-600 p-1 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center space-x-1.5 pt-1">
                  <MessageSquare className="w-3.5 h-3.5 text-[#0089e8] shrink-0" />
                  <input
                    type="text"
                    placeholder="Special instructions (e.g. extra spicy)"
                    value={cartItem.notes || ''}
                    onChange={(e) => updateCartNotes(cartItem.item.itemId, e.target.value)}
                    className="w-full bg-white border border-sky-200 rounded-lg px-2.5 py-1 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#0089e8]"
                  />
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Order Details Form & Grand Total */}
      <div className="border-t-2 border-slate-100 pt-3 space-y-3">
        {errorMsg && (
          <div className="bg-red-50 border border-red-300 text-red-700 p-2.5 rounded-xl text-xs flex items-center space-x-2 font-bold">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Customer Info */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>
            <label className="text-[10px] font-extrabold text-[#0089e8] uppercase tracking-wider block mb-1">
              Customer Name
            </label>
            <input
              type="text"
              placeholder="Walk-in Customer"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-2.5 py-1.5 text-slate-900 font-bold placeholder-slate-400 focus:outline-none focus:border-[#0089e8] focus:bg-white"
            />
          </div>

          <div>
            <label className="text-[10px] font-extrabold text-[#0089e8] uppercase tracking-wider block mb-1">
              Phone Number
            </label>
            <input
              type="tel"
              placeholder="Mobile number"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-2.5 py-1.5 text-slate-900 font-bold placeholder-slate-400 focus:outline-none focus:border-[#0089e8] focus:bg-white"
            />
          </div>
        </div>

        {/* Discount Input */}
        <div>
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-[10px] font-extrabold text-[#0089e8] uppercase tracking-wider">
              Discount ({settings.currencySymbol})
            </span>
          </div>
          <div className="relative">
            <Tag className="w-3.5 h-3.5 text-[#0089e8] absolute left-2.5 top-2.5" />
            <input
              type="number"
              min="0"
              placeholder="0"
              value={discountInput}
              onChange={(e) => setDiscountInput(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-900 font-bold focus:outline-none focus:border-[#0089e8] focus:bg-white"
            />
          </div>
        </div>

        {/* Calculation Totals */}
        <div className="bg-sky-50/80 p-3.5 rounded-2xl border border-sky-200 space-y-1.5 text-xs font-bold">
          <div className="flex justify-between text-slate-600">
            <span>Subtotal</span>
            <span>{formatCurrency(subtotal, settings.currencySymbol)}</span>
          </div>

          {discount > 0 && (
            <div className="flex justify-between text-emerald-600">
              <span>Discount</span>
              <span>-{formatCurrency(discount, settings.currencySymbol)}</span>
            </div>
          )}

          {settings.taxEnabled && (
            <div className="flex justify-between text-slate-600">
              <span>GST ({settings.taxPercentage}%)</span>
              <span>{formatCurrency(taxAmount, settings.currencySymbol)}</span>
            </div>
          )}

          <div className="flex justify-between text-xl font-black text-[#0089e8] pt-2 border-t border-sky-200">
            <span>GRAND TOTAL</span>
            <span>{formatCurrency(grandTotal, settings.currencySymbol)}</span>
          </div>
        </div>

        {/* Large Prominent Yellow PLACE ORDER Button */}
        <div>
          <button
            onClick={handlePlaceOrder}
            disabled={cart.length === 0 || isPlacing}
            className={`w-full py-4 rounded-2xl font-black text-lg uppercase tracking-wider flex items-center justify-center space-x-2 transition-all duration-200 shadow-md ${
              cart.length > 0 && !isPlacing
                ? 'bg-[#ffd400] hover:bg-[#ffe24d] text-[#00569e] shadow-[#ffd400]/40 active:scale-98 cursor-pointer hover:-translate-y-0.5 border-2 border-[#ffd400]'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed border-transparent opacity-70'
            }`}
          >
            <span>{isPlacing ? 'PLACING ORDER...' : 'PLACE ORDER →'}</span>
          </button>
          <div className="text-[11px] text-slate-500 text-center font-bold mt-1.5">
            Press <kbd className="bg-slate-100 border border-slate-300 px-1.5 py-0.5 rounded text-slate-700">Ctrl + Enter</kbd> to place order
          </div>
        </div>
      </div>
    </div>
  );
};
