import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGoogleAuth } from '../../hooks/auth/useGoogleAuth';
import './AuthCallbackPage.css';

const AuthCallbackPage: React.FC = () => {
    const navigate = useNavigate();
    const { handleCallback, error } = useGoogleAuth();
    const [isProcessing, setIsProcessing] = useState(true);

    useEffect(() => {
        const processCallback = async () => {
            const success = await handleCallback();

            if (!success) {
                setIsProcessing(false);
            }
            // If success, the hook will handle navigation
        };

        processCallback();
    }, [handleCallback]);

    if (error || !isProcessing) {
        return (
            <div className="auth-callback-container">
                <div className="auth-callback-card">
                    <div className="auth-callback-error">
                        <span className="error-icon">⚠️</span>
                        <h2>Authentication Failed</h2>
                        <p>{error || 'Something went wrong'}</p>
                        <button onClick={() => navigate('/login')}>
                            Back to Login
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="auth-callback-container">
            <div className="auth-callback-card">
                <div className="auth-callback-loading">
                    <div className="spinner"></div>
                    <h2>Completing sign in...</h2>
                    <p>Please wait while we authenticate you.</p>
                </div>
            </div>
        </div>
    );
};

export default AuthCallbackPage;
