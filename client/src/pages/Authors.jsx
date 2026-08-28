import React, { useState, useEffect } from 'react';
import { UserCheck, Plus, Edit2, Trash2, BookOpen, Search } from 'lucide-react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

export const Authors = () => {
  const { user } = useAuth();
  const [authors, setAuthors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingAuthor, setEditingAuthor] = useState(null);

  const [formData, setFormData] = useState({ name: '', country: '', bio: '', photo: '' });

  const fetchAuthors = async () => {
    setLoading(true);
    try {
      let query = '/authors?limit=50';
      if (search) query += `&search=${encodeURIComponent(search)}`;
      const res = await api.get(query);
      if (res.data.success) {
        setAuthors(res.data.data || []);
      }
    } catch (err) {
      toast.error('Failed to load authors');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(fetchAuthors, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const handleOpenModal = (author = null) => {
    if (author) {
      setEditingAuthor(author);
      setFormData({
        name: author.name || '',
        country: author.country || '',
        bio: author.bio || '',
        photo: author.photo || '',
      });
    } else {
      setEditingAuthor(null);
      setFormData({ name: '', country: '', bio: '', photo: '' });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingAuthor) {
        const res = await api.put(`/authors/${editingAuthor._id}`, formData);
        if (res.data.success) {
          toast.success('Author updated');
          setShowModal(false);
          fetchAuthors();
        }
      } else {
        const res = await api.post('/authors', formData);
        if (res.data.success) {
          toast.success('Author created');
          setShowModal(false);
          fetchAuthors();
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save author');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this author?')) return;
    try {
      const res = await api.delete(`/authors/${id}`);
      if (res.data.success) {
        toast.success('Author deleted');
        fetchAuthors();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete author');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Authors Directory</h1>
          <p className="text-sm text-slate-500 font-medium mt-0.5">
            Manage author profiles, biographies, countries, and written book catalogs.
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#FF6B00] hover:bg-[#E56000] text-white font-semibold text-sm rounded-xl shadow-md shadow-orange-500/20"
        >
          <Plus className="w-4 h-4" />
          Add Author
        </button>
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search author by name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[#F3F5F9] border border-slate-200/80 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#FF6B00]/20"
          />
        </div>
      </div>

      {loading ? (
        <div className="py-12 text-center text-slate-400 text-sm">Loading authors...</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {authors.map((aut) => (
            <div
              key={aut._id}
              className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition space-y-4 flex flex-col justify-between"
            >
              <div className="flex items-start gap-4">
                <img
                  src={
                    aut.photo ||
                    'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=256'
                  }
                  alt="Author"
                  className="w-14 h-14 rounded-full object-cover ring-2 ring-orange-500/20 flex-shrink-0"
                />
                <div>
                  <h3 className="font-bold text-slate-900 text-base">{aut.name}</h3>
                  <p className="text-xs text-[#FF6B00] font-semibold">{aut.country || 'International'}</p>
                  <span className="inline-block mt-1 px-2.5 py-0.5 bg-slate-100 text-slate-600 font-bold text-[10px] rounded-full">
                    {aut.bookCount || 0} Published Books
                  </span>
                </div>
              </div>

              <p className="text-xs text-slate-500 line-clamp-2">{aut.bio || 'No biography details provided.'}</p>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  onClick={() => handleOpenModal(aut)}
                  className="p-1.5 text-slate-400 hover:text-[#FF6B00] rounded-lg hover:bg-slate-50"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                {user?.role === 'Admin' && (
                  <button
                    onClick={() => handleDelete(aut._id)}
                    className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-slate-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-100 max-w-md w-full p-6 space-y-4">
            <h3 className="text-lg font-bold text-slate-900 border-b pb-2">
              {editingAuthor ? 'Edit Author Profile' : 'Add New Author'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Author Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full p-2.5 border rounded-xl bg-[#F3F5F9] focus:ring-2 focus:ring-[#FF6B00]/20 outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Country / Nationality</label>
                <input
                  type="text"
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  className="w-full p-2.5 border rounded-xl bg-[#F3F5F9] focus:ring-2 focus:ring-[#FF6B00]/20 outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Photo URL</label>
                <input
                  type="text"
                  placeholder="https://images.unsplash.com/..."
                  value={formData.photo}
                  onChange={(e) => setFormData({ ...formData, photo: e.target.value })}
                  className="w-full p-2.5 border rounded-xl bg-[#F3F5F9] focus:ring-2 focus:ring-[#FF6B00]/20 outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Biography</label>
                <textarea
                  rows="3"
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  className="w-full p-2.5 border rounded-xl bg-[#F3F5F9] focus:ring-2 focus:ring-[#FF6B00]/20 outline-none"
                ></textarea>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border rounded-xl font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#FF6B00] text-white rounded-xl font-semibold hover:bg-[#E56000]"
                >
                  Save Author
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
