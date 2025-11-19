import { useNavigate } from "react-router-dom";

const LowStockAlert = ({ lowStockItems }) => {
  const items = [
    { name: 'iPhone 13 Case', stock: 3, threshold: 10 },
    { name: 'Samsung Charger', stock: 5, threshold: 15 },
    { name: 'Wireless Earbuds', stock: 2, threshold: 8 },
    { name: 'Screen Protector', stock: 7, threshold: 20 }
  ];

  const navigate = useNavigate();

  return (
    <div className="p-4 space-y-3">
      {lowStockItems.map((item) => (
        <div key={item.id} className="flex justify-between items-center p-2 bg-red-50 rounded-lg">
          <div className="flex-1">
            <p className="font-medium text-sm text-red-800">{item.product.name}</p>
            <p className="font-medium text-sm text-red-800">from {item.supplier.name}</p>
            <p className="text-xs text-red-600">Only {item.stock_level} left</p>
          </div>
          <button 
            className="px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700"
            onClick={() => navigate('/admin/inventory')}
            >
            Reorder
          </button>
        </div>
      ))}
    </div>
  );
};

export default LowStockAlert;