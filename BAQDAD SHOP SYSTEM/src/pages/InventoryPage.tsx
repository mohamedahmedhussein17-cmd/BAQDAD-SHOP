import React, { useState, useMemo } from 'react';
import { useShop } from '../context/ShopContext';
import { Product } from '../types';
import { AddEditProductModal } from '../components/modals/AddEditProductModal';
import { RestockModal } from '../components/modals/RestockModal';
import { StockHistoryModal } from '../components/modals/StockHistoryModal';
import {
  Package,
  Plus,
  Search,
  Filter,
  ArrowUpRight,
  Edit2,
  Trash2,
  History,
  AlertTriangle,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export const InventoryPage: React.FC = () => {
  const { products, deleteProduct, formatCurrency, lowStockProducts, outOfStockProducts } = useShop();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [stockFilter, setStockFilter] = useState<'ALL' | 'LOW' | 'OUT' | 'HEALTHY'>('ALL');

  // Modals state
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState<Product | null>(null);

  const [isRestockModalOpen, setIsRestockModalOpen] = useState(false);
  const [restockProductTarget, setRestockProductTarget] = useState<Product | null>(null);

  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [historyProductTarget, setHistoryProductTarget] = useState<Product | null>(null);

  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Extract unique categories
  const categories = useMemo(() => {
    const set = new Set<string>();
    products.forEach(p => set.add(p.category));
    return Array.from(set);
  }, [products]);

  // Filter products
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const match =
          p.name.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q) ||
          (p.supplier && p.supplier.toLowerCase().includes(q));
        if (!match) return false;
      }

      // Category filter
      if (selectedCategory !== 'ALL' && p.category !== selectedCategory) {
        return false;
      }

      // Stock status filter
      if (stockFilter === 'OUT' && p.quantity > 0) return false;
      if (stockFilter === 'LOW' && (p.quantity === 0 || p.quantity > p.lowStockThreshold)) return false;
      if (stockFilter === 'HEALTHY' && p.quantity <= p.lowStockThreshold) return false;

      return true;
    });
  }, [products, searchQuery, selectedCategory, stockFilter]);

  const totalStockUnits = products.reduce((acc, p) => acc + p.quantity, 0);
  const totalStockCostValue = products.reduce((acc, p) => acc + p.quantity * p.costPrice, 0);
  const totalStockRetailValue = products.reduce((acc, p) => acc + p.quantity * p.sellingPrice, 0);

  const handleOpenAdd = () => {
    setProductToEdit(null);
    setIsAddEditModalOpen(true);
  };

  const handleOpenEdit = (p: Product) => {
    setProductToEdit(p);
    setIsAddEditModalOpen(true);
  };

  const handleOpenRestock = (p?: Product) => {
    setRestockProductTarget(p || null);
    setIsRestockModalOpen(true);
  };

  const handleOpenHistory = (p?: Product) => {
    setHistoryProductTarget(p || null);
    setIsHistoryModalOpen(true);
  };

  const handleDelete = (id: string) => {
    deleteProduct(id);
    setDeleteConfirmId(null);
  };

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Top Banner and Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#231F1C] tracking-tight">
            Inventory & Stock Control
          </h1>
          <p className="text-xs md:text-sm text-[#7D7065] mt-1">
            Track current stock levels, configure reorder alerts, and manage incoming product shipments.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => handleOpenHistory()}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-[#E2D9CC] rounded-xl text-xs font-semibold text-[#5C3826] hover:bg-[#FAF7F2] transition-colors cursor-pointer"
          >
            <History className="w-4 h-4" />
            <span>Stock History Log</span>
          </button>

          <button
            onClick={() => handleOpenRestock()}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#F2ECE3] border border-[#DDD3C4] rounded-xl text-xs font-semibold text-[#5C3826] hover:bg-[#EAE2D5] transition-colors cursor-pointer"
          >
            <ArrowUpRight className="w-4 h-4" />
            <span>Record New Stock</span>
          </button>

          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#5C3826] hover:bg-[#482B1D] text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Product</span>
          </button>
        </div>
      </div>

      {/* Inventory KPI Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-white rounded-2xl border border-[#EBE3D7] shadow-xs">
          <span className="text-[11px] font-semibold text-[#8C7E72] uppercase tracking-wider">
            Total Unique Products
          </span>
          <p className="text-2xl font-bold font-mono text-[#231F1C] mt-1 tabular-nums">
            {products.length}
          </p>
          <span className="text-[11px] text-[#706458]">In {categories.length} categories</span>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-[#EBE3D7] shadow-xs">
          <span className="text-[11px] font-semibold text-[#8C7E72] uppercase tracking-wider">
            Total Units on Hand
          </span>
          <p className="text-2xl font-bold font-mono text-[#231F1C] mt-1 tabular-nums">
            {totalStockUnits}
          </p>
          <span className="text-[11px] text-[#706458]">Physical shelf items</span>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-[#EBE3D7] shadow-xs">
          <span className="text-[11px] font-semibold text-[#8C7E72] uppercase tracking-wider">
            Stock Cost Value
          </span>
          <p className="text-2xl font-bold font-mono text-[#5C3826] mt-1 tabular-nums">
            {formatCurrency(totalStockCostValue)}
          </p>
          <span className="text-[11px] text-[#706458]">Capital in inventory</span>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-[#EBE3D7] shadow-xs">
          <span className="text-[11px] font-semibold text-[#8C7E72] uppercase tracking-wider">
            Retail Potential Value
          </span>
          <p className="text-2xl font-bold font-mono text-[#2D6A4F] mt-1 tabular-nums">
            {formatCurrency(totalStockRetailValue)}
          </p>
          <span className="text-[11px] text-[#706458]">Projected gross revenue</span>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white rounded-3xl p-4 md:p-5 border border-[#EBE3D7] shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
          {/* Search */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9E9285]" />
            <input
              type="text"
              placeholder="Search product, SKU, supplier..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-[#FAF7F2] border border-[#E2D9CC] rounded-xl text-xs focus:outline-hidden focus:ring-2 focus:ring-[#5C3826]"
            />
          </div>

          {/* Stock Condition Segmented Filter */}
          <div className="flex items-center gap-1.5 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
            <button
              onClick={() => setStockFilter('ALL')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                stockFilter === 'ALL'
                  ? 'bg-[#5C3826] text-white shadow-xs'
                  : 'bg-[#FAF7F2] text-[#4A433D] hover:bg-[#F2ECE3]'
              }`}
            >
              All Items ({products.length})
            </button>
            <button
              onClick={() => setStockFilter('LOW')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                stockFilter === 'LOW'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
              }`}
            >
              <span>Low Stock Alerts</span>
              <span className="font-mono px-1 bg-amber-700/20 rounded text-[10px]">
                {lowStockProducts.length}
              </span>
            </button>
            <button
              onClick={() => setStockFilter('OUT')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                stockFilter === 'OUT'
                  ? 'bg-rose-700 text-white shadow-xs'
                  : 'bg-rose-50 text-rose-800 hover:bg-rose-100'
              }`}
            >
              <span>Out of Stock</span>
              <span className="font-mono px-1 bg-rose-700/20 rounded text-[10px]">
                {outOfStockProducts.length}
              </span>
            </button>
            <button
              onClick={() => setStockFilter('HEALTHY')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                stockFilter === 'HEALTHY'
                  ? 'bg-[#2D6A4F] text-white shadow-xs'
                  : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
              }`}
            >
              Healthy Levels
            </button>
          </div>
        </div>

        {/* Categories horizontal tags */}
        <div className="flex items-center gap-2 overflow-x-auto pt-2 border-t border-[#F5EFE6]">
          <span className="text-[11px] font-bold text-[#8C7E72] uppercase shrink-0">
            Category:
          </span>
          <button
            onClick={() => setSelectedCategory('ALL')}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
              selectedCategory === 'ALL'
                ? 'bg-[#EAE2D5] text-[#5C3826] font-bold'
                : 'text-[#7D7065] hover:text-[#231F1C]'
            }`}
          >
            All Categories
          </button>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium cursor-pointer transition-colors whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-[#EAE2D5] text-[#5C3826] font-bold'
                  : 'text-[#7D7065] hover:text-[#231F1C]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-3xl border border-[#EBE3D7] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF7F2] border-b border-[#EBE3D7] text-[#706458] font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3.5 px-4">Product & SKU</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4 text-right">Cost Price</th>
                <th className="py-3.5 px-4 text-right">Selling Price</th>
                <th className="py-3.5 px-4 text-right">Unit Profit</th>
                <th className="py-3.5 px-4 text-center">Stock Level</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-[#F5EFE6]">
              {filteredProducts.map(p => {
                const isOut = p.quantity <= 0;
                const isLow = p.quantity > 0 && p.quantity <= p.lowStockThreshold;
                const unitProfit = p.sellingPrice - p.costPrice;
                const isConfirmingDelete = deleteConfirmId === p.id;

                return (
                  <tr key={p.id} className="hover:bg-[#FAF7F2]/60 transition-colors">
                    {/* Name & SKU */}
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-sm text-[#231F1C]">{p.name}</div>
                      <div className="text-[11px] text-[#8C7E72] font-mono mt-0.5">
                        SKU: {p.sku} {p.supplier && `· ${p.supplier}`}
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-3.5 px-4 text-[#5A524A] font-medium">
                      {p.category}
                    </td>

                    {/* Cost */}
                    <td className="py-3.5 px-4 text-right font-mono tabular-nums text-[#706458]">
                      {formatCurrency(p.costPrice)}
                    </td>

                    {/* Selling */}
                    <td className="py-3.5 px-4 text-right font-mono tabular-nums font-bold text-[#231F1C]">
                      {formatCurrency(p.sellingPrice)}
                    </td>

                    {/* Unit Profit */}
                    <td className="py-3.5 px-4 text-right font-mono tabular-nums text-emerald-700 font-semibold">
                      +{formatCurrency(unitProfit)}
                    </td>

                    {/* Stock Level */}
                    <td className="py-3.5 px-4 text-center">
                      <span className="font-mono text-sm font-bold tabular-nums text-[#231F1C]">
                        {p.quantity}
                      </span>
                      <span className="text-[10px] text-[#8C7E72] block">
                        Min alert: {p.lowStockThreshold}
                      </span>
                    </td>

                    {/* Status Badge */}
                    <td className="py-3.5 px-4">
                      {isOut ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                          <AlertCircle className="w-3 h-3" />
                          <span>Out of Stock</span>
                        </span>
                      ) : isLow ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                          <AlertTriangle className="w-3 h-3" />
                          <span>Low Stock ({p.quantity})</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>In Stock</span>
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      {isConfirmingDelete ? (
                        <div className="flex items-center justify-end gap-1.5">
                          <span className="text-[11px] text-rose-700 font-bold">Delete?</span>
                          <button
                            onClick={() => handleDelete(p.id)}
                            className="px-2 py-1 text-[11px] font-bold bg-rose-700 text-white rounded hover:bg-rose-800"
                          >
                            Yes
                          </button>
                          <button
                            onClick={() => setDeleteConfirmId(null)}
                            className="px-2 py-1 text-[11px] bg-gray-100 rounded hover:bg-gray-200 text-[#4A433D]"
                          >
                            No
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-end gap-1">
                          {/* Quick Restock button */}
                          <button
                            onClick={() => handleOpenRestock(p)}
                            title="Record new stock / Restock"
                            className="p-1.5 text-[#5C3826] hover:bg-[#F2ECE3] rounded-lg transition-colors cursor-pointer"
                          >
                            <ArrowUpRight className="w-4 h-4" />
                          </button>

                          {/* Audit history */}
                          <button
                            onClick={() => handleOpenHistory(p)}
                            title="View stock history log"
                            className="p-1.5 text-[#706458] hover:bg-[#F2ECE3] rounded-lg transition-colors cursor-pointer"
                          >
                            <History className="w-4 h-4" />
                          </button>

                          {/* Edit */}
                          <button
                            onClick={() => handleOpenEdit(p)}
                            title="Edit product"
                            className="p-1.5 text-[#706458] hover:bg-[#F2ECE3] rounded-lg transition-colors cursor-pointer"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>

                          {/* Delete */}
                          <button
                            onClick={() => setDeleteConfirmId(p.id)}
                            title="Delete product"
                            className="p-1.5 text-[#9E9285] hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}

              {filteredProducts.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-xs text-[#8C7E72]">
                    No products found matching the criteria. Click "Add Product" to add a new item.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      <AddEditProductModal
        isOpen={isAddEditModalOpen}
        onClose={() => setIsAddEditModalOpen(false)}
        productToEdit={productToEdit}
      />

      <RestockModal
        isOpen={isRestockModalOpen}
        onClose={() => setIsRestockModalOpen(false)}
        targetProduct={restockProductTarget}
      />

      <StockHistoryModal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        targetProduct={historyProductTarget}
      />
    </div>
  );
};
