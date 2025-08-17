import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Search, ChevronDown, ChevronUp, X, Check, Calendar } from 'lucide-react';

import Button from '../../../components/common/Button';
import Table from '../../../components/common/Table';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import DeleteConfirmation from '../../../components/common/DeleteConfirmation';
import { useAddShippingCostMutation, useGetShippingCostQuery } from '../../../slices/shippingCostApiSlice';
import Card from '../../../components/common/Card';

const Shipping = () => {
    // RTK Query hooks
    const {
        data,
        isLoading,
        isError,
        refetch
    } = useGetShippingCostQuery();
    const [addShippingCost, { isLoading: isAdding }] = useAddShippingCostMutation();

    const shippingData = data?.data || [];

    // Local state
    const [filteredData, setFilteredData] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortConfig, setSortConfig] = useState({ key: 'city', direction: 'asc' });
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(5);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);
    const [editMode, setEditMode] = useState(false);
    const [currentItem, setCurrentItem] = useState({
        city: '',
        cost: '',
        estimated_delivery_date: '',
    });
    const [errors, setErrors] = useState({});

    // Filter and sort data
    useEffect(() => {
        if (shippingData) {
            let filtered = [...shippingData];

            // Apply search filter
            if (searchTerm.trim() !== '') {
                filtered = filtered.filter(item =>
                    item.city.toLowerCase().includes(searchTerm.toLowerCase())
                );
            }

            // Apply sorting
            filtered.sort((a, b) => {
                if (a[sortConfig.key] < b[sortConfig.key]) {
                    return sortConfig.direction === 'asc' ? -1 : 1;
                }
                if (a[sortConfig.key] > b[sortConfig.key]) {
                    return sortConfig.direction === 'asc' ? 1 : -1;
                }
                return 0;
            });

            setFilteredData(filtered);
            setCurrentPage(1); // Reset to first page when filtering/sorting changes
        }
    }, [searchTerm, shippingData, sortConfig]);

    // Pagination
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredData.length / itemsPerPage);

    const handleSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
    };

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const openAddModal = () => {
        setEditMode(false);
        setCurrentItem({
            city: '',
            cost: '',
            estimated_delivery_date: '',
        });
        setErrors({});
        setIsModalOpen(true);
    };

    const openEditModal = (item) => {
        setEditMode(true);
        setCurrentItem({
            ...item,
            estimated_delivery_date: item.estimated_delivery_date ?
                new Date(item.estimated_delivery_date).toISOString().split('T')[0] : ''
        });
        setErrors({});
        setIsModalOpen(true);
    };

    const openDeleteModal = (item) => {
        setItemToDelete(item);
        setIsDeleteModalOpen(true);
    };

    const validateForm = () => {
        const newErrors = {};
        if (!currentItem.city) newErrors.city = 'City is required';
        if (!currentItem.cost || isNaN(currentItem.cost)) newErrors.cost = 'Valid cost is required';
        if (currentItem.estimated_delivery_date) {
            const deliveryDate = new Date(currentItem.estimated_delivery_date);
            if (deliveryDate < new Date()) {
                newErrors.estimated_delivery_date = 'Delivery date cannot be in the past';
            }
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        try {
            const shippingCostData = {
                city: currentItem.city,
                cost: parseFloat(currentItem.cost),
                estimated_delivery_date: currentItem.estimated_delivery_date || null
            };

            await addShippingCost(shippingCostData).unwrap();
            setIsModalOpen(false);
            refetch();
        } catch (error) {
            console.error('Failed to save shipping cost:', error);
            setErrors({ submit: error.message || 'Failed to save shipping cost' });
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setCurrentItem(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'Not specified';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const SortIcon = ({ column }) => {
        if (sortConfig.key !== column) return <ChevronDown className="ml-1 h-4 w-4 opacity-0 group-hover:opacity-100" />;
        return sortConfig.direction === 'asc' ?
            <ChevronUp className="ml-1 h-4 w-4" /> :
            <ChevronDown className="ml-1 h-4 w-4" />;
    };

    if (isLoading) return <LoadingSpinner />;
    if (isError) return <div className="text-red-500">Error loading shipping costs</div>;

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <h1 className="text-2xl font-bold text-gray-900">Shipping Costs</h1>
                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search by city..."
                            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            value={searchTerm}
                            onChange={handleSearch}
                        />
                    </div>
                    <Button onClick={openAddModal}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Shipping Cost
                    </Button>
                </div>
            </div>

            <Card>
                <Table headers={[
                    <button
                        key="city"
                        className="flex items-center group"
                        onClick={() => handleSort('city')}
                    >
                        City
                        <SortIcon column="city" />
                    </button>,
                    <button
                        key="cost"
                        className="flex items-center group"
                        onClick={() => handleSort('cost')}
                    >
                        Cost (LKR)
                        <SortIcon column="cost" />
                    </button>,
                    <button
                        key="delivery"
                        className="flex items-center group"
                        onClick={() => handleSort('estimated_delivery_date')}
                    >
                        Estimated Delivery
                        <SortIcon column="estimated_delivery_date" />
                    </button>,
                    'Actions'
                ]}>
                    {currentItems.length > 0 ? (
                        currentItems.map((item) => (
                            <tr key={item.id}>
                                <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                                    {item.city}
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                    LKR{item.cost}
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                    {formatDate(item.estimated_delivery_date)}
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-right">
                                    <div className="flex items-center justify-end space-x-2">
                                        <Button
                                            variant="secondary"
                                            size="sm"
                                            onClick={() => openEditModal(item)}
                                        >
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="danger"
                                            size="sm"
                                            onClick={() => openDeleteModal(item)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan={4} className="px-4 py-6 text-center text-sm text-gray-500">
                                No shipping costs found
                            </td>
                        </tr>
                    )}
                </Table>

                {filteredData.length > itemsPerPage && (
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={handlePageChange}
                        className="mt-4"
                    />
                )}
            </Card>

            {/* Add/Edit Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
                    <Card className="w-full max-w-md animate-in fade-in-90 zoom-in-90">
                        <div className="flex items-center justify-between p-4 border-b border-gray-200">
                            <h3 className="text-lg font-medium text-gray-900">
                                {editMode ? 'Edit Shipping Cost' : 'Add New Shipping Cost'}
                            </h3>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="text-gray-400 hover:text-gray-500"
                                disabled={isAdding}
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-4 space-y-4">
                            {errors.submit && (
                                <div className="p-3 text-sm text-red-700 bg-red-50 rounded-lg">
                                    {errors.submit}
                                </div>
                            )}

                            <div>
                                <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                                    City *
                                </label>
                                <input
                                    type="text"
                                    id="city"
                                    name="city"
                                    value={currentItem.city}
                                    onChange={handleInputChange}
                                    className={`block w-full rounded-lg border ${errors.city ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'} shadow-sm sm:text-sm`}
                                />
                                {errors.city && (
                                    <p className="mt-1 text-sm text-red-600">{errors.city}</p>
                                )}
                            </div>

                            <div>
                                <label htmlFor="cost" className="block text-sm font-medium text-gray-700 mb-1">
                                    Cost ($) *
                                </label>
                                <input
                                    type="number"
                                    id="cost"
                                    name="cost"
                                    min="0.01"
                                    step="0.01"
                                    value={currentItem.cost}
                                    onChange={handleInputChange}
                                    className={`block w-full rounded-lg border ${errors.cost ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'} shadow-sm sm:text-sm`}
                                />
                                {errors.cost && (
                                    <p className="mt-1 text-sm text-red-600">{errors.cost}</p>
                                )}
                            </div>

                            <div>
                                <label htmlFor="estimated_delivery_date" className="block text-sm font-medium text-gray-700 mb-1">
                                    Estimated Delivery Date
                                </label>
                                <div className="relative">
                                    <input
                                        type="date"
                                        id="estimated_delivery_date"
                                        name="estimated_delivery_date"
                                        value={currentItem.estimated_delivery_date}
                                        onChange={handleInputChange}
                                        min={new Date().toISOString().split('T')[0]}
                                        className={`block w-full rounded-lg border ${errors.estimated_delivery_date ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'} shadow-sm sm:text-sm`}
                                    />
                                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                        <Calendar className="h-5 w-5 text-gray-400" />
                                    </div>
                                </div>
                                {errors.estimated_delivery_date && (
                                    <p className="mt-1 text-sm text-red-600">{errors.estimated_delivery_date}</p>
                                )}
                            </div>

                            <div className="flex justify-end pt-4 space-x-3">
                                <Button
                                    type="button"
                                    variant="secondary"
                                    onClick={() => setIsModalOpen(false)}
                                    disabled={isAdding}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={isAdding}
                                >
                                    {isAdding ? (
                                        <>
                                            <LoadingSpinner size="sm" color="light" />
                                            <span className="ml-2">Saving...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Check className="mr-2 h-4 w-4" />
                                            {editMode ? 'Update' : 'Save'}
                                        </>
                                    )}
                                </Button>
                            </div>
                        </form>
                    </Card>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            <DeleteConfirmation
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={() => {
                    // TODO: Implement delete functionality
                    setIsDeleteModalOpen(false);
                }}
                itemName={itemToDelete?.city}
            />
        </div>
    );
};

export default Shipping;