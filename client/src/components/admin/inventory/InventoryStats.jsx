import Card from "../../common/Card";
import Badges from "../../common/Badges";

const InventoryStats = ({ stock }) => {
  if (!stock || stock.length === 0) {
    return (
      <Card className="p-6 bg-gradient-to-r from-gray-50 to-white">
        <div className="text-center text-gray-500 py-8">No stock data available</div>
      </Card>
    );
  }

  // Total number of products
  const total = stock.length;

  // Count stock categories
  const outOfStock = stock.filter((item) => item.stockLevel === 0).length;
  const lowStock = stock.filter(
    (item) => item.stockLevel > 0 && item.stockLevel < 10
  ).length;
  const criticalStock = stock.filter(
    (item) => item.stockLevel > 0 && item.stockLevel < 5
  ).length;
  const inStock = stock.filter((item) => item.stockLevel >= 10).length;

  // Calculate percentages
  const outOfStockPercent = total > 0 ? ((outOfStock / total) * 100).toFixed(1) : 0;
  const lowStockPercent = total > 0 ? ((lowStock / total) * 100).toFixed(1) : 0;
  const inStockPercent = total > 0 ? ((inStock / total) * 100).toFixed(1) : 0;
  const criticalStockPercent = total > 0 ? ((criticalStock / total) * 100).toFixed(1) : 0;

  const StatCard = ({ title, value, percent, variant, icon }) => (
    <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start">
        <div>
          <h4 className="text-sm font-medium text-gray-500">{title}</h4>
          <p className="text-2xl font-bold text-gray-900 mt-2">{value}</p>
          <p className="text-xs text-gray-500 mt-1">{percent}% of total</p>
        </div>
        <div className={`p-3 rounded-lg bg-gradient-to-br ${variant} text-white`}>
          {icon}
        </div>
      </div>
      <div className="mt-4">
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full ${variant.split(' ')[0]}`}
            style={{ width: `${percent}%` }}
          ></div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
      <StatCard
        title="Total Products"
        value={total}
        percent="100"
        variant="from-blue-500 to-blue-600"
        icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
        </svg>}
      />
      <StatCard
        title="In Stock"
        value={inStock}
        percent={inStockPercent}
        variant="from-green-500 to-green-600"
        icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>}
      />
      <StatCard
        title="Low Stock"
        value={lowStock}
        percent={lowStockPercent}
        variant="from-yellow-500 to-yellow-600"
        icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>}
      />
      <StatCard
        title="Out of Stock"
        value={outOfStock}
        percent={outOfStockPercent}
        variant="from-red-500 to-red-600"
        icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>}
      />
    </div>
  );
};

export default InventoryStats;