import { useState, useRef, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import Card from '../../common/Card';
import Button from '../../common/Button';
import { FiChevronDown, FiChevronUp } from 'react-icons/fi';

const OrderFilters = ({ filters, onFilterChange }) => {
    const [localFilters, setLocalFilters] = useState(filters);
    const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
    const [showDateRangeDropdown, setShowDateRangeDropdown] = useState(false);
    const dropdownRef = useRef(null);
    const buttonRef = useRef(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target) &&
                buttonRef.current && !buttonRef.current.contains(event.target)) {
                setShowDateRangeDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

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

    const applyDateRange = (days) => {
        let startDate = '';
        let endDate = '';

        if (days !== 'all') {
            const today = new Date();
            endDate = today.toISOString();

            const start = new Date();
            start.setDate(today.getDate() - parseInt(days));
            startDate = start.toISOString();
        }

        setLocalFilters(prev => ({
            ...prev,
            startDate,
            endDate
        }));

        setShowDateRangeDropdown(false);
    };

    const dateRangeOptions = [
        { value: '7', label: 'Last 7 days' },
        { value: '30', label: 'Last 30 days' },
        { value: '90', label: 'Last 90 days' },
        { value: 'all', label: 'All time' }
    ];

    // Calculate dropdown position
    const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });

    useEffect(() => {
        if (buttonRef.current && showDateRangeDropdown) {
            const rect = buttonRef.current.getBoundingClientRect();
            setDropdownPosition({
                top: rect.bottom + window.scrollY,
                left: rect.left + window.scrollX,
                width: rect.width
            });
        }
    }, [showDateRangeDropdown]);

    return (
        <>
            {/* Dropdown rendered outside the card to avoid overflow issues */}
            {showDateRangeDropdown && (
                <div
                    ref={dropdownRef}
                    className="fixed z-50 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden"
                    style={{
                        top: dropdownPosition.top,
                        left: dropdownPosition.left,
                        width: dropdownPosition.width
                    }}
                >
                    {dateRangeOptions.map(option => (
                        <button
                            key={option.value}
                            className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-50 text-gray-700"
                            onClick={() => applyDateRange(option.value)}
                        >
                            {option.label}
                        </button>
                    ))}
                </div>
            )}

            <Card className="p-4 relative">
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
                    {/* Search bar with date range dropdown */}
                    <div className="flex flex-col sm:flex-row gap-3">
                        <div className="flex-1">
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

                        <div className="relative">
                            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Date Range</label>
                            <button
                                ref={buttonRef}
                                type="button"
                                onClick={() => setShowDateRangeDropdown(!showDateRangeDropdown)}
                                className="w-full sm:w-auto p-2 text-xs sm:text-sm border border-gray-200 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white flex items-center justify-between"
                            >
                                <span>Quick Select</span>
                                <FiChevronDown className="ml-2" />
                            </button>
                        </div>
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
                                        dateFormat="d MMM, yyyy"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">To</label>
                                    <DatePicker
                                        selected={localFilters.endDate ? new Date(localFilters.endDate) : null}
                                        onChange={(date) => handleDateChange(date, 'endDate')}
                                        className="w-full p-2 text-xs sm:text-sm border border-gray-200 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                        placeholderText="End Date"
                                        dateFormat="d MMM, yyyy"
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
        </>
    );
};

export default OrderFilters;