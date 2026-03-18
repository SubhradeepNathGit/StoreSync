import React, { useContext, useState } from 'react';
import { Link } from 'react-router-dom';
import { ExternalLink, RotateCcw, Trash2, Tag, Pencil } from 'lucide-react';
import { toast } from 'react-toastify';
import AuthContext from '../../context/AuthContext';
import OptimizedImage from '../common/OptimizedImage';
import { preloadImage } from '../../utils/imagePreloader';
import ConfirmationModal from '../modals/ConfirmationModal';

const ProductCard = ({ product, onRestore, onForceDelete, onSoftDelete }) => {
  const { hasPermission } = useContext(AuthContext);

  // Move-to-trash confirmation
  const [showTrashModal, setShowTrashModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Permanent-delete confirmation (trash view only)
  const [showForceModal, setShowForceModal] = useState(false);
  const [isForceDeleting, setIsForceDeleting] = useState(false);

  const imageUrl = product.image && product.image.startsWith('http')
    ? product.image
    : product.image && !product.image.startsWith('http')
      ? `http://localhost:3006/${product.image}`
      : null;

  const categoryName = product.category?.name || (typeof product.category === 'string' ? product.category : '');
  const subcategoryName = product.subcategory?.name || '';

  const handleMouseEnter = () => {
    if (imageUrl) preloadImage(imageUrl);
  };

  // Soft delete — move to trash
  const handleConfirmTrash = async () => {
    setIsDeleting(true);
    try {
      const productApi = (await import('../../api/productApi')).default;
      await productApi.deleteProduct(product._id);
      toast.success(`"${product.name}" moved to trash`);
      if (onSoftDelete) onSoftDelete();
    } catch (err) {
      console.error(err);
      toast.error('Failed to move product to trash');
    } finally {
      setIsDeleting(false);
      setShowTrashModal(false);
    }
  };

  // Permanent delete — only from trash view
  const handleConfirmForceDelete = async () => {
    setIsForceDeleting(true);
    try {
      if (onForceDelete) await onForceDelete(product._id);
    } finally {
      setIsForceDeleting(false);
      setShowForceModal(false);
    }
  };

  return (
    <>
      {/* Move to Trash modal */}
      <ConfirmationModal
        isOpen={showTrashModal}
        onClose={() => setShowTrashModal(false)}
        onConfirm={handleConfirmTrash}
        title="Move to Trash?"
        message={`"${product.name}" will be moved to trash. You can restore it anytime from the Trash section.`}
        confirmText="Move to Trash"
        cancelText="Cancel"
        type="warning"
        isLoading={isDeleting}
      />

      {/* Permanent Delete modal (trash view only) */}
      <ConfirmationModal
        isOpen={showForceModal}
        onClose={() => setShowForceModal(false)}
        onConfirm={handleConfirmForceDelete}
        title="Delete Permanently?"
        message={`"${product.name}" will be permanently deleted and cannot be recovered.`}
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
        isLoading={isForceDeleting}
      />

      <div
        onMouseEnter={handleMouseEnter}
        className="group relative bg-white rounded-lg border border-slate-200 hover:border-slate-300 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col h-full overflow-hidden hover:-translate-y-1"
      >
        {/* Image */}
        <Link
          to={!product.isDeleted ? `/product/${product._id}` : '#'}
          className="relative aspect-[4/3] overflow-hidden bg-slate-100 flex items-center justify-center border-b border-slate-100"
        >
          {imageUrl ? (
            <OptimizedImage
              src={imageUrl}
              alt={product.name}
              objectFit="cover"
              className="w-full h-full group-hover:scale-105 transition-transform duration-500"
              containerClassName="w-full h-full"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-slate-100">
              <span className="text-slate-300 text-xs font-bold uppercase tracking-widest">No Image</span>
            </div>
          )}

          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
            {categoryName && (
              <div className="px-1.5 py-0.5 bg-white/90 backdrop-blur-sm rounded-md border border-slate-200 text-[8px] font-bold uppercase tracking-wider text-slate-600 shadow-sm flex items-center gap-1">
                <Tag className="w-2.5 h-2.5" />
                {categoryName}
              </div>
            )}
            {!product.inStock && (
              <div className="px-1.5 py-0.5 bg-red-500 rounded-md text-[8px] font-bold uppercase tracking-wider text-white shadow-sm">
                Out of Stock
              </div>
            )}
          </div>

          {/* Hover overlay */}
          {!product.isDeleted && (
            <div className="absolute inset-0 bg-slate-900/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <div className="p-2 bg-white rounded-lg shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300 border border-slate-100">
                <ExternalLink className="w-3.5 h-3.5 text-slate-700" />
              </div>
            </div>
          )}
        </Link>

        {/* Card Body */}
        <div className="px-2.5 py-2 flex flex-col flex-1">
          <div className="mb-1">
            {subcategoryName && (
              <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-0.5 block">
                {subcategoryName}
              </span>
            )}
            <h3 className="font-bold text-slate-800 leading-tight line-clamp-1 group-hover:text-slate-900 transition-colors text-[12px] tracking-tight">
              {product.name}
            </h3>
          </div>

          <div className="mt-auto pt-2 flex items-end justify-between border-t border-slate-50">
            <div className="flex flex-col">
              <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-0.5">Price</span>
              <div className="flex items-baseline gap-0.5">
                <span className="text-[10px] font-bold text-slate-600">₹</span>
                <span className="text-base font-black text-slate-900 tracking-tighter">
                  {Number(product.price).toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {/* Normal card actions — ONLY soft delete (move to trash) */}
            {!product.isDeleted && (
              <div className="flex gap-2">
                {hasPermission('update_product') && (
                  <Link
                    to={`/edit-product/${product._id}`}
                    className="p-1.5 bg-slate-50 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all border border-slate-100"
                    title="Edit Product"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </Link>
                )}
                {hasPermission('delete_product') && (
                  <button
                    onClick={(e) => { e.preventDefault(); setShowTrashModal(true); }}
                    className="p-1.5 bg-slate-50 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all border border-slate-100"
                    title="Move to Trash"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Trash view — restore & permanent delete */}
        {product.isDeleted && (
          <div className="px-3 pb-3 flex gap-1.5">
            {(hasPermission('update_product') || hasPermission('delete_product')) ? (
              <>
                {hasPermission('update_product') && (
                  <button
                    onClick={(e) => { e.preventDefault(); onRestore(product._id); }}
                    className="flex-1 py-1.5 bg-white border border-slate-200 text-green-600 rounded-lg text-[9px] font-bold uppercase tracking-wider hover:bg-green-50 hover:border-green-200 transition-all flex items-center justify-center gap-1"
                  >
                    <RotateCcw className="w-2.5 h-2.5" /> Restore
                  </button>
                )}
                {hasPermission('delete_product') && (
                  <button
                    onClick={(e) => { e.preventDefault(); setShowForceModal(true); }}
                    className="flex-1 py-1.5 bg-white border border-slate-200 text-red-600 rounded-lg text-[9px] font-bold uppercase tracking-wider hover:bg-red-50 hover:border-red-200 transition-all flex items-center justify-center gap-1"
                  >
                    <Trash2 className="w-2.5 h-2.5" /> Delete
                  </button>
                )}
              </>
            ) : (
              <div className="w-full text-center py-1.5 bg-slate-50 text-slate-400 rounded-lg text-[9px] font-bold uppercase tracking-wider">
                Restricted
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default ProductCard;
