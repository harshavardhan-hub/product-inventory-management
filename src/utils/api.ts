import axios from 'axios';
import { Product, ProductFormData } from '../types/Product';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://fakestoreapi.com';

// Define ApiResponse interface here instead of importing
interface ApiResponse {
  success: boolean;
  message: string;
  data?: any;
}

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
  // Get all products
  getAllProducts: async (): Promise<Product[]> => {
    try {
      const response = await api.get<Product[]>('/products');
      // Add stock information since FakeStore API doesn't provide it
      return response.data.map(product => ({
        ...product,
        stock: Math.floor(Math.random() * 100) + 1,
        inStock: Math.random() > 0.1, // 90% chance of being in stock
      }));
    } catch (error) {
      throw new Error('Failed to fetch products');
    }
  },

  // Get single product
  getProduct: async (id: number): Promise<Product> => {
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

  // Create new product (simulated)
  createProduct: async (productData: ProductFormData): Promise<ApiResponse> => {
    try {
      // Since FakeStore API doesn't actually create products, we simulate it
      const response = await api.post('/products', productData);
      
      // Return success response with mock data
      return {
        success: true,
        message: 'Product created successfully',
        data: {
          id: Date.now(), // Mock ID
          ...productData,
          rating: { rate: 0, count: 0 },
          inStock: true,
        }
      };
    } catch (error) {
      throw new Error('Failed to create product');
    }
  },

  // Update product (simulated)
  updateProduct: async (id: number, productData: Partial<ProductFormData>): Promise<ApiResponse> => {
    try {
      const response = await api.put(`/products/${id}`, productData);
      
      return {
        success: true,
        message: 'Product updated successfully',
        data: response.data
      };
    } catch (error) {
      throw new Error(`Failed to update product with id ${id}`);
    }
  },

  // Delete product (simulated)
  deleteProduct: async (id: number): Promise<ApiResponse> => {
    try {
      await api.delete(`/products/${id}`);
      
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
      throw new Error('Failed to fetch categories');
    }
  },
};

export default api;
