import React from 'react';
import { Download, CheckCircle2, RefreshCw } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const Header: React.FC = () => {
  const { settings, excelSync, exportExcelDatabase } = useApp();

  return (
    <header className="bg-white text-slate-900 border-b border-slate-200 sticky top-0 z-30 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex items-center justify-between gap-3">
        {/* FLOW Brand Header */}
        <div className="flex items-center space-x-3">
          <div className="bg-sky-500 text-white px-2.5 py-1 rounded-lg shadow-sm flex items-center justify-center font-extrabold tracking-tight text-lg">
            FLOW
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
              {settings.restaurantName || 'FLOW'}
            </h1>
            <p className="text-[11px] text-slate-500 font-medium tracking-wide">
              {settings.restaurantTagline || 'FLAVOURS ON WHEELS'}
            </p>
          </div>
        </div>

        {/* Right Controls: Excel Status Indicator & Export Button */}
        <div className="flex items-center space-x-2.5 text-xs">
          {/* Subtle Excel Status Badge */}
          <div className="bg-sky-50/80 border border-sky-200 text-sky-800 rounded-lg px-2.5 py-1.5 flex items-center space-x-1.5 font-medium text-xs">
            {excelSync.isSaving ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-sky-600 shrink-0" />
                <span className="hidden sm:inline">Syncing Excel...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span className="text-slate-700">Excel Synced</span>
              </>
            )}
          </div>

          {/* Export Excel Workbook Button */}
          <button
            onClick={exportExcelDatabase}
            title="Download Excel Database Workbook"
            className="bg-sky-500 hover:bg-sky-600 active:scale-95 text-white px-3 py-1.5 rounded-lg flex items-center space-x-1.5 font-semibold text-xs transition-all shadow-sm border border-sky-600 shrink-0"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export Excel</span>
          </button>
        </div>
      </div>
    </header>
  );
};
