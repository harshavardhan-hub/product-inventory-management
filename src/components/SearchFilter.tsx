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
    <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md border border-gray-200 mb-4 sm:mb-6">
      <div className="flex flex-col space-y-4">
        {/* Search Input - Full width on mobile */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search products by name or description..."
            value={searchTerm}
            onChange={(e) => dispatch(setSearchTerm(e.target.value))}
            className="input-field pl-9 sm:pl-10 text-sm sm:text-base"
          />
        </div>

        {/* Filters Row */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          {/* Category Filter */}
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Filter className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => dispatch(setSelectedCategory(e.target.value))}
              className="input-field pl-9 sm:pl-10 pr-8 appearance-none bg-white cursor-pointer w-full text-sm sm:text-base"
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
          <div className="flex gap-2 sm:gap-3 justify-center sm:justify-start">
            <button
              onClick={() => handleSortChange('name')}
              className={`flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 rounded-lg border transition-colors text-xs sm:text-sm ${
                sortBy === 'name'
                  ? 'bg-blue-100 border-blue-300 text-blue-700'
                  : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <span className="hidden sm:inline">Name</span>
              <span className="sm:hidden">A-Z</span>
              {sortBy === 'name' && (
                sortOrder === 'asc' ? <SortAsc size={14} /> : <SortDesc size={14} />
              )}
            </button>
            
            <button
              onClick={() => handleSortChange('price')}
              className={`flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 rounded-lg border transition-colors text-xs sm:text-sm ${
                sortBy === 'price'
                  ? 'bg-blue-100 border-blue-300 text-blue-700'
                  : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <span className="hidden sm:inline">Price</span>
              <span className="sm:hidden">$</span>
              {sortBy === 'price' && (
                sortOrder === 'asc' ? <SortAsc size={14} /> : <SortDesc size={14} />
              )}
            </button>

            {sortBy !== 'none' && (
              <button
                onClick={() => handleSortChange('none')}
                className="px-2 sm:px-3 py-2 text-xs sm:text-sm text-gray-500 hover:text-gray-700 transition-colors"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Active Filters Display - More compact on mobile */}
        {(searchTerm || selectedCategory !== 'all' || sortBy !== 'none') && (
          <div className="flex flex-wrap gap-2">
            {searchTerm && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                Search: "{searchTerm.length > 10 ? searchTerm.substring(0, 10) + '...' : searchTerm}"
                <button
                  onClick={() => dispatch(setSearchTerm(''))}
                  className="ml-1 hover:text-blue-600"
                >
                  ×
                </button>
              </span>
            )}
            
            {selectedCategory !== 'all' && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                Category: {selectedCategory.length > 8 ? selectedCategory.substring(0, 8) + '...' : selectedCategory}
                <button
                  onClick={() => dispatch(setSelectedCategory('all'))}
                  className="ml-1 hover:text-green-600"
                >
                  ×
                </button>
              </span>
            )}
            
            {sortBy !== 'none' && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-800">
                Sort: {sortBy} ({sortOrder})
                <button
                  onClick={() => dispatch(setSorting({ sortBy: 'none', sortOrder: 'asc' }))}
                  className="ml-1 hover:text-purple-600"
                >
                  ×
                </button>
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchFilter;
