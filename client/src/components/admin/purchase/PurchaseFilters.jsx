import { Search, Filter, Download, Plus } from 'lucide-react';
import Button from '../../common/Button';
import Dropdown from '../../common/Dropdown';
import Card from '../../common/Card';

const PurchaseFilters = ({
    searchTerm,
    onSearchChange,
    statusFilter,
    onStatusFilterChange,
    onNewRequest
}) => {
    const statusOptions = [
        { value: 'all', label: 'All Statuses' },
        { value: 'pending', label: 'Pending' },
        { value: 'approved', label: 'Approved' },
        { value: 'rejected', label: 'Rejected' },
        { value: 'cancelled', label: 'Cancelled' }
    ];

    return (
        <Card className="p-6 mb-6">
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                <div className="flex flex-col sm:flex-row gap-4 flex-1">
                    {/* Search */}
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <input
                            type="text"
                            placeholder="Search requests..."
                            className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            value={searchTerm}
                            onChange={(e) => onSearchChange(e.target.value)}
                        />
                    </div>

                    {/* Status Filter */}
                    <Dropdown
                        options={statusOptions}
                        value={statusFilter}
                        onChange={onStatusFilterChange}
                        buttonClassName="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                        renderSelected={(option) => (
                            <div className="flex items-center gap-2">
                                <Filter className="h-4 w-4" />
                                {option.label}
                            </div>
                        )}
                    />
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                    <Button
                        variant="primary"
                        size="md"
                        onClick={onNewRequest}
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        New Request
                    </Button>
                </div>
            </div>
        </Card>
    );
};

export default PurchaseFilters;