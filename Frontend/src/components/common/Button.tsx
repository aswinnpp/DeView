import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'ghost';
    children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({ variant = 'primary', children, style, ...props }) => {
    const variants = {
        primary: {
            background: '#4f46e5',
            color: 'white',
            border: 'none'
        },
        secondary: {
            background: '#334155',
            color: 'white',
            border: 'none'
        },
        success: {
            background: '#10b981',
            color: 'white',
            border: 'none'
        },
        danger: {
            background: '#ef4444',
            color: 'white',
            border: 'none'
        },
        ghost: {
            background: 'transparent',
            color: '#94a3b8',
            border: 'none'
        }
    };

    return (
        <button
            {...props}
            style={{
                ...variants[variant],
                padding: '10px 20px',
                borderRadius: 8,
                fontSize: 14,
                fontWeight: 600,
                cursor: props.disabled ? 'not-allowed' : 'pointer',
                opacity: props.disabled ? 0.6 : 1,
                transition: 'opacity 0.2s',
                ...style
            }}
        >
            {children}
        </button>
    );
};

export default Button;
