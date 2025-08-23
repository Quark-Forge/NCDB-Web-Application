import InventoryStats from "../../components/admin/inventory/InventoryStats";
import InventoryFilter from "../../components/admin/inventory/InventoryFilter";
import InventoryTable from "../../components/admin/inventory/InventoryTable";
import Pagination from "../../components/common/Pagination";
import Card from "../../components/common/Card";
import { useGetSupplierItemsQuery } from "../../slices/supplierItemsApiSlice";
import { useState, useEffect } from "react";

const Inventory = () => {
  const [filters, setFilters] = useState({
    searchTerm: "",
    inStock: false,
    lowStock: false,
    outOfStock: false,
    criticalStock: false,
  });

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 3,
  });

  // Fetch all data (no backend filtering)
  const { data, isLoading } = useGetSupplierItemsQuery();

  const products = (data?.data?.supplierItems || []).filter(
    (p) => !p.deletedAt && !p.Product?.deletedAt && !p.Supplier?.deletedAt
  );

  // Map stock data
  const stock = products.map((p) => ({
    productId: p.Product?.id,
    productName: p.Product?.name,
    stockLevel: p.stock_level,
    supplierId: p.Supplier.id,
    supplierSku: p.supplier_sku,
  }));

  // Apply frontend filter to calculate total pages
  const filteredStock = stock.filter((item) => {
    const searchMatch = item.productName
      .toLowerCase()
      .includes(filters.searchTerm.toLowerCase());

    const stockStatusMatch =
      (!filters.inStock &&
        !filters.lowStock &&
        !filters.outOfStock &&
        !filters.criticalStock) ||
      (filters.inStock && item.stockLevel > 10) ||
      (filters.lowStock && item.stockLevel <= 10 && item.stockLevel > 5) ||
      (filters.outOfStock && item.stockLevel === 0) ||
      (filters.criticalStock && item.stockLevel <= 5 && item.stockLevel > 0);

    return searchMatch && stockStatusMatch;
  });

  const totalItems = filteredStock.length;
  const totalPages = Math.ceil(totalItems / pagination.limit) || 1;

  // Reset page if current page exceeds total pages after filtering
  useEffect(() => {
    if (pagination.page > totalPages) {
      setPagination((prev) => ({ ...prev, page: 1 }));
    }
  }, [totalPages]);

  if (isLoading) return <Card className="p-4">Loading...</Card>;

  return (
    <div>
      <InventoryStats stock={stock} />
      <InventoryFilter filters={filters} setFilters={setFilters} />

      <InventoryTable
        stock={stock}
        filters={filters}
        pagination={pagination}
        setPagination={setPagination}
      />

      <Pagination
        currentPage={pagination.page}
        totalPages={totalPages}
        onPageChange={(newPage) =>
          setPagination((prev) => ({ ...prev, page: newPage }))
        }
      />
    </div>
  );
};

export default Inventory;
