import InventoryStats from "../../components/admin/inventory/InventoryStats";
import { useGetSupplierItemsQuery } from '../../../src/slices/supplierItemsApiSlice';
import Card from '../../../src/components/common/Card';

import InventoryFilter from "../../components/admin/inventory/InventoryFilter";
import InventoryTable from "../../components/admin/inventory/InventoryTable";
import { useState } from 'react';


const Inventory = () => {

const [filters,setFilters]=useState({

  searchTerm: "",
 
  inStock: false,
  lowStock: false,
  outOfStock: false,
  criticalStock: false,
})

  const {data, isLoading} =useGetSupplierItemsQuery();

    const products = (data?.data?.supplierItems || []).filter(
    p => !p.deletedAt && !p.Product?.deletedAt && !p.Supplier?.deletedAt
  );
  console.log(data?.data);

  

  if (isLoading) return <Card className="p-4">Loading stats...</Card>;
   const stock = products.map((p) => ({
    productId: p.Product?.id,
    productName: p.Product?.name,
    stockLevel: p.stock_level,
   supplierId: p.Supplier.id,
   supplierSku:p.supplier_sku
   
   
  }));
  


 
      return (
        <div  >
         <InventoryStats stock={stock} />
         <InventoryFilter filters={filters} setFilters={setFilters} />
         <InventoryTable stock={stock} filters={filters} />

        </div>
      )

};

export default Inventory;
