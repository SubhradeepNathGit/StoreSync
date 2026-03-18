import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { ChevronLeft, ChevronDown, Upload, Save, Info, FileSpreadsheet, X, Check, AlertCircle } from 'lucide-react';
import productApi from '../../api/productApi';
import Sidebar from '../../components/layout/Sidebar';
import useSidebarStore from '../../store/useSidebarStore';

const AddProduct = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);

  
  const [isCsvMode, setIsCsvMode] = useState(false);
  const [csvFile, setCsvFile] = useState(null);
  const [isCsvDragging, setIsCsvDragging] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importResults, setImportResults] = useState(null);
  const [isSubcategoryOpen, setIsSubcategoryOpen] = useState(false);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [subSearch, setSubSearch] = useState('');
  const [catSearch, setCatSearch] = useState('');
  const [isCreatingCat, setIsCreatingCat] = useState(false);
  const [isCreatingSub, setIsCreatingSub] = useState(false);
  const [sidebarRefreshTrigger, setSidebarRefreshTrigger] = useState(0);
  const { isOpen } = useSidebarStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm({
    defaultValues: {
      name: '',
      description: '',
      price: '',
      category: '',
      subcategory: '',
      inStock: true,
    },
  });

  const selectedCategory = watch('category');
  const imageFile = watch('image');

  const fetchCats = async () => {
    try {
      const data = await productApi.getAllCategoriesWithSubcategories();
      setCategories(data);
    } catch {
      toast.error('Failed to load categories');
    }
  };

  useEffect(() => {
    fetchCats();
  }, [sidebarRefreshTrigger]);

  useEffect(() => {
    if (selectedCategory) {
      const category = categories.find(c => c._id === selectedCategory);
      if (category && category.subcategories) {
        setSubcategories(category.subcategories);
      } else {
        setSubcategories([]);
      }
      setValue('subcategory', '');
    } else {
      setSubcategories([]);
      setValue('subcategory', '');
    }
  }, [selectedCategory, categories, setValue]);

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
    if (files && files[0]) {
      if (files[0].type.startsWith('image/')) {
        setValue('image', files);
      } else {
        toast.error('Please upload an image file');
      }
    }
  };

  const onCsvDrop = (e) => {
    e.preventDefault();
    setIsCsvDragging(false);
    const files = e.dataTransfer.files;
    if (files && files[0]) {
      if (files[0].name.endsWith('.csv')) {
        setCsvFile(files[0]);
      } else {
        toast.error('Please upload a valid CSV file');
      }
    }
  };

  const handleCsvSelect = (e) => {
    const file = e.target.files[0];
    if (file && file.name.endsWith('.csv')) {
      setCsvFile(file);
    } else if (file) {
      toast.error('Please upload a valid CSV file');
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

      await productApi.createProduct(formData);
      toast.success('Product added successfully!');
      navigate('/');
    } catch (error) {
      console.error('Error:', error);
      toast.error(error.response?.data?.message || 'Failed to add product');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCsvImport = async () => {
    if (!csvFile) return;

    try {
      setIsImporting(true);
      setImportResults(null);
      const res = await productApi.importProducts(csvFile);
      setImportResults(res);
      if (res.success) {
        toast.success(`Successfully imported ${res.summary.imported} products!`);
        
        setSidebarRefreshTrigger(prev => prev + 1);
        if (res.summary.failed === 0) {
          setTimeout(() => navigate('/'), 2000);
        }
      }
    } catch (error) {
      console.error('Import error:', error);
      toast.error(error.response?.data?.message || 'Failed to import products');
      if (error.response?.data?.errors) {
        setImportResults(error.response.data);
      }
    } finally {
      setIsImporting(false);
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
        setCatSearch('');
        setIsCategoryOpen(false);
        setSidebarRefreshTrigger(prev => prev + 1);
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
        setSidebarRefreshTrigger(prev => prev + 1);
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

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar
        selectedCategory=""
        onFilterChange={() => { }}
        refreshTrigger={sidebarRefreshTrigger}
      />

      <div className={`w-full transition-all duration-300 flex-1 ${isOpen ? 'lg:ml-72' : 'lg:ml-20'}`}>
        <div className="pt-[72px] lg:pt-0">
          <div className="container mx-auto px-4 sm:px-6 lg:px-10 py-8 lg:py-12">

            {}
            <div className="mb-10">
              <button
                onClick={() => navigate('/')}
                className="group flex items-center gap-2 text-slate-500 hover:text-slate-900 font-semibold transition-all mb-2 -ml-5 text-xs uppercase tracking-wider"
              >
                <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                Back to Dashboard
              </button>

              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                  <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
                    {isCsvMode ? 'Bulk' : 'Add'} <span className="text-slate-400 font-normal">{isCsvMode ? 'Import' : 'Product'}</span>
                  </h1>
                  <p className="text-slate-500 font-medium text-sm mt-1 text-inherit">
                    {isCsvMode
                      ? 'Upload a CSV file to add multiple products at once.'
                      : 'Fill in the details below to add a new product to your inventory.'}
                  </p>
                </div>

                <button
                  onClick={() => {
                    setIsCsvMode(!isCsvMode);
                    setImportResults(null);
                    setCsvFile(null);
                  }}
                  className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all border ${isCsvMode
                    ? 'border-slate-800 bg-slate-800 text-white hover:bg-slate-900'
                    : 'border-slate-200 text-slate-600 hover:border-slate-400 hover:text-slate-900'
                    }`}
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  {isCsvMode ? 'Switch to Manual Form' : 'Bulk CSV Import'}
                </button>
              </div>
            </div>

            {}
            <div className="flex flex-col">
              {}
              <div>
                {isCsvMode ? (
                  
                  <div className="p-8 space-y-8">
                    {!csvFile ? (
                      <div
                        onDragEnter={() => setIsCsvDragging(true)}
                        onDragOver={(e) => e.preventDefault()}
                        onDragLeave={() => setIsCsvDragging(false)}
                        onDrop={onCsvDrop}
                        className={`relative h-64 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center transition-all cursor-pointer ${isCsvDragging
                          ? 'border-slate-900 bg-slate-50'
                          : 'border-slate-200 bg-slate-50/50 hover:border-slate-300'
                          }`}
                      >
                        <div className="text-center">
                          <div className="w-16 h-16 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center mx-auto mb-4">
                            <Upload className="w-8 h-8 text-slate-400" />
                          </div>
                          <p className="text-lg font-bold text-slate-900">Drop CSV file here</p>
                          <p className="text-slate-500 text-sm mt-1 mb-6">or click to browse from your computer</p>
                          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-600">
                            <Info className="w-3.5 h-3.5" />
                            Max file size: 5MB
                          </div>
                        </div>
                        <input
                          type="file"
                          accept=".csv"
                          onChange={handleCsvSelect}
                          className="absolute inset-0 opacity-0 cursor-pointer"
                        />
                      </div>
                    ) : (
                      <div className="bg-slate-50 rounded-2xl border border-slate-200 p-8 flex flex-col items-center justify-center">
                        <div className="w-16 h-16 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center mb-4 text-slate-900">
                          <FileSpreadsheet className="w-8 h-8" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900">{csvFile.name}</h3>
                        <p className="text-slate-500 text-sm mt-1 uppercase tracking-widest font-bold">
                          {(csvFile.size / 1024).toFixed(2)} KB • Ready for processing
                        </p>

                        <div className="mt-8 flex items-center gap-4 w-full max-w-sm">
                          <button
                            onClick={handleCsvImport}
                            disabled={isImporting}
                            className="flex-1 py-4 bg-slate-800 text-white rounded-xl font-bold text-sm uppercase tracking-wider hover:bg-slate-900 active:scale-95 transition-all shadow-xl shadow-slate-200 disabled:opacity-50"
                          >
                            {isImporting ? (
                              <div className="flex items-center justify-center gap-2">
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Synchronizing...
                              </div>
                            ) : 'Start Bulk Import'}
                          </button>
                          <button
                            onClick={() => setCsvFile(null)}
                            disabled={isImporting}
                            className="p-4 bg-white border border-slate-200 text-slate-400 hover:text-red-500 hover:border-red-200 rounded-xl transition-all"
                          >
                            <X className="w-6 h-6" />
                          </button>
                        </div>
                      </div>
                    )}

                    {}
                    {importResults && (
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-center gap-4">
                            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm">
                              <FileSpreadsheet className="w-5 h-5 text-slate-400" />
                            </div>
                            <div>
                              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Rows</p>
                              <p className="text-xl font-bold text-slate-900">{importResults.summary?.totalRows || 0}</p>
                            </div>
                          </div>
                          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-center gap-4">
                            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm">
                              <Check className="w-5 h-5 text-slate-900" />
                            </div>
                            <div>
                              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Imported</p>
                              <p className="text-xl font-bold text-slate-900">{importResults.summary?.imported || 0}</p>
                            </div>
                          </div>
                          <div className="bg-red-50 border border-red-100 rounded-xl p-4 flex items-center gap-4">
                            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm">
                              <AlertCircle className="w-5 h-5 text-red-500" />
                            </div>
                            <div>
                              <p className="text-xs font-bold text-red-600 uppercase tracking-wider">Failed</p>
                              <p className="text-xl font-bold text-red-700">{importResults.summary?.failed || 0}</p>
                            </div>
                          </div>
                        </div>

                        {importResults.errors && importResults.errors.length > 0 && (
                          <div className="border border-red-100 rounded-xl overflow-hidden">
                            <div className="bg-red-50 px-4 py-2 border-b border-red-100 text-xs font-bold text-red-600 uppercase tracking-widest">
                              Registry Mismatch / Import Faults
                            </div>
                            <div className="bg-white max-h-48 overflow-y-auto divide-y divide-slate-100 p-2">
                              {importResults.errors.map((err, idx) => (
                                <div key={idx} className="p-3 flex items-start gap-3">
                                  <div className="text-[10px] font-bold text-slate-400 bg-slate-50 w-12 py-1 rounded text-center shrink-0">
                                    ROW {err.row || 'SYS'}
                                  </div>
                                  <p className="text-xs font-medium text-slate-600">{err.message}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div className="space-y-5">
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Product Name *</label>
                          <input
                            type="text"
                            placeholder="e.g. Formal Shirts"
                            {...register('name', { required: 'Product name is required' })}
                            className={inputClass(errors.name)}
                          />
                          {errors.name && <p className="text-red-500 text-xs font-medium">{errors.name.message}</p>}
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Description *</label>
                          <textarea
                            rows="4"
                            placeholder="Describe the product..."
                            {...register('description', { required: 'Description is required' })}
                            className={`${inputClass(errors.description)} resize-none`}
                          />
                          {errors.description && <p className="text-red-500 text-xs font-medium">{errors.description.message}</p>}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Price (₹) *</label>
                            <input
                              type="number"
                              step="0.01"
                              placeholder="0.00"
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

                      <div className="space-y-5">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                                    ? subcategories.find(i => i._id === watch('subcategory'))?.name
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
                                          placeholder="Search subsets..."
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
                                            className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-all ${watch('subcategory') === sub._id
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

                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Product Image</label>
                          <div
                            onDragEnter={(e) => { e.preventDefault(); setIsDragging(true); }}
                            onDragOver={(e) => e.preventDefault()}
                            onDragLeave={(e) => { e.preventDefault(); setIsDragging(false); }}
                            onDrop={onDrop}
                            className={`relative group h-[196px] border-2 border-dashed rounded-xl transition-all flex flex-col items-center justify-center overflow-hidden cursor-pointer ${isDragging
                              ? 'border-slate-400 bg-slate-50'
                              : 'border-slate-200 bg-slate-50/50 hover:border-slate-300 hover:bg-slate-50'
                              }`}
                          >
                            {imagePreview ? (
                              <>
                                <img src={imagePreview} alt="Preview" className="absolute inset-0 w-full h-full object-cover" />
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
                            Add Product
                          </>
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => navigate('/')}
                        className="w-full sm:w-auto px-8 py-3.5 bg-white border border-slate-200 text-slate-600 font-semibold text-sm rounded-xl hover:bg-slate-50 hover:text-slate-900 transition-all"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>

            {}
            <div className="mt-8 bg-slate-100/50 rounded-2xl border border-slate-200 p-6 flex items-start gap-4">
              <div className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center shrink-0 shadow-lg shadow-slate-200">
                {isCsvMode ? <FileSpreadsheet className="w-5 h-5 text-white" /> : <Info className="w-5 h-5 text-white" />}
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-bold text-slate-900">
                  {isCsvMode ? 'CSV Template Requirements' : 'Image Upload Guidelines'}
                </h4>
                {isCsvMode ? (
                  <>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                      Ensure your CSV file includes the following columns: <span className="font-bold text-slate-700">name, description, price, category</span>.
                      Optional: <span className="font-bold text-slate-700">subcategory, inStock, image (URL)</span>.
                    </p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {['name*', 'description*', 'price*', 'category*', 'subcategory', 'inStock', 'image'].map(tag => (
                        <span key={tag} className="px-2.5 py-1 bg-slate-50 border border-slate-100 rounded-lg text-[10px] font-bold text-slate-600 uppercase">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </>
                ) : (
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    Upload a clear product image in JPG, PNG or WebP format. Recommended size: 800×800px or larger.
                    Ensure the product is centered for the best visual presentation on the storefront.
                  </p>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default AddProduct;
