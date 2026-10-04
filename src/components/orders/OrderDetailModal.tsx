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
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-slate-50 px-5 py-3.5 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <h2 className="text-lg font-bold text-slate-900">
              Order Details — {order.orderNumber}
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-50 text-sky-700 border border-sky-200">
              {order.status.replace('_', ' ')}
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4 overflow-y-auto flex-1 text-slate-800">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs">
            <div>
              <div className="text-slate-400 font-medium">Customer</div>
              <div className="font-semibold text-slate-900 mt-0.5 text-xs sm:text-sm">{order.customerName || 'Walk-in'}</div>
            </div>
            <div>
              <div className="text-slate-400 font-medium">Phone</div>
              <div className="font-semibold text-slate-900 mt-0.5 text-xs sm:text-sm">{order.customerPhone || 'N/A'}</div>
            </div>
            <div>
              <div className="text-slate-400 font-medium">Arrival Time</div>
              <div className="font-semibold text-slate-900 mt-0.5 text-xs sm:text-sm">{formatTime(order.createdAt)}</div>
            </div>
            <div>
              <div className="text-slate-400 font-medium">Elapsed Time</div>
              <div className="font-semibold text-sky-600 mt-0.5 text-xs sm:text-sm">{liveWait}</div>
            </div>
          </div>

          {p && p.priorityRank > 0 && (
            <div className="bg-sky-50/60 border border-sky-200 p-3 rounded-xl flex items-center justify-between text-xs">
              <div className="flex items-center space-x-2">
                <span className="font-semibold bg-sky-500 text-white px-2.5 py-0.5 rounded-md text-xs">
                  Priority #{p.priorityRank}
                </span>
                <span className="text-slate-600">Score: <strong className="text-slate-900 font-semibold">{p.priorityScore}</strong></span>
              </div>
              <div className="text-xs font-medium text-sky-700">
                {p.remainingItems} items remaining
              </div>
            </div>
          )}

          <div className="space-y-2.5">
            <h3 className="font-semibold text-sm text-slate-900">
              Ordered Items & Completion Tracking
            </h3>

            <div className="space-y-2">
              {order.items.map((item) => (
                <div
                  key={item.orderItemId}
                  className="bg-slate-50/70 border border-slate-200 p-3 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="flex-1">
                    <div className="font-semibold text-slate-900 text-sm">
                      {item.itemName}
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5 font-normal">
                      {item.quantity} ordered @ {formatCurrency(item.unitPrice, settings.currencySymbol)} ={' '}
                      <strong className="text-slate-800 font-medium">
                        {formatCurrency(item.quantity * item.unitPrice, settings.currencySymbol)}
                      </strong>
                    </div>
                    {item.notes && (
                      <div className="text-xs text-sky-600 italic mt-0.5">
                        Instructions: {item.notes}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center space-x-2 shrink-0">
                    <div className="text-right mr-2 text-xs">
                      <div className="font-medium text-slate-700">
                        <span className="text-emerald-600 font-semibold">{item.completedQuantity}</span> / {item.quantity} Done
                      </div>
                    </div>

                    <button
                      onClick={() => undoOrderItemUnit(order.orderId, item.orderItemId)}
                      disabled={item.completedQuantity <= 0}
                      title="Undo 1 unit completion"
                      className="bg-white hover:bg-slate-100 disabled:opacity-30 text-slate-700 p-1.5 rounded-lg transition-colors border border-slate-200"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => completeOrderItemUnit(order.orderId, item.orderItemId)}
                      disabled={item.remainingQuantity <= 0}
                      className="bg-sky-500 hover:bg-sky-600 disabled:opacity-30 text-white font-semibold text-xs px-3 py-1.5 rounded-lg flex items-center space-x-1 transition-all shadow-sm"
                    >
                      <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                      <span>+1 Done</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal</span>
              <span>{formatCurrency(order.subtotal, settings.currencySymbol)}</span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between text-emerald-600">
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
            <div className="flex justify-between text-base font-bold text-slate-900 pt-2 border-t border-slate-200">
              <span>Grand Total</span>
              <span>{formatCurrency(order.grandTotal, settings.currencySymbol)}</span>
            </div>
          </div>
        </div>

        {/* Modal Controls Footer */}
        <div className="bg-slate-50 px-5 py-3 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2.5">
          <button
            onClick={() => {
              cancelOrder(order.orderId);
              onClose();
            }}
            className="bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-colors"
          >
            <Ban className="w-3.5 h-3.5" />
            <span>Cancel Order</span>
          </button>

          <div className="flex items-center space-x-2">
            {order.status !== 'DELIVERED' && (
              <button
                onClick={() => {
                  markDelivered(order.orderId);
                  onClose();
                }}
                className="bg-slate-800 hover:bg-slate-900 text-white px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-colors shadow-sm"
              >
                <Truck className="w-3.5 h-3.5" />
                <span>Mark Delivered</span>
              </button>
            )}

            {order.status !== 'READY' && order.status !== 'DELIVERED' && (
              <button
                onClick={() => {
                  updateOrderStatus(order.orderId, 'READY');
                  onClose();
                }}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-colors shadow-sm"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Mark Ready</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="bg-white hover:bg-slate-100 text-slate-700 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors border border-slate-200"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
