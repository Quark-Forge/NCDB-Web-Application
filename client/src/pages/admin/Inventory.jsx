import { useState } from 'react';
import InventoryStats from "../../components/admin/inventory/InventoryStats";
import { useGetSupplierItemsQuery } from '../../../src/slices/supplierItemsApiSlice';
import InventoryFilter from "../../components/admin/inventory/InventoryFilter";
import InventoryTable from "../../components/admin/inventory/InventoryTable";
import LoadingSpinner from '../../../src/components/common/LoadingSpinner';
import Card from '../../../src/components/common/Card';

const Inventory = () => {
  const [filters, setFilters] = useState({
    searchTerm: "",
    inStock: false,
    lowStock: false,
    outOfStock: false,
    criticalStock: false,
  });

  const { data, isLoading, error } = useGetSupplierItemsQuery();

  if (isLoading) return (
    <div className="flex justify-center items-center min-h-96">
      <div className="text-center">
        <LoadingSpinner size="lg" />
        <p className="mt-4 text-gray-500">Loading inventory data...</p>
      </div>
    </div>
  );

  if (error) return (
    <Card className="p-8 text-center">
      <div className="bg-gradient-to-r from-red-50 to-pink-50 p-6 rounded-xl">
        <div className="text-red-600 text-lg font-medium mb-2">Error loading inventory data</div>
        <p className="text-gray-600">Please try again later or contact support</p>
      </div>
    </Card>
  );

  const products = (data?.data?.supplierItems || []).filter(
    p => !p.deletedAt && !p.Product?.deletedAt && !p.Supplier?.deletedAt
  );

  const stock = products.map((p) => ({
    productId: p.Product?.id,
    productName: p.Product?.name,
    stockLevel: p.stock_level,
    supplierId: p.Supplier.id,
    supplierSku: p.supplier_sku,
    supplierName: p.Supplier?.name || 'Unknown Supplier'
  }));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Inventory Management</h1>
          <p className="text-gray-500 mt-1">Monitor and manage your product inventory</p>
        </div>
      </div>

      <InventoryStats stock={stock} />
      <InventoryFilter filters={filters} setFilters={setFilters} />
      <InventoryTable stock={stock} filters={filters} />
    </div>
  );
};

export default Inventory;