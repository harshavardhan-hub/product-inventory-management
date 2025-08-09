import React from 'react';
import { Edit2, Trash2, Star, Package, AlertTriangle } from 'lucide-react';
import { Product } from '../types/Product';

interface ProductCardProps {
  product: Product;
  onEdit: (product: Product) => void;
  onDelete: (id: number) => void;
  onUpdateStock: (id: number, stock: number, inStock: boolean) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onEdit, onDelete, onUpdateStock }) => {
  const [isEditingStock, setIsEditingStock] = React.useState(false);
  const [stockValue, setStockValue] = React.useState(product.stock || 0);

  const handleStockUpdate = () => {
    onUpdateStock(product.id, stockValue, stockValue > 0);
    setIsEditingStock(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleStockUpdate();
    } else if (e.key === 'Escape') {
      setStockValue(product.stock || 0);
      setIsEditingStock(false);
    }
  };

  return (
    <div className="card p-3 sm:p-4 hover:shadow-lg transition-shadow duration-200">
      {/* Product Image */}
      <div className="relative mb-3 sm:mb-4">
        <img
          src={product.image}
          alt={product.title}
          className="w-full h-36 sm:h-48 object-contain bg-gray-50 rounded-lg"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = 'https://via.placeholder.com/300x200?text=No+Image';
          }}
        />
        
        {/* Stock Status Badge */}
        <div className="absolute top-2 right-2">
          {product.inStock ? (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
              <Package size={10} className="mr-1" />
              <span className="hidden sm:inline">In Stock</span>
              <span className="sm:hidden">✓</span>
            </span>
          ) : (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
              <AlertTriangle size={10} className="mr-1" />
              <span className="hidden sm:inline">Out of Stock</span>
              <span className="sm:hidden">✗</span>
            </span>
          )}
        </div>
      </div>

      {/* Product Info */}
      <div className="space-y-2 sm:space-y-3">
        <h3 className="font-semibold text-sm sm:text-lg text-gray-800 line-clamp-2" title={product.title}>
          {product.title}
        </h3>
        
        <p className="text-gray-600 text-xs sm:text-sm line-clamp-2 sm:line-clamp-3" title={product.description}>
          {product.description}
        </p>

        {/* Category */}
        <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full font-medium">
          {product.category}
        </span>

        {/* Rating */}
        <div className="flex items-center gap-2">
          <div className="flex items-center">
            <Star size={14} className="text-yellow-400 fill-current" />
            <span className="text-xs sm:text-sm text-gray-600 ml-1">
              {product.rating.rate} ({product.rating.count})
            </span>
          </div>
        </div>

        {/* Price */}
        <div className="text-xl sm:text-2xl font-bold text-green-600">
          ${product.price.toFixed(2)}
        </div>

        {/* Stock Management */}
        <div className="flex items-center gap-2">
          <span className="text-xs sm:text-sm text-gray-600">Stock:</span>
          {isEditingStock ? (
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={stockValue}
                onChange={(e) => setStockValue(parseInt(e.target.value) || 0)}
                onKeyDown={handleKeyPress}
                onBlur={handleStockUpdate}
                className="w-16 sm:w-20 px-2 py-1 border border-gray-300 rounded text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="0"
                autoFocus
              />
            </div>
          ) : (
            <button
              onClick={() => setIsEditingStock(true)}
              className="text-xs sm:text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
            >
              {product.stock || 0} units
            </button>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          <button
            onClick={() => onEdit(product)}
            className="flex-1 flex items-center justify-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-xs sm:text-sm font-medium"
          >
            <Edit2 size={14} />
            <span className="hidden sm:inline">Edit</span>
          </button>
          
          <button
            onClick={() => onDelete(product.id)}
            className="flex-1 flex items-center justify-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-xs sm:text-sm font-medium"
          >
            <Trash2 size={14} />
            <span className="hidden sm:inline">Delete</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
