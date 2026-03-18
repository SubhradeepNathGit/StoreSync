import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { ChevronLeft, ChevronDown, Upload, Save, Info } from 'lucide-react';
import productApi from '../../api/productApi';
import Sidebar from '../../components/layout/Sidebar';
import useSidebarStore from '../../store/useSidebarStore';

const EditProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const { isOpen } = useSidebarStore();
  const [imagePreview, setImagePreview] = useState(null);
  const [existingImage, setExistingImage] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [isSubcategoryOpen, setIsSubcategoryOpen] = useState(false);
  const [catSearch, setCatSearch] = useState('');
  const [subSearch, setSubSearch] = useState('');
  const [isCreatingCat, setIsCreatingCat] = useState(false);
  const [isCreatingSub, setIsCreatingSub] = useState(false);


  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm();

  const selectedCategory = watch('category');
  const imageFile = watch('image');

  useEffect(() => {
    const initData = async () => {
      try {
        setLoading(true);
        const [product, cats] = await Promise.all([
          productApi.getProductById(id),
          productApi.getAllCategories(),
        ]);

        setCategories(cats);
        setValue('name', product.name);
        setValue('description', product.description);
        setValue('price', product.price);
        setValue('category', product.category?._id || product.category);
        setValue('subcategory', product.subcategory?._id || product.subcategory);
        setValue('inStock', product.inStock);

        if (product.image) {
          setExistingImage(
            product.image.startsWith('http')
              ? product.image
              : `http://localhost:3006/${product.image}`
          );
        }

        if (product.category) {
          const subs = await productApi.getSubcategories(
            product.category?._id || product.category
          );
          setSubcategories(subs);
        }
      } catch (error) {
        console.error('Error:', error);
        toast.error('Failed to load product details');
        navigate('/');
      } finally {
        setLoading(false);
      }
    };
    initData();
  }, [id, navigate, setValue]);

  useEffect(() => {
    if (selectedCategory && !loading) {
      const fetchSubs = async () => {
        try {
          const data = await productApi.getSubcategories(selectedCategory);
          setSubcategories(data);
        } catch (error) {
          console.error('Error fetching subcategories:', error);
        }
      };
      fetchSubs();
    }
  }, [selectedCategory, loading]);

  useEffect(() => {
    if (imageFile && imageFile[0]) {
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(imageFile[0]);
    } else {
      setImagePreview(null);
    }
  }, [imageFile]);

  const onDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files && files[0] && files[0].type.startsWith('image/')) {
      setValue('image', files);
    }
  };

  const onSubmit = async (data) => {
    try {
      setIsSubmitting(true);
      const formData = new FormData();
      formData.append('name', data.name);
      formData.append('description', data.description);
      formData.append('price', data.price);
      formData.append('category', data.category);
      if (data.subcategory) formData.append('subcategory', data.subcategory);
      formData.append('inStock', data.inStock);
      if (data.image && data.image[0]) formData.append('image', data.image[0]);

      await productApi.updateProduct(id, formData);
      toast.success('Product updated successfully!');
      navigate(`/product/${id}`);
    } catch (error) {
      console.error('Error:', error);
      toast.error(error.response?.data?.message || 'Failed to update product');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    if (!catSearch.trim()) return;
    try {
      setIsCreatingCat(true);
      const res = await productApi.createCategory({ name: catSearch.trim() });
      if (res.success) {
        setCategories([...categories, { ...res.data, subcategories: [] }]);
        setValue('category', res.data._id);
        setValue('subcategory', '');
        setCatSearch('');
        setIsCategoryOpen(false);
        toast.success('Category created');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create category');
    } finally {
      setIsCreatingCat(false);
    }
  };

  const handleCreateSubcategory = async (e) => {
    e.preventDefault();
    if (!subSearch.trim() || !selectedCategory) return;
    try {
      setIsCreatingSub(true);
      const res = await productApi.createSubcategory({ name: subSearch.trim(), categoryId: selectedCategory });
      if (res.success) {
        setSubcategories([...subcategories, res.data]);
        
        setCategories(prev => prev.map(c => 
          c._id === selectedCategory 
            ? { ...c, subcategories: [...c.subcategories, res.data] } 
            : c
        ));

        setValue('subcategory', res.data._id);
        setSubSearch('');
        setIsSubcategoryOpen(false);
        toast.success('Subcategory created');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create subcategory');
    } finally {
      setIsCreatingSub(false);
    }
  };

  const inputClass = (hasError) =>
    `w-full bg-slate-50 border ${hasError ? 'border-red-300 focus:border-red-400 focus:ring-red-100' : 'border-slate-200 focus:border-slate-400 focus:ring-slate-100'} rounded-xl px-4 py-3 text-slate-900 font-medium placeholder:text-slate-400 text-sm focus:outline-none focus:ring-4 transition-all`;

  if (loading) {
    return (
      <div className="flex min-h-screen bg-slate-50">
        <Sidebar selectedCategory="" onFilterChange={() => { }} />
        <div className="flex-1 flex items-center justify-center">
          <div className="relative w-12 h-12">
            <div className="absolute inset-0 border-4 border-slate-200 rounded-full" />
            <div className="absolute inset-0 border-4 border-slate-900 border-t-transparent rounded-full animate-spin" />
          </div>
        </div>
      </div>
    );
  }

  const displayImage = imagePreview || existingImage;

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar selectedCategory="" onFilterChange={() => { }} />

      <div className={`w-full transition-all duration-300 flex-1 ${isOpen ? 'lg:ml-72' : 'lg:ml-20'}`}>
        <div className="pt-[72px] lg:pt-0">
          <div className="container mx-auto px-4 sm:px-6 lg:px-10 py-8 lg:py-12">

            {}
            <div className="mb-10 pb-10">
              <button
                onClick={() => navigate(`/product/${id}`)}
                className="group flex items-center gap-2 text-slate-500 hover:text-slate-900 font-semibold transition-all mb-4 text-xs uppercase tracking-wider"
              >
                <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                Back to Product
              </button>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Product Management</span>
              </div>
              <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
                Edit <span className="text-slate-400 font-normal">Product</span>
              </h1>
              <p className="text-slate-500 font-medium text-sm mt-1">Update the details below to modify this product.</p>
            </div>

            {}
            <div className="flex flex-col">

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                  {}
                  <div className="space-y-5">
                    {}
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Product Name *</label>
                      <input
                        type="text"
                        {...register('name', { required: 'Product name is required' })}
                        className={inputClass(errors.name)}
                      />
                      {errors.name && <p className="text-red-500 text-xs font-medium">{errors.name.message}</p>}
                    </div>

                    {}
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Description *</label>
                      <textarea
                        rows="4"
                        {...register('description', { required: 'Description is required' })}
                        className={`${inputClass(errors.description)} resize-none`}
                      />
                      {errors.description && <p className="text-red-500 text-xs font-medium">{errors.description.message}</p>}
                    </div>

                    {}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Price (₹) *</label>
                        <input
                          type="number"
                          step="0.01"
                          {...register('price', { required: true, min: 0 })}
                          className={inputClass(errors.price)}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Availability</label>
                        <div className="h-[46px] flex items-center bg-slate-50 border border-slate-200 rounded-xl px-4">
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" className="sr-only peer" {...register('inStock')} />
                            <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-slate-900 transition-colors" />
                            <span className="ml-2.5 text-xs font-semibold text-slate-600">In Stock</span>
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>

                  {}
                  <div className="space-y-5">
                    {}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {}
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Category *</label>
                        <div className="relative">
                          <button
                            type="button"
                            onClick={() => setIsCategoryOpen(!isCategoryOpen)}
                            className={`${inputClass(errors.category)} flex items-center justify-between text-left`}
                          >
                            <span className={watch('category') ? 'text-slate-900' : 'text-slate-400'}>
                              {watch('category')
                                ? categories.find(c => c._id === watch('category'))?.name
                                : 'Select category'}
                            </span>
                            <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isCategoryOpen ? 'rotate-180' : ''}`} />
                          </button>

                          {isCategoryOpen && (
                            <>
                              <div
                                className="fixed inset-0 z-10"
                                onClick={() => setIsCategoryOpen(false)}
                              />
                              <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-2xl shadow-xl z-20 overflow-hidden animate-in fade-in zoom-in duration-200 origin-top">
                                <div className="p-2 border-b border-slate-50">
                                  <div className="relative">
                                    <Info className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                                    <input
                                      type="text"
                                      placeholder="Search categories..."
                                      value={catSearch}
                                      onChange={(e) => setCatSearch(e.target.value)}
                                      className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-xs font-medium focus:outline-none focus:border-slate-300 transition-all"
                                    />
                                  </div>
                                </div>
                                <div className="max-h-60 overflow-y-auto p-2 scrollbar-hide">
                                  {categories
                                    .filter(cat => cat.name.toLowerCase().includes(catSearch.toLowerCase()))
                                    .map(cat => (
                                      <button
                                        key={cat._id}
                                        type="button"
                                        onClick={() => {
                                          setValue('category', cat._id);
                                          setValue('subcategory', ''); 
                                          setIsCategoryOpen(false);
                                          setCatSearch('');
                                        }}
                                        className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${watch('category') === cat._id
                                          ? 'bg-slate-900 text-white'
                                          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                                          }`}
                                      >
                                        {cat.name}
                                      </button>
                                    ))
                                  }
                                  {catSearch.trim() && !categories.some(cat => cat.name.toLowerCase() === catSearch.trim().toLowerCase()) && (
                                    <button
                                      type="button"
                                      onClick={handleCreateCategory}
                                      disabled={isCreatingCat}
                                      className="w-full text-left px-3 py-2.5 rounded-lg text-sm font-bold text-indigo-600 hover:bg-indigo-50 transition-all flex items-center gap-2"
                                    >
                                      {isCreatingCat ? <div className="w-3 h-3 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" /> : <span>+</span>}
                                      Create "{catSearch}"
                                    </button>
                                  )}
                                  {!catSearch.trim() && categories.length === 0 && (
                                    <div className="py-8 text-center flex flex-col items-center justify-center space-y-3">
                                      <p className="text-xs text-slate-400 font-medium">No categories found</p>
                                      <div className="text-xs text-slate-500 max-w-[200px] mb-2 leading-relaxed">
                                        Type a name in the search box above to create your first category.
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </>
                          )}
                        </div>
                        {errors.category && <p className="text-red-500 text-xs font-medium mt-1">Category is required</p>}
                      </div>

                      {}
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Subcategory</label>
                        <div className="relative">
                          <button
                            type="button"
                            disabled={!selectedCategory}
                            onClick={() => setIsSubcategoryOpen(!isSubcategoryOpen)}
                            className={`${inputClass(false)} flex items-center justify-between text-left disabled:opacity-50 disabled:cursor-not-allowed`}
                          >
                            <span className={watch('subcategory') ? 'text-slate-900' : 'text-slate-400'}>
                              {watch('subcategory')
                                ? subcategories.find(sub => sub._id === watch('subcategory'))?.name
                                : 'Select subcategory'}
                            </span>
                            <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isSubcategoryOpen ? 'rotate-180' : ''}`} />
                          </button>

                          {isSubcategoryOpen && (
                            <>
                              <div
                                className="fixed inset-0 z-10"
                                onClick={() => setIsSubcategoryOpen(false)}
                              />
                              <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-2xl shadow-xl z-20 overflow-hidden animate-in fade-in zoom-in duration-200 origin-top">
                                <div className="p-2 border-b border-slate-50">
                                  <div className="relative">
                                    <Info className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                                    <input
                                      type="text"
                                      placeholder="Search subcategories..."
                                      value={subSearch}
                                      onChange={(e) => setSubSearch(e.target.value)}
                                      className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-xs font-medium focus:outline-none focus:border-slate-300 transition-all"
                                    />
                                  </div>
                                </div>
                                <div className="max-h-60 overflow-y-auto p-2 scrollbar-hide">
                                  {subcategories
                                    .filter(sub => sub.name.toLowerCase().includes(subSearch.toLowerCase()))
                                    .map(sub => (
                                      <button
                                        key={sub._id}
                                        type="button"
                                        onClick={() => {
                                          setValue('subcategory', sub._id);
                                          setIsSubcategoryOpen(false);
                                          setSubSearch('');
                                        }}
                                        className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${watch('subcategory') === sub._id
                                          ? 'bg-slate-900 text-white'
                                          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                                          }`}
                                      >
                                        {sub.name}
                                      </button>
                                    ))
                                  }
                                  {subSearch.trim() && !subcategories.some(sub => sub.name.toLowerCase() === subSearch.trim().toLowerCase()) && (
                                    <button
                                      type="button"
                                      onClick={handleCreateSubcategory}
                                      disabled={isCreatingSub}
                                      className="w-full text-left px-3 py-2 rounded-lg text-sm font-bold text-indigo-600 hover:bg-indigo-50 transition-all flex items-center gap-2"
                                    >
                                      {isCreatingSub ? <div className="w-3 h-3 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" /> : <span>+</span>}
                                      Create "{subSearch}"
                                    </button>
                                  )}
                                  {!subSearch.trim() && subcategories.length === 0 && (
                                    <div className="py-8 text-center flex flex-col items-center justify-center space-y-3">
                                      <p className="text-xs text-slate-400 font-medium">No matches found</p>
                                      <div className="text-xs text-slate-500 max-w-[200px] mb-2 leading-relaxed">
                                        Type a name in the search box above to create a new subcategory.
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {}
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Product Image</label>
                      <div
                        onDragEnter={() => setIsDragging(true)}
                        onDragOver={(e) => e.preventDefault()}
                        onDragLeave={() => setIsDragging(false)}
                        onDrop={onDrop}
                        className={`relative group h-[196px] border-2 border-dashed rounded-xl transition-all flex flex-col items-center justify-center overflow-hidden cursor-pointer ${isDragging
                          ? 'border-slate-400 bg-slate-50'
                          : 'border-slate-200 bg-slate-50/50 hover:border-slate-300 hover:bg-slate-50'
                          }`}
                      >
                        {displayImage ? (
                          <>
                            <img src={displayImage} alt="Preview" className="absolute inset-0 w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-slate-900/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <p className="text-white text-xs font-semibold flex items-center gap-2">
                                <Upload className="w-4 h-4" /> Replace Image
                              </p>
                            </div>
                          </>
                        ) : (
                          <div className="text-center p-6">
                            <div className="w-10 h-10 bg-white rounded-xl shadow-sm border border-slate-100 flex items-center justify-center mx-auto mb-3">
                              <Upload className="w-5 h-5 text-slate-400" />
                            </div>
                            <p className="text-sm font-semibold text-slate-700">Drop image here</p>
                            <p className="text-xs text-slate-400 mt-1">or click to browse</p>
                          </div>
                        )}
                        <input
                          type="file"
                          accept="image/*"
                          {...register('image')}
                          className="absolute inset-0 opacity-0 cursor-pointer"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {}
                <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center gap-3">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full sm:flex-1 py-3.5 bg-slate-800 text-white rounded-xl font-semibold text-sm hover:bg-slate-900 active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2.5 shadow-sm"
                  >
                    {isSubmitting ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        Save Changes
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate(`/product/${id}`)}
                    className="w-full sm:w-auto px-8 py-3.5 bg-white border border-slate-200 text-slate-600 font-semibold text-sm rounded-xl hover:bg-slate-50 hover:text-slate-900 transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>

            {}
            <div className="mt-4 p-4 bg-slate-100/50 rounded-xl border border-slate-200 flex items-start gap-3">
              <div className="w-7 h-7 bg-slate-800 rounded-lg flex items-center justify-center flex-shrink-0 border border-slate-100 mt-0.5">
                <Info className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-700">Leaving image blank will keep the existing one</p>
                <p className="text-xs text-slate-500 font-medium leading-relaxed mt-0.5">
                  Only upload a new image if you want to replace the current product image.
                </p>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default EditProduct;
