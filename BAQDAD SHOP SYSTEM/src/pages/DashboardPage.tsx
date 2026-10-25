import React, { useState } from 'react';
import { useShop } from '../context/ShopContext';
import {
  DollarSign,
  TrendingUp,
  Package,
  CreditCard,
  Plus,
  AlertTriangle,
  ArrowUpRight,
  ArrowRight,
  Clock,
  Sparkles,
  ShoppingBag,
  CheckCircle2
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const {
    products,
    sales,
    customers,
    debts,
    expenses,
    settings,
    openRecordSaleModal,
    setActivePage,
    formatCurrency,
    lowStockProducts,
    outOfStockProducts,
    totalSalesValue,
    totalRevenueCashCollected,
    totalCustomerDebt,
    grossProfitTotal
  } = useShop();

  const [salesTimeframe, setSalesTimeframe] = useState<'today' | 'week' | 'month'>('today');

  // Calculate stock status percentages
  const totalProductsCount = products.length;
  const inStockCount = products.filter(p => p.quantity > p.lowStockThreshold).length;
  const lowStockCount = lowStockProducts.length;
  const outOfStockCount = outOfStockProducts.length;

  const inStockPercent = totalProductsCount > 0 ? Math.round((inStockCount / totalProductsCount) * 100) : 0;
  const lowStockPercent = totalProductsCount > 0 ? Math.round((lowStockCount / totalProductsCount) * 100) : 0;
  const outStockPercent = totalProductsCount > 0 ? Math.round((outOfStockCount / totalProductsCount) * 100) : 0;

  // Recent sales (up to 5)
  const recentSales = sales.slice(0, 5);

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Low Stock Warning Banner if applicable */}
      {(lowStockCount > 0 || outOfStockCount > 0) && (
        <div className="bg-amber-50/90 border border-amber-200/90 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-800 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-amber-900">
                Inventory Attention Required ({lowStockCount + outOfStockCount} items)
              </h4>
              <p className="text-xs text-amber-800">
                {outOfStockCount > 0 && `${outOfStockCount} products are completely out of stock. `}
                {lowStockCount > 0 && `${lowStockCount} items are below their reorder threshold.`}
              </p>
            </div>
          </div>
          <button
            onClick={() => setActivePage('inventory')}
            className="px-4 py-2 text-xs font-semibold text-amber-900 bg-white border border-amber-300 rounded-xl hover:bg-amber-100 transition-colors shrink-0 self-start sm:self-auto cursor-pointer"
          >
            Review & Restock
          </button>
        </div>
      )}

      {/* Greeting Banner matching Screenshot */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold tracking-[0.18em] text-[#8C6D53] uppercase block mb-1">
            YOUR BUSINESS AT A GLANCE
          </span>
          <h1 className="text-3xl md:text-4xl font-extrabold text-[#231F1C] tracking-tight flex items-center gap-2">
            <span>Good day, {settings.adminName || 'Administrator'}</span>
            <span className="text-[#8C6D53] text-2xl font-normal">✦</span>
          </h1>
          <p className="text-sm text-[#7D7065] mt-1 font-medium">
            Here is what is happening in your shop today.
          </p>
        </div>

        {/* Primary Action Button matching Screenshot */}
        <button
          onClick={openRecordSaleModal}
          className="self-start md:self-auto flex items-center gap-2 px-6 py-3.5 bg-[#5C3826] hover:bg-[#482B1D] active:scale-[0.98] text-white font-semibold text-sm rounded-2xl shadow-sm transition-all cursor-pointer whitespace-nowrap"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Record a Sale</span>
        </button>
      </div>

      {/* 4 Metric Cards Grid matching Screenshot */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
        {/* Card 1: Total Sales */}
        <div className="bg-white rounded-3xl p-5 border border-[#EBE3D7] shadow-[0_2px_12px_rgba(74,46,27,0.03)] hover:border-[#D6C7B7] transition-all flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <span className="text-xs font-semibold text-[#7D7065]">Total Sales</span>
            <div className="w-9 h-9 rounded-2xl bg-[#F4EAE0] flex items-center justify-center text-[#5C3826]">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl md:text-3xl font-extrabold text-[#231F1C] font-mono tracking-tight tabular-nums">
              {formatCurrency(totalSalesValue)}
            </h3>
            <p className="text-xs text-[#8C7E72] mt-1 font-medium">
              All recorded sales ({sales.length} transactions)
            </p>
          </div>
        </div>

        {/* Card 2: Revenue */}
        <div className="bg-white rounded-3xl p-5 border border-[#EBE3D7] shadow-[0_2px_12px_rgba(74,46,27,0.03)] hover:border-[#D6C7B7] transition-all flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <span className="text-xs font-semibold text-[#7D7065]">Revenue</span>
            <div className="w-9 h-9 rounded-2xl bg-[#E2F1E5] flex items-center justify-center text-[#2D6A4F]">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl md:text-3xl font-extrabold text-[#231F1C] font-mono tracking-tight tabular-nums">
              {formatCurrency(totalRevenueCashCollected)}
            </h3>
            <p className="text-xs text-[#8C7E72] mt-1 font-medium">
              From completed sales & payments
            </p>
          </div>
        </div>

        {/* Card 3: Products in Stock */}
        <div className="bg-white rounded-3xl p-5 border border-[#EBE3D7] shadow-[0_2px_12px_rgba(74,46,27,0.03)] hover:border-[#D6C7B7] transition-all flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <span className="text-xs font-semibold text-[#7D7065]">Products in Stock</span>
            <div className="w-9 h-9 rounded-2xl bg-[#E5EEF7] flex items-center justify-center text-[#2A6F97]">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl md:text-3xl font-extrabold text-[#231F1C] font-mono tracking-tight tabular-nums">
              {products.reduce((acc, p) => acc + p.quantity, 0)}
            </h3>
            <p className="text-xs text-[#8C7E72] mt-1 font-medium">
              Across {totalProductsCount} different products
            </p>
          </div>
        </div>

        {/* Card 4: Outstanding Debt */}
        <div className="bg-white rounded-3xl p-5 border border-[#EBE3D7] shadow-[0_2px_12px_rgba(74,46,27,0.03)] hover:border-[#D6C7B7] transition-all flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <span className="text-xs font-semibold text-[#7D7065]">Outstanding Debt</span>
            <div className="w-9 h-9 rounded-2xl bg-[#F7E6E2] flex items-center justify-center text-[#B02A37]">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl md:text-3xl font-extrabold text-[#231F1C] font-mono tracking-tight tabular-nums">
              {formatCurrency(totalCustomerDebt)}
            </h3>
            <p className="text-xs text-[#8C7E72] mt-1 font-medium">
              Awaiting customer payment
            </p>
          </div>
        </div>
      </div>

      {/* Main Grid: Sales Overview & Stock Status */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sales Overview Card (8 cols) */}
        <div className="lg:col-span-8 bg-white rounded-3xl p-6 border border-[#EBE3D7] shadow-[0_2px_12px_rgba(74,46,27,0.03)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-[#F5EFE6]">
              <div>
                <h3 className="text-base font-bold text-[#231F1C]">Sales Overview</h3>
                <p className="text-xs text-[#8C7E72]">A simple view of your recent sales</p>
              </div>

              {/* Segmented control */}
              <div className="flex items-center gap-1 p-1 bg-[#FAF7F2] border border-[#EBE3D7] rounded-xl text-xs font-medium">
                <button
                  onClick={() => setSalesTimeframe('today')}
                  className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                    salesTimeframe === 'today'
                      ? 'bg-[#5C3826] text-white shadow-xs font-semibold'
                      : 'text-[#7D7065] hover:text-[#231F1C]'
                  }`}
                >
                  Recent Activity
                </button>
                <button
                  onClick={() => setActivePage('sales')}
                  className="px-3 py-1.5 text-[#7D7065] hover:text-[#5C3826] flex items-center gap-1 transition-colors"
                >
                  <span>Full Ledger</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* Quick Chart Visual / Mini SVG Graphic */}
            <div className="my-6">
              <div className="h-44 w-full flex items-end justify-between gap-3 pt-6 pb-2 px-2">
                {recentSales.map((sale, i) => {
                  const maxAmt = Math.max(...recentSales.map(s => s.totalAmount), 100);
                  const barHeight = Math.max(20, Math.round((sale.totalAmount / maxAmt) * 120));

                  return (
                    <div key={sale.id} className="flex-1 flex flex-col items-center gap-2 group cursor-pointer">
                      <div className="text-[10px] font-mono text-[#8C7E72] opacity-0 group-hover:opacity-100 transition-opacity">
                        {formatCurrency(sale.totalAmount)}
                      </div>
                      <div
                        style={{ height: `${barHeight}px` }}
                        className="w-full max-w-[42px] bg-[#E8DDD0] group-hover:bg-[#5C3826] rounded-xl transition-all duration-200"
                      />
                      <span className="text-[10px] font-mono text-[#8C7E72] truncate max-w-[60px]">
                        {sale.invoiceNumber.replace('INV-2026-', '#')}
                      </span>
                    </div>
                  );
                })}

                {recentSales.length === 0 && (
                  <div className="w-full text-center py-10 text-xs text-[#8C7E72]">
                    No sales recorded yet. Click "Record a Sale" to create your first transaction!
                  </div>
                )}
              </div>
            </div>

            {/* Recent Sales List */}
            <div className="divide-y divide-[#F5EFE6]">
              {recentSales.map(sale => (
                <div key={sale.id} className="py-3 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-[#FAF7F2] border border-[#EBE3D7] flex items-center justify-center text-[#5C3826]">
                      <ShoppingBag className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-semibold text-[#231F1C]">
                        {sale.customerName || 'Walk-in Customer'}
                      </p>
                      <p className="text-[11px] text-[#8C7E72]">
                        {sale.invoiceNumber} · {sale.items.length} item{sale.items.length !== 1 ? 's' : ''} · {sale.paymentMethod}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="font-mono font-bold text-sm text-[#231F1C] tabular-nums">
                      {formatCurrency(sale.totalAmount)}
                    </span>
                    <span
                      className={`block text-[10px] font-semibold ${
                        sale.paymentStatus === 'Paid'
                          ? 'text-emerald-700'
                          : 'text-rose-700'
                      }`}
                    >
                      {sale.paymentStatus}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-[#F5EFE6] mt-4 flex justify-between items-center text-xs text-[#8C7E72]">
            <span>Showing recent {recentSales.length} sales</span>
            <button
              onClick={() => setActivePage('sales')}
              className="text-[#5C3826] font-semibold hover:underline flex items-center gap-1"
            >
              <span>View All Sales Reports</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Stock Status Card (4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-3xl p-6 border border-[#EBE3D7] shadow-[0_2px_12px_rgba(74,46,27,0.03)] flex flex-col justify-between">
          <div>
            <div className="pb-4 border-b border-[#F5EFE6]">
              <h3 className="text-base font-bold text-[#231F1C]">Stock Status</h3>
              <p className="text-xs text-[#8C7E72]">Check products that need attention</p>
            </div>

            {/* Circular Gauge / Donut breakdown */}
            <div className="py-6 flex flex-col items-center justify-center">
              <div className="relative w-40 h-40 flex items-center justify-center">
                {/* SVG Ring Gauge */}
                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="transparent"
                    stroke="#F2ECE3"
                    strokeWidth="12"
                  />
                  {/* In Stock Segment */}
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="transparent"
                    stroke="#2D6A4F"
                    strokeWidth="12"
                    strokeDasharray={`${(inStockPercent / 100) * 251.2} 251.2`}
                    strokeLinecap="round"
                    className="transition-all duration-500"
                  />
                </svg>

                <div className="absolute flex flex-col items-center justify-center text-center">
                  <span className="text-2xl font-extrabold text-[#231F1C] font-mono tabular-nums">
                    {inStockPercent}%
                  </span>
                  <span className="text-[10px] font-semibold text-[#8C7E72] uppercase tracking-wider">
                    In Stock
                  </span>
                </div>
              </div>

              {/* Status Breakdown Indicators */}
              <div className="w-full mt-4 space-y-2.5 text-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-[#2D6A4F]" />
                    <span className="text-[#4A433D] font-medium">In Stock</span>
                  </div>
                  <span className="font-mono font-bold text-[#231F1C]">{inStockCount}</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-[#D97706]" />
                    <span className="text-[#4A433D] font-medium">Low Stock</span>
                  </div>
                  <span className="font-mono font-bold text-[#D97706]">{lowStockCount}</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-[#D9381E]" />
                    <span className="text-[#4A433D] font-medium">Out of Stock</span>
                  </div>
                  <span className="font-mono font-bold text-[#D9381E]">{outOfStockCount}</span>
                </div>
              </div>
            </div>

            {/* Quick attention list */}
            {lowStockProducts.length > 0 && (
              <div className="mt-2 pt-3 border-t border-[#F5EFE6]">
                <span className="text-[11px] font-bold text-[#8C6D53] uppercase tracking-wider block mb-2">
                  Needs Reordering
                </span>
                <div className="space-y-1.5">
                  {lowStockProducts.slice(0, 3).map(p => (
                    <div
                      key={p.id}
                      onClick={() => setActivePage('inventory')}
                      className="p-2 rounded-xl bg-[#FAF7F2] hover:bg-[#F2ECE3] transition-colors flex items-center justify-between cursor-pointer"
                    >
                      <span className="text-xs font-medium text-[#231F1C] truncate max-w-[170px]">
                        {p.name}
                      </span>
                      <span className="text-[11px] font-bold font-mono text-amber-700">
                        {p.quantity} left
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <button
            onClick={() => setActivePage('inventory')}
            className="w-full mt-4 py-2.5 text-xs font-semibold text-[#5C3826] bg-[#FAF7F2] hover:bg-[#F2ECE3] border border-[#EBE3D7] rounded-xl transition-colors cursor-pointer text-center"
          >
            Manage Catalog & Restock
          </button>
        </div>
      </div>
    </div>
  );
};
