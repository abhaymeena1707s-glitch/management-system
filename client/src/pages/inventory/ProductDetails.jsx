import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Package, Tag, Layers, FileText } from 'lucide-react';
import api from '../services/api';
import { formatCurrency } from '../utils/formatCurrency';

const ProductDetails = () => {
  const { itemId } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/items/${itemId}`);
        setProduct(res.data);
      } catch (error) {
        console.error('Failed to fetch product details', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [itemId]);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex h-64 flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 bg-gray-50">
        <p className="text-gray-500">Product not found.</p>
        <button
          onClick={() => navigate(-1)}
          className="mt-4 text-indigo-600 hover:text-indigo-700"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Product Details</h1>
          <p className="mt-1 text-sm text-gray-500">{product.itemId}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-white p-8 rounded-xl border border-gray-100 shadow-sm">
        {/* Image Section */}
        <div className="rounded-xl overflow-hidden bg-gray-50 border border-gray-100 flex items-center justify-center min-h-[300px]">
          {product.image ? (
            <img
              src={product.image.startsWith('http') ? product.image : `http://localhost:5000${product.image}`}
              alt={product.name}
              className="w-full h-full object-contain"
            />
          ) : (
            <div className="text-gray-400 flex flex-col items-center">
              <Package size={48} className="mb-2 opacity-50" />
              <span>No image available</span>
            </div>
          )}
        </div>

        {/* Details Section */}
        <div className="space-y-6">
          <div>
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-bold text-gray-900">{product.name}</h2>
              <span
                className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${
                  product.status === 'In Stock'
                    ? 'bg-green-100 text-green-800'
                    : product.status === 'Low Stock'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-red-100 text-red-800'
                }`}
              >
                {product.status}
              </span>
            </div>
            <div className="mt-4 text-4xl font-extrabold text-indigo-600">
              {formatCurrency(product.price)}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-6 border-t border-gray-100">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-gray-50 rounded-lg text-gray-400">
                <Tag size={20} />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Brand</p>
                <p className="text-base font-semibold text-gray-900">{product.brand || 'N/A'}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2 bg-gray-50 rounded-lg text-gray-400">
                <Layers size={20} />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Category</p>
                <p className="text-base font-semibold text-gray-900">{product.category}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2 bg-gray-50 rounded-lg text-gray-400">
                <Package size={20} />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Stock Available</p>
                <p className="text-base font-semibold text-gray-900">{product.stock} Units</p>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-gray-100">
            <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-900 mb-3">
              <FileText size={20} className="text-gray-400" />
              Description
            </h3>
            <p className="text-gray-600 leading-relaxed">
              {product.description || 'No description provided for this product.'}
            </p>
          </div>
          
          <div className="pt-6 flex gap-4">
            <button className="flex-1 bg-indigo-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-indigo-700 transition-colors">
              Edit Product
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
