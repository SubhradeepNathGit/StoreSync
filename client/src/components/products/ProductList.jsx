import React from 'react';
import ProductCard from './ProductCard';

const ProductList = ({ products, onRestore, onForceDelete, onSoftDelete }) => {
  if (!products || products.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">No products found</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4 mb-8">
      {products.map((product) => (
        <ProductCard
          key={product._id}
          product={product}
          onRestore={onRestore}
          onForceDelete={onForceDelete}
          onSoftDelete={onSoftDelete}
        />
      ))}
    </div>
  );
};

export default ProductList;
