import React, { useState, useMemo } from 'react';
import { useShop } from '../context/ShopContext';
import {
  TrendingUp,
  DollarSign,
  Receipt,
  PieChart,
  ArrowUpRight,
  Printer,
  Calendar,
  Layers,
  CreditCard
} from 'lucide-react';

export const RevenuePage: React.FC = () => {
  const { sales, expenses, debts, formatCurrency, settings } = useShop();

  const [timeframe, setTimeframe] = useState<'all' | 'monthly' | 'yearly'>('all');

  const now = new Date();

  // Filtered sales based on timeframe
  const periodSales = useMemo(() => {
    return sales.filter(s => {
      const d = new Date(s.date);
      if (timeframe === 'monthly') {
        return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
      } else if (timeframe === 'yearly') {
        return d.getFullYear() === now.getFullYear();
      }
      return true;
    });
  }, [sales, timeframe]);

  // Filtered expenses based on timeframe
  const periodExpenses = useMemo(() => {
    return expenses.filter(e => {
      const d = new Date(e.date);
      if (timeframe === 'monthly') {
        return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
      } else if (timeframe === 'yearly') {
        return d.getFullYear() === now.getFullYear();
      }
      return true;
    });
  }, [expenses, timeframe]);

  // Financial Metrics
  const grossRevenue = periodSales.reduce((acc, s) => acc + s.totalAmount, 0);
  const costOfGoods = periodSales.reduce((acc, s) => acc + s.totalCost, 0);
  const grossProfit = grossRevenue - costOfGoods;
  const totalOperatingCosts = periodExpenses.reduce((acc, e) => acc + e.amount, 0);
  const netIncome = grossProfit - totalOperatingCosts;
  const netMarginPercent = grossRevenue > 0 ? ((netIncome / grossRevenue) * 100).toFixed(1) : '0.0';
  const grossMarginPercent = grossRevenue > 0 ? ((grossProfit / grossRevenue) * 100).toFixed(1) : '0.0';

  // Category Revenue breakdown
  const categoryBreakdown = useMemo(() => {
    const map: Record<string, { revenue: number; profit: number }> = {};
    periodSales.forEach(sale => {
      sale.items.forEach(item => {
        // Find category if possible
        const cat = 'General';
        if (!map[cat]) map[cat] = { revenue: 0, profit: 0 };
        map[cat].revenue += item.subtotal;
        map[cat].profit += item.subtotal - item.quantity * item.costPrice;
      });
    });
    return map;
  }, [periodSales]);

  // Payment method breakdown
  const paymentMethodBreakdown = useMemo(() => {
    const map: Record<string, number> = {};
    periodSales.forEach(s => {
      map[s.paymentMethod] = (map[s.paymentMethod] || 0) + s.totalAmount;
    });
    return map;
  }, [periodSales]);

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#231F1C] tracking-tight">
            Revenue & Profitability Intelligence
          </h1>
          <p className="text-xs md:text-sm text-[#7D7065] mt-1">
            Complete financial analysis across gross revenue, inventory costs, operating expenses, and net profit.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Timeframe switch */}
          <div className="flex items-center gap-1 p-1 bg-[#FAF7F2] border border-[#EAE2D5] rounded-xl text-xs font-bold">
            {(
              [
                { id: 'all', label: 'All-Time' },
                { id: 'monthly', label: 'This Month' },
                { id: 'yearly', label: 'This Year' }
              ] as const
            ).map(t => (
              <button
                key={t.id}
                onClick={() => setTimeframe(t.id)}
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  timeframe === t.id
                    ? 'bg-[#5C3826] text-white shadow-xs'
                    : 'text-[#7D7065] hover:text-[#231F1C]'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-white border border-[#E2D9CC] rounded-xl text-xs font-semibold text-[#5C3826] hover:bg-[#FAF7F2] cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* Primary Financial Flow KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Gross Revenue */}
        <div className="p-5 bg-white rounded-3xl border border-[#EBE3D7] shadow-xs">
          <span className="text-[11px] font-semibold text-[#8C7E72] uppercase tracking-wider">
            Gross Sales Revenue
          </span>
          <p className="text-2xl md:text-3xl font-extrabold font-mono text-[#231F1C] mt-2 tabular-nums">
            {formatCurrency(grossRevenue)}
          </p>
          <span className="text-[11px] text-[#706458] mt-1 block">
            From {periodSales.length} sales
          </span>
        </div>

        {/* Cost of Goods Sold (COGS) */}
        <div className="p-5 bg-white rounded-3xl border border-[#EBE3D7] shadow-xs">
          <span className="text-[11px] font-semibold text-[#8C7E72] uppercase tracking-wider">
            Cost of Goods (COGS)
          </span>
          <p className="text-2xl md:text-3xl font-extrabold font-mono text-[#7D7065] mt-2 tabular-nums">
            {formatCurrency(costOfGoods)}
          </p>
          <span className="text-[11px] text-[#706458] mt-1 block">
            Purchasing / inventory expense
          </span>
        </div>

        {/* Operating Expenses */}
        <div className="p-5 bg-white rounded-3xl border border-[#EBE3D7] shadow-xs">
          <span className="text-[11px] font-semibold text-[#8C7E72] uppercase tracking-wider">
            Operating Expenses
          </span>
          <p className="text-2xl md:text-3xl font-extrabold font-mono text-[#9A6218] mt-2 tabular-nums">
            {formatCurrency(totalOperatingCosts)}
          </p>
          <span className="text-[11px] text-[#706458] mt-1 block">
            Rent, utilities, staff, overhead
          </span>
        </div>

        {/* Net Profit */}
        <div className="p-5 bg-white rounded-3xl border border-[#EBE3D7] shadow-xs">
          <span className="text-[11px] font-semibold text-[#8C7E72] uppercase tracking-wider">
            Net Income / Profit
          </span>
          <p
            className={`text-2xl md:text-3xl font-extrabold font-mono mt-2 tabular-nums ${
              netIncome >= 0 ? 'text-[#2D6A4F]' : 'text-rose-700'
            }`}
          >
            {netIncome >= 0 ? '+' : ''}{formatCurrency(netIncome)}
          </p>
          <span className="text-[11px] text-emerald-800 font-semibold mt-1 block">
            {netMarginPercent}% net margin
          </span>
        </div>
      </div>

      {/* Income Statement P&L Summary Block */}
      <div className="bg-white rounded-3xl p-6 border border-[#EBE3D7] shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-[#231F1C] uppercase tracking-wider">
          Profit & Loss Statement (P&L Breakdown)
        </h3>

        <div className="divide-y divide-[#F5EFE6] text-xs">
          <div className="py-2.5 flex justify-between font-semibold text-[#231F1C]">
            <span>Total Sales Revenue</span>
            <span className="font-mono text-sm">{formatCurrency(grossRevenue)}</span>
          </div>

          <div className="py-2.5 flex justify-between text-[#706458]">
            <span>Less: Cost of Goods Sold (Inventory Purchase Cost)</span>
            <span className="font-mono text-rose-700">-{formatCurrency(costOfGoods)}</span>
          </div>

          <div className="py-2.5 flex justify-between font-bold text-[#5C3826] bg-[#FAF7F2] px-3 rounded-lg">
            <span>Gross Profit (Revenue - COGS)</span>
            <span className="font-mono text-sm">+{formatCurrency(grossProfit)} ({grossMarginPercent}%)</span>
          </div>

          <div className="py-2.5 flex justify-between text-[#706458]">
            <span>Less: Store Operating Expenses (Overhead & Salaries)</span>
            <span className="font-mono text-rose-700">-{formatCurrency(totalOperatingCosts)}</span>
          </div>

          <div className="py-3 flex justify-between font-extrabold text-base text-[#231F1C] bg-[#FAF5EE] px-3 rounded-xl border border-[#EAE0D2]">
            <span>NET BUSINESS PROFIT</span>
            <span
              className={`font-mono ${
                netIncome >= 0 ? 'text-[#2D6A4F]' : 'text-rose-700'
              }`}
            >
              {netIncome >= 0 ? '+' : ''}{formatCurrency(netIncome)}
            </span>
          </div>
        </div>
      </div>

      {/* Payment Methods and Channel Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Payment Methods */}
        <div className="bg-white rounded-3xl p-6 border border-[#EBE3D7] shadow-xs">
          <h3 className="text-sm font-bold text-[#231F1C] mb-4">
            Revenue by Payment Method
          </h3>
          <div className="space-y-3">
            {Object.entries(paymentMethodBreakdown).map(([method, amt]) => {
              const pct = grossRevenue > 0 ? Math.round((amt / grossRevenue) * 100) : 0;
              return (
                <div key={method} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-[#231F1C]">{method}</span>
                    <span className="font-mono font-bold text-[#5C3826]">
                      {formatCurrency(amt)} ({pct}%)
                    </span>
                  </div>
                  <div className="w-full h-2.5 bg-[#FAF7F2] border border-[#EBE3D7] rounded-full overflow-hidden">
                    <div
                      style={{ width: `${pct}%` }}
                      className="h-full bg-[#5C3826] rounded-full transition-all duration-300"
                    />
                  </div>
                </div>
              );
            })}

            {Object.keys(paymentMethodBreakdown).length === 0 && (
              <p className="text-xs text-[#8C7E72] py-6 text-center">
                No revenue recorded in this period.
              </p>
            )}
          </div>
        </div>

        {/* Operating Cost Categories */}
        <div className="bg-white rounded-3xl p-6 border border-[#EBE3D7] shadow-xs">
          <h3 className="text-sm font-bold text-[#231F1C] mb-4">
            Operating Expense Categories
          </h3>
          <div className="space-y-3">
            {['Rent', 'Utilities', 'Salaries', 'Transport', 'Supplies', 'Maintenance'].map(cat => {
              const catTotal = periodExpenses
                .filter(e => e.category === cat)
                .reduce((s, e) => s + e.amount, 0);
              const pct = totalOperatingCosts > 0 ? Math.round((catTotal / totalOperatingCosts) * 100) : 0;

              return (
                <div key={cat} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-[#231F1C]">{cat}</span>
                    <span className="font-mono text-[#7D7065]">
                      {formatCurrency(catTotal)} ({pct}%)
                    </span>
                  </div>
                  <div className="w-full h-2.5 bg-[#FAF7F2] border border-[#EBE3D7] rounded-full overflow-hidden">
                    <div
                      style={{ width: `${pct}%` }}
                      className="h-full bg-[#9A6218] rounded-full transition-all duration-300"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
