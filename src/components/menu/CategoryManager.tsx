import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Check, X } from 'lucide-react';
import type { Category } from '../../types/menu';
import { useApp } from '../../context/AppContext';

export const CategoryManager: React.FC = () => {
  const { categories, addCategory, updateCategory, deleteCategory } = useApp();

  const [newCatName, setNewCatName] = useState('');
  const [editingCatId, setEditingCatId] = useState<string | null>(null);
  const [editingCatName, setEditingCatName] = useState('');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    addCategory({
      categoryName: newCatName.trim().toUpperCase(),
      displayOrder: categories.length + 1,
      active: true,
    });
    setNewCatName('');
  };

  const startEdit = (cat: Category) => {
    setEditingCatId(cat.categoryId);
    setEditingCatName(cat.categoryName);
  };

  const saveEdit = (cat: Category) => {
    if (!editingCatName.trim()) return;
    updateCategory({
      ...cat,
      categoryName: editingCatName.trim().toUpperCase(),
    });
    setEditingCatId(null);
  };

  return (
    <div className="bg-[#00247d] border-2 border-[#ffd400]/60 p-5 rounded-3xl space-y-4 shadow-xl">
      <div className="flex items-center justify-between border-b-2 border-[#ffd400]/40 pb-3">
        <h3 className="font-display text-lg text-[#ffd400] uppercase tracking-wide">MANAGE CATEGORIES</h3>
        <span className="text-xs font-black text-[#ffd400] bg-[#001b63] px-3 py-1 rounded-full border border-[#ffd400]/40">
          {categories.length} CATEGORIES
        </span>
      </div>

      <form onSubmit={handleAdd} className="flex gap-2">
        <input
          type="text"
          placeholder="New Category Name (e.g., BEVERAGES)..."
          value={newCatName}
          onChange={(e) => setNewCatName(e.target.value)}
          className="flex-1 bg-[#001b63] border border-[#ffd400]/40 rounded-xl px-3.5 py-2.5 text-xs text-white uppercase font-bold focus:outline-none focus:border-[#ffd400]"
        />
        <button
          type="submit"
          className="bg-[#ffd400] hover:bg-[#ffe24d] text-[#00247d] px-5 py-2.5 rounded-xl text-xs font-black flex items-center space-x-1 shrink-0 uppercase border-2 border-white shadow-md font-display"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>ADD CATEGORY</span>
        </button>
      </form>

      <div className="flex flex-wrap gap-2 pt-1">
        {categories.map((cat) => (
          <div
            key={cat.categoryId}
            className="bg-[#001b63] border-2 border-[#ffd400]/40 px-3.5 py-2 rounded-xl flex items-center space-x-2 text-xs text-white"
          >
            {editingCatId === cat.categoryId ? (
              <div className="flex items-center space-x-1.5">
                <input
                  type="text"
                  value={editingCatName}
                  onChange={(e) => setEditingCatName(e.target.value)}
                  className="bg-[#00247d] border-2 border-[#ffd400] rounded-lg px-2 py-0.5 text-xs text-white uppercase font-bold"
                  autoFocus
                />
                <button onClick={() => saveEdit(cat)} className="text-emerald-400 hover:text-white">
                  <Check className="w-4 h-4 stroke-[3]" />
                </button>
                <button onClick={() => setEditingCatId(null)} className="text-white/70 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <>
                <span className="font-extrabold uppercase">{cat.categoryName}</span>
                <div className="flex items-center space-x-1 pl-2 border-l border-[#ffd400]/30">
                  <button
                    onClick={() => startEdit(cat)}
                    className="text-white/70 hover:text-[#ffd400] p-0.5"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Delete category "${cat.categoryName}" and all its items?`)) {
                        deleteCategory(cat.categoryId);
                      }
                    }}
                    className="text-white/60 hover:text-red-300 p-0.5"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
