import React, { useState } from 'react';
import { useShop } from '../../context/ShopContext';
import { ExpenseCategory } from '../../types';
import { X, Receipt, AlertCircle } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  'Rent',
  'Utilities',
  'Salaries',
  'Maintenance',
  'Transport',
  'Supplies',
  'Marketing',
  'Other'
];

export const RecordExpenseModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const { addExpense, settings } = useShop();

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<ExpenseCategory>('Utilities');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [payee, setPayee] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [receiptNote, setReceiptNote] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const numAmount = parseFloat(amount);
    if (!title.trim()) {
      setErrorMsg('Expense description/title is required.');
      return;
    }
    if (isNaN(numAmount) || numAmount <= 0) {
      setErrorMsg('Please enter a valid expense amount.');
      return;
    }

    addExpense({
      title: title.trim(),
      category,
      amount: numAmount,
      date: new Date(date).toISOString(),
      payee: payee.trim() || 'General Expense',
      paymentMethod,
      receiptNote: receiptNote.trim() || undefined
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-white border border-[#E7DFD3] rounded-3xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#F0E9DF] bg-[#FAF7F2]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#5C3826] text-white flex items-center justify-center">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#2D2723]">Record Shop Expense</h3>
              <p className="text-xs text-[#8C7E72]">
                Track store operational costs and deduct from net profit.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-[#8C7E72] hover:bg-[#F2ECE3] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-[#5C3826] uppercase tracking-wider mb-1">
              Expense Description *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Monthly Electricity / Store Rent"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#FAF7F2] border border-[#E2D9CC] rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-[#5C3826]"
            />
          </div>

          {/* Category & Amount */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#5C3826] uppercase tracking-wider mb-1">
                Category *
              </label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value as ExpenseCategory)}
                className="w-full px-3 py-2.5 bg-[#FAF7F2] border border-[#E2D9CC] rounded-xl text-xs font-medium focus:outline-hidden focus:ring-2 focus:ring-[#5C3826]"
              >
                {EXPENSE_CATEGORIES.map(c => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#5C3826] uppercase tracking-wider mb-1">
                Amount ({settings.currency}) *
              </label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                required
                placeholder="0.00"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-[#E2D9CC] rounded-xl text-sm font-mono font-bold focus:outline-hidden focus:ring-2 focus:ring-[#5C3826]"
              />
            </div>
          </div>

          {/* Date & Payee */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#5C3826] uppercase tracking-wider mb-1">
                Date
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={e => setDate(e.target.value)}
                className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#E2D9CC] rounded-xl text-xs font-mono focus:outline-hidden focus:ring-2 focus:ring-[#5C3826]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#5C3826] uppercase tracking-wider mb-1">
                Payee / Vendor
              </label>
              <input
                type="text"
                placeholder="e.g. Landlord, Utility Co."
                value={payee}
                onChange={e => setPayee(e.target.value)}
                className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#E2D9CC] rounded-xl text-xs focus:outline-hidden focus:ring-2 focus:ring-[#5C3826]"
              />
            </div>
          </div>

          {/* Payment Method */}
          <div>
            <label className="block text-xs font-bold text-[#5C3826] uppercase tracking-wider mb-1">
              Payment Method
            </label>
            <select
              value={paymentMethod}
              onChange={e => setPaymentMethod(e.target.value)}
              className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#E2D9CC] rounded-xl text-xs font-medium focus:outline-hidden focus:ring-2 focus:ring-[#5C3826]"
            >
              <option value="Cash">Cash</option>
              <option value="Bank Transfer">Bank Transfer</option>
              <option value="Card">Card</option>
              <option value="Mobile Money">Mobile Money</option>
            </select>
          </div>

          {/* Receipt Note */}
          <div>
            <label className="block text-xs font-bold text-[#5C3826] uppercase tracking-wider mb-1">
              Receipt Reference / Note
            </label>
            <input
              type="text"
              placeholder="e.g. Receipt #9843 or invoice reference"
              value={receiptNote}
              onChange={e => setReceiptNote(e.target.value)}
              className="w-full px-3.5 py-2 bg-[#FAF7F2] border border-[#E2D9CC] rounded-xl text-xs focus:outline-hidden focus:ring-2 focus:ring-[#5C3826]"
            />
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-[#F0E9DF] flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 text-xs font-semibold text-[#5C3826] bg-[#FAF5EE] border border-[#E2D9CC] rounded-xl hover:bg-[#F2ECE3] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 text-xs font-bold text-white bg-[#5C3826] hover:bg-[#482B1D] rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              Save Expense
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
