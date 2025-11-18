import { useState } from 'react';
import { toast } from 'react-toastify';

export const useExport = () => {
    const [isExporting, setIsExporting] = useState(false);

    const exportToCSV = (data, headers, filename, config = {}) => {
        setIsExporting(true);
        try {
            const {
                delimiter = ',',
                includeHeaders = true,
                dateFields = [],
                formatDate = (dateString) => new Date(dateString).toLocaleDateString('en-LK', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit'
                })
            } = config;

            // Convert data to CSV rows
            const csvRows = data.map(item => {
                return headers.map(header => {
                    let value = item[header.key];

                    // Format dates
                    if (dateFields.includes(header.key) && value) {
                        value = formatDate(value);
                    }

                    // Handle empty values
                    if (value === null || value === undefined) {
                        value = 'N/A';
                    }

                    // Escape quotes and wrap in quotes
                    return `"${String(value).replace(/"/g, '""')}"`;
                });
            });

            // Combine headers and rows
            const csvContent = [
                includeHeaders ? headers.map(header => `"${header.label}"`).join(delimiter) : '',
                ...csvRows.map(row => row.join(delimiter))
            ].filter(row => row !== '').join('\n');

            // Create and download CSV file
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);

            link.setAttribute('href', url);
            link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
            link.style.visibility = 'hidden';

            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            toast.success(`${filename} exported successfully!`);
            return true;
        } catch (error) {
            console.error('Error exporting CSV:', error);
            toast.error(`Failed to export ${filename}`);
            return false;
        } finally {
            setIsExporting(false);
        }
    };

    return {
        exportToCSV,
        isExporting
    };
};