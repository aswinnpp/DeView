export const getStatusColor = (status: string): string => {
    switch (status) {
        case 'Paid':
        case 'approved':
        case 'completed':
        case 'active':
            return '#10b981';
        case 'Pending':
        case 'pending':
        case 'pending_approval':
        case 'scheduled':
            return '#f59e0b';
        case 'Rejected':
        case 'rejected':
        case 'cancelled':
        case 'failed':
            return '#ef4444';
        case 'in_progress':
            return '#3b82f6';
        default:
            return '#6b7280';
    }
};
