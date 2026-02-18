'use client';

import { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Printer, Download } from 'lucide-react';
import type { Sale, Shop, Customer } from '@/lib/types';

interface IRDInvoiceProps {
  sale: Sale;
  shop: Shop;
  customer?: Customer;
  items: any[];
}

export function IRDInvoice({ sale, shop, customer, items }: IRDInvoiceProps) {
  const invoiceRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    if (invoiceRef.current) {
      const printWindow = window.open('', '', 'width=800,height=600');
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Invoice ${sale.sale_number}</title>
              <style>
                body { font-family: monospace; padding: 20px; }
                .invoice { max-width: 80mm; margin: 0 auto; }
                .center { text-align: center; }
                .right { text-align: right; }
                .line { border-top: 1px dashed #000; margin: 10px 0; }
                .bold { font-weight: bold; }
                table { width: 100%; border-collapse: collapse; }
                td { padding: 2px 0; }
                @media print {
                  body { margin: 0; padding: 10px; }
                }
              </style>
            </head>
            <body>
              ${invoiceRef.current.innerHTML}
              <script>
                window.onload = function() {
                  window.print();
                  window.close();
                }
              </script>
            </body>
          </html>
        `);
        printWindow.document.close();
      }
    }
  };

  const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0);
  const vatAmount = items.reduce((sum, item) => sum + item.tax_amount, 0);
  const discountAmount = sale.discount_amount || 0;
  const netTaxable = subtotal - discountAmount;

  return (
    <div className="space-y-4">
      {/* Action Buttons */}
      <div className="flex gap-2 print:hidden">
        <Button onClick={handlePrint} className="bg-blue-600 hover:bg-blue-700">
          <Printer className="h-4 w-4 mr-2" />
          Print Invoice
        </Button>
      </div>

      {/* Invoice */}
      <div 
        ref={invoiceRef}
        className="bg-white p-6 border border-slate-300 rounded-lg font-mono text-sm"
        style={{ maxWidth: '80mm', margin: '0 auto' }}
      >
        {/* Header */}
        <div className="text-center border-b-2 border-dashed border-slate-400 pb-3 mb-3">
          <h1 className="text-lg font-bold">{shop.name}</h1>
          {shop.ird_registered && (
            <p className="text-xs font-bold mt-1">TAX INVOICE</p>
          )}
          <p className="text-xs mt-1">{shop.address}</p>
          <p className="text-xs">Phone: {shop.phone}</p>
          {shop.pan_number && (
            <p className="text-xs">PAN: {shop.pan_number}</p>
          )}
          {shop.vat_number && (
            <p className="text-xs">VAT No: {shop.vat_number}</p>
          )}
        </div>

        {/* Invoice Details */}
        <div className="text-xs space-y-1 mb-3">
          <div className="flex justify-between">
            <span>Invoice No:</span>
            <span className="font-bold">{sale.sale_number}</span>
          </div>
          <div className="flex justify-between">
            <span>Date:</span>
            <span>{new Date(sale.created_at).toLocaleString('en-GB')}</span>
          </div>
          {sale.table_number && (
            <div className="flex justify-between">
              <span>Table:</span>
              <span className="font-bold">#{sale.table_number}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span>Payment:</span>
            <span className="uppercase">{sale.payment_method}</span>
          </div>
        </div>

        {/* Customer Details */}
        {customer && (
          <div className="text-xs border-t border-dashed border-slate-400 pt-2 mb-3">
            <p><strong>Customer:</strong> {customer.name}</p>
            {customer.phone && <p>Phone: {customer.phone}</p>}
            {customer.pan_number && <p>PAN: {customer.pan_number}</p>}
          </div>
        )}

        {/* Items Table */}
        <div className="border-t-2 border-b-2 border-dashed border-slate-400 py-2 mb-3">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-slate-300">
                <th className="text-left py-1">Item</th>
                <th className="text-center">Qty</th>
                <th className="text-right">Rate</th>
                <th className="text-right">Amt</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, idx) => (
                <tr key={idx} className="border-b border-slate-200">
                  <td className="py-1">{item.product_name}</td>
                  <td className="text-center">{item.quantity}</td>
                  <td className="text-right">{item.unit_price.toFixed(2)}</td>
                  <td className="text-right font-semibold">{item.subtotal.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="text-xs space-y-1 mb-3">
          <div className="flex justify-between">
            <span>Subtotal (Taxable):</span>
            <span>Rs {subtotal.toFixed(2)}</span>
          </div>
          {discountAmount > 0 && (
            <div className="flex justify-between text-green-700">
              <span>Discount:</span>
              <span>-Rs {discountAmount.toFixed(2)}</span>
            </div>
          )}
          {discountAmount > 0 && (
            <div className="flex justify-between border-t border-slate-300 pt-1">
              <span>Net Taxable:</span>
              <span>Rs {netTaxable.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span>VAT (13%):</span>
            <span>Rs {vatAmount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between font-bold text-base border-t-2 border-slate-400 pt-2 mt-2">
            <span>GRAND TOTAL:</span>
            <span>Rs {sale.total_amount.toFixed(2)}</span>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-xs border-t border-dashed border-slate-400 pt-3 space-y-1">
          <p className="font-semibold">Thank you for your visit!</p>
          <p>Visit again!</p>
          {shop.ird_registered && (
            <p className="text-xs mt-2 text-slate-600">
              This is a computer-generated invoice.
            </p>
          )}
          <p className="text-xs text-slate-600">
            For queries: {shop.email}
          </p>
        </div>
      </div>
    </div>
  );
}
