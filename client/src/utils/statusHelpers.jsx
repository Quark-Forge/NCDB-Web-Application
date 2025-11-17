import { Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import Badges from '../components/common/Badges';

export const getStatusBadge = (status) => {
    const variants = {
        pending: { variant: 'warning', icon: <Clock className="h-3 w-3 mr-1" /> },
        approved: { variant: 'success', icon: <CheckCircle className="h-3 w-3 mr-1" /> },
        rejected: { variant: 'danger', icon: <XCircle className="h-3 w-3 mr-1" /> },
        cancelled: { variant: 'neutral', icon: <AlertCircle className="h-3 w-3 mr-1" /> }
    };

    const { variant, icon } = variants[status] || { variant: 'neutral', icon: null };

    return (
        <Badges variant={variant} size="sm">
            {icon}
            {status.charAt(0).toUpperCase() + status.slice(1)}
        </Badges>
    );
};

export const getStockStatus = (stockLevel) => {
    if (stockLevel <= 10) return { variant: 'danger', text: 'Low Stock' };
    if (stockLevel <= 25) return { variant: 'warning', text: 'Moderate Stock' };
    return { variant: 'success', text: 'Good Stock' };
};

export const formatPrice = (price) => {
    return `LKR ${parseFloat(price).toFixed(2)}`;
};