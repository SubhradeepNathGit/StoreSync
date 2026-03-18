import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Plus, Menu, X } from 'lucide-react';
import SearchBar from '../components/common/SearchBar';

const Navbar = ({ searchTerm, setSearchTerm }) => {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleAddProduct = () => {
    navigate('/add-product');
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50 border-b border-gray-200">
      <div className="mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {}
          <Link 
            to="/" 
            className="flex items-center gap-2 text-xl font-bold text-gray-800 hover:text-blue-600 transition-colors"
          >
            <ShoppingBag className="w-6 h-6 text-blue-600" />
            <span className="hidden sm:inline">My Store</span>
            <span className="sm:hidden">CRUD</span>
          </Link>

          {}
          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={handleAddProduct}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              <Plus className="w-4 h-4" />
              Add Product
            </button>
          </div>

          {}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition"
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            {}
            <div className="mb-4">
              <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
            </div>

            {}
            <div className="space-y-2">
              <button
                onClick={handleAddProduct}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                <Plus className="w-4 h-4" />
                Add Product
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
