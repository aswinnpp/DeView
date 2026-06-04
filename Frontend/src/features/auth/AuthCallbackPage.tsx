import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '../../context/store';
import { APP_ROUTES } from '../../constants/routes';
import { useGoogleAuth } from '../../hooks/auth/useGoogleAuth';
import { Button } from '../../components/common';

const AuthCallbackPage = () => {
    const navigate = useNavigate();
    const { error, data } = useGoogleAuth();
    const { handleCallback } = data;

    const [isProcessing, setIsProcessing] = useState(true);
    const user = useSelector((state: RootState) => state.auth.user);

    const hasRun = useRef(false);

    useEffect(() => {
        // If already logged in (Back button to callback), redirect by role.
        if (user) {
            const role = (user.role || '').toLowerCase();

            if (role === 'admin') {
                navigate(APP_ROUTES.ADMIN_DASHBOARD, { replace: true });
            } else if (role === 'company') {
                navigate(APP_ROUTES.COMPANY_DASHBOARD, { replace: true });
            } else if (role === 'hr') {
                navigate(APP_ROUTES.HR_DASHBOARD, { replace: true });
            } else if (role === 'interviewer') {
                navigate(APP_ROUTES.INTERVIEWER_ASSIGNMENTS, { replace: true });
            } else {
                navigate(APP_ROUTES.CANDIDATE_INTERVIEWS, { replace: true });
            }
            return;
        }

        if (hasRun.current) return;
        hasRun.current = true;

        const processCallback = async () => {
            const success = await handleCallback();

            if (!success) {
                setIsProcessing(false);
            }
            // success → hook handles navigation
        };

        processCallback();
    }, [handleCallback, user, navigate]);

    if (error || !isProcessing) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-[#0f0f1a] via-[#1a1a2e] to-[#16213e]">
                <div className="bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)] rounded-2xl p-12 text-center max-w-[400px] w-[90%]">
                    <div className="flex flex-col items-center gap-4">
                        <span className="text-5xl">⚠️</span>
                        <h2 className="text-[#fca5a5] m-0 text-xl font-semibold">
                            Authentication Failed
                        </h2>
                        <p className="text-[rgba(255,255,255,0.6)] m-0 text-sm">
                            {error || 'Something went wrong'}
                        </p>
                        <Button
                            variant="primary"
                            onClick={() => navigate('/login', { replace: true })}
                            className="py-3 px-6 rounded-lg text-sm font-semibold mt-2"
                        >
                            Back to Login
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-[#0f0f1a] via-[#1a1a2e] to-[#16213e]">
            <div className="bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)] rounded-2xl p-12 text-center max-w-[400px] w-[90%]">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-[rgba(255,255,255,0.1)] border-t-brand-primary rounded-full animate-spin"></div>
                    <h2 className="text-white m-0 text-xl font-semibold">
                        Completing sign in...
                    </h2>
                    <p className="text-[rgba(255,255,255,0.6)] m-0 text-sm">
                        Please wait while we authenticate you.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AuthCallbackPage;
