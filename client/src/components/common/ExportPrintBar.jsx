import ExportButton from './ExportButton';
import PrintButton from './PrintButton';

const ExportPrintBar = ({
    onExport,
    onPrint,
    isExporting = false,
    exportDisabled = false,
    printDisabled = false,
    exportLabel = "Export CSV",
    printLabel = "Print Report",
    className = ""
}) => {
    return (
        <div className={`flex items-center gap-3 ${className}`}>
            <ExportButton
                onExport={onExport}
                isExporting={isExporting}
                disabled={exportDisabled}
                label={exportLabel}
            />
            <PrintButton
                onPrint={onPrint}
                disabled={printDisabled}
                label={printLabel}
            />
        </div>
    );
};

export default ExportPrintBar;