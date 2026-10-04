import React, { useState, useEffect } from 'react';
import { X, Check } from 'lucide-react';
import type { MenuItem } from '../../types/menu';
import { useApp } from '../../context/AppContext';

interface ItemFormModalProps {
  itemToEdit: MenuItem | null;
  onClose: () => void;
}

export const ItemFormModal: React.FC<ItemFormModalProps> = ({ itemToEdit, onClose }) => {
  const { categories, addMenuItem, updateMenuItem, settings } = useApp();

  const [itemName, setItemName] = useState(itemToEdit?.itemName || '');
  const [categoryId, setCategoryId] = useState(itemToEdit?.categoryId || categories[0]?.categoryId || '');
  const [price, setPrice] = useState(itemToEdit?.price !== undefined ? String(itemToEdit.price) : '');
  const [available, setAvailable] = useState(itemToEdit?.available ?? true);
  const [displayOrder, setDisplayOrder] = useState(itemToEdit?.displayOrder !== undefined ? String(itemToEdit.displayOrder) : '1');
  const [note, setNote] = useState(itemToEdit?.note || '');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (itemToEdit) {
      setItemName(itemToEdit.itemName);
      setCategoryId(itemToEdit.categoryId);
      setPrice(String(itemToEdit.price));
      setAvailable(itemToEdit.available);
      setDisplayOrder(String(itemToEdit.displayOrder));
      setNote(itemToEdit.note || '');
    }
  }, [itemToEdit]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemName.trim()) {
      setErrorMsg('Item name is required.');
      return;
    }
    const parsedPrice = Number(price);
    if (isNaN(parsedPrice) || parsedPrice < 0) {
      setErrorMsg('Valid price is required.');
      return;
    }

    const categoryObj = categories.find((c) => c.categoryId === categoryId);
    const categoryName = categoryObj ? categoryObj.categoryName : 'General';

    if (itemToEdit) {
      updateMenuItem({
        ...itemToEdit,
        itemName: itemName.trim(),
        categoryId,
        categoryName,
        price: parsedPrice,
        available,
        displayOrder: Number(displayOrder) || 1,
        note: note.trim() || undefined,
      });
    } else {
      addMenuItem({
        itemName: itemName.trim(),
        categoryId,
        categoryName,
        price: parsedPrice,
        available,
        displayOrder: Number(displayOrder) || 1,
        note: note.trim() || undefined,
      });
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-[#001a5e]/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#00247d] border-4 border-[#ffd400] rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <div className="bg-[#001b63] px-6 py-4 border-b-2 border-[#ffd400]/40 flex items-center justify-between">
          <h2 className="text-xl font-black text-[#ffd400] font-display uppercase tracking-wide">
            {itemToEdit ? 'EDIT MENU ITEM' : 'ADD MENU ITEM'}
          </h2>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white p-1 rounded-xl hover:bg-[#0038a8] transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs font-bold text-white">
          {errorMsg && (
            <div className="bg-red-950/90 border-2 border-red-500 text-white p-3 rounded-2xl">
              {errorMsg}
            </div>
          )}

          <div>
            <label className="block text-[#ffd400] font-black uppercase mb-1">ITEM NAME</label>
            <input
              type="text"
              required
              placeholder="e.g. Crispy Chicken Patty Burger"
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              className="w-full bg-[#001b63] border border-[#ffd400]/40 rounded-2xl px-3.5 py-2.5 text-sm text-white font-bold focus:outline-none focus:border-[#ffd400]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[#ffd400] font-black uppercase mb-1">CATEGORY</label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full bg-[#001b63] border border-[#ffd400]/40 rounded-2xl px-3.5 py-2.5 text-sm text-white font-bold focus:outline-none focus:border-[#ffd400]"
              >
                {categories.map((c) => (
                  <option key={c.categoryId} value={c.categoryId}>
                    {c.categoryName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[#ffd400] font-black uppercase mb-1">
                PRICE ({settings.currencySymbol})
              </label>
              <input
                type="number"
                step="0.01"
                required
                placeholder="150"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full bg-[#001b63] border border-[#ffd400]/40 rounded-2xl px-3.5 py-2.5 text-sm text-[#ffd400] font-black font-display focus:outline-none focus:border-[#ffd400]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[#ffd400] font-black uppercase mb-1">DISPLAY ORDER</label>
              <input
                type="number"
                min="1"
                value={displayOrder}
                onChange={(e) => setDisplayOrder(e.target.value)}
                className="w-full bg-[#001b63] border border-[#ffd400]/40 rounded-2xl px-3.5 py-2.5 text-sm text-white font-bold focus:outline-none focus:border-[#ffd400]"
              />
            </div>

            <div>
              <label className="block text-[#ffd400] font-black uppercase mb-1">AVAILABILITY</label>
              <label className="flex items-center space-x-2 bg-[#001b63] border border-[#ffd400]/40 rounded-2xl px-3.5 py-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={available}
                  onChange={(e) => setAvailable(e.target.checked)}
                  className="w-4 h-4 text-[#ffd400] rounded accent-[#ffd400]"
                />
                <span className="font-extrabold text-white uppercase">
                  {available ? 'AVAILABLE' : 'UNAVAILABLE'}
                </span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-[#ffd400] font-black uppercase mb-1">
              NOTE / SPECIAL TAG (OPTIONAL)
            </label>
            <input
              type="text"
              placeholder="e.g. Based on availability"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full bg-[#001b63] border border-[#ffd400]/40 rounded-2xl px-3.5 py-2.5 text-sm text-white font-bold focus:outline-none focus:border-[#ffd400]"
            />
          </div>

          <div className="bg-[#001b63] -mx-6 -mb-6 mt-6 px-6 py-4 border-t-2 border-[#ffd400]/40 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-[#0038a8] hover:bg-[#002e99] text-white rounded-xl font-bold uppercase transition-colors"
            >
              CANCEL
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-[#ffd400] hover:bg-[#ffe24d] text-[#00247d] rounded-xl font-black uppercase flex items-center space-x-1.5 shadow-md border-2 border-white font-display"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>{itemToEdit ? 'SAVE CHANGES' : 'ADD ITEM'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
