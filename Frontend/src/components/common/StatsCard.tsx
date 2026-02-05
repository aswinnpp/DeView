import React from 'react';

interface StatsCardProps {
    label: string;
    value: string | number;
    valueColor?: string;
}

const StatsCard: React.FC<StatsCardProps> = ({ label, value, valueColor = '#e2e8f0' }) => {
    return (
        <div style={{
            background: '#1e293b',
            border: '1px solid #334155',
            borderRadius: 12,
            padding: 20
        }}>
            <div style={{ fontSize: 13, color: '#64748b', marginBottom: 8, fontWeight: 600 }}>
                {label}
            </div>
            <div style={{ fontSize: 28, fontWeight: 700, color: valueColor }}>
                {value}
            </div>
        </div>
    );
};

export default StatsCard;
