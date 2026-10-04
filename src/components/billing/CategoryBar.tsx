import React from 'react';
import { useApp } from '../../context/AppContext';

export const CategoryBar: React.FC = () => {
  const { categories, activeCategory, setActiveCategory } = useApp();

  const activeCats = categories.filter((c) => c.active);

  return (
    <div className="flex overflow-x-auto pb-2 gap-2.5 scrollbar-thin scrollbar-thumb-[#ffd400]">
      {activeCats.map((cat) => {
        const isActive = activeCategory === cat.categoryId;
        return (
          <button
            key={cat.categoryId}
            onClick={() => setActiveCategory(cat.categoryId)}
            className={`px-5 py-2.5 rounded-2xl font-extrabold text-xs uppercase tracking-wider whitespace-nowrap transition-all duration-200 shadow-sm ${
              isActive
                ? 'bg-[#0089e8] text-white border-2 border-[#0089e8] scale-105 shadow-md shadow-[#0089e8]/30 text-sm'
                : 'bg-white text-[#0089e8] hover:bg-sky-50 hover:text-[#0077cd] border-2 border-[#0089e8]/30'
            }`}
          >
            {cat.categoryName}
          </button>
        );
      })}
    </div>
  );
};
