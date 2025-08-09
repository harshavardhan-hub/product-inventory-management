export interface Product {
  id: number;
  title: string;
  price: number;
  description: string;
  category: string;
  image: string;
  rating: {
    rate: number;
    count: number;
  };
  // Additional fields for our inventory
  stock?: number;
  inStock?: boolean;
}

export interface ProductFormData {
  title: string;
  price: number;
  description: string;
  category: string;
  image: string;
  stock: number;
}

export interface ProductState {
  products: Product[];
  filteredProducts: Product[];
  loading: boolean;
  error: string | null;
  searchTerm: string;
  selectedCategory: string;
  sortBy: 'name' | 'price' | 'none';
  sortOrder: 'asc' | 'desc';
}

// ApiResponse removed - now defined in api.ts
