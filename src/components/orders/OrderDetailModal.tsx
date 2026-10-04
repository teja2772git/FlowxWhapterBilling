import React from 'react';
import { X, Check, RotateCcw, Ban, Truck, CheckCircle2 } from 'lucide-react';
import type { Order } from '../../types/order';
import { useApp } from '../../context/AppContext';
import { formatCurrency, formatTime, formatElapsedTime } from '../../utils/formatting';

interface OrderDetailModalProps {
  order: Order | null;
  onClose: () => void;
}

export const OrderDetailModal: React.FC<OrderDetailModalProps> = ({ order, onClose }) => {
  const {
    completeOrderItemUnit,
    undoOrderItemUnit,
    updateOrderStatus,
    cancelOrder,
    markDelivered,
    settings,
    nowTick,
  } = useApp();

  if (!order) return null;

  const liveWait = formatElapsedTime(order.createdAt, nowTick);
  const p = order.priorityInfo;

  return (
    <div className="fixed inset-0 bg-[#001a5e]/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#00247d] border-4 border-[#ffd400] rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-[#001b63] px-6 py-4 border-b-2 border-[#ffd400]/40 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <h2 className="text-2xl font-black text-[#ffd400] font-display uppercase tracking-wide">
              ORDER DETAILS — {order.orderNumber}
            </h2>
            <span
              className={`px-3.5 py-1 rounded-full text-xs font-black uppercase border border-white ${
                order.status === 'READY'
                  ? 'bg-emerald-500 text-slate-950'
                  : order.status === 'DELIVERED'
                  ? 'bg-blue-600 text-white'
                  : order.status === 'CANCELLED'
                  ? 'bg-red-600 text-white'
                  : 'bg-[#ffd400] text-[#00247d]'
              }`}
            >
              {order.status}
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white p-1 rounded-xl hover:bg-[#0038a8] transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5 overflow-y-auto flex-1 text-white">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#001a5e] p-4 rounded-2xl border-2 border-[#ffd400]/40 text-xs font-bold">
            <div>
              <div className="text-[#ffd400] uppercase text-[10px] font-black">Customer</div>
              <div className="font-extrabold text-white mt-0.5 text-sm">{order.customerName || 'Walk-in'}</div>
            </div>
            <div>
              <div className="text-[#ffd400] uppercase text-[10px] font-black">Phone</div>
              <div className="font-extrabold text-white mt-0.5 text-sm">{order.customerPhone || 'N/A'}</div>
            </div>
            <div>
              <div className="text-[#ffd400] uppercase text-[10px] font-black">Arrival Time</div>
              <div className="font-extrabold text-white mt-0.5 text-sm">{formatTime(order.createdAt)}</div>
            </div>
            <div>
              <div className="text-[#ffd400] uppercase text-[10px] font-black">Elapsed Time</div>
              <div className="font-extrabold text-[#ffd400] mt-0.5 text-sm">{liveWait}</div>
            </div>
          </div>

          {p && p.priorityRank > 0 && (
            <div className="bg-[#001b63] border-2 border-[#ffd400] p-3.5 rounded-2xl flex items-center justify-between text-xs text-white">
              <div className="flex items-center space-x-2">
                <span className="font-black font-display bg-[#ffd400] text-[#00247d] px-3 py-1 rounded-xl text-xs">
                  PRIORITY #{p.priorityRank}
                </span>
                <span>Score: <strong className="text-[#ffd400] font-black">{p.priorityScore}</strong></span>
              </div>
              <div className="text-xs font-bold text-[#ffd400]">
                Workload: {p.remainingItems} items remaining
              </div>
            </div>
          )}

          <div className="space-y-3">
            <h3 className="font-display text-lg text-[#ffd400] uppercase tracking-wide">
              ORDERED ITEMS & COMPLETION TRACKING
            </h3>

            <div className="space-y-2.5">
              {order.items.map((item) => (
                <div
                  key={item.orderItemId}
                  className="bg-[#001b63] border-2 border-[#ffd400]/40 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="flex-1">
                    <div className="font-extrabold text-white text-base uppercase">
                      {item.itemName}
                    </div>
                    <div className="text-xs text-white/90 mt-1 font-bold">
                      {item.quantity} ordered @ {formatCurrency(item.unitPrice, settings.currencySymbol)} ={' '}
                      <strong className="text-[#ffd400] font-black">
                        {formatCurrency(item.quantity * item.unitPrice, settings.currencySymbol)}
                      </strong>
                    </div>
                    {item.notes && (
                      <div className="text-xs text-[#ffd400] italic mt-1 font-bold">
                        Instructions: {item.notes}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center space-x-2 shrink-0">
                    <div className="text-right mr-2">
                      <div className="text-xs font-bold text-white">
                        <span className="text-emerald-400 font-black">{item.completedQuantity}</span> / {item.quantity} Done
                      </div>
                      <div className="text-xs text-[#ffd400] font-black">
                        {item.remainingQuantity} remaining
                      </div>
                    </div>

                    <button
                      onClick={() => undoOrderItemUnit(order.orderId, item.orderItemId)}
                      disabled={item.completedQuantity <= 0}
                      title="Undo 1 unit completion"
                      className="bg-[#002e99] hover:bg-[#0038a8] disabled:opacity-30 text-white p-2 rounded-xl transition-colors border border-[#ffd400]/40"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => completeOrderItemUnit(order.orderId, item.orderItemId)}
                      disabled={item.remainingQuantity <= 0}
                      className="bg-[#ffd400] hover:bg-[#ffe24d] disabled:opacity-30 text-[#00247d] font-black text-xs px-3.5 py-2 rounded-xl flex items-center space-x-1 transition-transform active:scale-95 shadow-md border-2 border-white uppercase font-display"
                    >
                      <Check className="w-4 h-4 stroke-[3]" />
                      <span>+1 DONE</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-[#001a5e] p-4 rounded-2xl border-2 border-[#ffd400]/40 space-y-1.5 text-xs font-bold">
            <div className="flex justify-between text-white/90">
              <span>Subtotal</span>
              <span>{formatCurrency(order.subtotal, settings.currencySymbol)}</span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between text-emerald-400">
                <span>Discount</span>
                <span>-{formatCurrency(order.discount, settings.currencySymbol)}</span>
              </div>
            )}
            {order.tax > 0 && (
              <div className="flex justify-between text-white/90">
                <span>GST ({settings.taxPercentage}%)</span>
                <span>{formatCurrency(order.tax, settings.currencySymbol)}</span>
              </div>
            )}
            <div className="flex justify-between text-xl font-black text-[#ffd400] font-display pt-2 border-t border-[#ffd400]/30">
              <span>GRAND TOTAL</span>
              <span>{formatCurrency(order.grandTotal, settings.currencySymbol)}</span>
            </div>
          </div>
        </div>

        {/* Modal Controls Footer */}
        <div className="bg-[#001b63] px-6 py-4 border-t-2 border-[#ffd400]/40 flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={() => {
              cancelOrder(order.orderId);
              onClose();
            }}
            className="bg-red-950 hover:bg-red-900 text-red-200 border-2 border-red-500 px-4 py-2.5 rounded-xl text-xs font-black uppercase flex items-center space-x-1.5 transition-colors font-display"
          >
            <Ban className="w-4 h-4" />
            <span>CANCEL ORDER</span>
          </button>

          <div className="flex items-center space-x-2">
            {order.status !== 'DELIVERED' && (
              <button
                onClick={() => {
                  markDelivered(order.orderId);
                  onClose();
                }}
                className="bg-blue-600 hover:bg-blue-500 text-white border-2 border-white px-4 py-2.5 rounded-xl text-xs font-black uppercase flex items-center space-x-1.5 transition-colors shadow-md font-display"
              >
                <Truck className="w-4 h-4" />
                <span>MARK DELIVERED</span>
              </button>
            )}

            {order.status !== 'READY' && order.status !== 'DELIVERED' && (
              <button
                onClick={() => {
                  updateOrderStatus(order.orderId, 'READY');
                  onClose();
                }}
                className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 border-2 border-white px-4 py-2.5 rounded-xl text-xs font-black uppercase flex items-center space-x-1.5 transition-colors shadow-md font-display"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>MARK READY</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="bg-[#0038a8] hover:bg-[#002e99] text-white px-4 py-2.5 rounded-xl text-xs font-black uppercase transition-colors border border-white/20"
            >
              CLOSE
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
