import React, { useState, useEffect } from 'react';
import { Package, Plus, Search, Edit, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

export const Items = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  const fetchItems = async () => {
    try {
      const response = await fetch('/api/inventory/items', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setItems(data.data);
      }
    } catch (error) {
      toast.error('Failed to fetch items');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        const response = await fetch(`/api/inventory/items/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        const data = await response.json();
        if (data.success) {
          toast.success('Item deleted successfully');
          fetchItems();
        }
      } catch (error) {
        toast.error('Error deleting item');
      }
    }
  };

  const filteredItems = items.filter(item => 
    item.name.toLowerCase().includes(search.toLowerCase()) ||
    item.sku.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <div className="flex justify-between items-center mb-8 border-b border-gray-100 pb-5">
          <div>
            <h2 className="text-xl font-bold text-gray-800">Items</h2>
            <p className="text-sm text-gray-500 mt-1">Manage all your items</p>
          </div>
          <button
            onClick={() => navigate('/inventory/add-item')}
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl shadow-md shadow-indigo-600/20 transition-all flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Add New Item
          </button>
        </div>

        <div className="mb-6">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by image, category or code..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition-colors"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="text-xs font-semibold text-gray-400 border-b border-gray-100">
              <tr>
                <th className="px-4 py-4 uppercase">ID</th>
                <th className="px-4 py-4 uppercase">Image</th>
                <th className="px-4 py-4 uppercase">Item Name</th>
                <th className="px-4 py-4 uppercase">Category</th>
                <th className="px-4 py-4 uppercase">Price (₹)</th>
                <th className="px-4 py-4 uppercase">Stock</th>
                <th className="px-4 py-4 uppercase">Status</th>
                <th className="px-4 py-4 uppercase text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan="8" className="px-4 py-8 text-center text-gray-500">Loading items...</td>
                </tr>
              ) : filteredItems.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-4 py-8 text-center text-gray-500">No items found.</td>
                </tr>
              ) : (
                filteredItems.map(item => (
                  <tr key={item._id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-5 font-semibold text-gray-800">#{item.sku}</td>
                    <td className="px-4 py-5">
                      <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                        <Package className="w-5 h-5 text-gray-400" />
                      </div>
                    </td>
                    <td className="px-4 py-5 font-semibold text-gray-800">{item.name}</td>
                    <td className="px-4 py-5 text-gray-500">{item.category}</td>
                    <td className="px-4 py-5 font-medium">{item.unitPrice.toLocaleString()}</td>
                    <td className="px-4 py-5">{item.quantity}</td>
                    <td className="px-4 py-5">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${item.quantity <= 5 ? 'text-red-600 bg-red-50' : 'text-emerald-600 bg-emerald-50'}`}>
                        {item.quantity <= 5 ? 'Low Stock' : 'In Stock'}
                      </span>
                    </td>
                    <td className="px-4 py-5">
                      <div className="flex justify-center gap-2">
                        <button
                          className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center hover:bg-indigo-100 transition-colors"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(item._id)}
                          className="w-8 h-8 rounded-full bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-100 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {!loading && filteredItems.length > 0 && (
          <div className="mt-4 flex justify-between items-center text-sm text-gray-500">
            <div>Showing 1 to {filteredItems.length} of {filteredItems.length} items</div>
            <div className="flex gap-1">
              <button className="px-3 py-1 border border-gray-200 rounded text-gray-400 hover:bg-gray-50">{'<'}</button>
              <button className="px-3 py-1 border border-indigo-600 bg-indigo-50 text-indigo-600 rounded font-medium">1</button>
              <button className="px-3 py-1 border border-gray-200 rounded text-gray-600 hover:bg-gray-50">2</button>
              <button className="px-3 py-1 border border-gray-200 rounded text-gray-600 hover:bg-gray-50">3</button>
              <span className="px-2 py-1">...</span>
              <button className="px-3 py-1 border border-gray-200 rounded text-gray-600 hover:bg-gray-50">10</button>
              <button className="px-3 py-1 border border-gray-200 rounded text-gray-600 hover:bg-gray-50">{'>'}</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
