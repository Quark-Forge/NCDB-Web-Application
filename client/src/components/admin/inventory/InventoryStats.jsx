import Card from "../../common/Card";

const InventoryStats = ({ stock }) => {
  if (!stock || stock.length === 0) {
    return <Card className="p-4">No stock data available</Card>;
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
  const outOfStockPercent = ((outOfStock / total) * 100).toFixed(1);
  const lowStockPercent = ((lowStock / total) * 100).toFixed(1);
  const inStockPercent = ((inStock / total) * 100).toFixed(1);
  const criticalStockPercent = ((criticalStock / total) * 100).toFixed(1);

  return (
    <Card className="p-4">
      <h3 className="text-sm font-medium mb-4">Inventory Statistics</h3>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <StatCard
          title="In Stock"
          value={`${inStock} (${inStockPercent}%)`}
          trend="up"
        />
        <StatCard
          title="Low Stock"
          value={`${lowStock} (${lowStockPercent}%)`}
          trend="down"
        />
        <StatCard
          title="Out of Stock"
          value={`${outOfStock} (${outOfStockPercent}%)`}
          trend="down"
        />

         <StatCard
          title="Critical Stock"
          value={`${criticalStock} (${criticalStockPercent}%)`}
          trend="down"
        />
      </div>
    </Card>
  );
};

// Reusable Stat Card
const StatCard = ({ title, value, trend }) => {
  const trendColors = {
    up: "text-green-600",
    down: "text-red-600",
    neutral: "text-gray-600",
  };

  const trendIcons = {
    up: "↑",
    down: "↓",
    neutral: "→",
  };

  return (
    <div className="bg-gray-50 p-3 rounded-lg">
      <h4 className="text-xs text-gray-500 font-medium">{title}</h4>
      <div className="flex items-end justify-between mt-1">
        <p className="text-lg font-bold">{value}</p>
        {trend && (
          <span className={`text-xs ${trendColors[trend]}`}>
            {trendIcons[trend]}
          </span>
        )}
      </div>
    </div>
  );
};

export default InventoryStats;
