
import { Link, useNavigate } from 'react-router-dom';
import Background from '@components/Background/Background';
import { Button } from '../../components/common';

const NotFoundPage = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen flex flex-col items-center justify-center relative font-[Inter,-apple-system,BlinkMacSystemFont,'Segoe_UI',Roboto,sans-serif] text-white overflow-hidden px-4 py-10 max-md:py-8 max-md:px-4 pb-24">
            <Background />

            <div className="relative z-10 text-center max-w-[600px]">
                {/* Error Code */}
                <div className="flex items-center justify-center gap-1 max-md:gap-0.5 mb-6 max-md:mb-4">
                    <span className="text-[120px] font-black bg-linear-to-br from-brand-primary to-brand-pink bg-clip-text text-transparent leading-none max-md:text-[72px] max-sm:text-[52px]">4</span>
                    <span className="text-[120px] font-black bg-linear-to-br from-brand-primary to-brand-pink bg-clip-text text-transparent leading-none max-md:text-[72px] max-sm:text-[52px]">0</span>
                    <span className="text-[120px] font-black bg-linear-to-br from-brand-primary to-brand-pink bg-clip-text text-transparent leading-none max-md:text-[72px] max-sm:text-[52px]">4</span>
                </div>

                <h1 className="text-4xl font-bold mb-4 max-md:text-2xl max-sm:text-xl">
                    Page Not Found
                </h1>

                <p className="text-lg text-[rgba(255,255,255,0.7)] leading-relaxed mb-10 max-md:mb-8 max-w-[500px] mx-auto max-md:text-sm max-sm:text-[13px]">
                    Oops! The page you're looking for seems to have vanished into the digital void.
                    Don't worry, it happens to the best of us.
                </p>

                {/* Action Buttons */}
                <div className="flex gap-4 justify-center flex-wrap mb-12 max-md:mb-8 max-md:flex-col max-md:items-stretch max-md:gap-3 max-md:max-w-[280px] max-md:mx-auto">
                    <Link
                        to="/"
                        className="inline-flex items-center justify-center gap-2.5 py-4 px-7 max-md:py-3 max-md:px-5 rounded-xl font-semibold text-base max-md:text-sm no-underline transition-all duration-300 cursor-pointer bg-linear-to-br from-brand-primary to-brand-secondary text-white border-none shadow-[0_4px_20px_rgba(102,126,234,0.4)] hover:-translate-y-0.5 hover:shadow-[0_6px_30px_rgba(102,126,234,0.5)] max-md:w-full max-md:justify-center"
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                            <polyline points="9 22 9 12 15 12 15 22"></polyline>
                        </svg>
                        Back to Home
                    </Link>
                    <Button
                        variant="secondary"
                        onClick={() => navigate(-1)}
                        className="inline-flex items-center justify-center gap-2.5 py-4 px-7 max-md:py-3 max-md:px-5 rounded-xl font-semibold text-base max-md:text-sm max-md:w-full max-md:justify-center"
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="19" y1="12" x2="5" y2="12"></line>
                            <polyline points="12 19 5 12 12 5"></polyline>
                        </svg>
                        Go Back
                    </Button>
                </div>
            </div>

            {/* Footer */}
            <footer className="absolute bottom-0 left-0 right-0 p-6 max-md:p-4 text-center bg-[rgba(15,15,25,0.9)] border-t border-[rgba(255,255,255,0.1)]">
                <div className="inline-flex items-center gap-2.5 mb-2">
                    <div className="w-7 h-7 max-md:w-6 max-md:h-6 bg-linear-to-br from-brand-primary to-brand-secondary rounded-md flex items-center justify-center text-sm max-md:text-xs font-bold">D</div>
                    <span className="text-base max-md:text-sm font-semibold tracking-wider">DEVIEW</span>
                </div>
                <p className="text-[13px] max-md:text-xs text-[rgba(255,255,255,0.4)] m-0">© 2024 DEVIEW - Developer Interview Platform</p>
            </footer>
        </div>
    );
};

export default NotFoundPage;
