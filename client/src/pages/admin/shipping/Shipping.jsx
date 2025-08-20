import { useState, useEffect } from 'react';
import { Plus, Search, ChevronDown, ChevronUp, Trash, Pencil } from 'lucide-react';

import Button from '../../../components/common/Button';
import Table from '../../../components/common/Table';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import DeleteConfirmation from '../../../components/common/DeleteConfirmation';
import { useAddShippingCostMutation, useDeleteShippingCostMutation, useGetShippingCostQuery, useUpdateShippingCostMutation } from '../../../slices/shippingCostApiSlice';
import Card from '../../../components/common/Card';
import { toast } from 'react-toastify';
import ShippingDetailsForm from '../../../components/admin/shipping/ShippingDetailsForm';

const Shipping = () => {
    // RTK Query hooks
    const {
        data,
        isLoading,
        isError,
        refetch
    } = useGetShippingCostQuery();
    const [addShippingCost, { isLoading: isAdding }] = useAddShippingCostMutation();
    const [deleteShippingCost] = useDeleteShippingCostMutation();
    const [updateShippingCost] = useUpdateShippingCostMutation();

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
        estimated_delivery_days: '',
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
            estimated_delivery_days: '',
        });
        setErrors({});
        setIsModalOpen(true);
    };

    const openEditModal = (item) => {
        setEditMode(true);
        setCurrentItem({
            ...item,
            estimated_delivery_days: item.estimated_delivery_days
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
        if (currentItem.estimated_delivery_days && isNaN(currentItem.estimated_delivery_days)) {
            newErrors.estimated_delivery_days = 'Delivery days must be a number';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        try {
            const payload = {
                city: currentItem.city,
                cost: parseFloat(currentItem.cost),
                estimated_delivery_days: currentItem.estimated_delivery_days
                    ? parseInt(currentItem.estimated_delivery_days)
                    : null
            };

            if (editMode) {
                await updateShippingCost({
                    id: currentItem.id,
                    ...payload
                }).unwrap();
                toast.success('Shipping cost updated');
            } else {
                await addShippingCost(payload).unwrap();
                toast.success('Shipping cost added');
            }

            setIsModalOpen(false);
            refetch();
        } catch (error) {
            console.error('Submission error:', error);
            toast.error(error.data?.message || 'Operation failed');
            setErrors({
                submit: error.data?.message || 'Failed to save shipping cost',
                ...error.data?.errors
            });
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setCurrentItem(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const deleteHandle = async () => {
        try {
            if (itemToDelete) {
                await deleteShippingCost(itemToDelete.id).unwrap();
                toast.success('Shipping Cost Deleted.');
                refetch();
            }
        } catch (err) {
            toast.error('error deleting Shipping Cost');
        }
    }

    const formatDeliveryDays = (days) => {
        if (!days) return 'Not specified';
        return `${days} day${days !== 1 ? 's' : ''}`;
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
                        onClick={() => handleSort('estimated_delivery_days')}
                    >
                        Estimated Delivery
                        <SortIcon column="estimated_delivery_days" />
                    </button>,
                    'Actions'
                ]}>
                    {currentItems.length > 0 ? (
                        currentItems.map((item) => (
                            item && (
                                <tr key={item.id}>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                                        {item.city}
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                        LKR {item.cost}
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                        {formatDeliveryDays(item.estimated_delivery_days)}
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-right">
                                        <div className="flex items-center justify-end space-x-2">
                                            <Button
                                                variant="secondary"
                                                size="sm"
                                                onClick={() => openEditModal(item)}
                                            >
                                                <Pencil size={16} />
                                            </Button>
                                            <Button
                                                variant="danger"
                                                size="sm"
                                                onClick={() => openDeleteModal(item)}
                                            >
                                                <Trash size={16} />
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            )))
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
                <ShippingDetailsForm
                    editMode = {editMode}
                    handleSubmit = {handleSubmit}
                     setIsModalOpen = {setIsModalOpen}
                     handleInputChange = {handleInputChange}
                     currentItem = {currentItem}
                     errors = {errors}
                     isAdding={isAdding}
                />
            )}

            {/* Delete Confirmation Modal */}
            <DeleteConfirmation
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={() => {
                    deleteHandle();
                    setIsDeleteModalOpen(false);
                }}
                itemName={itemToDelete?.city}
            />
        </div>
    );
};

export default Shipping;