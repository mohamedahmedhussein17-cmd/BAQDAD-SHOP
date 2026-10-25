import React, { useState, useMemo } from 'react';
import { useShop } from '../context/ShopContext';
import { Expense, ExpenseCategory } from '../types';
import { RecordExpenseModal } from '../components/modals/RecordExpenseModal';
import {
  Receipt,
  Plus,
  Search,
  Filter,
  DollarSign,
  Calendar,
  Trash2,
  Edit2,
  Building,
  Zap,
  Truck,
  Users
} from 'lucide-react';

const CATEGORIES: ('ALL' | ExpenseCategory)[] = [
  'ALL',
  'Rent',
  'Utilities',
  'Salaries',
  'Maintenance',
  'Transport',
  'Supplies',
  'Marketing',
  'Other'
];

export const ExpensePage: React.FC = () => {
  const { expenses, deleteExpense, formatCurrency } = useShop();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<'ALL' | ExpenseCategory>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const now = new Date();

  // Filter expenses
  const filteredExpenses = useMemo(() => {
    return expenses.filter(e => {
      if (categoryFilter !== 'ALL' && e.category !== categoryFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const match =
          e.title.toLowerCase().includes(q) ||
          e.payee.toLowerCase().includes(q) ||
          (e.receiptNote && e.receiptNote.toLowerCase().includes(q));
        if (!match) return false;
      }
      return true;
    });
  }, [expenses, categoryFilter, searchQuery]);

  const totalExpenseAmount = expenses.reduce((sum, e) => sum + e.amount, 0);

  const thisMonthExpenses = expenses
    .filter(e => {
      const d = new Date(e.date);
      return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
    })
    .reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#231F1C] tracking-tight">
            Shop Expense Management
          </h1>
          <p className="text-xs md:text-sm text-[#7D7065] mt-1">
            Record shop overheads including rent, generator bills, cashier salaries, and freight deliveries.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#5C3826] hover:bg-[#482B1D] text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Record Expense</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 bg-white rounded-2xl border border-[#EBE3D7] shadow-xs">
          <span className="text-[11px] font-semibold text-[#8C7E72] uppercase tracking-wider">
            This Month's Overhead
          </span>
          <p className="text-3xl font-bold font-mono text-[#9A6218] mt-1 tabular-nums">
            {formatCurrency(thisMonthExpenses)}
          </p>
          <span className="text-[11px] text-[#706458]">October operating expenses</span>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-[#EBE3D7] shadow-xs">
          <span className="text-[11px] font-semibold text-[#8C7E72] uppercase tracking-wider">
            Total All-Time Expenses
          </span>
          <p className="text-3xl font-bold font-mono text-[#231F1C] mt-1 tabular-nums">
            {formatCurrency(totalExpenseAmount)}
          </p>
          <span className="text-[11px] text-[#706458]">Cumulative recorded expenses</span>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-[#EBE3D7] shadow-xs">
          <span className="text-[11px] font-semibold text-[#8C7E72] uppercase tracking-wider">
            Expense Receipts Logged
          </span>
          <p className="text-3xl font-bold font-mono text-[#5C3826] mt-1 tabular-nums">
            {expenses.length}
          </p>
          <span className="text-[11px] text-[#706458]">Individual transactions</span>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="bg-white rounded-3xl p-4 md:p-5 border border-[#EBE3D7] shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9E9285]" />
            <input
              type="text"
              placeholder="Search expense, payee, receipt..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-[#FAF7F2] border border-[#E2D9CC] rounded-xl text-xs focus:outline-hidden focus:ring-2 focus:ring-[#5C3826]"
            />
          </div>

          <div className="flex items-center gap-1.5 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                  categoryFilter === cat
                    ? 'bg-[#5C3826] text-white shadow-xs'
                    : 'bg-[#FAF7F2] text-[#4A433D] hover:bg-[#F2ECE3]'
                }`}
              >
                {cat === 'ALL' ? 'All Expenses' : cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Expenses Table */}
      <div className="bg-white rounded-3xl border border-[#EBE3D7] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF7F2] border-b border-[#EBE3D7] text-[#706458] font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3.5 px-4">Expense Description</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Payee / Vendor</th>
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-4">Payment Method</th>
                <th className="py-3.5 px-4 text-right">Amount</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-[#F5EFE6]">
              {filteredExpenses.map(exp => (
                <tr key={exp.id} className="hover:bg-[#FAF7F2]/60 transition-colors">
                  {/* Title & Notes */}
                  <td className="py-3.5 px-4">
                    <span className="font-bold text-sm text-[#231F1C] block">{exp.title}</span>
                    {exp.receiptNote && (
                      <span className="text-[11px] text-[#8C7E72] line-clamp-1">
                        Ref: {exp.receiptNote}
                      </span>
                    )}
                  </td>

                  {/* Category */}
                  <td className="py-3.5 px-4">
                    <span className="px-2 py-0.5 rounded-md bg-[#FAF5EE] text-[#5C3826] border border-[#EAE2D5] font-semibold text-[11px]">
                      {exp.category}
                    </span>
                  </td>

                  {/* Payee */}
                  <td className="py-3.5 px-4 text-[#4A433D] font-medium">
                    {exp.payee}
                  </td>

                  {/* Date */}
                  <td className="py-3.5 px-4 text-[#706458] font-mono text-[11px]">
                    {new Date(exp.date).toLocaleDateString()}
                  </td>

                  {/* Method */}
                  <td className="py-3.5 px-4 text-[#4A433D]">
                    {exp.paymentMethod}
                  </td>

                  {/* Amount */}
                  <td className="py-3.5 px-4 text-right font-mono font-bold text-sm text-rose-800 tabular-nums">
                    -{formatCurrency(exp.amount)}
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => deleteExpense(exp.id)}
                      title="Delete expense"
                      className="p-1.5 text-[#9E9285] hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}

              {filteredExpenses.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-xs text-[#8C7E72]">
                    No expense records found. Click "Record Expense" to log your store expenses.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      <RecordExpenseModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
};
