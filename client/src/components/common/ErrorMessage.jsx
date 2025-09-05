const ErrorMessage = ({
    message = "Something went wrong",
    icon = null,
    onRetry = null,
    buttonText = "Try Again"
}) => {
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="text-center">
                {icon && <div className="text-red-500 mb-4">{icon}</div>}
                <p className="text-gray-500 mb-4">{message}</p>
                {onRetry && (
                    <button
                        onClick={onRetry}
                        className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                    >
                        {buttonText}
                    </button>
                )}
            </div>
        </div>
    );
};

export default ErrorMessage;