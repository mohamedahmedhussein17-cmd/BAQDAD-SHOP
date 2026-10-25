import React, { useState, useEffect } from 'react';
import { useShop } from '../context/ShopContext';
import {
  Settings,
  Store,
  DollarSign,
  Download,
  Upload,
  RotateCcw,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  User,
  FileSpreadsheet,
  Database,
  Cloud,
  RefreshCw,
  Copy,
  Check,
  X,
  ExternalLink,
  Code2
} from 'lucide-react';
import {
  getStoredSupabaseConfig,
  saveStoredSupabaseConfig,
  testSupabaseConnection,
  getSupabaseSQLSchema,
  pushAllToSupabase,
  pullAllFromSupabase
} from '../lib/supabase';

const CURRENCIES = [
  { code: '$', label: 'USD ($) - US Dollar' },
  { code: 'IQD ', label: 'IQD - Iraqi Dinar' },
  { code: '€', label: 'EUR (€) - Euro' },
  { code: '£', label: 'GBP (£) - British Pound' },
  { code: 'AED ', label: 'AED - UAE Dirham' },
  { code: 'SAR ', label: 'SAR - Saudi Riyal' }
];

export const SettingsPage: React.FC = () => {
  const {
    settings,
    updateSettings,
    products,
    sales,
    customers,
    debts,
    expenses,
    stockMovements,
    exportBackupJSON,
    importBackupJSON,
    resetToDemoData,
    clearAllData
  } = useShop();

  const [shopName, setShopName] = useState(settings.shopName);
  const [tagline, setTagline] = useState(settings.tagline);
  const [currency, setCurrency] = useState(settings.currency);
  const [phone, setPhone] = useState(settings.phone);
  const [address, setAddress] = useState(settings.address);
  const [defaultThreshold, setDefaultThreshold] = useState(settings.defaultLowStockThreshold.toString());
  const [adminName, setAdminName] = useState(settings.adminName);
  const [adminEmail, setAdminEmail] = useState(settings.adminEmail);
  const [adminRole, setAdminRole] = useState(settings.adminRole);

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);

  // Supabase State
  const [supabaseUrl, setSupabaseUrl] = useState('');
  const [supabaseAnonKey, setSupabaseAnonKey] = useState('');
  const [isTestingSupabase, setIsTestingSupabase] = useState(false);
  const [supabaseTestResult, setSupabaseTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);
  const [showSqlModal, setShowSqlModal] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);

  useEffect(() => {
    const config = getStoredSupabaseConfig();
    setSupabaseUrl(config.url || '');
    setSupabaseAnonKey(config.anonKey || '');
  }, []);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      shopName: shopName.trim(),
      tagline: tagline.trim(),
      currency,
      phone: phone.trim(),
      address: address.trim(),
      defaultLowStockThreshold: parseInt(defaultThreshold, 10) || 5,
      adminName: adminName.trim(),
      adminEmail: adminEmail.trim(),
      adminRole: adminRole.trim()
    });

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  // Test Supabase Connection
  const handleTestSupabase = async () => {
    if (!supabaseUrl.trim() || !supabaseAnonKey.trim()) {
      setSupabaseTestResult({
        success: false,
        message: 'Please provide both your Supabase Project URL and Anon/Public API Key.'
      });
      return;
    }

    setIsTestingSupabase(true);
    setSupabaseTestResult(null);

    const res = await testSupabaseConnection(supabaseUrl.trim(), supabaseAnonKey.trim());
    setIsTestingSupabase(false);
    setSupabaseTestResult(res);

    if (res.success) {
      saveStoredSupabaseConfig({
        url: supabaseUrl.trim(),
        anonKey: supabaseAnonKey.trim(),
        isConnected: true
      });
    }
  };

  // Save Supabase Configuration
  const handleSaveSupabaseConfig = () => {
    saveStoredSupabaseConfig({
      url: supabaseUrl.trim(),
      anonKey: supabaseAnonKey.trim(),
      isConnected: !!(supabaseUrl.trim() && supabaseAnonKey.trim())
    });
    setSyncStatus('Supabase configuration saved locally.');
    setTimeout(() => setSyncStatus(null), 3000);
  };

  // Push Local Data to Supabase
  const handlePushToSupabase = async () => {
    if (!supabaseUrl.trim() || !supabaseAnonKey.trim()) {
      setSyncStatus('Please configure and test your Supabase connection first.');
      return;
    }

    // Save first
    handleSaveSupabaseConfig();

    setIsSyncing(true);
    setSyncStatus('Pushing products, sales, customers, debts & expenses to Supabase...');

    const res = await pushAllToSupabase({
      products,
      sales,
      customers,
      debts,
      expenses,
      stockMovements
    });

    setIsSyncing(false);
    setSyncStatus(res.message);
    setTimeout(() => setSyncStatus(null), 5000);
  };

  // Pull Data from Supabase into Local Store
  const handlePullFromSupabase = async () => {
    if (!supabaseUrl.trim() || !supabaseAnonKey.trim()) {
      setSyncStatus('Please configure and test your Supabase connection first.');
      return;
    }

    handleSaveSupabaseConfig();

    setIsSyncing(true);
    setSyncStatus('Fetching tables from Supabase...');

    const res = await pullAllFromSupabase();
    setIsSyncing(false);

    if (res.success && res.data) {
      const { products: p, sales: s, customers: c, debts: d, expenses: e, stockMovements: m } = res.data;
      if (p.length > 0 || s.length > 0 || c.length > 0) {
        importBackupJSON(JSON.stringify({
          products: p,
          sales: s,
          customers: c,
          debts: d,
          expenses: e,
          stockMovements: m
        }));
        setSyncStatus(`Successfully loaded ${p.length} products, ${s.length} sales, and ${c.length} customers from Supabase!`);
      } else {
        setSyncStatus('Connected to Supabase, but tables are currently empty. Click "Push All Data to Supabase" to upload your records.');
      }
    } else {
      setSyncStatus(res.message);
    }

    setTimeout(() => setSyncStatus(null), 6000);
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(getSupabaseSQLSchema());
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
  };

  // Export inventory as CSV
  const handleExportInventoryCSV = () => {
    const headers = ['SKU', 'Name', 'Category', 'Quantity', 'CostPrice', 'SellingPrice', 'Supplier'];
    const rows = products.map(p => [
      p.sku,
      `"${p.name.replace(/"/g, '""')}"`,
      `"${p.category}"`,
      p.quantity,
      p.costPrice,
      p.sellingPrice,
      `"${(p.supplier || '').replace(/"/g, '""')}"`
    ]);
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `inventory-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export sales as CSV
  const handleExportSalesCSV = () => {
    const headers = ['InvoiceNumber', 'Date', 'Customer', 'TotalAmount', 'Profit', 'PaymentMethod', 'Status'];
    const rows = sales.map(s => [
      s.invoiceNumber,
      s.date,
      `"${(s.customerName || 'Walk-in').replace(/"/g, '""')}"`,
      s.totalAmount,
      s.netProfit,
      s.paymentMethod,
      s.paymentStatus
    ]);
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `sales-records-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Handle JSON file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = event => {
      const content = event.target?.result as string;
      if (content) {
        const ok = importBackupJSON(content);
        if (ok) {
          setImportStatus('Backup restored successfully!');
        } else {
          setImportStatus('Invalid JSON backup file format.');
        }
        setTimeout(() => setImportStatus(null), 4000);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-[#231F1C] tracking-tight">
          System & Backend Settings
        </h1>
        <p className="text-xs md:text-sm text-[#7D7065] mt-1">
          Connect your custom Supabase PostgreSQL backend, customize shop identity, and manage data backups.
        </p>
      </div>

      {savedSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-2 text-xs font-semibold text-emerald-800 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Shop settings saved successfully!</span>
        </div>
      )}

      {importStatus && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-center gap-2 text-xs font-semibold text-amber-900 animate-in fade-in">
          <AlertTriangle className="w-4 h-4 text-amber-600" />
          <span>{importStatus}</span>
        </div>
      )}

      {/* SUPABASE BACKEND INTEGRATION CARD */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-[#3ECF8E]/40 shadow-[0_4px_20px_rgba(62,207,142,0.06)] space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#F0E9DF] gap-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#3ECF8E]/15 text-[#16A34A] flex items-center justify-center font-bold">
              <Database className="w-6 h-6 text-[#15803D]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-[#231F1C]">Supabase PostgreSQL Backend</h2>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#E2F1E5] text-[#15803D]">
                  Active Engine
                </span>
              </div>
              <p className="text-xs text-[#8C7E72]">
                Connect your personal Supabase project to persist products, sales, and debt records in cloud PostgreSQL.
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowSqlModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#FAF7F2] hover:bg-[#F2ECE3] border border-[#E2D9CC] rounded-xl text-xs font-semibold text-[#5C3826] cursor-pointer self-start sm:self-auto"
          >
            <Code2 className="w-4 h-4 text-[#5C3826]" />
            <span>View SQL Schema</span>
          </button>
        </div>

        {/* Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-[#5C3826] uppercase tracking-wider mb-1.5">
              Supabase Project URL *
            </label>
            <input
              type="url"
              placeholder="https://xyzabcdefghijklm.supabase.co"
              value={supabaseUrl}
              onChange={e => setSupabaseUrl(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#FAF7F2] border border-[#E2D9CC] rounded-xl text-xs font-mono focus:outline-hidden focus:ring-2 focus:ring-[#15803D]"
            />
            <span className="text-[10px] text-[#8C7E72] mt-1 block">
              Found in your Supabase Dashboard: <strong>Project Settings → API → Project URL</strong>
            </span>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#5C3826] uppercase tracking-wider mb-1.5">
              Supabase Anon / Public Key *
            </label>
            <input
              type="password"
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6..."
              value={supabaseAnonKey}
              onChange={e => setSupabaseAnonKey(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#FAF7F2] border border-[#E2D9CC] rounded-xl text-xs font-mono focus:outline-hidden focus:ring-2 focus:ring-[#15803D]"
            />
            <span className="text-[10px] text-[#8C7E72] mt-1 block">
              Found in your Supabase Dashboard: <strong>Project Settings → API → Project API Keys (anon/public)</strong>
            </span>
          </div>
        </div>

        {/* Test Result Message */}
        {supabaseTestResult && (
          <div
            className={`p-3.5 rounded-2xl border text-xs flex items-center gap-2 animate-in fade-in ${
              supabaseTestResult.success
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-rose-50 border-rose-200 text-rose-800'
            }`}
          >
            {supabaseTestResult.success ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{supabaseTestResult.message}</span>
          </div>
        )}

        {/* Sync Status Banner */}
        {syncStatus && (
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs font-semibold text-amber-900 animate-in fade-in flex items-center gap-2">
            <RefreshCw className={`w-4 h-4 text-amber-700 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{syncStatus}</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            type="button"
            onClick={handleTestSupabase}
            disabled={isTestingSupabase}
            className="px-4 py-2.5 bg-white border border-[#15803D] text-[#15803D] hover:bg-emerald-50 font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Cloud className="w-4 h-4" />
            <span>{isTestingSupabase ? 'Testing...' : 'Test Connection'}</span>
          </button>

          <button
            type="button"
            onClick={handlePushToSupabase}
            disabled={isSyncing}
            className="px-4 py-2.5 bg-[#15803D] hover:bg-[#166534] text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Upload className="w-4 h-4" />
            <span>Push All Local Data to Supabase</span>
          </button>

          <button
            type="button"
            onClick={handlePullFromSupabase}
            disabled={isSyncing}
            className="px-4 py-2.5 bg-[#FAF7F2] hover:bg-[#F2ECE3] border border-[#E2D9CC] text-[#2D2723] font-semibold text-xs rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Pull Data from Supabase</span>
          </button>
        </div>
      </div>

      {/* Store Identity Settings Form */}
      <form onSubmit={handleSaveProfile} className="bg-white rounded-3xl p-6 md:p-8 border border-[#EBE3D7] shadow-xs space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-[#F0E9DF]">
          <div className="w-10 h-10 rounded-xl bg-[#5C3826] text-white flex items-center justify-center">
            <Store className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-[#231F1C]">Shop Profile & Identity</h2>
            <p className="text-xs text-[#8C7E72]">Appears on receipts, top banners, and customer statements.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-[#5C3826] uppercase tracking-wider mb-1.5">
              Shop Name *
            </label>
            <input
              type="text"
              required
              value={shopName}
              onChange={e => setShopName(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#FAF7F2] border border-[#E2D9CC] rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-[#5C3826]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#5C3826] uppercase tracking-wider mb-1.5">
              Tagline / Subtitle
            </label>
            <input
              type="text"
              value={tagline}
              onChange={e => setTagline(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#FAF7F2] border border-[#E2D9CC] rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-[#5C3826]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#5C3826] uppercase tracking-wider mb-1.5">
              Store Currency
            </label>
            <select
              value={currency}
              onChange={e => setCurrency(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#FAF7F2] border border-[#E2D9CC] rounded-xl text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-[#5C3826]"
            >
              {CURRENCIES.map(c => (
                <option key={c.code} value={c.code}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#5C3826] uppercase tracking-wider mb-1.5">
              Default Low Stock Alert Threshold
            </label>
            <input
              type="number"
              min="1"
              value={defaultThreshold}
              onChange={e => setDefaultThreshold(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#FAF7F2] border border-[#E2D9CC] rounded-xl text-sm font-mono focus:outline-hidden focus:ring-2 focus:ring-[#5C3826]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#5C3826] uppercase tracking-wider mb-1.5">
              Shop Phone Number
            </label>
            <input
              type="text"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#FAF7F2] border border-[#E2D9CC] rounded-xl text-sm font-mono focus:outline-hidden focus:ring-2 focus:ring-[#5C3826]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#5C3826] uppercase tracking-wider mb-1.5">
              Store Physical Address
            </label>
            <input
              type="text"
              value={address}
              onChange={e => setAddress(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#FAF7F2] border border-[#E2D9CC] rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-[#5C3826]"
            />
          </div>
        </div>

        {/* User / Administrator Profile */}
        <div className="pt-4 border-t border-[#F0E9DF]">
          <h3 className="text-xs font-bold text-[#5C3826] uppercase tracking-wider mb-3">
            Administrator Profile
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-[11px] font-semibold text-[#706458] mb-1">
                Display Name
              </label>
              <input
                type="text"
                value={adminName}
                onChange={e => setAdminName(e.target.value)}
                className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#E2D9CC] rounded-xl text-xs"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-[#706458] mb-1">
                Email
              </label>
              <input
                type="email"
                value={adminEmail}
                onChange={e => setAdminEmail(e.target.value)}
                className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#E2D9CC] rounded-xl text-xs"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-[#706458] mb-1">
                Role Label
              </label>
              <input
                type="text"
                value={adminRole}
                onChange={e => setAdminRole(e.target.value)}
                className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#E2D9CC] rounded-xl text-xs"
              />
            </div>
          </div>
        </div>

        <div className="pt-2">
          <button
            type="submit"
            className="px-6 py-3 bg-[#5C3826] hover:bg-[#482B1D] text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            Save Store Configuration
          </button>
        </div>
      </form>

      {/* Data Management & Backup Center */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-[#EBE3D7] shadow-xs space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-[#F0E9DF]">
          <div className="w-10 h-10 rounded-xl bg-[#FAF5EE] text-[#5C3826] flex items-center justify-center">
            <Download className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-[#231F1C]">Data Backup & Export Center</h2>
            <p className="text-xs text-[#8C7E72]">
              Safely backup all products, transactions, customer accounts, and debt ledgers.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* JSON Full Backup */}
          <div className="p-4 bg-[#FAF7F2] rounded-2xl border border-[#EAE2D5] flex flex-col justify-between">
            <div>
              <h4 className="text-xs font-bold text-[#231F1C]">Full Database Backup</h4>
              <p className="text-[11px] text-[#8C7E72] mt-1">
                Export complete shop state to JSON.
              </p>
            </div>
            <button
              onClick={exportBackupJSON}
              className="mt-4 px-3 py-2 text-xs font-bold text-[#5C3826] bg-white hover:bg-[#F2ECE3] border border-[#E2D9CC] rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download JSON</span>
            </button>
          </div>

          {/* Restore JSON Backup */}
          <div className="p-4 bg-[#FAF7F2] rounded-2xl border border-[#EAE2D5] flex flex-col justify-between">
            <div>
              <h4 className="text-xs font-bold text-[#231F1C]">Restore Database</h4>
              <p className="text-[11px] text-[#8C7E72] mt-1">
                Import from previous JSON file.
              </p>
            </div>
            <label className="mt-4 px-3 py-2 text-xs font-bold text-[#5C3826] bg-white hover:bg-[#F2ECE3] border border-[#E2D9CC] rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer text-center">
              <Upload className="w-3.5 h-3.5" />
              <span>Choose File</span>
              <input type="file" accept=".json" onChange={handleFileUpload} className="hidden" />
            </label>
          </div>

          {/* Export Inventory CSV */}
          <div className="p-4 bg-[#FAF7F2] rounded-2xl border border-[#EAE2D5] flex flex-col justify-between">
            <div>
              <h4 className="text-xs font-bold text-[#231F1C]">Export Products CSV</h4>
              <p className="text-[11px] text-[#8C7E72] mt-1">
                Spreadsheet of all items and prices.
              </p>
            </div>
            <button
              onClick={handleExportInventoryCSV}
              className="mt-4 px-3 py-2 text-xs font-bold text-[#5C3826] bg-white hover:bg-[#F2ECE3] border border-[#E2D9CC] rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
          </div>

          {/* Export Sales CSV */}
          <div className="p-4 bg-[#FAF7F2] rounded-2xl border border-[#EAE2D5] flex flex-col justify-between">
            <div>
              <h4 className="text-xs font-bold text-[#231F1C]">Export Sales CSV</h4>
              <p className="text-[11px] text-[#8C7E72] mt-1">
                Transaction records and profits.
              </p>
            </div>
            <button
              onClick={handleExportSalesCSV}
              className="mt-4 px-3 py-2 text-xs font-bold text-[#5C3826] bg-white hover:bg-[#F2ECE3] border border-[#E2D9CC] rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Danger & Reset Zone */}
        <div className="pt-6 border-t border-[#F0E9DF] flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div>
            <h4 className="text-xs font-bold text-rose-800 uppercase tracking-wider">
              Database Maintenance
            </h4>
            <p className="text-xs text-[#8C7E72]">
              Reset demo catalog or clear store data.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (window.confirm('Reset all catalog and transaction data to default demo state?')) {
                  resetToDemoData();
                }
              }}
              className="px-4 py-2 text-xs font-semibold text-[#5C3826] bg-[#FAF5EE] hover:bg-[#F2ECE3] border border-[#E2D9CC] rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset to Demo Data</span>
            </button>

            <button
              onClick={() => {
                if (window.confirm('WARNING: Are you sure you want to erase ALL products, sales, and debt records?')) {
                  clearAllData();
                }
              }}
              className="px-4 py-2 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Wipe Store Data</span>
            </button>
          </div>
        </div>
      </div>

      {/* SQL Schema Modal for Supabase SQL Editor */}
      {showSqlModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white border border-[#E7DFD3] rounded-3xl w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#F0E9DF] bg-[#FAF7F2]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#15803D] text-white flex items-center justify-center">
                  <Database className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#231F1C]">Supabase PostgreSQL Table Schema</h3>
                  <p className="text-xs text-[#8C7E72]">Copy and execute this script in your Supabase SQL Editor.</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopySql}
                  className="flex items-center gap-1 px-3 py-1.5 bg-[#15803D] text-white rounded-xl text-xs font-bold hover:bg-[#166534] transition-colors cursor-pointer"
                >
                  {copiedSql ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedSql ? 'Copied!' : 'Copy SQL'}</span>
                </button>
                <button
                  onClick={() => setShowSqlModal(false)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-[#8C7E72] hover:bg-[#F2ECE3]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto bg-[#1E1E1E] text-emerald-400 font-mono text-xs leading-relaxed">
              <pre className="whitespace-pre-wrap">{getSupabaseSQLSchema()}</pre>
            </div>

            <div className="p-4 border-t border-[#F0E9DF] bg-[#FAF7F2] flex justify-between items-center text-xs text-[#8C7E72]">
              <span>In Supabase: Go to <strong>SQL Editor → New Query → Paste → Run</strong></span>
              <button
                onClick={() => setShowSqlModal(false)}
                className="px-4 py-1.5 bg-white border border-[#E2D9CC] rounded-xl text-[#5C3826] font-semibold hover:bg-[#F2ECE3]"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
