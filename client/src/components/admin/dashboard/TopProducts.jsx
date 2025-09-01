// components/admin/dashboard/TopProducts.jsx
import { FiPackage, FiShoppingCart, FiDollarSign } from 'react-icons/fi';

const TopProducts = ({ topProducts }) => {
  // Handle undefined or empty array
  if (!topProducts || topProducts.length === 0) {
    return (
      <div className="p-6 text-center text-gray-500">
        <FiPackage className="mx-auto text-2xl text-gray-400 mb-2" />
        <p>No top selling products found</p>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      {topProducts.map((product) => (
        <div key={product.product_id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-3 flex-1">
            <div className="w-10 h-10 bg-gray-200 rounded flex items-center justify-center">
              {product.image_url ? (
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="w-8 h-8 object-cover rounded"
                />
              ) : (
                <FiPackage className="text-gray-400" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm text-gray-900 truncate">{product.name}</p>
            </div>
          </div>

          <div className="text-right">
            <div className="flex items-center gap-1 text-green-600">
              <FiShoppingCart className="text-xs" />
              <span className="font-semibold text-sm">{product.total_quantity}</span>
            </div>
            <div className="flex items-center gap-1 text-blue-600">
              <FiDollarSign className="text-xs" />
              <span className="font-semibold text-sm">LKR {product.total_revenue?.toFixed(2) || '0.00'}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default TopProducts;