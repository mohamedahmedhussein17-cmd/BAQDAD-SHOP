import React from 'react';
import { useShop } from '../../context/ShopContext';
import { X, Printer, CheckCircle2 } from 'lucide-react';

export const ReceiptModal: React.FC = () => {
  const { activeReceiptSale, closeReceiptModal, formatCurrency, settings } = useShop();

  if (!activeReceiptSale) return null;

  const sale = activeReceiptSale;

  const handlePrint = () => {
    window.print();
  };

  const formattedDate = new Date(sale.date).toLocaleString('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short'
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-white border border-[#E7DFD3] rounded-3xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header toolbar */}
        <div className="flex items-center justify-between px-6 py-3.5 border-b border-[#F0E9DF] bg-[#FAF7F2] no-print">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#5C3826]">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Sale Recorded Successfully</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-[#5C3826] hover:bg-[#482B1D] rounded-xl transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print</span>
            </button>
            <button
              onClick={closeReceiptModal}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-[#8C7E72] hover:bg-[#F2ECE3] transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Thermal / Standard Receipt Document */}
        <div id="printable-receipt" className="p-6 overflow-y-auto font-mono text-xs text-[#2D2723] bg-white">
          {/* Shop Header */}
          <div className="text-center pb-4 border-b border-dashed border-[#CFC5B8]">
            <h1 className="text-base font-bold uppercase tracking-wider text-[#1A1816]">
              {settings.shopName}
            </h1>
            <p className="text-[11px] text-[#706458] mt-0.5">{settings.tagline}</p>
            <p className="text-[10px] text-[#706458] mt-1">{settings.address}</p>
            <p className="text-[10px] text-[#706458]">Tel: {settings.phone}</p>
          </div>

          {/* Invoice Meta */}
          <div className="py-3 border-b border-dashed border-[#CFC5B8] space-y-1 text-[11px]">
            <div className="flex justify-between">
              <span className="text-[#706458]">INVOICE #:</span>
              <span className="font-bold">{sale.invoiceNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#706458]">DATE:</span>
              <span>{formattedDate}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#706458]">CUSTOMER:</span>
              <span className="font-semibold">{sale.customerName || 'Walk-in'}</span>
            </div>
            {sale.customerPhone && (
              <div className="flex justify-between">
                <span className="text-[#706458]">PHONE:</span>
                <span>{sale.customerPhone}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-[#706458]">CASHIER:</span>
              <span>{settings.adminName}</span>
            </div>
          </div>

          {/* Items Table */}
          <div className="py-3 border-b border-dashed border-[#CFC5B8]">
            <div className="grid grid-cols-12 font-bold text-[10px] text-[#706458] pb-1 uppercase border-b border-[#EAE2D5]">
              <span className="col-span-6">Item</span>
              <span className="col-span-2 text-center">Qty</span>
              <span className="col-span-4 text-right">Total</span>
            </div>

            <div className="divide-y divide-gray-100 py-1 space-y-1">
              {sale.items.map((item, idx) => (
                <div key={idx} className="grid grid-cols-12 text-[11px] pt-1.5">
                  <div className="col-span-6 pr-1 font-sans font-medium text-[#2D2723] leading-snug">
                    {item.productName}
                    <div className="text-[10px] font-mono text-[#8C7E72]">
                      {formatCurrency(item.unitPrice)} ea
                    </div>
                  </div>
                  <div className="col-span-2 text-center pt-0.5">{item.quantity}</div>
                  <div className="col-span-4 text-right font-bold pt-0.5 tabular-nums">
                    {formatCurrency(item.subtotal)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Financial Totals */}
          <div className="py-3 border-b border-dashed border-[#CFC5B8] space-y-1 text-xs">
            <div className="flex justify-between font-bold text-sm pt-1">
              <span>TOTAL DUE:</span>
              <span className="tabular-nums">{formatCurrency(sale.totalAmount)}</span>
            </div>
            <div className="flex justify-between text-[11px] pt-1">
              <span className="text-[#706458]">PAYMENT METHOD:</span>
              <span className="font-semibold">{sale.paymentMethod}</span>
            </div>
            <div className="flex justify-between text-[11px]">
              <span className="text-[#706458]">AMOUNT PAID:</span>
              <span className="tabular-nums font-bold text-emerald-800">
                {formatCurrency(sale.amountPaid)}
              </span>
            </div>
            {sale.debtAmount > 0 && (
              <div className="flex justify-between text-[11px] font-bold text-rose-800 bg-rose-50 p-1.5 rounded mt-1">
                <span>CREDIT / DEBT OWED:</span>
                <span className="tabular-nums">{formatCurrency(sale.debtAmount)}</span>
              </div>
            )}
          </div>

          {/* Footer note */}
          <div className="pt-4 text-center text-[10px] text-[#706458] space-y-1">
            <p className="font-semibold">Thank you for shopping at {settings.shopName}!</p>
            <p>Please keep this receipt for warranty and returns.</p>
            {sale.notes && <p className="italic text-[9px] mt-1 text-[#8C7E72]">"{sale.notes}"</p>}
          </div>
        </div>

        {/* Modal footer */}
        <div className="p-4 border-t border-[#F0E9DF] bg-[#FAF7F2] no-print">
          <button
            onClick={closeReceiptModal}
            className="w-full py-2.5 text-xs font-semibold text-[#5C3826] bg-white border border-[#E2D9CC] rounded-xl hover:bg-[#F2ECE3] transition-colors cursor-pointer"
          >
            Done & Return
          </button>
        </div>
      </div>
    </div>
  );
};
