import React, { useState, useEffect } from 'react';
import { Eye, Search, Package } from 'lucide-react';
import toast from 'react-hot-toast';

export const SearchItem = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchQuery, setSearchQuery] = useState(''); // what to actually search for

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

  const handleSearch = (e) => {
    e.preventDefault();
    setSearchQuery(searchTerm);
  };

  const filteredItems = items.filter(item => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <div className="mb-8 border-b border-gray-100 pb-5">
          <h2 className="text-xl font-bold text-gray-800">Search Item</h2>
          <p className="text-sm text-gray-500 mt-1">Search your items</p>
        </div>

        <form onSubmit={handleSearch} className="flex gap-4 mb-8">
          <input
            type="text"
            placeholder="lap"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 focus:bg-white transition-colors"
          />
          <button
            type="submit"
            className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl shadow-md shadow-indigo-600/20 transition-all flex items-center gap-2"
          >
            Search
          </button>
        </form>

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
                      <div className="flex justify-center">
                        <button
                          className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center hover:bg-indigo-100 transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
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
          <div className="mt-4 text-sm text-gray-500">
            Showing 1 to {filteredItems.length} of {filteredItems.length} items
          </div>
        )}
      </div>
    </div>
  );
};
