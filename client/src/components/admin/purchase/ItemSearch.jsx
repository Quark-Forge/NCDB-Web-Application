import { useState, useEffect } from 'react';
import { X, Search, Loader2 } from 'lucide-react';
import { useGetSupplierItemsQuery } from '../../../slices/supplierItemsApiSlice';
import Badges from '../../common/Badges';
import Card from '../../common/Card';
import { getStockStatus, formatPrice } from '../../../utils/statusHelpers';

const ItemSearch = ({ selectedItem, onSelectItem, onClearItem, disabled }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [showSearchResults, setShowSearchResults] = useState(false);

    const {
        data: supplierItemsData,
        isLoading: isLoadingItems,
        error: itemsError,
        refetch: refetchItems
    } = useGetSupplierItemsQuery();

    const [filteredItems, setFilteredItems] = useState([]);

    useEffect(() => {
        if (supplierItemsData?.data?.supplierItems) {
            if (searchTerm.length > 2) {
                const results = supplierItemsData.data.supplierItems.filter(item =>
                    item.Product?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    item.Supplier?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    item.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    item.supplier_sku?.toLowerCase().includes(searchTerm.toLowerCase())
                );
                setFilteredItems(results);
            } else {
                setFilteredItems([]);
            }
        }
    }, [searchTerm, supplierItemsData]);

    const handleSearch = (term) => {
        setSearchTerm(term);
        setShowSearchResults(term.length > 2);
    };

    return (
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Item *
            </label>

            {selectedItem ? (
                <Card className="p-4 border-green-200 bg-green-50">
                    <div className="flex justify-between items-start">
                        <div className="flex-1">
                            <h4 className="font-medium text-green-900">{selectedItem.Product?.name}</h4>
                            <p className="text-sm text-green-700">{selectedItem.Supplier?.name}</p>
                            <p className="text-sm text-green-600 mt-1">{selectedItem.description}</p>
                            <div className="flex items-center mt-2 space-x-4 text-xs">
                                <span className="text-gray-600">SKU: {selectedItem.supplier_sku}</span>
                                <span className="text-gray-600">Price: {formatPrice(selectedItem.price)}</span>
                                <Badges
                                    variant={getStockStatus(selectedItem.stock_level).variant}
                                    size="sm"
                                >
                                    Stock: {selectedItem.stock_level}
                                </Badges>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={onClearItem}
                            className="text-green-600 hover:text-green-800 ml-2"
                            disabled={disabled}
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                </Card>
            ) : (
                <div className="relative">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <input
                            type="text"
                            placeholder="Search for items by name, supplier, or description..."
                            className="pl-10 pr-4 py-3 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            value={searchTerm}
                            onChange={(e) => handleSearch(e.target.value)}
                            onFocus={() => searchTerm.length > 2 && setShowSearchResults(true)}
                            disabled={isLoadingItems || disabled}
                        />
                        {isLoadingItems && (
                            <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 animate-spin text-gray-400" />
                        )}
                    </div>

                    {itemsError && (
                        <div className="mt-2 text-sm text-red-600">
                            Failed to load items. <button onClick={refetchItems} className="text-blue-600 hover:underline">Retry</button>
                        </div>
                    )}

                    {showSearchResults && (
                        <Card className="absolute z-10 w-full mt-1 max-h-60 overflow-auto shadow-lg">
                            {filteredItems.length > 0 ? (
                                filteredItems.map((item) => (
                                    <button
                                        key={item.id}
                                        type="button"
                                        className="w-full text-left p-4 hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                                        onClick={() => {
                                            onSelectItem(item);
                                            setShowSearchResults(false);
                                        }}
                                    >
                                        <div className="flex justify-between items-start">
                                            <div className="flex-1">
                                                <div className="font-medium text-gray-900">{item.Product?.name}</div>
                                                <div className="text-sm text-gray-600">{item.Supplier?.name}</div>
                                                <div className="text-xs text-gray-500 mt-1">{item.description}</div>
                                            </div>
                                            <div className="text-right ml-4">
                                                <div className="text-sm font-medium text-gray-900">
                                                    {formatPrice(item.price)}
                                                </div>
                                                <Badges
                                                    variant={getStockStatus(item.stock_level).variant}
                                                    size="sm"
                                                    className="mt-1"
                                                >
                                                    {item.stock_level} in stock
                                                </Badges>
                                            </div>
                                        </div>
                                        <div className="text-xs text-gray-500 mt-2">
                                            SKU: {item.supplier_sku} • Lead time: {item.lead_time_days} days
                                        </div>
                                    </button>
                                ))
                            ) : searchTerm.length > 2 ? (
                                <div className="p-4 text-center text-gray-500">
                                    <Search className="h-6 w-6 mx-auto mb-2" />
                                    <p>No items found matching "{searchTerm}"</p>
                                </div>
                            ) : null}
                        </Card>
                    )}
                </div>
            )}
        </div>
    );
};

export default ItemSearch;