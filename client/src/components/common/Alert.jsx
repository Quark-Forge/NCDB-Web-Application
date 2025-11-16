import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';

const Alert = ({
    isOpen,
    onClose,
    type = 'success', // 'success', 'error', 'warning', 'info'
    title,
    message,
    confirmText = 'OK',
    onConfirm,
    showConfirmButton = true,
    showCancelButton = false,
    cancelText = 'Cancel'
}) => {
    if (!isOpen) return null;

    const alertConfig = {
        success: {
            icon: CheckCircle,
            bgColor: 'bg-green-50',
            borderColor: 'border-green-200',
            iconColor: 'text-green-600',
            textColor: 'text-green-800'
        },
        error: {
            icon: XCircle,
            bgColor: 'bg-red-50',
            borderColor: 'border-red-200',
            iconColor: 'text-red-600',
            textColor: 'text-red-800'
        },
        warning: {
            icon: AlertTriangle,
            bgColor: 'bg-yellow-50',
            borderColor: 'border-yellow-200',
            iconColor: 'text-yellow-600',
            textColor: 'text-yellow-800'
        },
        info: {
            icon: Info,
            bgColor: 'bg-blue-50',
            borderColor: 'border-blue-200',
            iconColor: 'text-blue-600',
            textColor: 'text-blue-800'
        }
    };

    const config = alertConfig[type];
    const IconComponent = config.icon;

    return (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-brightness-60 flex items-center justify-center p-4">
            <div className={`bg-white rounded-lg shadow-xl max-w-md w-full overflow-hidden animate-in fade-in-90 zoom-in-90 border ${config.borderColor}`}>
                {/* Header */}
                <div className="flex items-start p-6">
                    <div className={`flex-shrink-0 flex items-center justify-center h-10 w-10 rounded-full ${config.bgColor}`}>
                        <IconComponent className={`h-5 w-5 ${config.iconColor}`} />
                    </div>
                    <div className="ml-4 flex-1">
                        <h3 className={`text-lg font-medium ${config.textColor}`}>
                            {title}
                        </h3>
                        <div className="mt-1">
                            <p className="text-sm text-gray-600">
                                {message}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-500 transition-colors"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Footer */}
                <div className="bg-gray-50 px-6 py-4 flex flex-row-reverse gap-3">
                    {showConfirmButton && (
                        <button
                            onClick={onConfirm || onClose}
                            className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${type === 'success' ? 'bg-green-600 hover:bg-green-700' :
                                    type === 'error' ? 'bg-red-600 hover:bg-red-700' :
                                        type === 'warning' ? 'bg-yellow-600 hover:bg-yellow-700' :
                                            'bg-blue-600 hover:bg-blue-700'
                                } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500`}
                        >
                            {confirmText}
                        </button>
                    )}
                    {showCancelButton && (
                        <button
                            onClick={onClose}
                            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                            {cancelText}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Alert;