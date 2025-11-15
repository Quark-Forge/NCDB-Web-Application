import jsPDF from 'jspdf';

export const generateShippingLabel = (order, trackingNumber, packageDetails = {}) => {
    const doc = new jsPDF();

    // Set up dimensions
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 15;
    let yPosition = margin;

    // Title
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('SHIPPING LABEL', pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 10;

    // Separator line
    doc.setDrawColor(0);
    doc.setLineWidth(0.5);
    doc.line(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 15;

    // Order Information
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('ORDER INFORMATION', margin, yPosition);
    yPosition += 8;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(`Order Number: #${order.order_number}`, margin, yPosition);
    yPosition += 6;
    doc.text(`Shipping Date: ${new Date().toLocaleDateString('en-LK')}`, margin, yPosition);
    yPosition += 15;

    // From Address (Your Business)
    doc.setFont('helvetica', 'bold');
    doc.text('FROM:', margin, yPosition);
    yPosition += 8;

    doc.setFont('helvetica', 'normal');
    doc.text('NCDB Mart', margin, yPosition);
    yPosition += 6;
    doc.text('Jaffna, Kaithady', margin, yPosition);
    yPosition += 6;
    doc.text('Phone: +94 77 123 4567', margin, yPosition);
    yPosition += 15;

    // To Address (Customer)
    doc.setFont('helvetica', 'bold');
    doc.text('TO:', margin, yPosition);
    yPosition += 8;

    doc.setFont('helvetica', 'normal');
    doc.text(order.shipping_name, margin, yPosition);
    yPosition += 6;
    doc.text(order.address_line1, margin, yPosition);
    yPosition += 6;

    if (order.address_line2) {
        doc.text(order.address_line2, margin, yPosition);
        yPosition += 6;
    }

    doc.text(`${order.city}`, margin, yPosition);
    yPosition += 6;
    doc.text(`Postal Code: ${order.postal_code}` || '40000', margin, yPosition);
    yPosition += 6;
    doc.text(order.country || 'Sri Lanka', margin, yPosition);
    yPosition += 6;
    doc.text(`Phone: ${order.shipping_phone}`, margin, yPosition);
    yPosition += 15;

    // Package Information
    doc.setFont('helvetica', 'bold');
    doc.text('PACKAGE INFORMATION', margin, yPosition);
    yPosition += 8;

    doc.setFont('helvetica', 'normal');
    doc.text(`Items: ${order.items?.length || 0} item(s)`, margin, yPosition);
    yPosition += 6;
    doc.text(`Package Type: ${packageDetails.packageType || 'Package'}`, margin, yPosition);
    yPosition += 6;
    doc.text(`Weight: ${packageDetails.weight || '1'} kg`, margin, yPosition);
    yPosition += 15;

    // Footer
    yPosition = 260;
    doc.setFontSize(8);
    doc.setFont('helvetica', 'italic');
    doc.text('Thank you for your business!', pageWidth / 2, yPosition, { align: 'center' });

    return doc;
};

export const downloadShippingLabel = (order, trackingNumber, packageDetails = {}) => {
    const doc = generateShippingLabel(order, trackingNumber, packageDetails);
    const fileName = `shipping-label-${order.order_number}.pdf`;
    doc.save(fileName);
};

export const openShippingLabelInNewTab = (order, trackingNumber, packageDetails = {}) => {
    const doc = generateShippingLabel(order, trackingNumber, packageDetails);
    const pdfBlob = doc.output('blob');
    const pdfUrl = URL.createObjectURL(pdfBlob);
    window.open(pdfUrl, '_blank');
};

// Generate tracking number
export const generateTrackingNumber = () => {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 5).toUpperCase();
    return `SL${timestamp}${random}`;
};