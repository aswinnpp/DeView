import React from 'react';
import { getStatusColor } from '../../utils/statusColors';

interface StatusBadgeProps {
    status: string;
    size?: 'sm' | 'md' | 'lg';
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
    const color = getStatusColor(status);

    const sizeStyles = {
        sm: { padding: '3px 10px', fontSize: 11 },
        md: { padding: '4px 12px', fontSize: 12 },
        lg: { padding: '6px 14px', fontSize: 13 }
    };

    return (
        <span style={{
            ...sizeStyles[size],
            borderRadius: 6,
            fontWeight: 600,
            background: `${color}20`,
            color,
            display: 'inline-block'
        }}>
            {status}
        </span>
    );
};

export default StatusBadge;
