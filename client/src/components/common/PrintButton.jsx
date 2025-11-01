import { FiPrinter } from 'react-icons/fi';

const PrintButton = ({
    onPrint,
    disabled = false,
    label = "Print",
    className = "",
    ...props
}) => {
    return (
        <button
            onClick={onPrint}
            disabled={disabled}
            className={`flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
            {...props}
        >
            <FiPrinter size={16} />
            {label}
        </button>
    );
};

export default PrintButton;