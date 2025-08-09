import React from 'react';
import { Provider } from 'react-redux';
import { store } from './store';
import { Plus, Package, RefreshCw, AlertCircle, CheckCircle, X } from 'lucide-react';
import { useAppDispatch, useAppSelector } from './store';
import {
  fetchProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  updateProductStock,
  clearError,
} from './store/productSlice';
import ProductList from './components/ProductList';
import ProductForm from './components/ProductForm';
import SearchFilter from './components/SearchFilter';
import Modal from './components/Modal';
import { Product, ProductFormData } from './types/Product';

// Toast Notification Component
interface ToastProps {
  message: string;
  type: 'success' | 'error';
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, type, onClose }) => {
  React.useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`fixed top-4 right-4 z-50 p-3 sm:p-4 rounded-lg shadow-lg max-w-xs sm:max-w-sm ${
      type === 'success' ? 'bg-green-100 border border-green-400 text-green-700' : 'bg-red-100 border border-red-400 text-red-700'
    }`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          {type === 'success' ? (
            <CheckCircle size={18} className="mr-2 flex-shrink-0" />
          ) : (
            <AlertCircle size={18} className="mr-2 flex-shrink-0" />
          )}
          <span className="text-xs sm:text-sm font-medium">{message}</span>
        </div>
        <button onClick={onClose} className="ml-2 hover:opacity-70 flex-shrink-0">
          <X size={14} />
        </button>
      </div>
    </div>
  );
};

// Main Dashboard Component
const Dashboard: React.FC = () => {
  const dispatch = useAppDispatch();
  const { filteredProducts, loading, error } = useAppSelector(state => state.products);

  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [editingProduct, setEditingProduct] = React.useState<Product | null>(null);
  const [toast, setToast] = React.useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Load products on component mount
  React.useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  // Handle form submission
  const handleFormSubmit = async (formData: ProductFormData) => {
    try {
      if (editingProduct) {
        await dispatch(updateProduct({ id: editingProduct.id, data: formData })).unwrap();
        setToast({ message: 'Product updated successfully!', type: 'success' });
      } else {
        await dispatch(createProduct(formData)).unwrap();
        setToast({ message: 'Product created successfully!', type: 'success' });
      }
      
      setIsModalOpen(false);
      setEditingProduct(null);
    } catch (error) {
      setToast({ 
        message: error as string || 'An error occurred while saving the product.', 
        type: 'error' 
      });
    }
  };

  // Handle product deletion
  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
      try {
        await dispatch(deleteProduct(id)).unwrap();
        setToast({ message: 'Product deleted successfully!', type: 'success' });
      } catch (error) {
        setToast({ 
          message: error as string || 'Failed to delete product.', 
          type: 'error' 
        });
      }
    }
  };

  // Handle stock update
  const handleStockUpdate = (id: number, stock: number, inStock: boolean) => {
    dispatch(updateProductStock({ id, stock, inStock }));
    setToast({ message: 'Stock updated successfully!', type: 'success' });
  };

  // Handle edit
  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  // Handle add new product
  const handleAddNew = () => {
    setEditingProduct(null);
    setIsModalOpen(true);
  };

  // Handle modal close
  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
  };

  // Handle refresh
  const handleRefresh = () => {
    dispatch(fetchProducts());
    setToast({ message: 'Products refreshed!', type: 'success' });
  };

  // Clear error
  React.useEffect(() => {
    if (error) {
      setToast({ message: error, type: 'error' });
      dispatch(clearError());
    }
  }, [error, dispatch]);

  const stats = React.useMemo(() => {
    const total = filteredProducts.length;
    const inStock = filteredProducts.filter(p => p.inStock).length;
    const outOfStock = total - inStock;
    const totalValue = filteredProducts.reduce((sum, p) => sum + (p.price * (p.stock || 0)), 0);

    return { total, inStock, outOfStock, totalValue };
  }, [filteredProducts]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile-Responsive Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14 sm:h-16">
            {/* Logo and Title */}
            <div className="flex items-center min-w-0 flex-1">
              <Package className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600 mr-2 sm:mr-3 flex-shrink-0" />
              <h1 className="text-lg sm:text-2xl font-bold text-gray-900 truncate">
                {import.meta.env.VITE_APP_NAME?.split(' ').slice(0, 2).join(' ') || 'Product Inventory'}
              </h1>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden sm:flex items-center gap-3">
              <button
                onClick={handleRefresh}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors rounded-lg hover:bg-gray-100"
                title="Refresh products"
              >
                <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
                <span className="hidden md:inline">Refresh</span>
              </button>
              
              <button
                onClick={handleAddNew}
                className="btn-primary flex items-center gap-2"
              >
                <Plus className="h-5 w-5" />
                <span className="hidden md:inline">Add Product</span>
                <span className="md:hidden">Add</span>
              </button>
            </div>

            {/* Mobile Navigation */}
            <div className="flex sm:hidden items-center gap-2">
              <button
                onClick={handleRefresh}
                disabled={loading}
                className="p-2 text-gray-600 hover:text-gray-800 transition-colors rounded-lg hover:bg-gray-100"
                title="Refresh products"
              >
                <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
              </button>
              
              <button
                onClick={handleAddNew}
                className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                title="Add Product"
              >
                <Plus className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Mobile-Responsive Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
          <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600">Total</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <Package className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
            </div>
          </div>
          
          <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600">In Stock</p>
                <p className="text-xl sm:text-2xl font-bold text-green-600">{stats.inStock}</p>
              </div>
              <CheckCircle className="h-6 w-6 sm:h-8 sm:w-8 text-green-600" />
            </div>
          </div>
          
          <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600">Out of Stock</p>
                <p className="text-xl sm:text-2xl font-bold text-red-600">{stats.outOfStock}</p>
              </div>
              <AlertCircle className="h-6 w-6 sm:h-8 sm:w-8 text-red-600" />
            </div>
          </div>
          
          <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md border border-gray-200 col-span-2 lg:col-span-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600">Total Value</p>
                <p className="text-lg sm:text-2xl font-bold text-gray-900">${stats.totalValue.toFixed(2)}</p>
              </div>
              <Package className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <SearchFilter />

        {/* Product List */}
        <ProductList
          products={filteredProducts}
          loading={loading}
          error={error}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onUpdateStock={handleStockUpdate}
        />
      </main>

      {/* Modal for Add/Edit Product */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        title={editingProduct ? 'Edit Product' : 'Add New Product'}
        size="lg"
      >
        <ProductForm
          product={editingProduct}
          onSubmit={handleFormSubmit}
          onCancel={handleModalClose}
          loading={loading}
        />
      </Modal>

      {/* Toast Notifications */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};

// App Wrapper with Redux Provider
const App: React.FC = () => {
  return (
    <Provider store={store}>
      <Dashboard />
    </Provider>
  );
};

export default App;
