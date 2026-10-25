import React, { useState, useEffect } from 'react';
import { useShop } from '../../context/ShopContext';
import { DebtRecord } from '../../types';
import { X, CreditCard, AlertCircle, CheckCircle } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  debtRecord: DebtRecord | null;
}

export const RecordDebtPaymentModal: React.FC<Props> = ({ isOpen, onClose, debtRecord }) => {
  const { recordDebtPayment, formatCurrency } = useShop();

  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [note, setNote] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (debtRecord) {
      setPaymentAmount(debtRecord.remainingBalance.toString());
      setNote(debtRecord.type === 'CUSTOMER' ? 'Customer balance settlement' : 'Supplier invoice payment');
    }
    setErrorMsg(null);
  }, [debtRecord, isOpen]);

  if (!isOpen || !debtRecord) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const amount = parseFloat(paymentAmount);
    if (isNaN(amount) || amount <= 0) {
      setErrorMsg('Please enter a valid payment amount.');
      return;
    }

    if (amount > debtRecord.remainingBalance) {
      setErrorMsg(`Payment amount cannot exceed remaining balance of ${formatCurrency(debtRecord.remainingBalance)}.`);
      return;
    }

    recordDebtPayment(debtRecord.id, amount, paymentMethod, note.trim() || undefined);
    onClose();
  };

  const parsedAmount = parseFloat(paymentAmount) || 0;
  const balanceAfter = Math.max(0, debtRecord.remainingBalance - parsedAmount);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-white border border-[#E7DFD3] rounded-3xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#F0E9DF] bg-[#FAF7F2]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#5C3826] text-white flex items-center justify-center">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#2D2723]">
                {debtRecord.type === 'CUSTOMER' ? 'Receive Customer Payment' : 'Pay Supplier Debt'}
              </h3>
              <p className="text-xs text-[#8C7E72]">{debtRecord.partyName}</p>
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

          {/* Current Debt Status */}
          <div className="p-3.5 bg-[#FAF6F0] border border-[#EAE0D2] rounded-2xl space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-[#706458]">Original Debt:</span>
              <span className="font-mono font-semibold">{formatCurrency(debtRecord.totalDebt)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#706458]">Already Paid:</span>
              <span className="font-mono text-emerald-700 font-semibold">{formatCurrency(debtRecord.amountPaid)}</span>
            </div>
            <div className="flex justify-between font-bold pt-1 border-t border-[#EAE0D2]">
              <span className="text-rose-800">Current Outstanding:</span>
              <span className="font-mono text-rose-800 text-sm">{formatCurrency(debtRecord.remainingBalance)}</span>
            </div>
          </div>

          {/* Payment Amount */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-bold text-[#5C3826] uppercase tracking-wider">
                Payment Amount *
              </label>
              <button
                type="button"
                onClick={() => setPaymentAmount(debtRecord.remainingBalance.toString())}
                className="text-[11px] font-semibold text-[#5C3826] hover:underline"
              >
                Pay Full Balance
              </button>
            </div>
            <input
              type="number"
              step="0.01"
              min="0.01"
              max={debtRecord.remainingBalance}
              required
              value={paymentAmount}
              onChange={e => setPaymentAmount(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#FAF7F2] border border-[#E2D9CC] rounded-xl text-sm font-mono font-bold focus:outline-hidden focus:ring-2 focus:ring-[#5C3826]"
            />
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

          {/* Notes */}
          <div>
            <label className="block text-xs font-bold text-[#5C3826] uppercase tracking-wider mb-1">
              Payment Note / Receipt Ref
            </label>
            <input
              type="text"
              value={note}
              onChange={e => setNote(e.target.value)}
              className="w-full px-3.5 py-2 bg-[#FAF7F2] border border-[#E2D9CC] rounded-xl text-xs"
            />
          </div>

          {/* Balance after preview */}
          <div className="pt-2 text-xs flex justify-between text-[#706458]">
            <span>Remaining balance after payment:</span>
            <span className="font-mono font-bold text-[#2D2723]">{formatCurrency(balanceAfter)}</span>
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
              Confirm Payment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
