import React, { useState } from 'react';
import { Edit2, Trash2, Check, X, Power } from 'lucide-react';
import type { MenuItem } from '../../types/menu';
import { useApp } from '../../context/AppContext';
import { formatCurrency } from '../../utils/formatting';

interface MenuItemTableProps {
  items: MenuItem[];
  onEditItem: (item: MenuItem) => void;
}

export const MenuItemTable: React.FC<MenuItemTableProps> = ({ items, onEditItem }) => {
  const { updateItemPrice, toggleItemAvailability, deleteMenuItem, settings } = useApp();

  const [editingPriceId, setEditingPriceId] = useState<string | null>(null);
  const [tempPrice, setTempPrice] = useState<string>('');

  const startPriceEdit = (item: MenuItem) => {
    setEditingPriceId(item.itemId);
    setTempPrice(String(item.price));
  };

  const savePriceEdit = (itemId: string) => {
    const val = Number(tempPrice);
    if (!isNaN(val) && val >= 0) {
      updateItemPrice(itemId, val);
    }
    setEditingPriceId(null);
  };

  return (
    <div className="bg-white border-2 border-[#0038a8]/20 rounded-3xl overflow-hidden shadow-xl">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-blue-50 text-[#00247d] font-extrabold uppercase tracking-wider border-b border-blue-200 text-xs">
              <th className="p-4">ORDER</th>
              <th className="p-4">ITEM NAME</th>
              <th className="p-4">CATEGORY</th>
              <th className="p-4">PRICE ({settings.currencySymbol})</th>
              <th className="p-4">STATUS</th>
              <th className="p-4 text-right">ACTIONS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-800 font-bold">
            {items.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-slate-400 font-extrabold text-base">
                  NO ITEMS FOUND IN THIS CATEGORY.
                </td>
              </tr>
            ) : (
              items.map((item) => (
                <tr key={item.itemId} className="hover:bg-blue-50/60 transition-colors">
                  <td className="p-4 font-black text-slate-400 w-16">
                    #{item.displayOrder}
                  </td>
                  <td className="p-4">
                    <div className="font-extrabold text-[#00247d] text-base uppercase">
                      {item.itemName}
                    </div>
                    {item.note && (
                      <div className="text-xs text-[#0047b8] italic mt-0.5 font-bold">
                        Note: {item.note}
                      </div>
                    )}
                  </td>
                  <td className="p-4">
                    <span className="bg-blue-50 border border-blue-200 px-3 py-1 rounded-xl text-xs font-extrabold text-[#00247d]">
                      {item.categoryName}
                    </span>
                  </td>

                  {/* Inline Price Edit */}
                  <td className="p-4 font-black text-lg text-[#00247d]">
                    {editingPriceId === item.itemId ? (
                      <div className="flex items-center space-x-1.5">
                        <input
                          type="number"
                          value={tempPrice}
                          onChange={(e) => setTempPrice(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && savePriceEdit(item.itemId)}
                          className="w-24 bg-white border-2 border-[#0038a8] rounded-xl px-2.5 py-1 text-slate-900 text-sm font-bold focus:outline-none"
                          autoFocus
                        />
                        <button
                          onClick={() => savePriceEdit(item.itemId)}
                          className="bg-emerald-500 text-white p-1.5 rounded-xl hover:bg-emerald-600 border border-white"
                        >
                          <Check className="w-4 h-4 stroke-[3]" />
                        </button>
                        <button
                          onClick={() => setEditingPriceId(null)}
                          className="bg-slate-200 text-slate-700 p-1.5 rounded-xl hover:bg-slate-300"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => startPriceEdit(item)}
                        title="Click to edit price directly"
                        className="hover:underline hover:text-[#0047b8] flex items-center space-x-1.5 cursor-pointer"
                      >
                        <span>{formatCurrency(item.price, settings.currencySymbol)}</span>
                        <Edit2 className="w-3.5 h-3.5 text-[#0047b8] opacity-80 hover:opacity-100 ml-1" />
                      </button>
                    )}
                  </td>

                  <td className="p-4">
                    <button
                      onClick={() => toggleItemAvailability(item.itemId)}
                      className={`px-3.5 py-1.5 rounded-full font-extrabold text-xs uppercase flex items-center space-x-1.5 transition-colors border ${
                        item.available
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                          : 'bg-red-50 text-red-700 border-red-300'
                      }`}
                    >
                      <Power className="w-3.5 h-3.5" />
                      <span>{item.available ? 'AVAILABLE' : 'UNAVAILABLE'}</span>
                    </button>
                  </td>

                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => onEditItem(item)}
                        className="p-2 bg-blue-50 hover:bg-blue-100 text-[#00247d] border border-blue-200 rounded-xl transition-colors"
                        title="Edit Item Details"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Are you sure you want to delete "${item.itemName}"?`)) {
                            deleteMenuItem(item.itemId);
                          }
                        }}
                        className="p-2 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-xl transition-colors"
                        title="Delete Item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
