import React, { useState, useMemo } from 'react';
import { useShop } from '../../context/ShopContext';
import { Product } from '../../types';
import { X, History, ArrowDownRight, ArrowUpRight, Filter, Search } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  targetProduct?: Product | null;
}

export const StockHistoryModal: React.FC<Props> = ({ isOpen, onClose, targetProduct }) => {
  const { stockMovements, products } = useShop();

  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredMovements = useMemo(() => {
    return stockMovements.filter(m => {
      if (targetProduct && m.productId !== targetProduct.id) {
        return false;
      }
      if (typeFilter !== 'ALL' && m.type !== typeFilter) {
        return false;
      }
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        return (
          m.productName.toLowerCase().includes(q) ||
          (m.note && m.note.toLowerCase().includes(q)) ||
          (m.referenceId && m.referenceId.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [stockMovements, targetProduct, typeFilter, searchTerm]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-white border border-[#E7DFD3] rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[88vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#F0E9DF] bg-[#FAF7F2]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#5C3826] text-white flex items-center justify-center">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#2D2723]">
                {targetProduct ? `Stock Audit: ${targetProduct.name}` : 'Stock Movement & History Audit'}
              </h3>
              <p className="text-xs text-[#8C7E72]">
                Detailed chronological log of restocks, sales deductions, and adjustments.
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

        {/* Filters */}
        <div className="p-4 border-b border-[#F0E9DF] bg-white flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#9E9285]" />
            <input
              type="text"
              placeholder="Search product or reference..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-[#FAF7F2] border border-[#E2D9CC] rounded-xl text-xs focus:outline-hidden focus:ring-2 focus:ring-[#5C3826]"
            />
          </div>

          <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto">
            {['ALL', 'RESTOCK', 'SALE', 'ADJUSTMENT'].map(t => (
              <button
                key={t}
                onClick={() => setTypeFilter(t)}
                className={`px-3 py-1 text-xs font-semibold rounded-lg border transition-all cursor-pointer whitespace-nowrap ${
                  typeFilter === t
                    ? 'bg-[#5C3826] text-white border-[#5C3826]'
                    : 'bg-[#FAF7F2] text-[#4A433D] border-[#E2D9CC] hover:bg-[#F2ECE3]'
                }`}
              >
                {t === 'ALL' ? 'All Logs' : t}
              </button>
            ))}
          </div>
        </div>

        {/* Audit Movements List */}
        <div className="flex-1 overflow-y-auto p-4 divide-y divide-[#F5EFE6]">
          {filteredMovements.length === 0 ? (
            <div className="py-12 text-center text-xs text-[#8C7E72]">
              No stock movements recorded matching the current filter.
            </div>
          ) : (
            filteredMovements.map(m => {
              const isPositive = m.quantityChanged > 0;
              const formattedDate = new Date(m.date).toLocaleString('en-US', {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              });

              return (
                <div key={m.id} className="py-3 flex items-start justify-between gap-3 text-xs">
                  <div className="flex items-start gap-2.5">
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                        isPositive ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {isPositive ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-[#2D2723]">{m.productName}</span>
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.2 rounded uppercase ${
                            m.type === 'RESTOCK'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : m.type === 'SALE'
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : 'bg-stone-100 text-stone-700 border border-stone-200'
                          }`}
                        >
                          {m.type}
                        </span>
                      </div>

                      <div className="text-[11px] text-[#706458] mt-0.5">
                        {m.note || 'Inventory update'} {m.referenceId && `· Ref: ${m.referenceId}`}
                      </div>
                      <div className="text-[10px] text-[#9E9285] mt-0.5">{formattedDate}</div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span
                      className={`font-mono font-bold text-sm tabular-nums ${
                        isPositive ? 'text-emerald-700' : 'text-amber-700'
                      }`}
                    >
                      {isPositive ? `+${m.quantityChanged}` : m.quantityChanged}
                    </span>
                    <div className="text-[10px] font-mono text-[#8C7E72] mt-0.5">
                      {m.previousQuantity} → <strong className="text-[#2D2723]">{m.newQuantity}</strong>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#F0E9DF] bg-[#FAF7F2] text-right">
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-semibold text-[#5C3826] bg-white border border-[#E2D9CC] rounded-xl hover:bg-[#F2ECE3] transition-colors"
          >
            Close Audit
          </button>
        </div>
      </div>
    </div>
  );
};
