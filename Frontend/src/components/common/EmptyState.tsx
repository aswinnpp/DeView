import React from 'react';

interface EmptyStateProps {
    icon?: string;
    title: string;
    message: string;
    background?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({
    icon = '📭',
    title,
    message,
    background = '#1e293b'
}) => {
    return (
        <div style={{
            background,
            border: '1px solid #334155',
            borderRadius: 12,
            padding: 60,
            textAlign: 'center'
        }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>{icon}</div>
            <h3 style={{ color: '#e2e8f0', margin: '0 0 8px 0' }}>{title}</h3>
            <p style={{ color: '#94a3b8', margin: 0 }}>{message}</p>
        </div>
    );
};

export default EmptyState;
