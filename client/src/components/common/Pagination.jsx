import Button from './Button';

const Pagination = ({
    currentPage,
    totalPages,
    onPageChange,
    className = '',
}) => {
    const getPageNumbers = () => {
        if (totalPages <= 7) {
            return Array.from({ length: totalPages }, (_, i) => i + 1);
        }

        const pages = [];
        const leftBound = Math.max(2, currentPage - 1);
        const rightBound = Math.min(totalPages - 1, currentPage + 1);

        // Always include first page
        pages.push(1);

        // Add ellipsis or adjacent pages
        if (leftBound > 2) {
            pages.push('...');
        } else if (totalPages > 1) {
            pages.push(2);
        }

        // Add middle pages around current page
        for (let i = leftBound; i <= rightBound; i++) {
            if (i > 1 && i < totalPages) {
                pages.push(i);
            }
        }

        // Add ellipsis or adjacent pages
        if (rightBound < totalPages - 1) {
            pages.push('...');
        } else if (totalPages > 1) {
            pages.push(totalPages - 1);
        }

        // Always include last page if different from first
        if (totalPages > 1) {
            pages.push(totalPages);
        }

        return pages;
    };

    return (
        <div className={`flex flex-col sm:flex-row items justify-center gap-4 p-4 ${className}`}>
            <div className="flex items-center gap-1">
                <Button
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    variant="ghost"
                    size="sm"
                    className="px-3 py-1.5 rounded-md"
                    aria-label="Previous page"
                >
                    <span className="sr-only">Previous</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                </Button>

                {getPageNumbers().map((number, index) => (
                    number === '...' ? (
                        <span key={`ellipsis-${index}`} className="px-3 py-1.5 text-gray-500">...</span>
                    ) : (
                        <Button
                            key={number}
                            onClick={() => onPageChange(number)}
                            variant={number === currentPage ? 'primary' : 'ghost'}
                            size="sm"
                            className={`px-3 py-1.5 rounded-md ${number === currentPage ? 'shadow-md' : ''}`}
                            aria-label={`Page ${number}`}
                            aria-current={number === currentPage ? 'page' : undefined}
                        >
                            {number}
                        </Button>
                    )
                ))}

                <Button
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    variant="ghost"
                    size="sm"
                    className="px-3 py-1.5 rounded-md"
                    aria-label="Next page"
                >
                    <span className="sr-only">Next</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                </Button>
            </div>
        </div>
    );
};

export default Pagination;