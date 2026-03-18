import React, { useEffect, useState, useContext } from 'react';
import { toast } from 'react-toastify';
import { Plus, X, Package, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import productApi from '../../api/productApi';
import ProductList from '../../components/products/ProductList';
import Pagination from '../../components/common/Pagination';
import FilterBar from '../../components/products/FilterBar';
import SearchBar from '../../components/common/SearchBar';
import Sidebar from '../../components/layout/Sidebar';
import AuthContext from '../../context/AuthContext';
import AddProduct from './AddProduct';
import useSidebarStore from '../../store/useSidebarStore';
import { preloadImages } from '../../utils/imagePreloader';
import ConfirmationModal from '../../components/modals/ConfirmationModal';
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { TrendingUp, PieChart as PieIcon, ChevronDown, ChevronUp } from 'lucide-react';
import { useSocket } from '../../context/SocketContext';

const getColor = (index) => {
  
  const basePalette = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4", "#f43f5e", "#84cc16", "#0ea5e9"];
  if (index < basePalette.length) return basePalette[index];
  
  
  
  const hue = (index * 137.508) % 360;
  return `hsl(${hue}, 75%, 60%)`;
};

const CHART_STYLES = `
  .custom-scrollbar {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
  .custom-scrollbar::-webkit-scrollbar {
    display: none;
  }
`;

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const Home = () => {
  const navigate = useNavigate();
  const { hasPermission, user } = useContext(AuthContext);
  const { isOpen } = useSidebarStore();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const socket = useSocket();

  
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('');
  const [subcategory, setSubcategory] = useState('');
  const [categoryName, setCategoryName] = useState('');
  const [subcategoryName, setSubcategoryName] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);

  
  const [metrics, setMetrics] = useState(null);
  const [showAnalytics, setShowAnalytics] = useState(true);

  
  const priceBounds = {
    min: metrics?.minPrice ?? 0,
    max: metrics?.maxPrice ?? 50000,
  };

  
  const [sort, setSort] = useState('latest');
  const [filters, setFilters] = useState({
    minPrice: '',
    maxPrice: '',
    inStock: ''
  });

  
  const [isClearModalOpen, setIsClearModalOpen] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [sidebarRefreshTrigger, setSidebarRefreshTrigger] = useState(0);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  
  const [isSurgicalModalOpen, setIsSurgicalModalOpen] = useState(false);
  const [surgicalTarget, setSurgicalTarget] = useState(null); 

  
  const fetchMetrics = async () => {
    try {
      const data = await productApi.getMetrics();
      setMetrics(data);
    } catch {
      console.error('Error fetching metrics');
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  useEffect(() => {
    if (!socket) return;

    socket.on('PRODUCT_UPDATED', () => {
      fetchMetrics();
      setRefreshTrigger(prev => prev + 1);
    });

    return () => {
      socket.off('PRODUCT_UPDATED');
    };
  }, [socket]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        page,
        limit: 20,
        sort,
        ...filters
      };

      if (searchTerm.trim()) params.search = searchTerm.trim();

      if (category === 'trash') {
        params.isDeleted = true;
      } else {
        if (category) params.category = category;
        if (subcategory) params.subcategory = subcategory;
      }

      const response = await productApi.getAllProducts(params);

      setProducts(response.data || []);
      setTotalPages(response.totalPages || 1);
      setTotalProducts(response.totalProducts || 0);

      
      if (response.data && response.data.length > 0) {
        const imageUrls = response.data
          .map(p => p.image)
          .filter(url => url && url.startsWith('http'));
        preloadImages(imageUrls);
      }

      
      if (page === 1) fetchMetrics();
    } catch (error) {
      console.error('Error fetching products:', error);
      setError(error.response?.data?.message || 'Failed to load products');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchProducts();
    }, 500);

    return () => clearTimeout(delayDebounceFn);
    
  }, [page, searchTerm, category, subcategory, sort, filters, refreshTrigger]);

  useEffect(() => {
    if (page !== 1) setPage(1);
    
  }, [searchTerm, category, subcategory, sort, filters]);

  const handleSearch = (term) => setSearchTerm(term);

  const handleFilterChange = ({ category: cat, subcategory: sub }) => {
    setCategory(cat);
    setSubcategory(sub);
  };

  const handleRestore = async (id) => {
    try {
      await productApi.restoreProduct(id);
      fetchProducts();
    } catch (error) {
      console.error('Failed to restore', error);
    }
  };

  const handleForceDelete = async (id) => {
    try {
      await productApi.forceDeleteProduct(id);
      fetchProducts();
    } catch (error) {
      console.error('Failed to delete', error);
    }
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setCategory('');
    setCategoryName('');
    setSubcategory('');
    setSubcategoryName('');
    setSort('latest');
    setFilters({ minPrice: '', maxPrice: '', inStock: '' });
    setPage(1);
  };

  const handleClearInventory = async () => {
    if (totalProducts === 0) {
      toast.info("No products found to clear.");
      return;
    }
    setIsClearModalOpen(true);
  };

  const confirmClearInventory = async () => {
    try {
      setIsClearing(true);
      await productApi.bulkDeleteProducts();
      toast.success("Inventory cleared successfully");
      setIsClearModalOpen(false);
      handleClearFilters(); 
      setSidebarRefreshTrigger(prev => prev + 1); 
      fetchProducts();
      fetchMetrics();
    } catch {
      toast.error("Clear inventory failed");
    } finally {
      setIsClearing(false);
    }
  };

  const handleDeleteSurgical = (type, id, name) => {
    setSurgicalTarget({ type, id, name });
    setIsSurgicalModalOpen(true);
  };

  const confirmSurgicalDelete = async () => {
    try {
      setIsClearing(true);
      if (surgicalTarget.type === 'category') {
        await productApi.deleteCategory(surgicalTarget.id);
      } else {
        await productApi.deleteSubcategory(surgicalTarget.id);
      }
      toast.success(`${surgicalTarget.type.charAt(0).toUpperCase() + surgicalTarget.type.slice(1)} removed successfully`);
      setIsSurgicalModalOpen(false);
      handleClearFilters(); 
      setSidebarRefreshTrigger(prev => prev + 1);
      fetchProducts();
      fetchMetrics();
    } catch {
      toast.error("Deletion failed");
    } finally {
      setIsClearing(false);
      setSurgicalTarget(null);
    }
  };


  const categoryChartData = {
    labels: metrics?.categoryStats?.map(d => d.name) || [],
    datasets: [{
      label: 'Products',
      data: metrics?.categoryStats?.map(d => d.count) || [],
      backgroundColor: metrics?.categoryStats?.map((_, i) => getColor(i)) || [],
      borderRadius: 6,
      barThickness: 40,
    }]
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#fff',
        titleColor: '#0f172a',
        bodyColor: '#0f172a',
        borderColor: '#e2e8f0',
        borderWidth: 1,
        padding: 10,
        boxPadding: 4,
        usePointStyle: true,
        titleFont: { size: 13, weight: 'bold' },
        bodyFont: { size: 12, weight: 'bold' }
      }
    },
    scales: {
      x: { grid: { display: false }, ticks: { color: "#64748b", font: { size: 10, weight: 'bold' } }, border: { display: false } },
      y: { display: false }
    }
  };


  return (
    <div className="flex min-h-screen bg-slate-50 overflow-x-hidden">
      <style>{CHART_STYLES}</style>
      {}
      <Sidebar
        selectedCategory={category}
        selectedSubcategory={subcategory}
        onFilterChange={handleFilterChange}
        refreshTrigger={sidebarRefreshTrigger}
      />

      {}
      <div className={`w-full transition-all duration-300 flex-1 ${isOpen ? 'lg:ml-72' : 'lg:ml-20'}`}>
        <div className="pt-[72px] lg:pt-0">
          <div className="container mx-auto px-4 sm:px-6 lg:px-10 py-8 lg:py-12">

            {}
            <div className="mb-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Overview</span>
                </div>
                <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
                  Product <span className="text-slate-400 font-normal">Dashboard</span>
                  {category && category !== 'trash' && (
                    <span className="flex items-center gap-2 px-3 py-1 bg-slate-100 rounded-lg text-sm text-slate-600 border border-slate-200 ml-2 animate-in fade-in slide-in-from-left-2 duration-300">
                      {subcategory ? 'Sub:' : 'Cat:'} <span className="font-bold text-slate-900">{subcategoryName || categoryName}</span>
                      {user?.role === 'owner' && (
                        <button
                          onClick={() => handleDeleteSurgical(subcategory ? 'subcategory' : 'category', subcategory || category, subcategoryName || categoryName)}
                          className="p-1 hover:bg-red-100 hover:text-red-600 rounded-md transition-all group"
                          title="Delete this category/subcategory"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </span>
                  )}
                </h1>
                <p className="text-slate-500 font-medium text-base mt-1">Manage your shop's inventory and performance</p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                {hasPermission('create_product') && (
                  <button
                    onClick={() => navigate('/add-product')}
                    className="flex items-center gap-2 px-5 py-3.5 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-all duration-200 font-bold text-xs uppercase tracking-widest shadow-lg shadow-slate-200 active:scale-95"
                  >
                    <Plus className="w-4 h-4" />
                    Add Product
                  </button>
                )}
                {user?.role === 'owner' && (
                  <button
                    onClick={handleClearInventory}
                    className="flex items-center gap-2 px-5 py-3.5 bg-red-50 border border-red-100 text-red-600 rounded-xl hover:bg-red-100 transition-all duration-200 font-bold text-xs uppercase tracking-widest shadow-sm active:scale-95"
                  >
                    <Trash2 className="w-4 h-4" />
                    Clear Inventory
                  </button>
                )}
              </div>
            </div>

            {}
            <ConfirmationModal
              isOpen={isClearModalOpen}
              onClose={() => !isClearing && setIsClearModalOpen(false)}
              onConfirm={confirmClearInventory}
              isLoading={isClearing}
              title="Clear Inventory?"
              message="CRITICAL WARNING: This will PERMANENTLY delete ALL products, images, categories, and subcategories. This action is irreversible and cannot be undone."
              confirmText="Clear Everything"
              type="danger"
            />

            <ConfirmationModal
              isOpen={isSurgicalModalOpen}
              onClose={() => !isClearing && setIsSurgicalModalOpen(false)}
              onConfirm={confirmSurgicalDelete}
              isLoading={isClearing}
              title={`Remove ${surgicalTarget?.type === 'category' ? 'Category' : 'Subcategory'}?`}
              message={`Are you sure you want to remove the ${surgicalTarget?.type} "${surgicalTarget?.name}"? All products belonging to this ${surgicalTarget?.type} will be PERMANENTLY deleted.`}
              confirmText="Confirm Removal"
              type="danger"
            />

            {}
            <div className="mb-10">
              <div className="flex items-center justify-between mb-4">
                <button
                  onClick={() => setShowAnalytics(!showAnalytics)}
                  className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors"
                >
                  <TrendingUp className="w-4 h-4" />
                  <span className="text-xs font-bold uppercase tracking-widest">Store Analytics</span>
                  {showAnalytics ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
              </div>

              {showAnalytics && metrics && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-top-4 duration-500">
                  {}
                  <div className="lg:col-span-1 grid grid-cols-2 gap-4">
                    <div className="col-span-2 bg-indigo-600 p-6 rounded-2xl border border-indigo-700 shadow-lg shadow-indigo-200 text-white relative overflow-hidden group">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-white/20 transition-colors" />
                      <div className="relative z-10">
                        <p className="text-[10px] font-bold text-white/70 uppercase tracking-widest mb-1">Total Inventory Value</p>
                        <p className="text-3xl font-bold">
                          ₹ {(metrics?.totalInventoryValue || 0).toLocaleString()}
                        </p>
                        <div className="mt-3 flex items-center gap-2 text-[10px] font-bold text-white/50 uppercase tracking-wider">
                          <TrendingUp className="w-3 h-3" /> Realtime Valuation
                        </div>
                      </div>
                    </div>
                    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Total Items</p>
                      <p className="text-2xl font-bold text-slate-900">{metrics.totalProducts}</p>
                    </div>
                    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">In Stock</p>
                      <p className="text-2xl font-bold text-emerald-600">{metrics.inStock}</p>
                    </div>
                    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Out of Stock</p>
                      <p className="text-2xl font-bold text-amber-500">{metrics.outOfStock}</p>
                    </div>
                    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Archived</p>
                      <p className="text-2xl font-bold text-slate-400">{metrics.deletedProducts}</p>
                    </div>
                    <div className="col-span-2 bg-indigo-600 p-5 rounded-2xl border border-indigo-700 shadow-lg shadow-indigo-200 text-white flex items-center justify-between">
                      <div>
                        <p className="text-[10px] font-bold text-white/70 uppercase tracking-widest mb-1">Live Inventory Health</p>
                        <p className="text-xl font-bold">{Math.round((metrics.inStock / metrics.totalProducts || 0) * 100)}% Available</p>
                      </div>
                      <PieIcon className="w-8 h-8 text-white/30" />
                    </div>
                  </div>

                  {}
                  <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col">
                    <h3 className="text-sm font-bold text-slate-900 mb-6 flex items-center gap-2">
                      Category Distribution
                    </h3>
                    <div className="flex-1 overflow-x-auto overflow-y-hidden custom-scrollbar pb-2 flex flex-col justify-end">
                      <div style={{ height: "240px", minWidth: Math.max(600, (metrics?.categoryStats?.length || 0) * 100) }}>
                        <Bar data={categoryChartData} options={barOptions} />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {}
            {(metrics?.totalProducts > 0 || loading) && (
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm px-5 py-3.5 mb-8">
                <div className="flex flex-col lg:flex-row items-center gap-4">
                  {}
                  <div className="flex-1 w-full">
                    <SearchBar
                      searchTerm={searchTerm}
                      setSearchTerm={handleSearch}
                    />
                  </div>

                  {}
                  <div className="h-8 w-px bg-slate-100 hidden lg:block flex-shrink-0" />

                  {}
                  <div className="flex-shrink-0 w-full lg:w-auto">
                    <FilterBar
                      filters={filters}
                      setFilters={setFilters}
                      sort={sort}
                      setSort={setSort}
                      onClear={handleClearFilters}
                      minPriceBound={priceBounds.min}
                      maxPriceBound={priceBounds.max}
                    />
                  </div>
                </div>

                {}
                {(searchTerm || category || subcategory) && (
                  <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap items-center gap-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mr-1">Active Filters:</span>
                    {searchTerm && (
                      <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold">
                        <span>Search: {searchTerm}</span>
                        <X className="w-3 h-3 cursor-pointer hover:text-slate-900" onClick={() => setSearchTerm('')} />
                      </div>
                    )}
                    {category && (
                      <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold">
                        <span>{category === 'trash' ? 'Trash' : 'Category Filter'}</span>
                        <X className="w-3 h-3 cursor-pointer hover:text-slate-900" onClick={() => handleFilterChange({ category: '', subcategory: '' })} />
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {}
            <div className="min-h-[400px]">
              {loading && (
                <div className="flex flex-col items-center justify-center py-24">
                  <div className="relative w-12 h-12">
                    <div className="absolute inset-0 border-4 border-slate-200 rounded-full" />
                    <div className="absolute inset-0 border-4 border-slate-900 border-t-transparent rounded-full animate-spin" />
                  </div>
                  <p className="mt-5 text-slate-400 font-semibold uppercase tracking-widest text-[10px]">Loading Products...</p>
                </div>
              )}

              {error && !loading && (
                <div className="bg-red-50 border border-red-100 rounded-xl p-10 text-center max-w-xl mx-auto">
                  <div className="w-14 h-14 bg-red-100 rounded-xl flex items-center justify-center mx-auto mb-5">
                    <X className="w-7 h-7 text-red-600" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">Failed to Load</h3>
                  <p className="text-slate-500 font-medium mb-7 leading-relaxed">{error}</p>
                  <button
                    onClick={fetchProducts}
                    className="px-6 py-3 bg-slate-800 text-white rounded-xl font-semibold text-sm hover:bg-slate-900 transition-all active:scale-95 shadow-sm"
                  >
                    Retry
                  </button>
                </div>
              )}

              {!loading && !error && (
                <>
                  {products.length > 0 ? (
                    <div className="space-y-10">
                      <ProductList
                        products={products}
                        onRestore={handleRestore}
                        onForceDelete={handleForceDelete}
                        onSoftDelete={fetchProducts}
                      />

                      {totalPages > 1 && (
                        <div className="flex justify-center pb-10">
                          <Pagination
                            page={page}
                            setPage={setPage}
                            totalPages={totalPages}
                          />
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="bg-white rounded-xl border border-slate-200 p-16 text-center shadow-sm">
                      <div className="mb-6">
                        <div className="w-20 h-20 bg-slate-50 rounded-xl flex items-center justify-center mx-auto border border-slate-100">
                          <Package className="w-10 h-10 text-slate-300" />
                        </div>
                      </div>
                      <h3 className="text-xl font-bold text-slate-900 mb-2">No Products Found</h3>
                      <p className="text-slate-500 font-medium mb-8 max-w-sm mx-auto leading-relaxed">
                        No products match your current filters. Try adjusting your search or reset the filters.
                      </p>

                      <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                        <button
                          onClick={handleClearFilters}
                          className="px-6 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl font-semibold text-sm hover:bg-slate-50 transition-all active:scale-95 shadow-sm"
                        >
                          Clear Filters
                        </button>
                        {!searchTerm && !category && hasPermission('create_product') && (
                          <button
                            onClick={() => navigate('/add-product')}
                            className="px-6 py-3 bg-slate-800 text-white rounded-xl font-semibold text-sm hover:bg-slate-900 transition-all active:scale-95 shadow-sm"
                          >
                            Add First Product
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
