import { ChevronLeft, ChevronRight } from "lucide-react";

const Pagination = ({ page, totalPages, handlePreviousPage, handleNextPage }) => {
    return (
        <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-t border-gray-200">
            <div className="text-sm text-gray-500">
                Page {page} of {totalPages}
            </div>
            <div className="flex space-x-2">
                <button
                    onClick={handlePreviousPage}
                    disabled={page === 1}
                    className={`flex items-center px-3 py-1 border rounded-md ${page === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Previous
                </button>
                <button
                    onClick={handleNextPage}
                    disabled={page === totalPages}
                    className={`flex items-center px-3 py-1 border rounded-md ${page === totalPages ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                >
                    Next
                    <ChevronRight className="h-4 w-4 ml-1" />
                </button>
            </div>
        </div>
    )
}

export default Pagination;