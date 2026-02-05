import React from 'react';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
    maxWidth?: number;
    zIndex?: number;
}

const Modal: React.FC<ModalProps> = ({
    isOpen,
    onClose,
    children,
    maxWidth = 900,
    zIndex = 1000
}) => {
    if (!isOpen) return null;

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex,
            padding: 20
        }}>
            <div style={{
                background: '#1e293b',
                borderRadius: 12,
                padding: 32,
                maxWidth,
                width: '100%',
                maxHeight: '90vh',
                overflowY: 'auto',
                border: '1px solid #334155',
                position: 'relative'
            }}>
                {/* Close Button */}
                <button
                    onClick={onClose}
                    style={{
                        position: 'absolute',
                        top: 16,
                        right: 16,
                        background: 'rgba(255, 255, 255, 0.1)',
                        border: 'none',
                        borderRadius: 6,
                        color: '#94a3b8',
                        fontSize: 20,
                        width: 32,
                        height: 32,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
                        e.currentTarget.style.color = '#e2e8f0';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                        e.currentTarget.style.color = '#94a3b8';
                    }}
                >
                    ×
                </button>
                {children}
            </div>
        </div>
    );
};

export default Modal;
