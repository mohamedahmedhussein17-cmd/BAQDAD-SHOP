import React, { useState } from 'react';
import { useShop } from '../context/ShopContext';
import {
  Store,
  ShoppingCart,
  Package,
  Plus,
  ArrowUpRight,
  CreditCard,
  Receipt,
  Search,
  TrendingUp,
  ShieldAlert,
  Sparkles,
  CheckCircle2,
  Users
} from 'lucide-react';

export const FrontPage: React.FC = () => {
  const {
    settings,
    products,
    sales,
    customers,
    debts,
    expenses,
    openRecordSaleModal,
    setActivePage,
    formatCurrency,
    lowStockProducts,
    outOfStockProducts,
    totalSalesValue,
    totalRevenueCashCollected,
    totalCustomerDebt
  } = useShop();

  const [quickLookupQuery, setQuickLookupQuery] = useState('');

  // Quick lookup search
  const lookupResults = quickLookupQuery.trim()
    ? products.filter(
        p =>
          p.name.toLowerCase().includes(quickLookupQuery.toLowerCase()) ||
          p.sku.toLowerCase().includes(quickLookupQuery.toLowerCase()) ||
          p.category.toLowerCase().includes(quickLookupQuery.toLowerCase())
      )
    : [];

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Front Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#4A2E1B] via-[#5C3826] to-[#734A33] text-white p-8 md:p-10 shadow-lg border border-[#3E2312]">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-xs text-xs font-semibold text-[#F7EFE6] mb-4">
            <Store className="w-3.5 h-3.5" />
            <span>{settings.shopName} · Welcome Front Portal</span>
          </div>

          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white mb-3 leading-tight">
            Seamless Shop Operations & POS Control
          </h1>
          <p className="text-sm md:text-base text-[#E6DACD] leading-relaxed mb-6">
            Easily manage sales, monitor product stock in real time, record customer credit ledgers, and maintain accurate financial revenue and expenses.
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={openRecordSaleModal}
              className="flex items-center gap-2 px-6 py-3.5 bg-white text-[#5C3826] font-bold text-sm rounded-2xl shadow-md hover:bg-[#FAF7F2] transition-all cursor-pointer active:scale-95"
            >
              <ShoppingCart className="w-4 h-4 text-[#5C3826]" />
              <span>Open POS Cashier</span>
            </button>

            <button
              onClick={() => setActivePage('dashboard')}
              className="flex items-center gap-2 px-6 py-3.5 bg-white/15 hover:bg-white/20 text-white font-semibold text-sm rounded-2xl border border-white/20 backdrop-blur-xs transition-all cursor-pointer"
            >
              <span>View Full Dashboard</span>
              <TrendingUp className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Decorative corner accent */}
        <div className="absolute right-0 bottom-0 translate-x-12 translate-y-12 w-80 h-80 rounded-full bg-white/5 pointer-events-none blur-2xl" />
      </div>

      {/* Instant Product & Price Checker Tool */}
      <div className="bg-white rounded-3xl p-6 border border-[#EBE3D7] shadow-[0_2px_12px_rgba(74,46,27,0.03)]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div>
            <h2 className="text-base font-bold text-[#231F1C] flex items-center gap-2">
              <Search className="w-4 h-4 text-[#5C3826]" />
              <span>Fast Counter Price & Stock Checker</span>
            </h2>
            <p className="text-xs text-[#8C7E72]">
              Instant search for counter clerks to verify selling prices, SKU, and available units.
            </p>
          </div>

          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9E9285]" />
            <input
              type="text"
              placeholder="Search product name or SKU..."
              value={quickLookupQuery}
              onChange={e => setQuickLookupQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-[#FAF7F2] border border-[#E2D9CC] rounded-xl text-xs focus:outline-hidden focus:ring-2 focus:ring-[#5C3826]"
            />
          </div>
        </div>

        {/* Search Results Drawer */}
        {quickLookupQuery.trim() !== '' && (
          <div className="mt-3 border-t border-[#F5EFE6] pt-3">
            {lookupResults.length === 0 ? (
              <p className="text-xs text-[#8C7E72] py-4 text-center">
                No products found matching "{quickLookupQuery}".
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {lookupResults.map(p => {
                  const isOut = p.quantity <= 0;
                  const isLow = p.quantity > 0 && p.quantity <= p.lowStockThreshold;

                  return (
                    <div
                      key={p.id}
                      className="p-3.5 bg-[#FAF7F2] rounded-2xl border border-[#EBE3D7] flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between text-[11px] mb-1">
                          <span className="font-semibold text-[#8C7E72] uppercase">{p.category}</span>
                          <span className="font-mono text-[#9E9285]">{p.sku}</span>
                        </div>
                        <h4 className="text-xs font-bold text-[#231F1C]">{p.name}</h4>
                      </div>

                      <div className="mt-3 pt-2 border-t border-[#EAE2D5] flex items-center justify-between">
                        <div>
                          <span className="text-[10px] text-[#8C7E72] block">Price</span>
                          <span className="font-mono font-bold text-sm text-[#5C3826]">
                            {formatCurrency(p.sellingPrice)}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] text-[#8C7E72] block">Stock</span>
                          <span
                            className={`font-mono font-bold text-xs ${
                              isOut ? 'text-rose-700' : isLow ? 'text-amber-700' : 'text-emerald-700'
                            }`}
                          >
                            {isOut ? 'Out of Stock' : `${p.quantity} units`}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Quick Action Navigation Hub */}
      <div>
        <h2 className="text-sm font-bold uppercase tracking-wider text-[#8C6D53] mb-4">
          Quick Workflows & Actions
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Action 1: Inventory */}
          <button
            onClick={() => setActivePage('inventory')}
            className="p-5 bg-white rounded-3xl border border-[#EBE3D7] hover:border-[#5C3826]/40 hover:shadow-xs transition-all text-left flex flex-col justify-between group cursor-pointer"
          >
            <div className="w-10 h-10 rounded-2xl bg-[#F4EAE0] text-[#5C3826] flex items-center justify-center group-hover:scale-105 transition-transform">
              <Package className="w-5 h-5" />
            </div>
            <div className="mt-4">
              <h3 className="text-sm font-bold text-[#231F1C]">Inventory Management</h3>
              <p className="text-xs text-[#8C7E72] mt-1">
                {products.length} products listed. Add, edit, delete, or restock items.
              </p>
            </div>
          </button>

          {/* Action 2: Sales */}
          <button
            onClick={() => setActivePage('sales')}
            className="p-5 bg-white rounded-3xl border border-[#EBE3D7] hover:border-[#5C3826]/40 hover:shadow-xs transition-all text-left flex flex-col justify-between group cursor-pointer"
          >
            <div className="w-10 h-10 rounded-2xl bg-[#E2F1E5] text-[#2D6A4F] flex items-center justify-center group-hover:scale-105 transition-transform">
              <ShoppingCart className="w-5 h-5" />
            </div>
            <div className="mt-4">
              <h3 className="text-sm font-bold text-[#231F1C]">Sales & Reports</h3>
              <p className="text-xs text-[#8C7E72] mt-1">
                Filter sales daily, weekly, monthly, and yearly.
              </p>
            </div>
          </button>

          {/* Action 3: Customer Debt */}
          <button
            onClick={() => setActivePage('customer-debts')}
            className="p-5 bg-white rounded-3xl border border-[#EBE3D7] hover:border-[#5C3826]/40 hover:shadow-xs transition-all text-left flex flex-col justify-between group cursor-pointer"
          >
            <div className="w-10 h-10 rounded-2xl bg-[#F7E6E2] text-[#B02A37] flex items-center justify-center group-hover:scale-105 transition-transform">
              <CreditCard className="w-5 h-5" />
            </div>
            <div className="mt-4">
              <h3 className="text-sm font-bold text-[#231F1C]">Customer Debts</h3>
              <p className="text-xs text-[#8C7E72] mt-1">
                {formatCurrency(totalCustomerDebt)} owed by customers. Record payments.
              </p>
            </div>
          </button>

          {/* Action 4: Expenses */}
          <button
            onClick={() => setActivePage('expenses')}
            className="p-5 bg-white rounded-3xl border border-[#EBE3D7] hover:border-[#5C3826]/40 hover:shadow-xs transition-all text-left flex flex-col justify-between group cursor-pointer"
          >
            <div className="w-10 h-10 rounded-2xl bg-[#FAF0E1] text-[#9A6218] flex items-center justify-center group-hover:scale-105 transition-transform">
              <Receipt className="w-5 h-5" />
            </div>
            <div className="mt-4">
              <h3 className="text-sm font-bold text-[#231F1C]">Expense Tracker</h3>
              <p className="text-xs text-[#8C7E72] mt-1">
                Track shop rent, electricity, salaries, and operating overhead.
              </p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};
