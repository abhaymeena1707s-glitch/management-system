import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const BRANDS = [
  { name: 'HP', icon: 'https://upload.wikimedia.org/wikipedia/commons/a/ad/HP_logo_2012.svg' },
  { name: 'Dell', icon: 'https://upload.wikimedia.org/wikipedia/commons/1/18/Dell_logo_2016.svg' },
  { name: 'Lenovo', icon: 'https://upload.wikimedia.org/wikipedia/commons/b/b8/Lenovo_logo_2015.svg' },
  { name: 'ASUS', icon: 'https://upload.wikimedia.org/wikipedia/commons/2/2e/ASUS_Logo.svg' },
  { name: 'Acer', icon: 'https://upload.wikimedia.org/wikipedia/commons/8/8b/Acer-logo.svg' },
  { name: 'Apple', icon: 'https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg' },
  { name: 'MSI', icon: 'https://upload.wikimedia.org/wikipedia/commons/b/b1/MSI_Logo.svg' },
  { name: 'Samsung', icon: 'https://upload.wikimedia.org/wikipedia/commons/2/24/Samsung_Logo.svg' },
];

const BrandsView = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/dashboard')}
          className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Laptops</h1>
          <p className="mt-1 text-sm text-gray-500">Select a brand to view available products</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {BRANDS.map((brand) => (
          <Link
            key={brand.name}
            to={`/laptops/${brand.name.toLowerCase()}`}
            className="group flex flex-col items-center justify-center rounded-xl border border-gray-100 bg-white p-8 shadow-sm transition-all duration-200 hover:shadow-md hover:border-indigo-100"
          >
            <div className="h-16 w-32 mb-4 flex items-center justify-center opacity-70 group-hover:opacity-100 transition-opacity">
              <img src={brand.icon} alt={brand.name} className="max-h-full max-w-full object-contain" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 group-hover:text-indigo-600 transition-colors">
              {brand.name}
            </h3>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default BrandsView;
