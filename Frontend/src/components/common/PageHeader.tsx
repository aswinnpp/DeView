import React from 'react';

interface PageHeaderProps {
    title: string;
    subtitle?: string;
}

const PageHeader: React.FC<PageHeaderProps> = ({ title, subtitle }) => {
    return (
        <div style={{ marginBottom: 24 }}>
            <h2 style={{ margin: 0, fontSize: 22, color: '#f1f5f9' }}>{title}</h2>
            {subtitle && (
                <p style={{ margin: '4px 0 0 0', color: '#94a3b8', fontSize: 14 }}>
                    {subtitle}
                </p>
            )}
        </div>
    );
};

export default PageHeader;
