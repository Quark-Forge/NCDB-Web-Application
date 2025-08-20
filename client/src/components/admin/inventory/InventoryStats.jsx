

import { useGetSupplierItemsQuery } from '../../../slices/supplierItemsApiSlice';
import Card from '../../common/Card';

const InventoryStats = () => {
    const { data, isLoading } = useGetSupplierItemsQuery();
    const products = data?.data || [];

  console.log(products);
  

    if (isLoading) return <Card className="p-4">Loading stats...</Card>;

    return (
//         <Card className="p-4">
//             <h3 className="text-sm font-medium mb-4">Inventory Statistics</h3>
//             <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
//                 <StatCard
//                     title={products.stock_level}
//                     value={products.}
//                     trend="up"
//                     change={products.stock_level? "instock":"outofstock"}
//                 />
//                 {/* <StatCard
//                     title="Low Stock"
//                     value={lowStock}
//                     trend="down"
//                     change={products.length ? `${Math.round((lowStock/products.length)*100)}%` : '0%'}
//                 />
//                 <StatCard
//                     title="Out of Stock"
//                     value={outOfStock}
//                     trend="down"
//                     change={products.length ? `${Math.round((outOfStock/products.length)*100)}%` : '0%'}
//                 /> */}
//             </div>
//         </Card>
//     );
// };

// const StatCard = ({ title, value, trend, change }) => {
//     const trendColors = {
//         up: 'text-green-600',
//         down: 'text-red-600',
//         neutral: 'text-gray-600'
//     };
//     const trendIcons = {
//         up: '↑',
//         down: '↓',
//         neutral: '→'
//     };
//     return (
//         <div className="bg-gray-50 p-3 rounded-lg">
//             <h4 className="text-xs text-gray-500 font-medium">{title}</h4>
//             <div className="flex items-end justify-between mt-1">
//                 <p className="text-lg font-bold">{title}</p>
//                 {trend && (
//                     <span className={`text-xs ${trendColors[trend]}`}>
//                         {trendIcons[trend]} {change}
//                     </span>
//                 )}
//             </div>
//         </div>

<div>

   <div>
  {products.map((p) => (
    <p key={`${p.supplier_id}-${p.product_id}`}>{p.supplier_id}</p>
  ))}
</div>

</div>
    );
};

export default InventoryStats;