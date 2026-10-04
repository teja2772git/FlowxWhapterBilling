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
    <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col justify-between h-full shadow-saas">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center space-x-2">
          <ShoppingCart className="w-4 h-4 text-sky-500" />
          <h2 className="font-bold text-base text-slate-900">
            Current Order
          </h2>
        </div>
        {cart.length > 0 && (
          <button
            onClick={clearCart}
            className="text-xs text-rose-600 hover:text-rose-700 flex items-center space-x-1 font-semibold transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear</span>
          </button>
        )}
      </div>

      {/* Cart Items List */}
      <div className="flex-1 overflow-y-auto my-3 space-y-2.5 pr-1 min-h-[180px] max-h-[360px]">
        {cart.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
            <ShoppingCart className="w-10 h-10 stroke-[1.5] mb-2 text-slate-300" />
            <p className="font-semibold text-sm text-slate-700">Your order is empty</p>
            <p className="text-xs mt-0.5 text-slate-400 font-normal">Select items from the menu to start an order</p>
          </div>
        ) : (
          cart.map((cartItem) => {
            const itemTotal = cartItem.item.price * cartItem.quantity;
            return (
              <div
                key={cartItem.item.itemId}
                className="bg-slate-50 border border-slate-200 p-3 rounded-xl space-y-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="font-semibold text-slate-900 text-xs sm:text-sm">
                      {cartItem.item.itemName}
                    </h4>
                    <div className="text-[11px] text-slate-500 font-normal mt-0.5">
                      {formatCurrency(cartItem.item.price, settings.currencySymbol)} each
                    </div>
                  </div>

                  <div className="text-sm font-bold text-slate-900">
                    {formatCurrency(itemTotal, settings.currencySymbol)}
                  </div>
                </div>

                {/* Quantity Controls & Notes Input */}
                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center space-x-1 bg-white border border-slate-200 rounded-lg p-0.5 shadow-xs">
                    <button
                      onClick={() => updateCartQuantity(cartItem.item.itemId, cartItem.quantity - 1)}
                      className="p-1 text-slate-600 hover:bg-slate-100 rounded-md font-semibold"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="font-bold text-slate-900 px-2 text-xs">
                      {cartItem.quantity}
                    </span>
                    <button
                      onClick={() => updateCartQuantity(cartItem.item.itemId, cartItem.quantity + 1)}
                      className="p-1 text-slate-600 hover:bg-slate-100 rounded-md font-semibold"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <button
                    onClick={() => removeFromCart(cartItem.item.itemId)}
                    className="text-slate-400 hover:text-rose-600 p-1 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex items-center space-x-1.5 pt-1">
                  <MessageSquare className="w-3 h-3 text-slate-400 shrink-0" />
                  <input
                    type="text"
                    placeholder="Instructions (e.g. extra spicy)"
                    value={cartItem.notes || ''}
                    onChange={(e) => updateCartNotes(cartItem.item.itemId, e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-md px-2 py-1 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Order Details Form & Grand Total */}
      <div className="border-t border-slate-100 pt-3 space-y-2.5">
        {errorMsg && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 p-2.5 rounded-lg text-xs flex items-center space-x-2 font-medium">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Customer Info */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>
            <label className="text-[11px] font-medium text-slate-500 block mb-1">
              Customer Name
            </label>
            <input
              type="text"
              placeholder="Walk-in Customer"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 font-medium placeholder:text-slate-400 focus:outline-none focus:border-sky-500 focus:bg-white"
            />
          </div>

          <div>
            <label className="text-[11px] font-medium text-slate-500 block mb-1">
              Phone Number
            </label>
            <input
              type="tel"
              placeholder="Mobile number"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 font-medium placeholder:text-slate-400 focus:outline-none focus:border-sky-500 focus:bg-white"
            />
          </div>
        </div>

        {/* Discount Input */}
        <div>
          <label className="text-[11px] font-medium text-slate-500 block mb-1">
            Discount ({settings.currencySymbol})
          </label>
          <div className="relative">
            <Tag className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
            <input
              type="number"
              min="0"
              placeholder="0"
              value={discountInput}
              onChange={(e) => setDiscountInput(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-900 font-medium focus:outline-none focus:border-sky-500 focus:bg-white"
            />
          </div>
        </div>

        {/* Calculation Totals */}
        <div className="bg-sky-50/60 p-3 rounded-xl border border-sky-200/80 space-y-1 text-xs">
          <div className="flex justify-between text-slate-600 font-normal">
            <span>Subtotal</span>
            <span>{formatCurrency(subtotal, settings.currencySymbol)}</span>
          </div>

          {discount > 0 && (
            <div className="flex justify-between text-emerald-600 font-medium">
              <span>Discount</span>
              <span>-{formatCurrency(discount, settings.currencySymbol)}</span>
            </div>
          )}

          {settings.taxEnabled && (
            <div className="flex justify-between text-slate-600 font-normal">
              <span>GST ({settings.taxPercentage}%)</span>
              <span>{formatCurrency(taxAmount, settings.currencySymbol)}</span>
            </div>
          )}

          <div className="flex justify-between text-base font-bold text-slate-900 pt-1.5 border-t border-sky-200/80">
            <span>Grand Total</span>
            <span>{formatCurrency(grandTotal, settings.currencySymbol)}</span>
          </div>
        </div>

        {/* Prominent Primary Light-Blue Place Order Button */}
        <div>
          <button
            onClick={handlePlaceOrder}
            disabled={cart.length === 0 || isPlacing}
            className={`w-full py-3 rounded-lg font-semibold text-sm flex items-center justify-center space-x-2 transition-all duration-150 shadow-sm ${
              cart.length > 0 && !isPlacing
                ? 'bg-sky-500 hover:bg-sky-600 text-white active:scale-98 cursor-pointer border border-sky-600'
                : 'bg-slate-100 text-slate-400 cursor-not-allowed border-transparent'
            }`}
          >
            <span>{isPlacing ? 'Placing Order...' : 'Place Order →'}</span>
          </button>
          <div className="text-[11px] text-slate-400 text-center font-normal mt-1">
            Press <kbd className="bg-slate-100 border border-slate-200 px-1 py-0.5 rounded text-slate-600">Ctrl + Enter</kbd> to place order
          </div>
        </div>
      </div>
    </div>
  );
};
