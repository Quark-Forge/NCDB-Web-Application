import { FiDownload } from 'react-icons/fi';

const ExportButton = ({
    onExport,
    isExporting,
    label = "Export CSV",
    disabled = false,
    className = "",
    ...props
}) => {
    return (
        <button
            onClick={onExport}
            disabled={disabled || isExporting}
            className={`flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
            {...props}
        >
            {isExporting ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
            ) : (
                <FiDownload size={16} />
            )}
            {label}
        </button>
    );
};

export default ExportButton;