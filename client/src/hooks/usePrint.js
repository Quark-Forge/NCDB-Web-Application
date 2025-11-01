import { useRef, useCallback } from 'react';
import { toast } from 'react-toastify';

export const usePrint = () => {
    const componentRef = useRef();

    const handlePrint = useCallback(() => {
        if (!componentRef.current) {
            toast.error('No content available for printing');
            return;
        }

        try {
            const printContent = componentRef.current.innerHTML;
            const printWindow = window.open('', '_blank', 'width=800,height=600');

            if (!printWindow) {
                toast.error('Please allow popups for printing');
                return;
            }

            printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Print Document</title>
            <style>
              body { 
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
                margin: 40px; 
                line-height: 1.6;
                color: #333;
              }
              .print-container {
                max-width: 100%;
              }
              .print-header {
                text-align: center;
                margin-bottom: 30px;
                padding-bottom: 20px;
                border-bottom: 2px solid #e5e7eb;
              }
              .print-header h1 {
                margin: 0 0 10px 0;
                color: #111827;
                font-size: 24px;
              }
              .print-header p {
                margin: 5px 0;
                color: #6b7280;
              }
              table {
                width: 100%;
                border-collapse: collapse;
                margin: 20px 0;
                font-size: 14px;
              }
              th {
                background-color: #f9fafb;
                border: 1px solid #d1d5db;
                padding: 12px;
                text-align: left;
                font-weight: 600;
                color: #374151;
              }
              td {
                border: 1px solid #e5e7eb;
                padding: 12px;
              }
              tr:nth-child(even) {
                background-color: #f9fafb;
              }
              .print-footer {
                margin-top: 40px;
                text-align: center;
                font-size: 12px;
                color: #9ca3af;
                border-top: 1px solid #e5e7eb;
                padding-top: 20px;
              }
              .text-center { text-align: center; }
              .text-right { text-align: right; }
              .font-bold { font-weight: bold; }
              .capitalize { text-transform: capitalize; }
              @media print {
                body { margin: 0; }
                .print-container { max-width: none; }
              }
            </style>
          </head>
          <body>
            <div class="print-container">
              ${printContent}
            </div>
          </body>
        </html>
      `);

            printWindow.document.close();

            // Wait for content to load
            setTimeout(() => {
                printWindow.print();
                // Optional: close window after printing
                // printWindow.onafterprint = () => printWindow.close();
            }, 500);

        } catch (error) {
            console.error('Print error:', error);
            toast.error('Failed to generate print document');
        }
    }, []);

    return {
        printRef: componentRef,
        handlePrint
    };
};