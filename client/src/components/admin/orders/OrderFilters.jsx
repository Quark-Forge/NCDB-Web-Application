import { useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import Card from '../../common/Card';
import Button from '../../common/Button';
import { FiChevronDown, FiChevronUp } from 'react-icons/fi';

const OrderFilters = ({ filters, onFilterChange }) => {
    const [localFilters, setLocalFilters] = useState(filters);
    const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setLocalFilters(prev => ({ ...prev, [name]: value }));
    };

    const handleDateChange = (date, field) => {
        setLocalFilters(prev => ({
            ...prev,
            [field]: date ? date.toISOString() : ''
        }));
    };

    const applyFilters = () => {
        onFilterChange(localFilters);
    };

    const resetFilters = () => {
        const resetValues = {
            status: '',
            startDate: '',
            endDate: '',
            product_id: '',
            supplier_id: '',
            searchQuery: '',
        };
        setLocalFilters(resetValues);
        onFilterChange(resetValues);
    };

    const toggleAdvancedFilters = () => {
        setShowAdvancedFilters(!showAdvancedFilters);
    };

    return (
        <Card className="p-4">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-medium">Filters</h3>
                <button
                    onClick={toggleAdvancedFilters}
                    className="text-xs flex items-center text-blue-600 hover:text-blue-800"
                >
                    {showAdvancedFilters ? (
                        <>
                            <span>Hide filters</span>
                            <FiChevronUp className="ml-1" />
                        </>
                    ) : (
                        <>
                            <span>Show all filters</span>
                            <FiChevronDown className="ml-1" />
                        </>
                    )}
                </button>
            </div>

            <div className="space-y-4">
                {/* Always visible search bar */}
                <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Search</label>
                    <input
                        type="text"
                        name="searchQuery"
                        value={localFilters.searchQuery}
                        onChange={handleChange}
                        onKeyPress={(e) => e.key === 'Enter' && applyFilters()}
                        className="w-full p-2 text-xs sm:text-sm border border-gray-200 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Order ID, Customer Name"
                    />
                </div>

                {/* Advanced filters - conditionally rendered */}
                {showAdvancedFilters && (
                    <>
                        <div>
                            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Status</label>
                            <select
                                name="status"
                                value={localFilters.status}
                                onChange={handleChange}
                                className="w-full p-2 text-xs sm:text-sm border border-gray-200 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="">All Statuses</option>
                                <option value="pending">Pending</option>
                                <option value="processing">Processing</option>
                                <option value="shipped">Shipped</option>
                                <option value="delivered">Delivered</option>
                                <option value="cancelled">Cancelled</option>
                            </select>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">From</label>
                                <DatePicker
                                    selected={localFilters.startDate ? new Date(localFilters.startDate) : null}
                                    onChange={(date) => handleDateChange(date, 'startDate')}
                                    className="w-full p-2 text-xs sm:text-sm border border-gray-200 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                    placeholderText="Start Date"
                                    dateFormat="MMM d, yyyy"
                                />
                            </div>
                            <div>
                                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">To</label>
                                <DatePicker
                                    selected={localFilters.endDate ? new Date(localFilters.endDate) : null}
                                    onChange={(date) => handleDateChange(date, 'endDate')}
                                    className="w-full p-2 text-xs sm:text-sm border border-gray-200 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                    placeholderText="End Date"
                                    dateFormat="MMM d, yyyy"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Product ID</label>
                                <input
                                    type="text"
                                    name="product_id"
                                    value={localFilters.product_id}
                                    onChange={handleChange}
                                    className="w-full p-2 text-xs sm:text-sm border border-gray-200 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Enter product ID"
                                />
                            </div>
                            <div>
                                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Supplier ID</label>
                                <input
                                    type="text"
                                    name="supplier_id"
                                    value={localFilters.supplier_id}
                                    onChange={handleChange}
                                    className="w-full p-2 text-xs sm:text-sm border border-gray-200 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Enter supplier ID"
                                />
                            </div>
                        </div>
                    </>
                )}

                <div className="flex space-x-2 pt-2">
                    <Button
                        onClick={applyFilters}
                        variant="primary"
                        size="sm"
                        className="w-full sm:w-auto"
                    >
                        Apply Filters
                    </Button>
                    <Button
                        onClick={resetFilters}
                        variant="secondary"
                        size="sm"
                        className="w-full sm:w-auto"
                    >
                        Reset
                    </Button>
                </div>
            </div>
        </Card>
    );
};

export default OrderFilters;