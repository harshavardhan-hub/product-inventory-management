import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { ProductState, ProductFormData } from '../types/Product';
import { productApi } from '../utils/api';

// Load state from localStorage
const loadStateFromStorage = (): Partial<ProductState> => {
  try {
    const serializedState = localStorage.getItem('productInventory');
    if (serializedState === null) return {};
    return JSON.parse(serializedState);
  } catch (error) {
    console.warn('Failed to load state from localStorage:', error);
    return {};
  }
};

// Save state to localStorage
const saveStateToStorage = (state: ProductState) => {
  try {
    const serializedState = JSON.stringify({
      products: state.products,
      searchTerm: state.searchTerm,
      selectedCategory: state.selectedCategory,
      sortBy: state.sortBy,
      sortOrder: state.sortOrder,
    });
    localStorage.setItem('productInventory', serializedState);
  } catch (error) {
    console.warn('Failed to save state to localStorage:', error);
  }
};

// Initial state
const initialState: ProductState = {
  products: [],
  filteredProducts: [],
  loading: false,
  error: null,
  searchTerm: '',
  selectedCategory: 'all',
  sortBy: 'none',
  sortOrder: 'asc',
  ...loadStateFromStorage(),
};

// Async thunks
export const fetchProducts = createAsyncThunk(
  'products/fetchProducts',
  async (_, { rejectWithValue }) => {
    try {
      const products = await productApi.getAllProducts();
      return products;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch products');
    }
  }
);

export const createProduct = createAsyncThunk(
  'products/createProduct',
  async (productData: ProductFormData, { rejectWithValue }) => {
    try {
      const response = await productApi.createProduct(productData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to create product');
    }
  }
);

export const updateProduct = createAsyncThunk(
  'products/updateProduct',
  async ({ id, data }: { id: number; data: Partial<ProductFormData> }, { rejectWithValue }) => {
    try {
      await productApi.updateProduct(id, data);
      return { id, data };
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to update product');
    }
  }
);

export const deleteProduct = createAsyncThunk(
  'products/deleteProduct',
  async (id: number, { rejectWithValue }) => {
    try {
      await productApi.deleteProduct(id);
      return id;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to delete product');
    }
  }
);

// Helper function to filter and sort products
const filterAndSortProducts = (state: ProductState) => {
  let filtered = [...state.products];

  // Apply search filter
  if (state.searchTerm) {
    filtered = filtered.filter(product =>
      product.title.toLowerCase().includes(state.searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(state.searchTerm.toLowerCase())
    );
  }

  // Apply category filter
  if (state.selectedCategory !== 'all') {
    filtered = filtered.filter(product => product.category === state.selectedCategory);
  }

  // Apply sorting
  if (state.sortBy !== 'none') {
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (state.sortBy) {
        case 'name':
          comparison = a.title.localeCompare(b.title);
          break;
        case 'price':
          comparison = a.price - b.price;
          break;
        default:
          return 0;
      }
      
      return state.sortOrder === 'desc' ? -comparison : comparison;
    });
  }

  state.filteredProducts = filtered;
};

// Product slice
const productSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    setSearchTerm: (state, action: PayloadAction<string>) => {
      state.searchTerm = action.payload;
      filterAndSortProducts(state);
      saveStateToStorage(state);
    },
    
    setSelectedCategory: (state, action: PayloadAction<string>) => {
      state.selectedCategory = action.payload;
      filterAndSortProducts(state);
      saveStateToStorage(state);
    },
    
    setSorting: (state, action: PayloadAction<{ sortBy: 'name' | 'price' | 'none'; sortOrder: 'asc' | 'desc' }>) => {
      state.sortBy = action.payload.sortBy;
      state.sortOrder = action.payload.sortOrder;
      filterAndSortProducts(state);
      saveStateToStorage(state);
    },
    
    clearError: (state) => {
      state.error = null;
    },
    
    updateProductStock: (state, action: PayloadAction<{ id: number; stock: number; inStock: boolean }>) => {
      const product = state.products.find(p => p.id === action.payload.id);
      if (product) {
        product.stock = action.payload.stock;
        product.inStock = action.payload.inStock;
        filterAndSortProducts(state);
        saveStateToStorage(state);
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch products
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload;
        filterAndSortProducts(state);
        saveStateToStorage(state);
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Create product
      .addCase(createProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createProduct.fulfilled, (state, action) => {
        state.loading = false;
        state.products.unshift(action.payload);
        filterAndSortProducts(state);
        saveStateToStorage(state);
      })
      .addCase(createProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Update product
      .addCase(updateProduct.fulfilled, (state, action) => {
        const { id, data } = action.payload;
        const productIndex = state.products.findIndex(p => p.id === id);
        if (productIndex !== -1) {
          state.products[productIndex] = { ...state.products[productIndex], ...data };
          filterAndSortProducts(state);
          saveStateToStorage(state);
        }
      })
      .addCase(updateProduct.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      
      // Delete product
      .addCase(deleteProduct.fulfilled, (state, action) => {
        const id = action.payload;
        state.products = state.products.filter(p => p.id !== id);
        filterAndSortProducts(state);
        saveStateToStorage(state);
      })
      .addCase(deleteProduct.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  },
});

export const {
  setSearchTerm,
  setSelectedCategory,
  setSorting,
  clearError,
  updateProductStock,
} = productSlice.actions;

export default productSlice.reducer;
