import React from 'react';
import { Search, Filter, SortAsc, SortDesc } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../store';
import { setSearchTerm, setSelectedCategory, setSorting } from '../store/productSlice';

const SearchFilter: React.FC = () => {
  const dispatch = useAppDispatch();
  const { searchTerm, selectedCategory, sortBy, sortOrder, products } = useAppSelector(state => state.products);

  // Get unique categories from products
  const categories = React.useMemo(() => {
    const uniqueCategories = [...new Set(products.map(product => product.category))];
    return uniqueCategories.sort();
  }, [products]);

  const handleSortChange = (newSortBy: 'name' | 'price' | 'none') => {
    if (newSortBy === sortBy) {
      // Toggle sort order if same field
      dispatch(setSorting({ 
        sortBy: newSortBy, 
        sortOrder: sortOrder === 'asc' ? 'desc' : 'asc' 
      }));
    } else {
      // Set new sort field with ascending order
      dispatch(setSorting({ sortBy: newSortBy, sortOrder: 'asc' }));
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 mb-6">
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Search Input */}
        <div className="flex-1 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search products by name or description..."
            value={searchTerm}
            onChange={(e) => dispatch(setSearchTerm(e.target.value))}
            className="input-field pl-10"
          />
        </div>

        {/* Category Filter */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Filter className="h-5 w-5 text-gray-400" />
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => dispatch(setSelectedCategory(e.target.value))}
            className="input-field pl-10 pr-8 appearance-none bg-white cursor-pointer min-w-[200px]"
          >
            <option value="all">All Categories</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </option>
            ))}
          </select>
        </div>

        {/* Sort Options */}
        <div className="flex gap-2">
          <button
            onClick={() => handleSortChange('name')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
              sortBy === 'name'
                ? 'bg-blue-100 border-blue-300 text-blue-700'
                : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            Name
            {sortBy === 'name' && (
              sortOrder === 'asc' ? <SortAsc size={16} /> : <SortDesc size={16} />
            )}
          </button>
          
          <button
            onClick={() => handleSortChange('price')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
              sortBy === 'price'
                ? 'bg-blue-100 border-blue-300 text-blue-700'
                : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            Price
            {sortBy === 'price' && (
              sortOrder === 'asc' ? <SortAsc size={16} /> : <SortDesc size={16} />
            )}
          </button>

          {sortBy !== 'none' && (
            <button
              onClick={() => handleSortChange('none')}
              className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              Clear Sort
            </button>
          )}
        </div>
      </div>

      {/* Active Filters Display */}
      {(searchTerm || selectedCategory !== 'all' || sortBy !== 'none') && (
        <div className="mt-4 flex flex-wrap gap-2">
          {searchTerm && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
              Search: "{searchTerm}"
              <button
                onClick={() => dispatch(setSearchTerm(''))}
                className="ml-2 hover:text-blue-600"
              >
                ×
              </button>
            </span>
          )}
          
          {selectedCategory !== 'all' && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800">
              Category: {selectedCategory}
              <button
                onClick={() => dispatch(setSelectedCategory('all'))}
                className="ml-2 hover:text-green-600"
              >
                ×
              </button>
            </span>
          )}
          
          {sortBy !== 'none' && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-purple-100 text-purple-800">
              Sort: {sortBy} ({sortOrder})
              <button
                onClick={() => dispatch(setSorting({ sortBy: 'none', sortOrder: 'asc' }))}
                className="ml-2 hover:text-purple-600"
              >
                ×
              </button>
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchFilter;
