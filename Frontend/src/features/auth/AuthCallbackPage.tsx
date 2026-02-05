import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import './AuthCallbackPage.css';
import { setProfileCompletion } from '@/utils/auth';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const AuthCallbackPage: React.FC = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const exchangeSession = async () => {
            const sessionId = searchParams.get('sessionId');

            if (!sessionId) {
                setError('No session ID found');
                return;
            }

            try {
                const response = await fetch(`${API_BASE_URL}/auth/google/exchange?sessionId=${sessionId}`);

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || 'Failed to exchange session');
                }

                const data = await response.json();

                // Store token and role
                localStorage.setItem('accessToken', data.token);
                localStorage.setItem('userRole', data.role);

                // Redirect based on role
                switch (data.role) {
                    case 'admin':
                        navigate('/admin', { replace: true });
                        break;
                    case 'company':
                        navigate('/company/dashboard', { replace: true });
                        break;
                    case 'hr':
                        navigate('/hr/dashboard', { replace: true });
                        break;
                    case 'interviewer':
                        navigate('/interviewer/dashboard', { replace: true });
                        break;
                    case 'candidate':
                    default:
                        // Store profile completion for candidates (used by CandidateProfileGuard)
                        if (data.profileCompletion !== undefined) {
                            setProfileCompletion(data.profileCompletion);
                        }
                        // Check profile completion for candidates
                        if (data.profileCompletion !== undefined && data.profileCompletion < 80) {
                            navigate('/candidate/profile', {
                                state: { showProfileWarning: true },
                                replace: true
                            });
                        } else {
                            navigate('/candidate/jobs', { replace: true });
                        }
                        break;
                }
            } catch (err: any) {
                setError(err.message || 'Authentication failed');
            }
        };

        exchangeSession();
    }, [searchParams, navigate]);

    if (error) {
        return (
            <div className="auth-callback-container">
                <div className="auth-callback-card">
                    <div className="auth-callback-error">
                        <span className="error-icon">⚠️</span>
                        <h2>Authentication Failed</h2>
                        <p>{error}</p>
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
