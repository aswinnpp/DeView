import React from 'react';

interface AlertBannerProps {
    message: string;
    type?: 'info' | 'warning' | 'error' | 'success';
}

const AlertBanner: React.FC<AlertBannerProps> = ({ message, type = 'warning' }) => {
    const styles = {
        info: { border: '1px solid #3b82f6', color: '#60a5fa' },
        warning: { border: '1px solid #f59e0b', color: '#fbbf24' },
        error: { border: '1px solid #ef4444', color: '#f87171' },
        success: { border: '1px solid #10b981', color: '#34d399' }
    };

    return (
        <div style={{
            background: '#1e293b',
            ...styles[type],
            padding: 12,
            borderRadius: 8,
            marginBottom: 16
        }}>
            {message}
        </div>
    );
};

export default AlertBanner;
