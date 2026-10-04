import React from 'react';
import { Printer, X, CheckCircle2 } from 'lucide-react';
import type { Order } from '../../types/order';
import { useApp } from '../../context/AppContext';
import { formatCurrency, formatTime, formatDate } from '../../utils/formatting';

interface ReceiptModalProps {
  order: Order | null;
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({ order, onClose }) => {
  const { settings } = useApp();

  if (!order) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-[#001a5e]/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#00247d] border-4 border-[#ffd400] rounded-3xl max-w-md w-full overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-[#001b63] px-6 py-4 border-b-2 border-[#ffd400]/40 flex items-center justify-between">
          <div className="flex items-center space-x-2 text-emerald-400 font-extrabold text-sm">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <span className="font-display text-base tracking-wide uppercase text-white">ORDER PLACED SUCCESSFULLY!</span>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white p-1 rounded-xl hover:bg-[#0038a8] transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Printable Thermal Receipt Card */}
        <div className="p-6 bg-white text-slate-900 font-mono text-sm space-y-4 print:p-0">
          <div className="text-center border-b-2 border-dashed border-slate-300 pb-3">
            <h2 className="text-2xl font-black text-[#00247d] font-display tracking-tight uppercase">
              {settings.restaurantName}
            </h2>
            <p className="text-xs text-slate-600 font-sans font-bold">
              {settings.restaurantTagline}
            </p>
            <div className="mt-2 text-sm font-black text-[#00247d]">
              ORDER {order.orderNumber}
            </div>
            <div className="text-xs text-slate-500">
              {formatDate(order.createdAt)} • {formatTime(order.createdAt)}
            </div>
          </div>

          {(order.customerName || order.customerPhone) && (
            <div className="text-xs border-b border-dashed border-slate-300 pb-2">
              <div>Customer: <span className="font-bold">{order.customerName || 'Walk-in'}</span></div>
              {order.customerPhone && <div>Phone: {order.customerPhone}</div>}
            </div>
          )}

          <div className="space-y-2 py-1">
            <div className="flex justify-between text-xs font-bold text-slate-500 border-b border-slate-200 pb-1">
              <span>ITEM</span>
              <span>QTY x PRICE</span>
              <span>TOTAL</span>
            </div>
            {order.items.map((item) => (
              <div key={item.orderItemId} className="flex justify-between items-start text-xs">
                <div className="flex-1 pr-2">
                  <div className="font-bold text-slate-900">{item.itemName}</div>
                  {item.notes && <div className="text-[10px] text-slate-500 italic">Note: {item.notes}</div>}
                </div>
                <div className="w-20 text-center text-slate-700">
                  {item.quantity} x {formatCurrency(item.unitPrice, settings.currencySymbol)}
                </div>
                <div className="w-16 text-right font-black text-slate-900">
                  {formatCurrency(item.quantity * item.unitPrice, settings.currencySymbol)}
                </div>
              </div>
            ))}
          </div>

          <div className="border-t-2 border-dashed border-slate-300 pt-3 space-y-1 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal</span>
              <span>{formatCurrency(order.subtotal, settings.currencySymbol)}</span>
            </div>

            {order.discount > 0 && (
              <div className="flex justify-between text-emerald-600 font-bold">
                <span>Discount</span>
                <span>-{formatCurrency(order.discount, settings.currencySymbol)}</span>
              </div>
            )}

            {order.tax > 0 && (
              <div className="flex justify-between text-slate-600">
                <span>GST ({settings.taxPercentage}%)</span>
                <span>{formatCurrency(order.tax, settings.currencySymbol)}</span>
              </div>
            )}

            <div className="flex justify-between text-lg font-black text-[#00247d] font-display pt-2 border-t-2 border-slate-900">
              <span>GRAND TOTAL</span>
              <span>{formatCurrency(order.grandTotal, settings.currencySymbol)}</span>
            </div>
          </div>

          <div className="text-center text-[10px] text-slate-500 pt-2 font-sans italic">
            {settings.receiptFooterText}
          </div>
        </div>

        {/* Action Controls */}
        <div className="bg-[#001b63] px-6 py-4 border-t-2 border-[#ffd400]/40 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#0038a8] hover:bg-[#002e99] text-white rounded-xl text-xs font-bold uppercase transition-colors border border-white/20"
          >
            CLOSE
          </button>
          <button
            onClick={handlePrint}
            className="px-5 py-2.5 bg-[#ffd400] hover:bg-[#ffe24d] text-[#00247d] rounded-xl text-xs font-black uppercase flex items-center space-x-1.5 transition-transform active:scale-95 shadow-lg shadow-[#ffd400]/20 border-2 border-white font-display"
          >
            <Printer className="w-4 h-4" />
            <span>PRINT RECEIPT</span>
          </button>
        </div>
      </div>
    </div>
  );
};
