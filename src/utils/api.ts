import axios from 'axios';
import { Product, ProductFormData } from '../types/Product';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://fakestoreapi.com';
const LOCAL_PRODUCTS_KEY = 'local_products';

// Define ApiResponse interface
interface ApiResponse {
  success: boolean;
  message: string;
  data?: any;
}

// Local storage helpers for products
const getLocalProducts = (): Product[] => {
  try {
    const stored = localStorage.getItem(LOCAL_PRODUCTS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.warn('Failed to load local products:', error);
    return [];
  }
};

const saveLocalProducts = (products: Product[]) => {
  try {
    localStorage.setItem(LOCAL_PRODUCTS_KEY, JSON.stringify(products));
  } catch (error) {
    console.warn('Failed to save local products:', error);
  }
};

const addLocalProduct = (product: Product) => {
  const localProducts = getLocalProducts();
  localProducts.unshift(product); // Add to beginning
  saveLocalProducts(localProducts);
};

const updateLocalProduct = (id: number, updatedData: Partial<Product>) => {
  const localProducts = getLocalProducts();
  const index = localProducts.findIndex(p => p.id === id);
  if (index !== -1) {
    localProducts[index] = { ...localProducts[index], ...updatedData };
    saveLocalProducts(localProducts);
  }
};

const deleteLocalProduct = (id: number) => {
  const localProducts = getLocalProducts();
  const filtered = localProducts.filter(p => p.id !== id);
  saveLocalProducts(filtered);
};

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    console.log(`✅ API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error('❌ Response Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export const productApi = {
  // Get all products (API + Local)
  getAllProducts: async (): Promise<Product[]> => {
    try {
      const response = await api.get<Product[]>('/products');
      // Add stock information to API products
      const apiProducts = response.data.map(product => ({
        ...product,
        stock: Math.floor(Math.random() * 100) + 1,
        inStock: Math.random() > 0.1,
      }));

      // Get local products and merge with API products
      const localProducts = getLocalProducts();
      
      // Combine: local products first, then API products
      const allProducts = [...localProducts, ...apiProducts];
      
      // Remove duplicates (in case a local product has same ID as API product)
      const uniqueProducts = allProducts.filter((product, index, self) => 
        index === self.findIndex(p => p.id === product.id)
      );

      console.log(`📦 Total products: ${uniqueProducts.length} (${localProducts.length} local + ${apiProducts.length} API)`);
      
      return uniqueProducts;
    } catch (error) {
      console.warn('API fetch failed, using local products only');
      return getLocalProducts();
    }
  },

  // Get single product
  getProduct: async (id: number): Promise<Product> => {
    // First check local products
    const localProducts = getLocalProducts();
    const localProduct = localProducts.find(p => p.id === id);
    if (localProduct) {
      return localProduct;
    }

    // If not found locally, try API
    try {
      const response = await api.get<Product>(`/products/${id}`);
      return {
        ...response.data,
        stock: Math.floor(Math.random() * 100) + 1,
        inStock: Math.random() > 0.1,
      };
    } catch (error) {
      throw new Error(`Failed to fetch product with id ${id}`);
    }
  },

  // Create new product (Store locally)
  createProduct: async (productData: ProductFormData): Promise<ApiResponse> => {
    try {
      // Create product with unique ID
      const newProduct: Product = {
        id: Date.now(), // Use timestamp as unique ID
        title: productData.title,
        price: productData.price,
        description: productData.description,
        category: productData.category,
        image: productData.image,
        rating: { rate: 0, count: 0 },
        stock: productData.stock,
        inStock: productData.stock > 0,
      };

      // Save to localStorage
      addLocalProduct(newProduct);

      // Also attempt to post to API (for simulation)
      try {
        await api.post('/products', productData);
      } catch (apiError) {
        console.warn('API post failed, but product saved locally');
      }
      
      return {
        success: true,
        message: 'Product created and saved locally',
        data: newProduct
      };
    } catch (error) {
      throw new Error('Failed to create product');
    }
  },

  // Update product
  updateProduct: async (id: number, productData: Partial<ProductFormData>): Promise<ApiResponse> => {
    try {
      // Update locally first
      updateLocalProduct(id, productData);

      // Try to update via API
      try {
        await api.put(`/products/${id}`, productData);
      } catch (apiError) {
        console.warn('API update failed, but product updated locally');
      }
      
      return {
        success: true,
        message: 'Product updated successfully',
        data: productData
      };
    } catch (error) {
      throw new Error(`Failed to update product with id ${id}`);
    }
  },

  // Delete product
  deleteProduct: async (id: number): Promise<ApiResponse> => {
    try {
      // Delete locally first
      deleteLocalProduct(id);

      // Try to delete via API
      try {
        await api.delete(`/products/${id}`);
      } catch (apiError) {
        console.warn('API delete failed, but product deleted locally');
      }
      
      return {
        success: true,
        message: 'Product deleted successfully',
      };
    } catch (error) {
      throw new Error(`Failed to delete product with id ${id}`);
    }
  },

  // Get categories
  getCategories: async (): Promise<string[]> => {
    try {
      const response = await api.get<string[]>('/products/categories');
      return response.data;
    } catch (error) {
      // Fallback to default categories if API fails
      return [
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
    }
  },

  // Utility: Clear all local products (for testing)
  clearLocalProducts: () => {
    localStorage.removeItem(LOCAL_PRODUCTS_KEY);
    console.log('🗑️ All local products cleared');
  }
};

export default api;
