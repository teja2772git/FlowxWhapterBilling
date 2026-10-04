import React, { useState } from 'react';
import { Save, Download, Upload, RefreshCw, Sliders, ShieldCheck, FileSpreadsheet, Cloud } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const SettingsPage: React.FC = () => {
  const { settings, updateSettings, exportExcelDatabase, importExcelDatabase, resetToDefaults } = useApp();

  const [formSettings, setFormSettings] = useState({ ...settings });
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);
  const [isImporting, setIsImporting] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(formSettings);
    setSaveSuccessMsg('Settings saved and applied immediately!');
    setTimeout(() => setSaveSuccessMsg(null), 3000);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsImporting(true);
    try {
      await importExcelDatabase(file);
      alert('Excel workbook database imported successfully!');
    } catch (err: any) {
      alert(`Import failed: ${err.message || String(err)}`);
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="flex-1 p-3 sm:p-4 md:p-6 space-y-5 max-w-5xl mx-auto w-full min-w-0 overflow-x-hidden">
      {/* Clean Page Title Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
          System & Engine Settings
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 font-normal mt-0.5">
          Configure branding, tax options, priority engine, and Excel persistence.
        </p>
      </div>

      {saveSuccessMsg && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 p-3 rounded-xl text-xs font-semibold animate-in fade-in">
          ✓ {saveSuccessMsg}
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-5">
        {/* 1. General & POS Branding Settings */}
        <div className="bg-white border border-slate-200 p-4 sm:p-5 rounded-xl space-y-4 shadow-saas">
          <h2 className="text-base font-bold text-slate-900 flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-sky-500" />
            <span>Store Branding & Receipt Settings</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 text-xs">
            <div>
              <label className="block text-slate-500 font-medium mb-1">Restaurant Name</label>
              <input
                type="text"
                value={formSettings.restaurantName}
                onChange={(e) => setFormSettings({ ...formSettings, restaurantName: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 font-medium focus:outline-none focus:border-sky-500 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-slate-500 font-medium mb-1">Tagline</label>
              <input
                type="text"
                value={formSettings.restaurantTagline}
                onChange={(e) => setFormSettings({ ...formSettings, restaurantTagline: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 font-medium focus:outline-none focus:border-sky-500 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-slate-500 font-medium mb-1">Currency Symbol</label>
              <input
                type="text"
                value={formSettings.currencySymbol}
                onChange={(e) => setFormSettings({ ...formSettings, currencySymbol: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 font-medium focus:outline-none focus:border-sky-500 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-slate-500 font-medium mb-1">Receipt Footer Text</label>
              <input
                type="text"
                value={formSettings.receiptFooterText}
                onChange={(e) => setFormSettings({ ...formSettings, receiptFooterText: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 font-medium focus:outline-none focus:border-sky-500 focus:bg-white"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
            <label className="flex items-center space-x-3 bg-slate-50 border border-slate-200 p-3 rounded-xl cursor-pointer">
              <input
                type="checkbox"
                checked={formSettings.taxEnabled}
                onChange={(e) => setFormSettings({ ...formSettings, taxEnabled: e.target.checked })}
                className="w-4 h-4 text-sky-500 rounded accent-sky-500"
              />
              <div>
                <div className="font-semibold text-slate-800">Enable GST Tax</div>
                <div className="text-[11px] text-slate-500 font-normal">Automatically calculate tax on billing</div>
              </div>
            </label>

            <div>
              <label className="block text-slate-500 font-medium mb-1">GST Tax Percentage (%)</label>
              <input
                type="number"
                step="0.1"
                disabled={!formSettings.taxEnabled}
                value={formSettings.taxPercentage}
                onChange={(e) => setFormSettings({ ...formSettings, taxPercentage: Number(e.target.value) })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 font-medium focus:outline-none focus:border-sky-500 focus:bg-white disabled:opacity-40"
              />
            </div>
          </div>
        </div>

        {/* 2. Priority Engine Tuning */}
        <div className="bg-white border border-slate-200 p-4 sm:p-5 rounded-xl space-y-4 shadow-saas">
          <h2 className="text-base font-bold text-slate-900 flex items-center space-x-2">
            <Sliders className="w-4 h-4 text-sky-500" />
            <span>Smart Priority Algorithm Tuning</span>
          </h2>
          <p className="text-xs text-slate-500 font-normal">
            Tune queue scoring behavior dynamically without modifying source code.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 text-xs">
            <div>
              <label className="block text-slate-500 font-medium mb-1">Aging Weight</label>
              <input
                type="number"
                step="0.1"
                value={formSettings.priorityAgingWeight}
                onChange={(e) => setFormSettings({ ...formSettings, priorityAgingWeight: Number(e.target.value) })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 font-medium focus:outline-none focus:border-sky-500 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-slate-500 font-medium mb-1">Workload Weight (Per Item)</label>
              <input
                type="number"
                step="0.1"
                value={formSettings.priorityWorkloadWeight}
                onChange={(e) => setFormSettings({ ...formSettings, priorityWorkloadWeight: Number(e.target.value) })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 font-medium focus:outline-none focus:border-sky-500 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-slate-500 font-medium mb-1">Completion Bonus Weight</label>
              <input
                type="number"
                step="0.1"
                value={formSettings.priorityCompletionWeight}
                onChange={(e) => setFormSettings({ ...formSettings, priorityCompletionWeight: Number(e.target.value) })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 font-medium focus:outline-none focus:border-sky-500 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-slate-500 font-medium mb-1">Max Workload Score</label>
              <input
                type="number"
                value={formSettings.maxWorkloadScore}
                onChange={(e) => setFormSettings({ ...formSettings, maxWorkloadScore: Number(e.target.value) })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 font-medium focus:outline-none focus:border-sky-500 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-slate-500 font-medium mb-1">Anti-Starvation Threshold (Mins)</label>
              <input
                type="number"
                value={formSettings.starvationThresholdMinutes}
                onChange={(e) => setFormSettings({ ...formSettings, starvationThresholdMinutes: Number(e.target.value) })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 font-medium focus:outline-none focus:border-sky-500 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-slate-500 font-medium mb-1">Anti-Starvation Boost / Min</label>
              <input
                type="number"
                value={formSettings.starvationBoostPerMin}
                onChange={(e) => setFormSettings({ ...formSettings, starvationBoostPerMin: Number(e.target.value) })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 font-medium focus:outline-none focus:border-sky-500 focus:bg-white"
              />
            </div>
          </div>
        </div>

        {/* 3. Excel Storage & Backup Controls */}
        <div className="bg-white border border-slate-200 p-4 sm:p-5 rounded-xl space-y-4 shadow-saas">
          <h2 className="text-base font-bold text-slate-900 flex items-center space-x-2">
            <FileSpreadsheet className="w-4 h-4 text-emerald-500" />
            <span>Excel Workbook Persistence & Data Tools</span>
          </h2>

          <div className="flex flex-wrap gap-2.5 text-xs">
            <button
              type="button"
              onClick={exportExcelDatabase}
              className="bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 px-3.5 py-2 rounded-lg font-semibold flex items-center space-x-1.5 transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Download Excel Workbook (.xlsx)</span>
            </button>

            <label className="bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 px-3.5 py-2 rounded-lg font-semibold flex items-center space-x-1.5 cursor-pointer transition-colors">
              <Upload className="w-3.5 h-3.5 text-emerald-600" />
              <span>{isImporting ? 'Importing...' : 'Upload Excel Workbook'}</span>
              <input
                type="file"
                accept=".xlsx, .xls"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>

            <button
              type="button"
              onClick={() => {
                if (confirm('Reset database to default initial menu and clear order history?')) {
                  resetToDefaults();
                }
              }}
              className="bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 px-3.5 py-2 rounded-lg font-semibold flex items-center space-x-1.5 ml-auto transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5 text-rose-500" />
              <span>Reset Database to Defaults</span>
            </button>
          </div>
        </div>

        {/* 4. MS Graph Settings */}
        <div className="bg-white border border-slate-200 p-4 sm:p-5 rounded-xl space-y-4 shadow-saas">
          <h2 className="text-base font-bold text-slate-900 flex items-center space-x-2">
            <Cloud className="w-4 h-4 text-sky-500" />
            <span>Microsoft 365 / Graph API Integration</span>
          </h2>

          <label className="flex items-center space-x-3 bg-slate-50 border border-slate-200 p-3.5 rounded-xl cursor-pointer text-xs">
            <input
              type="checkbox"
              checked={formSettings.msGraphEnabled}
              onChange={(e) => setFormSettings({ ...formSettings, msGraphEnabled: e.target.checked })}
              className="w-4 h-4 text-sky-500 rounded accent-sky-500"
            />
            <div>
              <div className="font-semibold text-slate-800">Enable Microsoft Graph Online Sync</div>
              <div className="text-[11px] text-slate-500 font-normal">Sync workbook directly to OneDrive / SharePoint Online</div>
            </div>
          </label>

          {formSettings.msGraphEnabled && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs pt-1">
              <div>
                <label className="block text-slate-500 font-medium mb-1">Azure Tenant ID</label>
                <input
                  type="text"
                  placeholder="e.g. 00000000-0000-0000-0000-000000000000"
                  value={formSettings.msGraphTenantId}
                  onChange={(e) => setFormSettings({ ...formSettings, msGraphTenantId: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 font-medium focus:outline-none focus:border-sky-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-slate-500 font-medium mb-1">App Client ID</label>
                <input
                  type="text"
                  placeholder="e.g. 00000000-0000-0000-0000-000000000000"
                  value={formSettings.msGraphClientId}
                  onChange={(e) => setFormSettings({ ...formSettings, msGraphClientId: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 font-medium focus:outline-none focus:border-sky-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-slate-500 font-medium mb-1">OneDrive Drive Item ID</label>
                <input
                  type="text"
                  placeholder="Drive Item ID for Flow_POS_Database.xlsx"
                  value={formSettings.msGraphDriveItemId}
                  onChange={(e) => setFormSettings({ ...formSettings, msGraphDriveItemId: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 font-medium focus:outline-none focus:border-sky-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-slate-500 font-medium mb-1">Remote File Name</label>
                <input
                  type="text"
                  value={formSettings.msGraphFileName}
                  onChange={(e) => setFormSettings({ ...formSettings, msGraphFileName: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 font-medium focus:outline-none focus:border-sky-500 focus:bg-white"
                />
              </div>
            </div>
          )}
        </div>

        {/* Save Settings Button */}
        <div className="flex justify-end pt-1">
          <button
            type="submit"
            className="bg-sky-500 hover:bg-sky-600 active:scale-95 text-white font-semibold px-6 py-2.5 rounded-lg flex items-center space-x-2 transition-all shadow-sm border border-sky-600 text-xs sm:text-sm"
          >
            <Save className="w-4 h-4" />
            <span>Save Settings</span>
          </button>
        </div>
      </form>
    </div>
  );
};
