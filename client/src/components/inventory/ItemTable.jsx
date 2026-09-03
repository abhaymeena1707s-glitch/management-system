import React from 'react';
import { Edit, Trash2 } from 'lucide-react';
import { formatCurrency } from '../../utils/formatCurrency';

const ItemTable = ({ items = [], onEdit, onDelete }) => {
  if (!items || items.length === 0) {
    return (
      <div className="py-8 text-center text-gray-500 bg-white rounded-lg border border-gray-100 shadow-sm">
        No items found in the inventory.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-100 bg-white shadow-sm">
      <table className="min-w-full divide-y divide-gray-200 text-sm text-left">
        <thead className="bg-gray-50 text-gray-500">
          <tr>
            <th className="px-6 py-4 font-semibold uppercase tracking-wider">Item Name & ID</th>
            <th className="px-6 py-4 font-semibold uppercase tracking-wider">Category</th>
            <th className="px-6 py-4 font-semibold uppercase tracking-wider text-right">Price</th>
            <th className="px-6 py-4 font-semibold uppercase tracking-wider text-right">Stock</th>
            <th className="px-6 py-4 font-semibold uppercase tracking-wider text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {items.map((item) => (
            <tr key={item._id} className="hover:bg-gray-50/50 transition-colors">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center gap-3">
                  {item.image ? (
                    <img src={`http://localhost:5000${item.image}`} alt={item.name} className="h-10 w-10 rounded-md object-cover border border-gray-200" />
                  ) : (
                    <div className="h-10 w-10 rounded-md bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-400 text-xs">No img</div>
                  )}
                  <div>
                    <div className="font-medium text-gray-900">{item.name}</div>
                    <div className="text-xs text-gray-500 font-mono mt-0.5">{item.itemId}</div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-100">
                  {item.category}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-gray-900 text-right font-medium">
                {formatCurrency(item.price)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right">
                <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-sm font-medium ${item.stock < 10 ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
                  {item.stock}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button
                  onClick={() => onEdit(item)}
                  className="text-indigo-600 hover:text-indigo-900 mr-3 p-1 rounded hover:bg-indigo-50 transition-colors"
                  title="Edit Item"
                >
                  <Edit size={18} />
                </button>
                <button
                  onClick={() => onDelete(item._id)}
                  className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50 transition-colors"
                  title="Delete Item"
                >
                  <Trash2 size={18} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ItemTable;
