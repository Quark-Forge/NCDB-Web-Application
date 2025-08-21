import { Check, X } from "lucide-react";
import LoadingSpinner from "../../common/LoadingSpinner";
import Button from "../../common/Button";
import Card from "../../common/Card";

const ShippingDetailsForm = ({ editMode, handleSubmit, setIsModalOpen, handleInputChange, currentItem, isAdding, errors  }) => {
    return (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-brightness-60 flex items-center justify-center p-4">
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
                            className={`block w-full rounded-lg p-2 border ${errors.city ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'} shadow-sm sm:text-sm`}
                        />
                        {errors.city && (
                            <p className="mt-1 text-sm text-red-600">{errors.city}</p>
                        )}
                    </div>

                    <div>
                        <label htmlFor="cost" className="block text-sm font-medium text-gray-700 mb-1">
                            Cost (LKR) *
                        </label>
                        <input
                            type="number"
                            id="cost"
                            name="cost"
                            min="0.01"
                            step="0.01"
                            value={currentItem.cost}
                            onChange={handleInputChange}
                            className={`block w-full rounded-lg p-2 border ${errors.cost ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'} shadow-sm sm:text-sm`}
                        />
                        {errors.cost && (
                            <p className="mt-1 text-sm text-red-600">{errors.cost}</p>
                        )}
                    </div>

                    <div>
                        <label htmlFor="estimated_delivery_days" className="block text-sm font-medium text-gray-700 mb-1">
                            Estimated Delivery Days
                        </label>
                        <input
                            type="number"
                            id="estimated_delivery_days"
                            name="estimated_delivery_days"
                            min="1"
                            value={currentItem.estimated_delivery_days}
                            onChange={handleInputChange}
                            className={`block w-full rounded-lg p-2 border ${errors.estimated_delivery_days ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'} shadow-sm sm:text-sm`}
                            placeholder="Enter number of days"
                        />
                        {errors.estimated_delivery_days && (
                            <p className="mt-1 text-sm text-red-600">{errors.estimated_delivery_days}</p>
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
    )
}

export default ShippingDetailsForm;