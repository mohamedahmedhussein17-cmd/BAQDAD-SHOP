import React, { useState, useMemo } from 'react';
import { useShop } from '../context/ShopContext';
import { Sale } from '../types';
import {
  ShoppingBag,
  Plus,
  Search,
  Calendar,
  DollarSign,
  TrendingUp,
  Receipt,
  User,
  Clock,
  Printer
} from 'lucide-react';

export const SalesPage: React.FC = () => {
  const { sales, openRecordSaleModal, openReceiptModal, formatCurrency } = useShop();

  const [timeHorizon, setTimeHorizon] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('daily');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSaleDetail, setSelectedSaleDetail] = useState<Sale | null>(null);

  // Time filtering logic
  const now = new Date();

  const filteredSales = useMemo(() => {
    return sales.filter(sale => {
      const saleDate = new Date(sale.date);

      // Search match
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const match =
          sale.invoiceNumber.toLowerCase().includes(q) ||
          (sale.customerName && sale.customerName.toLowerCase().includes(q)) ||
          sale.items.some(i => i.productName.toLowerCase().includes(q));
        if (!match) return false;
      }

      // Time range filter
      if (timeHorizon === 'daily') {
        return (
          saleDate.getFullYear() === now.getFullYear() &&
          saleDate.getMonth() === now.getMonth() &&
          saleDate.getDate() === now.getDate()
        );
      } else if (timeHorizon === 'weekly') {
        const diffDays = Math.floor((now.getTime() - saleDate.getTime()) / (1000 * 60 * 60 * 24));
        return diffDays <= 7;
      } else if (timeHorizon === 'monthly') {
        return (
          saleDate.getFullYear() === now.getFullYear() &&
          saleDate.getMonth() === now.getMonth()
        );
      } else if (timeHorizon === 'yearly') {
        return saleDate.getFullYear() === now.getFullYear();
      }

      return true;
    });
  }, [sales, timeHorizon, searchQuery]);

  // Aggregated figures for current period
  const periodTotalRevenue = filteredSales.reduce((acc, s) => acc + s.totalAmount, 0);
  const periodTotalCost = filteredSales.reduce((acc, s) => acc + s.totalCost, 0);
  const periodNetProfit = filteredSales.reduce((acc, s) => acc + s.netProfit, 0);
  const periodCount = filteredSales.length;
  const avgTicket = periodCount > 0 ? periodTotalRevenue / periodCount : 0;
  const marginPercent = periodTotalRevenue > 0 ? ((periodNetProfit / periodTotalRevenue) * 100).toFixed(1) : '0.0';

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header and New Sale CTA */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#231F1C] tracking-tight">
            Sales Ledger & Revenue Reports
          </h1>
          <p className="text-xs md:text-sm text-[#7D7065] mt-1">
            Analyze daily, weekly, monthly, and yearly sales performance and profit margins.
          </p>
        </div>

        <button
          onClick={openRecordSaleModal}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#5C3826] hover:bg-[#482B1D] text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Record New Sale (POS)</span>
        </button>
      </div>

      {/* Time Horizon Tabs: Daily, Weekly, Monthly, Year */}
      <div className="bg-white rounded-3xl p-3 border border-[#EBE3D7] shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 w-full sm:w-auto p-1 bg-[#FAF7F2] border border-[#EAE2D5] rounded-2xl">
          {(
            [
              { id: 'daily', label: 'Daily (Today)' },
              { id: 'weekly', label: 'Weekly (Last 7 Days)' },
              { id: 'monthly', label: 'Monthly (This Month)' },
              { id: 'yearly', label: 'Yearly (This Year)' }
            ] as const
          ).map(tab => (
            <button
              key={tab.id}
              onClick={() => setTimeHorizon(tab.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                timeHorizon === tab.id
                  ? 'bg-[#5C3826] text-white shadow-xs'
                  : 'text-[#7D7065] hover:text-[#231F1C]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9E9285]" />
          <input
            type="text"
            placeholder="Search invoice #, customer..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[#FAF7F2] border border-[#E2D9CC] rounded-xl text-xs focus:outline-hidden focus:ring-2 focus:ring-[#5C3826]"
          />
        </div>
      </div>

      {/* Period Analytics KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="p-4 bg-white rounded-2xl border border-[#EBE3D7] shadow-xs">
          <span className="text-[11px] font-semibold text-[#8C7E72] uppercase tracking-wider">
            Total Sales
          </span>
          <p className="text-2xl font-bold font-mono text-[#231F1C] mt-1 tabular-nums">
            {formatCurrency(periodTotalRevenue)}
          </p>
          <span className="text-[11px] text-[#706458]">Gross turnover</span>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-[#EBE3D7] shadow-xs">
          <span className="text-[11px] font-semibold text-[#8C7E72] uppercase tracking-wider">
            Cost of Goods
          </span>
          <p className="text-2xl font-bold font-mono text-[#7D7065] mt-1 tabular-nums">
            {formatCurrency(periodTotalCost)}
          </p>
          <span className="text-[11px] text-[#706458]">Stock purchase cost</span>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-[#EBE3D7] shadow-xs">
          <span className="text-[11px] font-semibold text-[#8C7E72] uppercase tracking-wider">
            Net Profit
          </span>
          <p className="text-2xl font-bold font-mono text-emerald-700 mt-1 tabular-nums">
            +{formatCurrency(periodNetProfit)}
          </p>
          <span className="text-[11px] text-emerald-800 font-semibold">{marginPercent}% gross margin</span>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-[#EBE3D7] shadow-xs">
          <span className="text-[11px] font-semibold text-[#8C7E72] uppercase tracking-wider">
            Transactions
          </span>
          <p className="text-2xl font-bold font-mono text-[#231F1C] mt-1 tabular-nums">
            {periodCount}
          </p>
          <span className="text-[11px] text-[#706458]">Completed sales</span>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-[#EBE3D7] shadow-xs">
          <span className="text-[11px] font-semibold text-[#8C7E72] uppercase tracking-wider">
            Avg. Ticket
          </span>
          <p className="text-2xl font-bold font-mono text-[#5C3826] mt-1 tabular-nums">
            {formatCurrency(avgTicket)}
          </p>
          <span className="text-[11px] text-[#706458]">Per transaction</span>
        </div>
      </div>

      {/* Sales Transactions Table */}
      <div className="bg-white rounded-3xl border border-[#EBE3D7] shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-[#EBE3D7] flex items-center justify-between">
          <h3 className="text-sm font-bold text-[#231F1C]">
            Sales Records ({filteredSales.length})
          </h3>
          <span className="text-xs text-[#8C7E72]">
            Filter: <strong className="capitalize text-[#5C3826]">{timeHorizon}</strong>
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF7F2] border-b border-[#EBE3D7] text-[#706458] font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3.5 px-4">Invoice # & Date</th>
                <th className="py-3.5 px-4">Customer</th>
                <th className="py-3.5 px-4">Items Summary</th>
                <th className="py-3.5 px-4">Payment Method</th>
                <th className="py-3.5 px-4 text-right">Sale Total</th>
                <th className="py-3.5 px-4 text-right">Profit</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-[#F5EFE6]">
              {filteredSales.map(sale => {
                const formattedDate = new Date(sale.date).toLocaleString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                });

                return (
                  <tr key={sale.id} className="hover:bg-[#FAF7F2]/60 transition-colors">
                    {/* Invoice & Date */}
                    <td className="py-3.5 px-4">
                      <span className="font-mono font-bold text-sm text-[#231F1C] block">
                        {sale.invoiceNumber}
                      </span>
                      <span className="text-[11px] text-[#8C7E72]">{formattedDate}</span>
                    </td>

                    {/* Customer */}
                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-[#231F1C] block">
                        {sale.customerName || 'Walk-in Guest'}
                      </span>
                      {sale.customerPhone && (
                        <span className="text-[11px] text-[#8C7E72]">{sale.customerPhone}</span>
                      )}
                    </td>

                    {/* Items */}
                    <td className="py-3.5 px-4">
                      <div className="text-[#4A433D] font-medium">
                        {sale.items.length} item{sale.items.length !== 1 ? 's' : ''}:{' '}
                        <span className="text-[#8C7E72] text-[11px]">
                          {sale.items.map(i => `${i.productName} (${i.quantity})`).slice(0, 2).join(', ')}
                          {sale.items.length > 2 && '...'}
                        </span>
                      </div>
                    </td>

                    {/* Payment Method */}
                    <td className="py-3.5 px-4">
                      <span className="font-medium text-[#4A433D]">{sale.paymentMethod}</span>
                      {sale.debtAmount > 0 && (
                        <span className="block text-[10px] text-rose-700 font-semibold font-mono">
                          Debt: {formatCurrency(sale.debtAmount)}
                        </span>
                      )}
                    </td>

                    {/* Total Amount */}
                    <td className="py-3.5 px-4 text-right font-mono text-sm font-bold text-[#231F1C] tabular-nums">
                      {formatCurrency(sale.totalAmount)}
                    </td>

                    {/* Profit */}
                    <td className="py-3.5 px-4 text-right font-mono tabular-nums text-emerald-700 font-semibold">
                      +{formatCurrency(sale.netProfit)}
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold ${
                          sale.paymentStatus === 'Paid'
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : sale.paymentStatus === 'Partially Paid'
                            ? 'bg-amber-50 text-amber-800 border border-amber-200'
                            : 'bg-rose-50 text-rose-800 border border-rose-200'
                        }`}
                      >
                        {sale.paymentStatus}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => openReceiptModal(sale)}
                        title="View & Print Receipt"
                        className="p-1.5 text-[#5C3826] hover:bg-[#F2ECE3] rounded-lg transition-colors cursor-pointer inline-flex items-center gap-1 font-semibold text-xs"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>Receipt</span>
                      </button>
                    </td>
                  </tr>
                );
              })}

              {filteredSales.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-xs text-[#8C7E72]">
                    No sales recorded in the {timeHorizon} period. Record a new sale to see it here!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
