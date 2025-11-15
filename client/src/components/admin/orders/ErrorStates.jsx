import { Shield, AlertCircle } from 'lucide-react';

const ErrorStates = ({ error, onRefetch, onNavigate }) => {
    if (error.status === 403) {
        return (
            <div className="max-w-2xl mx-auto mt-8">
                <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                    <Shield className="h-12 w-12 text-red-500 mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-red-800 mb-2">Access Denied</h2>
                    <p className="text-red-600 mb-4">
                        You don't have permission to view this order. This order may not belong to your account.
                    </p>
                    <button
                        onClick={onNavigate}
                        className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
                    >
                        Back to Orders
                    </button>
                </div>
            </div>
        );
    }

    if (error.status === 404) {
        return (
            <div className="max-w-2xl mx-auto mt-8">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
                    <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-yellow-800 mb-2">Order Not Found</h2>
                    <p className="text-yellow-600 mb-4">
                        The order you're looking for doesn't exist or may have been deleted.
                    </p>
                    <button
                        onClick={onNavigate}
                        className="bg-yellow-600 text-white px-4 py-2 rounded-md hover:bg-yellow-700"
                    >
                        Back to Orders
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto mt-8">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                <h2 className="text-xl font-bold text-red-800 mb-2">Error Loading Order</h2>
                <p className="text-red-600 mb-4">
                    {error.data?.message || 'Failed to load order details. Please try again.'}
                </p>
                <div className="flex gap-2 justify-center">
                    <button
                        onClick={onRefetch}
                        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                    >
                        Try Again
                    </button>
                    <button
                        onClick={onNavigate}
                        className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
                    >
                        Back to Orders
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ErrorStates;