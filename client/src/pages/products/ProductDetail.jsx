import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ChevronLeft, Pencil, Trash2, RotateCcw, Package,
  ShieldCheck, CheckCircle2, XCircle
} from 'lucide-react';
import { toast } from 'react-toastify';
import productApi from '../../api/productApi';
import AuthContext from '../../context/AuthContext';
import Sidebar from '../../components/layout/Sidebar';
import useSidebarStore from '../../store/useSidebarStore';
import OptimizedImage from '../../components/common/OptimizedImage';
import ConfirmationModal from '../../components/modals/ConfirmationModal';

const TableRow = ({ label, value, last = false }) => (
  <div className={`flex items-center justify-between py-3 ${!last ? 'border-b border-slate-100' : ''}`}>
    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{label}</span>
    <span className="text-sm font-semibold text-slate-800 text-right">{value}</span>
  </div>
);

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, hasPermission } = useContext(AuthContext);
  const { isOpen } = useSidebarStore();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  // Modal state
  const [showTrashModal, setShowTrashModal]     = useState(false);
  const [showForceModal, setShowForceModal]     = useState(false);
  const [isTrashLoading, setIsTrashLoading]     = useState(false);
  const [isForceLoading, setIsForceLoading]     = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProductDetail();
    
  }, [id]);

  const fetchProductDetail = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await productApi.getProductById(id);
      setProduct(data);
    } catch (error) {
      console.error('Error fetching product:', error);
      setError(error.response?.data?.message || 'Failed to load product details');
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async () => {
    try {
      await productApi.restoreProduct(id);
      navigate('/');
    } catch (error) {
      console.error('Error restoring:', error);
    }
  };

  const handleSoftDelete = async () => {
    setIsTrashLoading(true);
    try {
      await productApi.deleteProduct(id);
      toast.success('Product moved to trash');
      navigate('/');
    } catch (error) {
      console.error('Error deleting:', error);
      toast.error('Failed to move to trash');
    } finally {
      setIsTrashLoading(false);
      setShowTrashModal(false);
    }
  };

  const handleForceDelete = async () => {
    setIsForceLoading(true);
    try {
      await productApi.forceDeleteProduct(id);
      toast.success('Product permanently deleted');
      navigate('/');
    } catch (error) {
      console.error('Error purging:', error);
      toast.error('Failed to delete permanently');
    } finally {
      setIsForceLoading(false);
      setShowForceModal(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-slate-50">
        <Sidebar selectedCategory="" onFilterChange={() => { }} />
        <div className="flex-1 flex items-center justify-center">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 border-4 border-slate-200 rounded-full" />
            <div className="absolute inset-0 border-4 border-slate-800 border-t-transparent rounded-full animate-spin" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="flex min-h-screen bg-slate-50">
        <Sidebar selectedCategory="" onFilterChange={() => { }} />
        <div className="flex-1 flex flex-col items-center justify-center p-10">
          <div className="p-8 bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50 text-center max-w-md">
            <div className="w-20 h-20 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Package className="w-10 h-10 text-red-500" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Product Not Found</h2>
            <p className="text-slate-500 font-medium mb-8 text-sm">The requested product does not exist or has been removed.</p>
            <button
              onClick={() => navigate('/')}
              className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-black transition-all"
            >
              Return to Catalog
            </button>
          </div>
        </div>
      </div>
    );
  }

  const imageUrl = product.image && product.image.startsWith('http')
    ? product.image
    : 'https://via.placeholder.com/300';

  const categoryName = typeof product.category === 'object' ? product.category?.name : product.category;
  const subcategoryName = product.subcategory?.name;

  return (
    <>
      {/* Move to Trash modal */}
      <ConfirmationModal
        isOpen={showTrashModal}
        onClose={() => setShowTrashModal(false)}
        onConfirm={handleSoftDelete}
        title="Move to Trash?"
        message={`"${product.name}" will be moved to trash. You can restore it anytime from the Trash section.`}
        confirmText="Move to Trash"
        cancelText="Cancel"
        type="warning"
        isLoading={isTrashLoading}
      />

      {/* Permanent Delete modal */}
      <ConfirmationModal
        isOpen={showForceModal}
        onClose={() => setShowForceModal(false)}
        onConfirm={handleForceDelete}
        title="Delete Permanently?"
        message={`"${product.name}" will be permanently deleted and cannot be recovered.`}
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
        isLoading={isForceLoading}
      />

      <div className="flex min-h-screen bg-slate-50 overflow-x-hidden">
        <Sidebar selectedCategory="" onFilterChange={() => { }} />

        {}
        <div className={`w-full transition-all duration-300 flex-1 ${isOpen ? 'lg:ml-72' : 'lg:ml-20'}`}>
        <div className="pt-[72px] lg:pt-0">
          <div className="container mx-auto px-4 sm:px-6 lg:px-10 py-8 lg:py-12">

            {}
            <div className="mb-6">
              <button
                onClick={() => navigate('/')}
                className="group flex items-center gap-2 text-slate-400 hover:text-slate-900 font-bold transition-all text-[10px] uppercase tracking-widest"
              >
                <ChevronLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
                Back to Catalog
              </button>
            </div>

            {}
            <div className="mb-8 flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-2">
              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2.5">
                  <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
                    {product.name}
                  </h1>
                  {product.inStock ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-bold uppercase tracking-wider border border-emerald-100">
                      <CheckCircle2 className="w-3 h-3" /> In Stock
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-50 text-red-500 rounded-full text-[10px] font-bold uppercase tracking-wider border border-red-100">
                      <XCircle className="w-3 h-3" /> Out of Stock
                    </span>
                  )}
                  {product.isDeleted && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-600 rounded-full text-[10px] font-bold uppercase tracking-wider border border-amber-100">
                      Archived
                    </span>
                  )}
                </div>
                {(categoryName || subcategoryName) && (
                  <p className="text-slate-400 font-semibold text-xs uppercase tracking-[0.2em]">
                    {categoryName}{subcategoryName ? ` / ${subcategoryName}` : ''}
                  </p>
                )}
              </div>

              {}
              <div className="flex items-center gap-2 shrink-0">
                {hasPermission('update_product') && !product.isDeleted && (
                  <button
                    onClick={() => navigate(`/edit-product/${product._id}`)}
                    className="flex items-center justify-center w-10 h-10 bg-slate-900 text-white rounded-xl hover:bg-black transition-all shadow-sm group"
                    title="Edit Product"
                  >
                    <Pencil className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  </button>
                )}
                {hasPermission('delete_product') && !product.isDeleted && (
                  <button
                    onClick={() => setShowTrashModal(true)}
                    className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-500 rounded-xl font-bold text-xs uppercase tracking-wider hover:border-slate-400 hover:text-slate-900 transition-all shadow-sm"
                    title="Move to Trash"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Move to Trash
                  </button>
                )}
                {hasPermission('delete_product') && product.isDeleted && (
                  <button
                    onClick={() => handleRestore(product._id)}
                    className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-500 rounded-xl font-bold text-xs uppercase tracking-wider hover:border-slate-400 hover:text-slate-900 transition-all shadow-sm"
                    title="Restore"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Restore
                  </button>
                )}
                {hasPermission('delete_product') && product.isDeleted && (
                  <button
                    onClick={() => setShowForceModal(true)}
                    className="flex items-center gap-2 px-4 py-2.5 bg-red-600 text-white rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-red-700 transition-all shadow-sm"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Delete
                  </button>
                )}
              </div>
            </div>

            {}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">

              {}
              <div className="lg:col-span-7 flex flex-col gap-4">
                <div className="bg-white rounded-3xl border border-slate-100 shadow-lg overflow-hidden aspect-[4/3]">
                  <OptimizedImage
                    src={imageUrl}
                    alt={product.name}
                    objectFit="cover"
                    className="w-full h-full hover:scale-105 transition-transform duration-700"
                    containerClassName="w-full h-full"
                  />
                </div>

                {}
                <div className="grid grid-cols-3 gap-3">
                  <div className="flex flex-col items-center justify-center gap-2.5 p-5 bg-white rounded-3xl border border-slate-100 shadow-sm transition-all hover:shadow-md group">
                    <div className="w-10 h-10 rounded-2xl bg-emerald-50 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                      <ShieldCheck className="w-5 h-5 text-emerald-500" />
                    </div>
                    <div className="text-center">
                      <p className="text-xs font-black text-slate-800 uppercase tracking-tight leading-tight mb-0.5">Genuine</p>
                      <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">100% authentic</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-center justify-center gap-2.5 p-5 bg-white rounded-3xl border border-slate-100 shadow-sm transition-all hover:shadow-md group">
                    <div className="w-10 h-10 rounded-2xl bg-blue-50 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                      <CheckCircle2 className="w-5 h-5 text-blue-500" />
                    </div>
                    <div className="text-center">
                      <p className="text-xs font-black text-slate-800 uppercase tracking-tight leading-tight mb-0.5">Certified</p>
                      <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Quality verified</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-center justify-center gap-2.5 p-5 bg-white rounded-3xl border border-slate-100 shadow-sm transition-all hover:shadow-md group">
                    <div className="w-10 h-10 rounded-2xl bg-violet-50 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                      <Package className="w-5 h-5 text-violet-500" />
                    </div>
                    <div className="text-center">
                      <p className="text-xs font-black text-slate-800 uppercase tracking-tight leading-tight mb-0.5">Assured</p>
                      <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Buyer protected</p>
                    </div>
                  </div>
                </div>
              </div>

              {}
              <div className="lg:col-span-5 flex flex-col gap-6">

                {}
                <div className="bg-slate-900 rounded-2xl p-6 text-white">
                  <span className="text-[9px] font-bold uppercase tracking-[0.25em] text-white/40 block mb-2">Price</span>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-2xl font-light opacity-30">₹</span>
                    <span className="text-5xl font-black tracking-tighter leading-none">
                      {Number(product.price).toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                {}
                {product.description && (
                  <div>
                    <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-2">Description</h3>
                    <p className="text-slate-600 font-medium leading-relaxed text-sm">
                      {product.description}
                    </p>
                  </div>
                )}

                {}
                <div>
                  <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-1">Product Details</h3>
                  <div className="divide-y-0">
                    <TableRow label="Category" value={categoryName || 'N/A'} />
                    <TableRow label="Subcategory" value={subcategoryName || 'General'} />
                    <TableRow label="Stock" value={product.inStock ? 'In Stock' : 'Out of Stock'} />
                    <TableRow label="Status" value={product.isDeleted ? 'Archived' : 'Active'} />
                    <TableRow label="Created By" value={product.createdBy?.name || 'System'} />
                    <TableRow label="Registered" value={new Date(product.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })} />
                    <TableRow label="Last Updated" value={new Date(product.updatedAt || product.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })} />
                    <TableRow label="Product ID" value={product._id.slice(-8).toUpperCase()} last />
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>
        </div>
      </div>
    </>
  );
};

export default ProductDetail;
