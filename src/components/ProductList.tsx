import React from 'react';
import { Package, AlertCircle, Loader2 } from 'lucide-react';
import ProductCard from './ProductCard';
import { Product } from '../types/Product';

interface ProductListProps {
  products: Product[];
  loading: boolean;
  error: string | null;
  onEdit: (product: Product) => void;
  onDelete: (id: number) => void;
  onUpdateStock: (id: number, stock: number, inStock: boolean) => void;
}

const ProductList: React.FC<ProductListProps> = ({
  products,
  loading,
  error,
  onEdit,
  onDelete,
  onUpdateStock,
}) => {
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-4" />
        <p className="text-gray-600 text-sm sm:text-base">Loading products...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <AlertCircle className="w-10 h-10 sm:w-12 sm:h-12 text-red-500 mb-4" />
        <h3 className="text-lg font-semibold text-gray-800 mb-2">Error Loading Products</h3>
        <p className="text-gray-600 text-center max-w-md text-sm sm:text-base">{error}</p>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Package className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-semibold text-gray-800 mb-2">No Products Found</h3>
        <p className="text-gray-600 text-center max-w-md text-sm sm:text-base">
          No products match your current search criteria. Try adjusting your filters or add some new products.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          onEdit={onEdit}
          onDelete={onDelete}
          onUpdateStock={onUpdateStock}
        />
      ))}
    </div>
  );
};

export default ProductList;
