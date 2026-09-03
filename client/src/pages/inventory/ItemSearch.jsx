import { useState, useEffect } from 'react';
import { Search, Loader2 } from 'lucide-react';
import ItemTable from '../../components/inventory/ItemTable';
import Modal from '../../components/common/Modal';
import api from '../../api/axios';
import { useNavigate } from 'react-router-dom';

const ItemSearch = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  
  const navigate = useNavigate();

  // Basic debounce implementation
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchTerm) {
        searchItems();
      } else {
        setItems([]);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  const searchItems = async () => {
    try {
      setLoading(true);
      const { data } = await api.get(`/items/search?q=${searchTerm}`);
      setItems(data);
    } catch (error) {
      console.error('Failed to search items', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item) => {
    navigate('/items/add', { state: { item } });
  };

  const handleDeleteConfirm = (id) => {
    setItemToDelete(id);
    setDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/items/${itemToDelete}`);
      setItems(items.filter((item) => item._id !== itemToDelete));
      setDeleteModalOpen(false);
      setItemToDelete(null);
    } catch (error) {
      console.error('Failed to delete item', error);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Search Items</h1>
        <p className="mt-1 text-sm text-gray-500">Find items quickly across your inventory</p>
      </div>

      <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="relative max-w-2xl mx-auto mb-8">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            autoFocus
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full rounded-lg border border-gray-300 py-3 pl-11 pr-10 text-base shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            placeholder="Search by Item ID, Name, or Category..."
          />
          {loading && (
            <div className="absolute inset-y-0 right-0 flex items-center pr-4">
              <Loader2 className="h-5 w-5 animate-spin text-indigo-500" />
            </div>
          )}
        </div>

        {searchTerm && (
          <div>
            <h3 className="mb-4 text-sm font-medium text-gray-500">
              {items.length} {items.length === 1 ? 'result' : 'results'} found for "{searchTerm}"
            </h3>
            <ItemTable 
              items={items} 
              onEdit={handleEdit} 
              onDelete={handleDeleteConfirm} 
            />
          </div>
        )}

        {!searchTerm && (
          <div className="py-12 text-center text-gray-500">
            <Search className="mx-auto h-12 w-12 text-gray-300 mb-4" />
            <p>Start typing to search for items</p>
          </div>
        )}
      </div>

      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Delete Item?"
      >
        <div className="space-y-6">
          <div className="text-sm text-gray-500">
            <p>Are you sure you want to delete this item?</p>
            <p className="mt-1">This action cannot be undone.</p>
          </div>
          <div className="flex justify-end gap-3">
            <button
              onClick={() => setDeleteModalOpen(false)}
              className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              className="rounded-md border border-transparent bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors"
            >
              Delete
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ItemSearch;
