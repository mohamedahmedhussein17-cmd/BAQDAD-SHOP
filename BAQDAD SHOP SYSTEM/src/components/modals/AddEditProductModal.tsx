import React, { useState, useEffect } from 'react';
import { useShop } from '../../context/ShopContext';
import { Product } from '../../types';
import { X, Package, Check, AlertCircle } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  productToEdit?: Product | null;
}

const CATEGORY_PRESETS = [
  'Groceries',
  'Beverages',
  'Electronics',
  'Home & Kitchen',
  'Apparel',
  'Personal Care',
  'Hardware',
  'Stationery'
];

export const AddEditProductModal: React.FC<Props> = ({ isOpen, onClose, productToEdit }) => {
  const { addProduct, updateProduct, settings, formatCurrency } = useShop();

  const [name, setName] = useState('');
  const [category, setCategory] = useState('Groceries');
  const [customCategory, setCustomCategory] = useState('');
  const [sellingPrice, setSellingPrice] = useState('');
  const [costPrice, setCostPrice] = useState('');
  const [quantity, setQuantity] = useState('');
  const [lowStockThreshold, setLowStockThreshold] = useState('5');
  const [sku, setSku] = useState('');
  const [supplier, setSupplier] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (productToEdit) {
      setName(productToEdit.name);
      if (CATEGORY_PRESETS.includes(productToEdit.category)) {
        setCategory(productToEdit.category);
        setCustomCategory('');
      } else {
        setCategory('Other');
        setCustomCategory(productToEdit.category);
      }
      setSellingPrice(productToEdit.sellingPrice.toString());
      setCostPrice(productToEdit.costPrice.toString());
      setQuantity(productToEdit.quantity.toString());
      setLowStockThreshold(productToEdit.lowStockThreshold.toString());
      setSku(productToEdit.sku);
      setSupplier(productToEdit.supplier || '');
    } else {
      // Defaults for new product
      setName('');
      setCategory('Groceries');
      setCustomCategory('');
      setSellingPrice('');
      setCostPrice('');
      setQuantity('10');
      setLowStockThreshold(settings.defaultLowStockThreshold.toString());
      setSku(`BQD-${Math.floor(1000 + Math.random() * 9000)}`);
      setSupplier('');
    }
    setErrorMsg(null);
  }, [productToEdit, isOpen, settings.defaultLowStockThreshold]);

  if (!isOpen) return null;

  const numSelling = parseFloat(sellingPrice) || 0;
  const numCost = parseFloat(costPrice) || 0;
  const unitProfit = numSelling - numCost;
  const marginPercent = numSelling > 0 ? ((unitProfit / numSelling) * 100).toFixed(1) : '0.0';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!name.trim()) {
      setErrorMsg('Product name is required.');
      return;
    }

    const finalCategory = category === 'Other' ? (customCategory.trim() || 'General') : category;
    const finalSellingPrice = parseFloat(sellingPrice);
    const finalCostPrice = parseFloat(costPrice);
    const finalQuantity = parseInt(quantity, 10);
    const finalThreshold = parseInt(lowStockThreshold, 10);

    if (isNaN(finalSellingPrice) || finalSellingPrice < 0) {
      setErrorMsg('Please enter a valid selling price.');
      return;
    }
    if (isNaN(finalCostPrice) || finalCostPrice < 0) {
      setErrorMsg('Please enter a valid cost price.');
      return;
    }
    if (isNaN(finalQuantity) || finalQuantity < 0) {
      setErrorMsg('Please enter a valid quantity.');
      return;
    }

    if (productToEdit) {
      updateProduct(productToEdit.id, {
        name: name.trim(),
        category: finalCategory,
        sellingPrice: finalSellingPrice,
        costPrice: finalCostPrice,
        quantity: finalQuantity,
        lowStockThreshold: isNaN(finalThreshold) ? 5 : finalThreshold,
        sku: sku.trim() || `BQD-${productToEdit.id}`,
        supplier: supplier.trim() || undefined
      });
    } else {
      addProduct({
        name: name.trim(),
        category: finalCategory,
        sellingPrice: finalSellingPrice,
        costPrice: finalCostPrice,
        quantity: finalQuantity,
        lowStockThreshold: isNaN(finalThreshold) ? 5 : finalThreshold,
        sku: sku.trim() || `BQD-${Date.now().toString().slice(-4)}`,
        supplier: supplier.trim() || undefined
      });
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-white border border-[#E7DFD3] rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#F0E9DF] bg-[#FAF7F2]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#5C3826] text-white flex items-center justify-center">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#2D2723]">
                {productToEdit ? 'Edit Product' : 'Add New Product'}
              </h3>
              <p className="text-xs text-[#8C7E72]">
                Configure product pricing, inventory thresholds, and supplier details.
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
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Product Name */}
          <div>
            <label className="block text-xs font-bold text-[#5C3826] uppercase tracking-wider mb-1">
              Product Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Basmati Rice Premium (5kg)"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#FAF7F2] border border-[#E2D9CC] rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-[#5C3826]"
            />
          </div>

          {/* Category & Custom Category */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#5C3826] uppercase tracking-wider mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="w-full px-3 py-2.5 bg-[#FAF7F2] border border-[#E2D9CC] rounded-xl text-xs font-medium focus:outline-hidden focus:ring-2 focus:ring-[#5C3826]"
              >
                {CATEGORY_PRESETS.map(cat => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
                <option value="Other">Other (Custom)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#5C3826] uppercase tracking-wider mb-1">
                SKU / Code
              </label>
              <input
                type="text"
                placeholder="e.g. BQD-104"
                value={sku}
                onChange={e => setSku(e.target.value)}
                className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#E2D9CC] rounded-xl text-xs font-mono focus:outline-hidden focus:ring-2 focus:ring-[#5C3826]"
              />
            </div>
          </div>

          {category === 'Other' && (
            <div>
              <label className="block text-xs font-bold text-[#5C3826] uppercase tracking-wider mb-1">
                Custom Category Name
              </label>
              <input
                type="text"
                placeholder="Enter custom category"
                value={customCategory}
                onChange={e => setCustomCategory(e.target.value)}
                className="w-full px-3.5 py-2 bg-[#FAF7F2] border border-[#E2D9CC] rounded-xl text-xs"
              />
            </div>
          )}

          {/* Pricing Grid */}
          <div className="grid grid-cols-2 gap-3 p-3.5 bg-[#FAF6F0] border border-[#EAE0D2] rounded-2xl">
            <div>
              <label className="block text-xs font-bold text-[#5C3826] uppercase tracking-wider mb-1">
                Selling Price ({settings.currency}) *
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                required
                placeholder="0.00"
                value={sellingPrice}
                onChange={e => setSellingPrice(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-[#E2D9CC] rounded-xl text-sm font-mono font-bold focus:outline-hidden focus:ring-2 focus:ring-[#5C3826]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#5C3826] uppercase tracking-wider mb-1">
                Cost Price ({settings.currency}) *
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                required
                placeholder="0.00"
                value={costPrice}
                onChange={e => setCostPrice(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-[#E2D9CC] rounded-xl text-sm font-mono font-bold focus:outline-hidden focus:ring-2 focus:ring-[#5C3826]"
              />
            </div>

            <div className="col-span-2 pt-2 border-t border-[#EAE0D2] flex justify-between text-xs text-[#706458]">
              <span>
                Profit Per Unit: <strong className="font-mono text-emerald-700">{formatCurrency(unitProfit)}</strong>
              </span>
              <span>
                Gross Margin: <strong className="font-mono text-[#5C3826]">{marginPercent}%</strong>
              </span>
            </div>
          </div>

          {/* Inventory stock & Low stock alert threshold */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#5C3826] uppercase tracking-wider mb-1">
                Current Stock (Units) *
              </label>
              <input
                type="number"
                min="0"
                required
                placeholder="0"
                value={quantity}
                onChange={e => setQuantity(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#FAF7F2] border border-[#E2D9CC] rounded-xl text-sm font-mono focus:outline-hidden focus:ring-2 focus:ring-[#5C3826]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#5C3826] uppercase tracking-wider mb-1">
                Low Stock Alert At
              </label>
              <input
                type="number"
                min="1"
                placeholder="5"
                value={lowStockThreshold}
                onChange={e => setLowStockThreshold(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#FAF7F2] border border-[#E2D9CC] rounded-xl text-sm font-mono focus:outline-hidden focus:ring-2 focus:ring-[#5C3826]"
              />
            </div>
          </div>

          {/* Supplier Name */}
          <div>
            <label className="block text-xs font-bold text-[#5C3826] uppercase tracking-wider mb-1">
              Supplier / Distributor (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Al-Khaleej Food Dist."
              value={supplier}
              onChange={e => setSupplier(e.target.value)}
              className="w-full px-3.5 py-2 bg-[#FAF7F2] border border-[#E2D9CC] rounded-xl text-xs focus:outline-hidden focus:ring-2 focus:ring-[#5C3826]"
            />
          </div>

          {/* Modal Actions */}
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
              {productToEdit ? 'Save Changes' : 'Create Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
