import React from 'react';
import { formatCurrency } from '../../utils/formatCurrency';

const PrintableInvoice = ({ bill }) => {
  if (!bill) return null;

  return (
    <div className="p-8 bg-white max-w-4xl mx-auto text-black">
      <div className="flex justify-between items-start border-b pb-6 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">INVOICE</h1>
          <p className="text-gray-500 mt-1">Invoice #{bill._id?.substring(0, 8).toUpperCase() || 'N/A'}</p>
        </div>
        <div className="text-right">
          <h2 className="text-xl font-semibold">Library Management System</h2>
          <p className="text-gray-500">123 Education Street</p>
          <p className="text-gray-500">City, State 12345</p>
        </div>
      </div>

      <div className="flex justify-between mb-8">
        <div>
          <h3 className="text-gray-500 text-sm font-semibold uppercase tracking-wider mb-2">Bill To</h3>
          <p className="font-medium text-gray-900">{bill.customerName || 'Walk-in Customer'}</p>
          {bill.customerPhone && <p className="text-gray-500">{bill.customerPhone}</p>}
        </div>
        <div className="text-right">
          <h3 className="text-gray-500 text-sm font-semibold uppercase tracking-wider mb-2">Date</h3>
          <p className="font-medium text-gray-900">
            {new Date(bill.createdAt || Date.now()).toLocaleDateString()}
          </p>
        </div>
      </div>

      <table className="w-full text-left mb-8">
        <thead>
          <tr className="border-b-2 border-gray-300">
            <th className="py-3 text-gray-800 font-semibold">Description</th>
            <th className="py-3 text-gray-800 font-semibold text-right">Price</th>
            <th className="py-3 text-gray-800 font-semibold text-right">Qty</th>
            <th className="py-3 text-gray-800 font-semibold text-right">Total</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {bill.items?.map((item, index) => (
            <tr key={index}>
              <td className="py-4 text-gray-800">{item.name}</td>
              <td className="py-4 text-gray-800 text-right">{formatCurrency(item.price)}</td>
              <td className="py-4 text-gray-800 text-right">{item.quantity}</td>
              <td className="py-4 text-gray-800 text-right font-medium">
                {formatCurrency(item.price * item.quantity)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="flex justify-end">
        <div className="w-1/2 space-y-3">
          <div className="flex justify-between text-gray-600">
            <span>Subtotal</span>
            <span>{formatCurrency(bill.subTotal)}</span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>Tax (18% GST)</span>
            <span>{formatCurrency(bill.tax)}</span>
          </div>
          <div className="flex justify-between text-xl font-bold text-gray-900 border-t pt-3 mt-3">
            <span>Total</span>
            <span>{formatCurrency(bill.grandTotal)}</span>
          </div>
        </div>
      </div>

      <div className="mt-16 text-center text-gray-500 text-sm">
        <p>Thank you for your business!</p>
      </div>
    </div>
  );
};

export default PrintableInvoice;
