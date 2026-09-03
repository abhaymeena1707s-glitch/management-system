import React from 'react';
import { formatCurrency } from '../../utils/formatCurrency';

const RecentTransactions = ({ transactions = [] }) => {
  if (!transactions.length) {
    return <p className="text-gray-500 py-4 text-center">No recent transactions found.</p>;
  }
  return (
    <div className="mt-4 space-y-4">
      {transactions.map(t => (
        <div key={t._id} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
          <div>
            <p className="font-medium text-gray-800">{t.customerName || 'Walk-in Customer'}</p>
            <p className="text-xs text-gray-500">{new Date(t.createdAt).toLocaleDateString()}</p>
          </div>
          <div className="text-right">
            <p className="font-semibold text-emerald-600">+{formatCurrency(t.grandTotal)}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default RecentTransactions;
