import React, { useState, useEffect } from 'react';
import { Search, Plus, Trash2, Package } from 'lucide-react';
import toast from 'react-hot-toast';

export const Billing = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Cart state
  const [cart, setCart] = useState([]);
  const [discount, setDiscount] = useState(0);

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

  const addToCart = (item) => {
    const existing = cart.find(c => c._id === item._id);
    if (existing) {
      if (existing.cartQty >= item.quantity) {
        toast.error('Not enough stock available');
        return;
      }
      setCart(cart.map(c => c._id === item._id ? { ...c, cartQty: c.cartQty + 1 } : c));
    } else {
      if (item.quantity <= 0) {
        toast.error('Out of stock');
        return;
      }
      setCart([...cart, { ...item, cartQty: 1 }]);
    }
  };

  const removeFromCart = (itemId) => {
    setCart(cart.filter(c => c._id !== itemId));
  };

  const updateCartQty = (itemId, qty) => {
    const newQty = parseInt(qty) || 1;
    const item = items.find(i => i._id === itemId);
    if (item && newQty > item.quantity) {
      toast.error('Not enough stock available');
      return;
    }
    setCart(cart.map(c => c._id === itemId ? { ...c, cartQty: newQty } : c));
  };

  const subtotal = cart.reduce((sum, item) => sum + (item.unitPrice * item.cartQty), 0);
  const grandTotal = subtotal - discount;

  const handleGenerateBill = async () => {
    if (cart.length === 0) {
      return toast.error('Cart is empty');
    }

    try {
      const payload = {
        billNumber: `INV-${Math.floor(1000 + Math.random() * 9000)}`,
        customerName: 'Walk-In Customer',
        customerEmail: '',
        customerPhone: '',
        paymentMethod: 'Cash',
        discount: Number(discount),
        tax: 0,
        items: cart.map(c => ({
          item: c._id,
          quantity: c.cartQty,
          unitPrice: c.unitPrice
        }))
      };

      const response = await fetch('/api/inventory/bills', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      if (data.success) {
        toast.success('Bill generated successfully');
        setCart([]);
        setDiscount(0);
        fetchItems(); // Refresh stock
      } else {
        toast.error(data.message || 'Failed to generate bill');
      }
    } catch (error) {
      toast.error('Error generating bill');
    }
  };

  const filteredItems = items.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="mb-2">
        <h2 className="text-2xl font-bold text-gray-800">Billing</h2>
        <p className="text-sm text-gray-500 mt-1">Create new invoice</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1">
        {/* Left Column: Add Items */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col h-full min-h-[600px]">
          <h3 className="font-bold text-gray-800 mb-4">Add Items</h3>
          
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Scan barcode or search item..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition-all text-sm"
            />
          </div>

          <div className="flex-1 overflow-y-auto pr-2 space-y-3">
            {loading ? (
              <p className="text-center text-gray-500 py-8">Loading items...</p>
            ) : filteredItems.length === 0 ? (
              <p className="text-center text-gray-500 py-8">No items found</p>
            ) : (
              filteredItems.map(item => (
                <div key={item._id} className="flex items-center justify-between p-3 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                      <Package className="w-5 h-5 text-gray-400" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800 text-sm">{item.name}</p>
                      <p className="text-xs text-gray-500">Stock: {item.quantity}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-semibold text-gray-800">₹{item.unitPrice.toLocaleString()}</span>
                    <button
                      onClick={() => addToCart(item)}
                      disabled={item.quantity <= 0}
                      className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center hover:bg-indigo-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Column: Current Bill */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col h-full min-h-[600px]">
          <h3 className="font-bold text-gray-800 mb-4">Current Bill</h3>
          
          <div className="flex-1 overflow-y-auto mb-6">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="text-xs font-semibold text-gray-400 border-b border-gray-100">
                <tr>
                  <th className="pb-3 pt-2">Item</th>
                  <th className="pb-3 pt-2">Price</th>
                  <th className="pb-3 pt-2 text-center">Qty</th>
                  <th className="pb-3 pt-2 text-right">Total</th>
                  <th className="pb-3 pt-2 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {cart.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="py-8 text-center text-gray-400">Cart is empty</td>
                  </tr>
                ) : (
                  cart.map(item => (
                    <tr key={item._id}>
                      <td className="py-3 font-medium text-gray-800">{item.name}</td>
                      <td className="py-3">₹{item.unitPrice.toLocaleString()}</td>
                      <td className="py-3 text-center">
                        <input
                          type="number"
                          min="1"
                          max={item.quantity}
                          value={item.cartQty}
                          onChange={(e) => updateCartQty(item._id, e.target.value)}
                          className="w-16 px-2 py-1 text-center bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-indigo-500"
                        />
                      </td>
                      <td className="py-3 text-right font-semibold text-gray-800">
                        ₹{(item.unitPrice * item.cartQty).toLocaleString()}
                      </td>
                      <td className="py-3 text-center">
                        <button
                          onClick={() => removeFromCart(item._id)}
                          className="text-red-400 hover:text-red-600 hover:bg-red-50 p-1.5 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="border-t border-gray-100 pt-4 space-y-3">
            <div className="flex justify-between text-sm font-medium text-gray-600">
              <span>Subtotal</span>
              <span>₹{subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center text-sm font-medium text-gray-600">
              <span>Discount</span>
              <div className="flex items-center gap-2">
                <span>₹</span>
                <input
                  type="number"
                  min="0"
                  value={discount}
                  onChange={(e) => setDiscount(Number(e.target.value))}
                  className="w-20 px-2 py-1 text-right bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
            <div className="flex justify-between text-lg font-bold text-gray-800 pt-2 border-t border-gray-100">
              <span>Grand Total</span>
              <span>₹{grandTotal.toLocaleString()}</span>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mt-6 pt-4">
              <button
                onClick={() => { setCart([]); setDiscount(0); }}
                className="py-3 text-gray-600 font-semibold bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors border border-gray-200"
              >
                Clear Bill
              </button>
              <button
                onClick={handleGenerateBill}
                disabled={cart.length === 0}
                className="py-3 bg-[#00D084] hover:bg-[#00B875] text-white font-semibold rounded-xl shadow-md shadow-[#00D084]/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Generate Bill
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
