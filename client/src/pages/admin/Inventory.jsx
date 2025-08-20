
import { useState } from "react";
import InventoryStats from "../../components/admin/inventory/InventoryStats";


const Inventory = () => {

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      <h1 className="text-xl md:text-2xl font-bold text-gray-800 mb-4">Inventory Management</h1>
      <div className="mb-6">
        <InventoryStats />
      </div>
    
    </div>
  );
};

export default Inventory;