import { Frown, Loader2 } from 'lucide-react';
import SupplierCard from './SupplierCard';

const SuppliersList = ({
  isLoading,
  filteredSuppliers,
  searchTerm,
  handleDelete
}) => {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8 md:p-12">
        <Loader2 className="h-6 w-6 md:h-8 md:w-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  if (filteredSuppliers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 md:p-12 text-center">
        <Frown className="h-8 w-8 md:h-12 md:w-12 text-gray-400 mb-3 md:mb-4" />
        <h3 className="text-base md:text-lg font-medium text-gray-700">No suppliers found</h3>
        <p className="text-sm md:text-base text-gray-500 mt-1">
          {searchTerm ? "Try a different search term" : "No suppliers available"}
        </p>
      </div>
    );
  }

  return (
    <SupplierCard
      filteredSuppliers={filteredSuppliers}
      handleDelete={handleDelete}
    />
  );
};

export default SuppliersList;