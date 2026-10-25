import React, { useState, useEffect } from 'react';
import { useShop } from '../../context/ShopContext';
import { Product } from '../../types';
import { X, ArrowUpRight, AlertCircle, CheckCircle2 } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  targetProduct?: Product | null;
}

export const RestockModal: React.FC<Props> = ({ isOpen, onClose, targetProduct }) => {
  const { products, restockProduct, formatCurrency, settings } = useShop();

  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [quantityToAdd, setQuantityToAdd] = useState('10');
  const [updatedCostPrice, setUpdatedCostPrice] = useState('');
  const [supplier, setSupplier] = useState('');
  const [note, setNote] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (targetProduct) {
      setSelectedProductId(targetProduct.id);
      setSupplier(targetProduct.supplier || '');
      setUpdatedCostPrice(targetProduct.costPrice.toString());
    } else if (products.length > 0 && !selectedProductId) {
      setSelectedProductId(products[0].id);
      setSupplier(products[0].supplier || '');
      setUpdatedCostPrice(products[0].costPrice.toString());
    }
    setQuantityToAdd('10');
    setNote('');
    setErrorMsg(null);
  }, [targetProduct, isOpen, products]);

  if (!isOpen) return null;

  const currentProduct = products.find(p => p.id === selectedProductId);

  const handleProductChange = (prodId: string) => {
    setSelectedProductId(prodId);
    const p = products.find(prod => prod.id === prodId);
    if (p) {
      setSupplier(p.supplier || '');
      setUpdatedCostPrice(p.costPrice.toString());
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const qty = parseInt(quantityToAdd, 10);
    if (isNaN(qty) || qty <= 0) {
      setErrorMsg('Please enter a valid stock quantity to add (at least 1).');
      return;
    }

    if (!selectedProductId) {
      setErrorMsg('Please select a product to restock.');
      return;
    }

    const cost = updatedCostPrice ? parseFloat(updatedCostPrice) : undefined;

    restockProduct(
      selectedProductId,
      qty,
      cost && cost > 0 ? cost : undefined,
      note.trim() || undefined,
      supplier.trim() || undefined
    );

    onClose();
  };

  const numQty = parseInt(quantityToAdd, 10) || 0;
  const newProjectedQty = currentProduct ? currentProduct.quantity + numQty : numQty;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-white border border-[#E7DFD3] rounded-3xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#F0E9DF] bg-[#FAF7F2]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#5C3826] text-white flex items-center justify-center">
              <ArrowUpRight className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#2D2723]">Record New Stock</h3>
              <p className="text-xs text-[#8C7E72]">
                Replenish inventory and log restock audit history.
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

          {/* Product Picker */}
          <div>
            <label className="block text-xs font-bold text-[#5C3826] uppercase tracking-wider mb-1">
              Select Product *
            </label>
            <select
              value={selectedProductId}
              onChange={e => handleProductChange(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#FAF7F2] border border-[#E2D9CC] rounded-xl text-xs font-medium focus:outline-hidden focus:ring-2 focus:ring-[#5C3826]"
            >
              {products.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name} (Current: {p.quantity} units)
                </option>
              ))}
            </select>
          </div>

          {/* Current Stock Preview */}
          {currentProduct && (
            <div className="p-3 bg-[#FAF5EE] border border-[#EAE0D2] rounded-xl text-xs flex justify-between items-center">
              <div>
                <span className="text-[#706458]">Current Stock:</span>{' '}
                <strong className="font-mono text-[#2D2723]">{currentProduct.quantity} units</strong>
              </div>
              <div className="text-right">
                <span className="text-[#706458]">After Restock:</span>{' '}
                <strong className="font-mono text-emerald-700 font-bold">
                  {newProjectedQty} units
                </strong>
              </div>
            </div>
          )}

          {/* Quantity to Add */}
          <div>
            <label className="block text-xs font-bold text-[#5C3826] uppercase tracking-wider mb-1">
              Quantity Received (Units) *
            </label>
            <input
              type="number"
              min="1"
              required
              placeholder="e.g. 20"
              value={quantityToAdd}
              onChange={e => setQuantityToAdd(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#FAF7F2] border border-[#E2D9CC] rounded-xl text-sm font-mono font-bold focus:outline-hidden focus:ring-2 focus:ring-[#5C3826]"
            />
          </div>

          {/* Optional Cost Price adjustment */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#5C3826] uppercase tracking-wider mb-1">
                Unit Cost ({settings.currency})
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={updatedCostPrice}
                onChange={e => setUpdatedCostPrice(e.target.value)}
                className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#E2D9CC] rounded-xl text-xs font-mono focus:outline-hidden focus:ring-2 focus:ring-[#5C3826]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#5C3826] uppercase tracking-wider mb-1">
                Supplier
              </label>
              <input
                type="text"
                placeholder="e.g. Al-Khaleej Dist."
                value={supplier}
                onChange={e => setSupplier(e.target.value)}
                className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#E2D9CC] rounded-xl text-xs focus:outline-hidden focus:ring-2 focus:ring-[#5C3826]"
              />
            </div>
          </div>

          {/* Shipment Note */}
          <div>
            <label className="block text-xs font-bold text-[#5C3826] uppercase tracking-wider mb-1">
              Batch Note / Invoice Ref (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Batch #499 delivery from supplier"
              value={note}
              onChange={e => setNote(e.target.value)}
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
              Confirm Restock
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
