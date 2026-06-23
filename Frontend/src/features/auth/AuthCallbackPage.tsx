import { useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { APP_ROUTES } from '../../constants/routes';
import { useGoogleAuth } from '../../hooks/auth/useGoogleAuth';
import { Button } from '../../components/common';

const AuthCallbackPage = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { error, data } = useGoogleAuth();
    const { handleCallback } = data;

    const sessionId = searchParams.get('sessionId');
    const [callbackFailed, setCallbackFailed] = useState(false);
    const hasRun = useRef(false);

    useEffect(() => {
        if (!sessionId || hasRun.current) return;
        hasRun.current = true;

        void handleCallback().then((success) => {
            if (!success) {
                setCallbackFailed(true);
            }
        });
    }, [handleCallback, sessionId]);

    const oauthSessionType = sessionStorage.getItem('oauthSessionType');
    const fallbackLoginPath =
        oauthSessionType === 'admin' ? APP_ROUTES.ADMIN_LOGIN : APP_ROUTES.LOGIN;

    const showError = !sessionId || Boolean(error) || callbackFailed;

    if (showError) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-[#0f0f1a] via-[#1a1a2e] to-[#16213e]">
                <div className="bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)] rounded-2xl p-12 text-center max-w-[400px] w-[90%]">
                    <div className="flex flex-col items-center gap-4">
                        <span className="text-5xl">⚠️</span>
                        <h2 className="text-[#fca5a5] m-0 text-xl font-semibold">
                            Authentication Failed
                        </h2>
                        <p className="text-[rgba(255,255,255,0.6)] m-0 text-sm">
                            {error || (sessionId ? 'Something went wrong' : 'Invalid callback. No session ID found.')}
                        </p>
                        <Button
                            variant="primary"
                            onClick={() => navigate(fallbackLoginPath, { replace: true })}
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
