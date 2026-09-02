import { useState, useRef } from 'react';
import { Search, Plus, Trash2, Printer, Save, Loader2 } from 'lucide-react';
import api from '../../api/axios';
import { formatCurrency } from '../../utils/formatCurrency';
import PrintableInvoice from '../../components/inventory/PrintableInvoice';

const Billing = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  
  const [billItems, setBillItems] = useState([]);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  
  const [isSaving, setIsSaving] = useState(false);
  const [savedBill, setSavedBill] = useState(null);
  
  const printRef = useRef(null);

  const taxRate = 0.18; // 18% GST

  const handleSearch = async (e) => {
    const term = e.target.value;
    setSearchTerm(term);
    
    if (term.length > 1) {
      setIsSearching(true);
      try {
        const { data } = await api.get(`/items/search?q=${term}`);
        setSearchResults(data);
      } catch (error) {
        console.error('Failed to search items', error);
      } finally {
        setIsSearching(false);
      }
    } else {
      setSearchResults([]);
    }
  };

  const addItemToBill = (item) => {
    const existingItem = billItems.find((i) => i._id === item._id);
    if (existingItem) {
      setBillItems(
        billItems.map((i) =>
          i._id === item._id ? { ...i, quantity: i.quantity + 1 } : i
        )
      );
    } else {
      setBillItems([...billItems, { ...item, quantity: 1 }]);
    }
    setSearchTerm('');
    setSearchResults([]);
  };

  const updateQuantity = (id, newQuantity) => {
    if (newQuantity < 1) return;
    setBillItems(
      billItems.map((item) =>
        item._id === id ? { ...item, quantity: parseInt(newQuantity) } : item
      )
    );
  };

  const removeBillItem = (id) => {
    setBillItems(billItems.filter((item) => item._id !== id));
  };

  const subTotal = billItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const taxAmount = subTotal * taxRate;
  const grandTotal = subTotal + taxAmount;

  const handleSaveBill = async () => {
    if (billItems.length === 0) return;
    
    setIsSaving(true);
    try {
      const billData = {
        customerName,
        customerPhone,
        items: billItems.map((item) => ({
          itemId: item._id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
        })),
        subTotal,
        tax: taxAmount,
        grandTotal,
      };

      const { data } = await api.post('/bills', billData);
      setSavedBill(data);
      
      // Clear form
      setBillItems([]);
      setCustomerName('');
      setCustomerPhone('');
    } catch (error) {
      console.error('Failed to save bill', error);
      alert('Failed to save bill. Please check stock availability.');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePrint = () => {
    if (printRef.current) {
      const printContents = printRef.current.innerHTML;
      const originalContents = document.body.innerHTML;
      document.body.innerHTML = printContents;
      window.print();
      document.body.innerHTML = originalContents;
      window.location.reload(); // Quick way to restore React state after messing with DOM
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Billing</h1>
        <p className="mt-1 text-sm text-gray-500">Create new invoice and manage billing</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Column - Item Search & Bill Items */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">Add Items</h2>
            
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={handleSearch}
                className="block w-full rounded-md border border-gray-300 py-2 pl-10 pr-3 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                placeholder="Search items to add..."
              />
              {isSearching && (
                <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                  <Loader2 className="h-4 w-4 animate-spin text-indigo-500" />
                </div>
              )}

              {/* Search Results Dropdown */}
              {searchResults.length > 0 && (
                <div className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                  {searchResults.map((item) => (
                    <div
                      key={item._id}
                      onClick={() => addItemToBill(item)}
                      className="relative cursor-pointer select-none py-2 pl-3 pr-9 text-gray-900 hover:bg-indigo-50 hover:text-indigo-600"
                    >
                      <div className="flex justify-between">
                        <div>
                          <span className="block font-medium">{item.name}</span>
                          <span className="block text-xs text-gray-500">{item.itemId}</span>
                        </div>
                        <div className="text-right">
                          <span className="block font-medium">{formatCurrency(item.price)}</span>
                          <span className="block text-xs text-gray-500">Stock: {item.stock}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">Current Bill</h2>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 text-gray-500">
                  <tr>
                    <th className="px-4 py-3 font-medium">Item</th>
                    <th className="px-4 py-3 font-medium">Price</th>
                    <th className="px-4 py-3 font-medium">Qty</th>
                    <th className="px-4 py-3 font-medium">Total</th>
                    <th className="px-4 py-3 font-medium"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {billItems.map((item) => (
                    <tr key={item._id}>
                      <td className="px-4 py-3 font-medium text-gray-900">{item.name}</td>
                      <td className="px-4 py-3 text-gray-500">{formatCurrency(item.price)}</td>
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          min="1"
                          max={item.stock}
                          value={item.quantity}
                          onChange={(e) => updateQuantity(item._id, e.target.value)}
                          className="w-16 rounded-md border border-gray-300 px-2 py-1 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                      </td>
                      <td className="px-4 py-3 font-medium text-gray-900">
                        {formatCurrency(item.price * item.quantity)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => removeBillItem(item._id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {billItems.length === 0 && (
                    <tr>
                      <td colSpan="5" className="px-4 py-8 text-center text-gray-500">
                        No items added to the bill yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column - Summary & Customer Info */}
        <div className="space-y-6">
          <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">Customer Details</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Customer Name</label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  placeholder="Optional"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                <input
                  type="text"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  placeholder="Optional"
                />
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">Order Summary</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-gray-500">
                <span>Subtotal</span>
                <span className="font-medium text-gray-900">{formatCurrency(subTotal)}</span>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>Tax (18% GST)</span>
                <span className="font-medium text-gray-900">{formatCurrency(taxAmount)}</span>
              </div>
              <div className="my-4 border-t border-gray-200"></div>
              <div className="flex justify-between text-base font-bold text-gray-900">
                <span>Grand Total</span>
                <span>{formatCurrency(grandTotal)}</span>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              <button
                onClick={handleSaveBill}
                disabled={billItems.length === 0 || isSaving}
                className="flex w-full items-center justify-center gap-2 rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:bg-indigo-400"
              >
                {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save size={18} />}
                Generate Bill
              </button>
              
              {savedBill && (
                <button
                  onClick={handlePrint}
                  className="flex w-full items-center justify-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                  <Printer size={18} />
                  Print Invoice
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Hidden Printable Area */}
      {savedBill && (
        <div style={{ display: 'none' }}>
          <div ref={printRef}>
            <PrintableInvoice bill={savedBill} />
          </div>
        </div>
      )}
    </div>
  );
};

export default Billing;
