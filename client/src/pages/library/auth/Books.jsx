import React, { useState, useEffect, useRef } from 'react';
import {
  Plus,
  Search,
  Filter,
  BookOpen,
  Edit2,
  Trash2,
  Eye,
  ShieldAlert,
  HardDrive,
  Link,
  X,
  Loader2,
  Check,
  Upload,
  UserCheck,
  FolderPlus,
} from 'lucide-react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import {
  getCoverImageUrl,
  formatCoverImageData,
  extractGoogleDriveFileId,
  processLocalImageFile,
  FALLBACK_BOOK_COVER,
} from '../utils/googleDriveUtils';

export const Books = () => {
  const { user } = useAuth();
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [authors, setAuthors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedAuthor, setSelectedAuthor] = useState('');
  const [availability, setAvailability] = useState('');
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });

  // Ref for local file upload from Laptop
  const fileInputRef = useRef(null);

  // Modal States
  const [showModal, setShowModal] = useState(false);
  const [editingBook, setEditingBook] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingBook, setDeletingBook] = useState(null);

  // Cover Image & Drive Modal States
  const [coverInputUrl, setCoverInputUrl] = useState('');
  const [showDriveModal, setShowDriveModal] = useState(false);
  const [driveInput, setDriveInput] = useState('');
  const [driveModalError, setDriveModalError] = useState('');

  // Quick Add Author & Category Modal States
  const [showAddAuthorModal, setShowAddAuthorModal] = useState(false);
  const [newAuthorName, setNewAuthorName] = useState('');
  const [newAuthorCountry, setNewAuthorCountry] = useState('');
  const [creatingAuthor, setCreatingAuthor] = useState(false);

  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [creatingCategory, setCreatingCategory] = useState(false);

  // Form State & Validation
  const [formErrors, setFormErrors] = useState({});
  const [formData, setFormData] = useState({
    title: '',
    isbn: '',
    author: '',
    category: '',
    description: '',
    publisher: '',
    publicationYear: new Date().getFullYear(),
    language: 'English',
    totalCopies: 1,
    shelfNumber: 'A-1',
    coverImage: '',
  });

  const fetchBooks = async (page = 1) => {
    setLoading(true);
    try {
      let query = `/books?page=${page}&limit=${pagination.limit}`;
      if (search) query += `&search=${encodeURIComponent(search)}`;
      if (selectedCategory) query += `&category=${selectedCategory}`;
      if (selectedAuthor) query += `&author=${selectedAuthor}`;
      if (availability) query += `&availability=${availability}`;

      const res = await api.get(query);
      if (res.data.success) {
        setBooks(res.data.data);
        setPagination(res.data.pagination);
      }
    } catch (err) {
      toast.error('Failed to load books');
    } finally {
      setLoading(false);
    }
  };

  const fetchMetadata = async () => {
    try {
      const [catRes, autRes] = await Promise.all([
        api.get('/categories'),
        api.get('/authors?limit=100'),
      ]);
      const loadedCategories = catRes.data.data || [];
      const loadedAuthors = autRes.data.data || [];
      setCategories(loadedCategories);
      setAuthors(loadedAuthors);
    } catch (err) {
      // ignore
    }
  };

  useEffect(() => {
    fetchMetadata();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchBooks(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search, selectedCategory, selectedAuthor, availability]);

  const handleOpenModal = (book = null) => {
    setFormErrors({});
    if (book) {
      setEditingBook(book);
      const imgVal = book.coverImage || '';
      setFormData({
        title: book.title || '',
        isbn: book.isbn || '',
        author: book.author?._id || book.author || '',
        category: book.category?._id || book.category || '',
        description: book.description || '',
        publisher: book.publisher || '',
        publicationYear: book.publicationYear || new Date().getFullYear(),
        language: book.language || 'English',
        totalCopies: book.totalCopies || 1,
        shelfNumber: book.shelfNumber || 'A-1',
        coverImage: imgVal,
      });
      setCoverInputUrl(
        typeof imgVal === 'string'
          ? imgVal
          : imgVal?.url || (imgVal?.fileId ? `https://lh3.googleusercontent.com/d/${imgVal.fileId}` : '')
      );
    } else {
      setEditingBook(null);
      const initialAuthor = authors.length > 0 ? authors[0]._id : '';
      const initialCategory = categories.length > 0 ? categories[0]._id : '';

      setFormData({
        title: '',
        isbn: '',
        author: initialAuthor,
        category: initialCategory,
        description: '',
        publisher: '',
        publicationYear: new Date().getFullYear(),
        language: 'English',
        totalCopies: 1,
        shelfNumber: 'A-1',
        coverImage: '',
      });
      setCoverInputUrl('');
    }
    setShowModal(true);
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.title || !formData.title.trim()) {
      errors.title = 'Book Title is required';
    }
    if (!formData.isbn || !formData.isbn.trim()) {
      errors.isbn = 'ISBN Number is required';
    }
    if (!formData.author) {
      errors.author = 'Please select an Author';
    }
    if (!formData.category) {
      errors.category = 'Please select a Category';
    }
    if (!formData.totalCopies || formData.totalCopies < 1) {
      errors.totalCopies = 'Total Copies must be at least 1';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Please fill in all required fields');
      return;
    }

    setSaving(true);
    try {
      let finalCover = formData.coverImage;
      if (!finalCover && coverInputUrl && coverInputUrl.trim()) {
        finalCover = formatCoverImageData(coverInputUrl);
      }

      const payload = {
        ...formData,
        coverImage: finalCover || formData.coverImage || '',
      };

      if (editingBook) {
        const res = await api.put(`/books/${editingBook._id}`, payload);
        if (res.data.success) {
          toast.success('Book updated successfully');
          setShowModal(false);
          fetchBooks(pagination.page);
        }
      } else {
        const res = await api.post('/books', payload);
        if (res.data.success) {
          toast.success('Book created successfully');
          setShowModal(false);
          fetchBooks(1);
        }
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to save book';
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingBook) return;
    try {
      const res = await api.delete(`/books/${deletingBook._id}`);
      if (res.data.success) {
        toast.success('Book deleted successfully');
        setShowDeleteModal(false);
        setDeletingBook(null);
        fetchBooks(pagination.page);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete book');
    }
  };

  const handleApplyUrl = (urlStr) => {
    if (!urlStr || !urlStr.trim()) {
      setFormData((prev) => ({ ...prev, coverImage: '' }));
      return;
    }
    const formatted = formatCoverImageData(urlStr);
    setFormData((prev) => ({ ...prev, coverImage: formatted }));
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file (JPG, PNG, WEBP, etc.)');
      return;
    }

    const loadingToast = toast.loading('Processing image from laptop...');
    try {
      const imageObject = await processLocalImageFile(file);
      setFormData((prev) => ({ ...prev, coverImage: imageObject }));
      setCoverInputUrl('');
      toast.success('Image selected from laptop!', { id: loadingToast });
    } catch (err) {
      toast.error(err.message || 'Failed to process image', { id: loadingToast });
    } finally {
      if (e.target) e.target.value = '';
    }
  };

  const handlePasteUrl = async () => {
    let text = coverInputUrl;
    try {
      if (navigator.clipboard && navigator.clipboard.readText) {
        const clipText = await navigator.clipboard.readText();
        if (clipText && clipText.trim()) {
          text = clipText.trim();
          setCoverInputUrl(text);
        }
      }
    } catch (err) {
      // Clipboard access unavailable or non-https, use input text
    }

    if (!text || !text.trim()) {
      toast.error('Please paste or type an image URL first');
      return;
    }

    handleApplyUrl(text);
    toast.success('Image URL applied successfully!');
  };

  const handleSelectDriveFile = (inputStr) => {
    if (!inputStr || !inputStr.trim()) {
      setDriveModalError('Please enter a Google Drive link or File ID');
      return;
    }
    const driveId = extractGoogleDriveFileId(inputStr);
    if (!driveId) {
      setDriveModalError(
        'Invalid Google Drive link or File ID. Please paste a valid link (e.g. drive.google.com/file/d/...)'
      );
      return;
    }
    const formatted = formatCoverImageData(inputStr, 'Google Drive Cover');
    setFormData((prev) => ({ ...prev, coverImage: formatted }));
    setCoverInputUrl(formatted.url);
    setShowDriveModal(false);
    setDriveInput('');
    setDriveModalError('');
    toast.success('Google Drive image set successfully');
  };

  const handleRemoveCover = () => {
    setFormData((prev) => ({ ...prev, coverImage: '' }));
    setCoverInputUrl('');
  };

  const handleQuickAddAuthor = async (e) => {
    e.preventDefault();
    if (!newAuthorName || !newAuthorName.trim()) {
      toast.error('Author name is required');
      return;
    }

    setCreatingAuthor(true);
    try {
      const res = await api.post('/authors', {
        name: newAuthorName.trim(),
        country: newAuthorCountry.trim() || 'International',
      });

      if (res.data.success) {
        const createdAuthor = res.data.data;
        toast.success(`Author "${createdAuthor.name}" added successfully`);

        setAuthors((prev) => [createdAuthor, ...prev]);
        setFormData((prev) => ({ ...prev, author: createdAuthor._id }));
        if (formErrors.author) {
          setFormErrors((prev) => ({ ...prev, author: null }));
        }

        setShowAddAuthorModal(false);
        setNewAuthorName('');
        setNewAuthorCountry('');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add author');
    } finally {
      setCreatingAuthor(false);
    }
  };

  const handleQuickAddCategory = async (e) => {
    e.preventDefault();
    if (!newCategoryName || !newCategoryName.trim()) {
      toast.error('Category name is required');
      return;
    }

    setCreatingCategory(true);
    try {
      const res = await api.post('/categories', {
        name: newCategoryName.trim(),
      });

      if (res.data.success) {
        const createdCat = res.data.data;
        toast.success(`Category "${createdCat.name}" added successfully`);

        setCategories((prev) => [createdCat, ...prev]);
        setFormData((prev) => ({ ...prev, category: createdCat._id }));
        if (formErrors.category) {
          setFormErrors((prev) => ({ ...prev, category: null }));
        }

        setShowAddCategoryModal(false);
        setNewCategoryName('');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add category');
    } finally {
      setCreatingCategory(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Add Button */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Book Inventory</h1>
          <p className="text-sm text-slate-500 font-medium mt-0.5">
            Manage your library's catalog, ISBN numbers, copies, and shelf numbers.
          </p>
        </div>

        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#FF6B00] hover:bg-[#E56000] text-white font-semibold text-sm rounded-xl shadow-md shadow-orange-500/20 transition"
        >
          <Plus className="w-4 h-4" />
          Add New Book
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row items-center gap-4">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search by title, ISBN, publisher..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[#F3F5F9] border border-slate-200/80 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#FF6B00]/20"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 outline-none"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </select>

          {/* Author Filter */}
          <select
            value={selectedAuthor}
            onChange={(e) => setSelectedAuthor(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 outline-none"
          >
            <option value="">All Authors</option>
            {authors.map((a) => (
              <option key={a._id} value={a._id}>
                {a.name}
              </option>
            ))}
          </select>

          {/* Availability Filter */}
          <select
            value={availability}
            onChange={(e) => setAvailability(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 outline-none"
          >
            <option value="">All Availability</option>
            <option value="available">In Stock</option>
            <option value="out_of_stock">Out of Stock</option>
          </select>
        </div>
      </div>

      {/* Books Data Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-12 text-center text-slate-400 text-sm">Loading books catalog...</div>
        ) : books.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-sm">No books found matching criteria.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-100 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  <th className="py-3.5 px-4">Book Details</th>
                  <th className="py-3.5 px-4">Author</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Shelf</th>
                  <th className="py-3.5 px-4 text-center">Copies</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
                {books.map((b) => (
                  <tr key={b._id} className="hover:bg-slate-50/60 transition">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={getCoverImageUrl(b.coverImage)}
                          alt="Cover"
                          referrerPolicy="no-referrer"
                          className="w-9 h-12 object-cover rounded-md shadow-sm border border-slate-200 bg-slate-100"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = FALLBACK_BOOK_COVER;
                          }}
                        />
                        <div>
                          <p className="font-semibold text-slate-800 text-sm">{b.title}</p>
                          <p className="text-[11px] text-slate-400 font-mono mt-0.5">ISBN: {b.isbn}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-600 font-semibold">{b.author?.name || 'N/A'}</td>
                    <td className="py-3 px-4">
                      <span className="px-2.5 py-1 bg-slate-100 text-slate-600 font-medium rounded-lg text-[11px]">
                        {b.category?.name || 'N/A'}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-500">{b.shelfNumber}</td>
                    <td className="py-3 px-4 text-center font-semibold">
                      <span className="text-[#FF6B00]">{b.availableCopies}</span> / {b.totalCopies}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`inline-block px-3 py-1 font-bold text-[10px] rounded-full ${
                          b.availableCopies > 0
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {b.availableCopies > 0 ? 'Available' : 'Out of Stock'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenModal(b)}
                          className="p-1.5 text-slate-400 hover:text-[#FF6B00] rounded-lg hover:bg-slate-100 transition"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        {user?.role === 'Admin' && (
                          <button
                            onClick={() => {
                              setDeletingBook(b);
                              setShowDeleteModal(true);
                            }}
                            className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-slate-100 transition"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Bar */}
        {pagination.totalPages > 1 && (
          <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>
              Showing page {pagination.page} of {pagination.totalPages} ({pagination.total} total)
            </span>
            <div className="flex items-center gap-2">
              <button
                disabled={pagination.page <= 1}
                onClick={() => fetchBooks(pagination.page - 1)}
                className="px-3 py-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50"
              >
                Previous
              </button>
              <button
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => fetchBooks(pagination.page + 1)}
                className="px-3 py-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add / Edit Book Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-100 max-w-xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-slate-900 border-b pb-3">
              {editingBook ? 'Edit Book Details' : 'Add New Book'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs font-medium text-slate-700">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1 font-semibold text-slate-700">Book Title *</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => {
                      setFormData({ ...formData, title: e.target.value });
                      if (formErrors.title) setFormErrors({ ...formErrors, title: null });
                    }}
                    className={`w-full p-2.5 border rounded-xl outline-none focus:ring-2 focus:ring-[#FF6B00]/20 ${
                      formErrors.title ? 'border-red-500 bg-red-50/20' : 'border-slate-200'
                    }`}
                  />
                  {formErrors.title && (
                    <p className="text-[11px] text-red-500 mt-1">{formErrors.title}</p>
                  )}
                </div>
                <div>
                  <label className="block mb-1 font-semibold text-slate-700">ISBN Number *</label>
                  <input
                    type="text"
                    value={formData.isbn}
                    onChange={(e) => {
                      setFormData({ ...formData, isbn: e.target.value });
                      if (formErrors.isbn) setFormErrors({ ...formErrors, isbn: null });
                    }}
                    className={`w-full p-2.5 border rounded-xl outline-none focus:ring-2 focus:ring-[#FF6B00]/20 font-mono ${
                      formErrors.isbn ? 'border-red-500 bg-red-50/20' : 'border-slate-200'
                    }`}
                  />
                  {formErrors.isbn && (
                    <p className="text-[11px] text-red-500 mt-1">{formErrors.isbn}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-semibold text-slate-700">Author *</label>
                    <button
                      type="button"
                      onClick={() => setShowAddAuthorModal(true)}
                      className="text-[11px] text-[#FF6B00] hover:text-[#D94400] font-semibold flex items-center gap-1 hover:underline"
                    >
                      <Plus className="w-3 h-3" />
                      Add New Author
                    </button>
                  </div>
                  <select
                    value={formData.author}
                    onChange={(e) => {
                      setFormData({ ...formData, author: e.target.value });
                      if (formErrors.author) setFormErrors({ ...formErrors, author: null });
                    }}
                    className={`w-full p-2.5 border rounded-xl outline-none focus:ring-2 focus:ring-[#FF6B00]/20 bg-white ${
                      formErrors.author ? 'border-red-500 bg-red-50/20' : 'border-slate-200'
                    }`}
                  >
                    <option value="">Select Author</option>
                    {authors.map((a) => (
                      <option key={a._id} value={a._id}>
                        {a.name}
                      </option>
                    ))}
                  </select>
                  {formErrors.author && (
                    <p className="text-[11px] text-red-500 mt-1">{formErrors.author}</p>
                  )}
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-semibold text-slate-700">Category *</label>
                    <button
                      type="button"
                      onClick={() => setShowAddCategoryModal(true)}
                      className="text-[11px] text-[#FF6B00] hover:text-[#D94400] font-semibold flex items-center gap-1 hover:underline"
                    >
                      <Plus className="w-3 h-3" />
                      Add New Category
                    </button>
                  </div>
                  <select
                    value={formData.category}
                    onChange={(e) => {
                      setFormData({ ...formData, category: e.target.value });
                      if (formErrors.category) setFormErrors({ ...formErrors, category: null });
                    }}
                    className={`w-full p-2.5 border rounded-xl outline-none focus:ring-2 focus:ring-[#FF6B00]/20 bg-white ${
                      formErrors.category ? 'border-red-500 bg-red-50/20' : 'border-slate-200'
                    }`}
                  >
                    <option value="">Select Category</option>
                    {categories.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                  {formErrors.category && (
                    <p className="text-[11px] text-red-500 mt-1">{formErrors.category}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block mb-1 font-semibold text-slate-700">Total Copies *</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.totalCopies}
                    onChange={(e) => {
                      setFormData({ ...formData, totalCopies: Number(e.target.value) });
                      if (formErrors.totalCopies) setFormErrors({ ...formErrors, totalCopies: null });
                    }}
                    className={`w-full p-2.5 border rounded-xl outline-none focus:ring-2 focus:ring-[#FF6B00]/20 ${
                      formErrors.totalCopies ? 'border-red-500 bg-red-50/20' : 'border-slate-200'
                    }`}
                  />
                  {formErrors.totalCopies && (
                    <p className="text-[11px] text-red-500 mt-1">{formErrors.totalCopies}</p>
                  )}
                </div>
                <div>
                  <label className="block mb-1 font-semibold text-slate-700">Shelf Number</label>
                  <input
                    type="text"
                    value={formData.shelfNumber}
                    onChange={(e) => setFormData({ ...formData, shelfNumber: e.target.value })}
                    className="w-full p-2.5 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#FF6B00]/20"
                  />
                </div>
                <div>
                  <label className="block mb-1 font-semibold text-slate-700">Publisher</label>
                  <input
                    type="text"
                    value={formData.publisher}
                    onChange={(e) => setFormData({ ...formData, publisher: e.target.value })}
                    className="w-full p-2.5 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#FF6B00]/20"
                  />
                </div>
              </div>

              {/* Cover Image Section */}
              <div className="space-y-2 pt-1 border-t border-slate-100">
                <label className="block font-semibold text-slate-700">Cover Image</label>

                {/* Hidden File Input for Laptop Selection */}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept="image/*"
                  className="hidden"
                />

                <div className="flex flex-col gap-2">
                  {/* Option 1: URL input + Paste button */}
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Paste image URL or Google Drive link..."
                      value={coverInputUrl}
                      onChange={(e) => {
                        setCoverInputUrl(e.target.value);
                        handleApplyUrl(e.target.value);
                      }}
                      className="flex-1 p-2.5 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#FF6B00]/20 text-xs"
                    />
                    <button
                      type="button"
                      onClick={handlePasteUrl}
                      className="px-3 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs flex items-center gap-1.5 transition whitespace-nowrap"
                      title="Paste URL from clipboard"
                    >
                      <Link className="w-3.5 h-3.5" />
                      Paste URL
                    </button>
                  </div>

                  {/* Option 2 & 3: Upload from Laptop & Google Drive buttons */}
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex-1 sm:flex-none px-3.5 py-2.5 bg-orange-50 hover:bg-orange-100 text-[#D94400] border border-orange-200/80 font-semibold rounded-xl text-xs flex items-center justify-center gap-1.5 transition shadow-sm"
                    >
                      <Upload className="w-3.5 h-3.5 text-[#FF6B00]" />
                      Select from Laptop
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setDriveInput('');
                        setDriveModalError('');
                        setShowDriveModal(true);
                      }}
                      className="flex-1 sm:flex-none px-3.5 py-2.5 bg-orange-50 hover:bg-orange-100 text-[#D94400] border border-orange-200/80 font-semibold rounded-xl text-xs flex items-center justify-center gap-1.5 transition shadow-sm"
                    >
                      <HardDrive className="w-3.5 h-3.5 text-[#FF6B00]" />
                      Choose from Google Drive
                    </button>
                  </div>
                </div>

                {/* Cover Image Preview */}
                {formData.coverImage && (
                  <div className="mt-3 p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={getCoverImageUrl(formData.coverImage)}
                        alt="Cover Preview"
                        referrerPolicy="no-referrer"
                        className="w-12 h-16 object-cover rounded-lg shadow-sm border border-slate-300 bg-white"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = FALLBACK_BOOK_COVER;
                        }}
                      />
                      <div>
                        <p className="font-semibold text-slate-800 text-xs truncate max-w-[220px]">
                          {typeof formData.coverImage === 'object'
                            ? formData.coverImage.fileName ||
                              (formData.coverImage.type === 'file'
                                ? 'Laptop Image'
                                : formData.coverImage.type === 'google_drive'
                                ? 'Google Drive Cover'
                                : 'Selected Cover')
                            : 'Cover Image Selected'}
                        </p>
                        {typeof formData.coverImage === 'object' &&
                          formData.coverImage.type === 'file' &&
                          formData.coverImage.fileSize && (
                            <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                              Size: {formData.coverImage.fileSize}
                            </p>
                          )}
                        {typeof formData.coverImage === 'object' && formData.coverImage.fileId && (
                          <p className="text-[10px] text-[#FF6B00] font-mono mt-0.5">
                            Drive ID: {formData.coverImage.fileId}
                          </p>
                        )}
                        <div className="flex items-center gap-1.5 mt-1">
                          <span className="inline-block px-2 py-0.5 bg-emerald-100 text-emerald-800 font-bold text-[9px] rounded-full">
                            Preview Ready
                          </span>
                          <span className="inline-block px-2 py-0.5 bg-orange-50 text-[#D94400] font-medium text-[9px] rounded-full capitalize">
                            {typeof formData.coverImage === 'object'
                              ? formData.coverImage.type === 'file'
                                ? 'Laptop File'
                                : formData.coverImage.type === 'google_drive'
                                ? 'Google Drive'
                                : 'Image URL'
                              : 'Image URL'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleRemoveCover}
                      className="px-2.5 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 font-semibold text-xs rounded-lg flex items-center gap-1 transition border border-red-200"
                    >
                      <X className="w-3.5 h-3.5" />
                      Remove
                    </button>
                  </div>
                )}
              </div>

              <div>
                <label className="block mb-1 font-semibold text-slate-700">Description</label>
                <textarea
                  rows="3"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full p-2.5 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#FF6B00]/20"
                ></textarea>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border rounded-xl font-semibold hover:bg-slate-50 text-slate-700 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 bg-[#FF6B00] text-white rounded-xl font-semibold hover:bg-[#E56000] disabled:opacity-50 flex items-center gap-2 shadow-sm"
                >
                  {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                  {saving ? 'Saving Book...' : 'Save Book'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Google Drive Selection Modal */}
      {showDriveModal && (
        <div className="fixed inset-0 z-[60] bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-100 max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-orange-100 text-[#FF6B00] rounded-xl">
                  <HardDrive className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">Select Image from Google Drive</h4>
                  <p className="text-[11px] text-slate-500">Paste your Google Drive link or File ID</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowDriveModal(false);
                  setDriveModalError('');
                }}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block mb-1 font-semibold text-slate-700">Google Drive Link / File ID</label>
                <input
                  type="text"
                  placeholder="https://drive.google.com/file/d/1A2B3C.../view?usp=sharing"
                  value={driveInput}
                  onChange={(e) => {
                    setDriveInput(e.target.value);
                    setDriveModalError('');
                  }}
                  className="w-full p-2.5 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#FF6B00]/20 font-mono text-xs"
                />
              </div>

              {driveModalError && (
                <div className="p-2.5 bg-red-50 text-red-600 text-[11px] font-medium rounded-xl border border-red-200">
                  {driveModalError}
                </div>
              )}

              <div className="p-3 bg-orange-50/60 rounded-xl border border-orange-100 text-[11px] text-slate-600 space-y-1">
                <p className="font-semibold text-[#B33600]">💡 How to share your Google Drive image:</p>
                <ol className="list-decimal pl-4 space-y-1">
                  <li>Right-click image in Google Drive & click <b>Share</b>.</li>
                  <li>Set permission to <b>"Anyone with the link can view"</b>.</li>
                  <li>Copy link and paste it in the box above.</li>
                </ol>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowDriveModal(false);
                  setDriveModalError('');
                }}
                className="px-4 py-2 border rounded-xl text-xs font-semibold hover:bg-slate-50 text-slate-700"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleSelectDriveFile(driveInput)}
                className="px-4 py-2 bg-[#FF6B00] text-white rounded-xl text-xs font-semibold hover:bg-[#E56000] flex items-center gap-1.5 shadow-sm"
              >
                <Check className="w-3.5 h-3.5" />
                Apply Drive Image
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-100 max-w-md w-full p-6 space-y-4 text-center">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Delete Book</h3>
            <p className="text-xs text-slate-500">
              Are you sure you want to delete <span className="font-bold text-slate-800">"{deletingBook?.title}"</span>? Safe deletion verification will check for active issued copies.
            </p>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 border rounded-xl text-xs font-semibold hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-xl text-xs font-semibold hover:bg-red-700"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Add Author Modal */}
      {showAddAuthorModal && (
        <div className="fixed inset-0 z-[70] bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-[#FF6B00]" />
                Add New Author
              </h4>
              <button
                type="button"
                onClick={() => setShowAddAuthorModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleQuickAddAuthor} className="space-y-3 text-xs">
              <div>
                <label className="block mb-1 font-semibold text-slate-700">Author Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Robert Kiyosaki, J.K. Rowling..."
                  value={newAuthorName}
                  onChange={(e) => setNewAuthorName(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#FF6B00]/20"
                  autoFocus
                />
              </div>

              <div>
                <label className="block mb-1 font-semibold text-slate-700">Country / Nationality</label>
                <input
                  type="text"
                  placeholder="e.g. United States, India, International..."
                  value={newAuthorCountry}
                  onChange={(e) => setNewAuthorCountry(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#FF6B00]/20"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddAuthorModal(false)}
                  className="px-3.5 py-2 border rounded-xl font-semibold hover:bg-slate-50 text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingAuthor}
                  className="px-4 py-2 bg-[#FF6B00] hover:bg-[#E56000] text-white font-semibold rounded-xl flex items-center gap-1.5 shadow-sm disabled:opacity-50"
                >
                  {creatingAuthor && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  {creatingAuthor ? 'Adding Author...' : 'Add & Select Author'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Quick Add Category Modal */}
      {showAddCategoryModal && (
        <div className="fixed inset-0 z-[70] bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <FolderPlus className="w-4 h-4 text-[#FF6B00]" />
                Add New Category
              </h4>
              <button
                type="button"
                onClick={() => setShowAddCategoryModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleQuickAddCategory} className="space-y-3 text-xs">
              <div>
                <label className="block mb-1 font-semibold text-slate-700">Category Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Science Fiction, Technology, History..."
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#FF6B00]/20"
                  autoFocus
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddCategoryModal(false)}
                  className="px-3.5 py-2 border rounded-xl font-semibold hover:bg-slate-50 text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingCategory}
                  className="px-4 py-2 bg-[#FF6B00] hover:bg-[#E56000] text-white font-semibold rounded-xl flex items-center gap-1.5 shadow-sm disabled:opacity-50"
                >
                  {creatingCategory && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  {creatingCategory ? 'Adding Category...' : 'Add & Select Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
