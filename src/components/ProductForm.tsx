import React from 'react';
import { Product, ProductFormData } from '../types/Product';
import { Save, X } from 'lucide-react';

interface ProductFormProps {
  product?: Product | null;
  onSubmit: (data: ProductFormData) => void;
  onCancel: () => void;
  loading?: boolean;
}

const ProductForm: React.FC<ProductFormProps> = ({ product, onSubmit, onCancel, loading = false }) => {
  // ✅ FIXED: Ensure price and stock are initialized as numbers
  const [formData, setFormData] = React.useState<ProductFormData>({
    title: product?.title || '',
    price: typeof product?.price === 'number' ? product.price : 0,
    description: product?.description || '',
    category: product?.category || '',
    image: product?.image || '',
    stock: typeof product?.stock === 'number' ? product.stock : 0,
  });

  const [errors, setErrors] = React.useState<Partial<ProductFormData>>({});

  const validateForm = (): boolean => {
    const newErrors: Partial<ProductFormData> = {};

    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (formData.price <= 0) newErrors.price = 'Price must be greater than 0';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.category.trim()) newErrors.category = 'Category is required';
    if (!formData.image.trim()) newErrors.image = 'Image URL is required';
    if (formData.stock < 0) newErrors.stock = 'Stock cannot be negative';

    // Validate image URL format
    if (formData.image && !isValidUrl(formData.image)) {
      newErrors.image = 'Please enter a valid image URL';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidUrl = (string: string): boolean => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  // ✅ FIXED: Proper type handling in handleChange
  const handleChange = (field: keyof ProductFormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const categories = [
    'electronics',
    'jewelery',
    "men's clothing",
    "women's clothing",
    'beauty',
    'furniture',
    'groceries',
    'sports',
    'automotive',
    'books'
  ];

  return (
    <form onSubmit={handleSubmit} className="p-6 space-y-6">
      {/* Title */}
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
          Product Title *
        </label>
        <input
          type="text"
          id="title"
          value={formData.title}
          onChange={(e) => handleChange('title', e.target.value)}
          className={`input-field ${errors.title ? 'border-red-500 focus:ring-red-500' : ''}`}
          placeholder="Enter product title"
          maxLength={100}
        />
        {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
        <p className="mt-1 text-xs text-gray-500">{formData.title.length}/100 characters</p>
      </div>

      {/* Price and Stock Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">
            Price ($) *
          </label>
          <input
            type="number"
            id="price"
            value={formData.price}
            onChange={(e) => {
              const value = parseFloat(e.target.value);
              handleChange('price', isNaN(value) ? 0 : value);
            }}
            className={`input-field ${errors.price ? 'border-red-500 focus:ring-red-500' : ''}`}
            placeholder="0.00"
            min="0"
            step="0.01"
          />
          {errors.price && <p className="mt-1 text-sm text-red-600">{errors.price}</p>}
        </div>

        <div>
          <label htmlFor="stock" className="block text-sm font-medium text-gray-700 mb-2">
            Stock Quantity *
          </label>
          <input
            type="number"
            id="stock"
            value={formData.stock}
            onChange={(e) => {
              const value = parseInt(e.target.value);
              handleChange('stock', isNaN(value) ? 0 : value);
            }}
            className={`input-field ${errors.stock ? 'border-red-500 focus:ring-red-500' : ''}`}
            placeholder="0"
            min="0"
          />
          {errors.stock && <p className="mt-1 text-sm text-red-600">{errors.stock}</p>}
        </div>
      </div>

      {/* Category */}
      <div>
        <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
          Category *
        </label>
        <select
          id="category"
          value={formData.category}
          onChange={(e) => handleChange('category', e.target.value)}
          className={`input-field ${errors.category ? 'border-red-500 focus:ring-red-500' : ''}`}
        >
          <option value="">Select a category</option>
          {categories.map((category) => (
            <option key={category} value={category}>
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </option>
          ))}
        </select>
        {errors.category && <p className="mt-1 text-sm text-red-600">{errors.category}</p>}
      </div>

      {/* Image URL */}
      <div>
        <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-2">
          Image URL *
        </label>
        <input
          type="url"
          id="image"
          value={formData.image}
          onChange={(e) => handleChange('image', e.target.value)}
          className={`input-field ${errors.image ? 'border-red-500 focus:ring-red-500' : ''}`}
          placeholder="https://example.com/image.jpg"
        />
        {errors.image && <p className="mt-1 text-sm text-red-600">{errors.image}</p>}
        
        {/* Image Preview */}
        {formData.image && isValidUrl(formData.image) && (
          <div className="mt-2">
            <p className="text-sm text-gray-600 mb-2">Preview:</p>
            <img
              src={formData.image}
              alt="Preview"
              className="w-32 h-32 object-contain border border-gray-300 rounded"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
              }}
            />
          </div>
        )}
      </div>

      {/* Description */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
          Description *
        </label>
        <textarea
          id="description"
          value={formData.description}
          onChange={(e) => handleChange('description', e.target.value)}
          className={`input-field resize-vertical ${errors.description ? 'border-red-500 focus:ring-red-500' : ''}`}
          placeholder="Enter product description"
          rows={4}
          maxLength={500}
        />
        {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
        <p className="mt-1 text-xs text-gray-500">{formData.description.length}/500 characters</p>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50"
        >
          <X size={16} />
          Cancel
        </button>
        
        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          {loading ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Save size={16} />
          )}
          {product ? 'Update Product' : 'Create Product'}
        </button>
      </div>
    </form>
  );
};

export default ProductForm;
