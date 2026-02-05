import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Background from '@components/Background/Background';
import './NotFoundPage.css';

const NotFoundPage: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="notfound-container">
            <Background />

            <div className="notfound-content">
                {/* Error Code */}
                <div className="error-code">
                    <span className="digit">4</span>
                    <span className="digit">0</span>
                    <span className="digit">4</span>
                </div>

                <h1 className="notfound-title">
                    Page Not Found
                </h1>

                <p className="notfound-subtitle">
                    Oops! The page you're looking for seems to have vanished into the digital void.
                    Don't worry, it happens to the best of us.
                </p>

                {/* Action Buttons */}
                <div className="notfound-actions">
                    <Link to="/" className="primary-btn">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                            <polyline points="9 22 9 12 15 12 15 22"></polyline>
                        </svg>
                        Back to Home
                    </Link>
                    <button onClick={() => navigate(-1)} className="secondary-btn">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="19" y1="12" x2="5" y2="12"></line>
                            <polyline points="12 19 5 12 12 5"></polyline>
                        </svg>
                        Go Back
                    </button>
                </div>

                {/* Quick Links */}
                <div className="quick-links">
                    <p className="quick-links-title">Quick Links</p>
                    <div className="quick-links-grid">
                        <Link to="/login" className="quick-link">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
                                <polyline points="10 17 15 12 10 7"></polyline>
                                <line x1="15" y1="12" x2="3" y2="12"></line>
                            </svg>
                            Login
                        </Link>
                        <Link to="/register" className="quick-link">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                                <circle cx="8.5" cy="7" r="4"></circle>
                                <line x1="20" y1="8" x2="20" y2="14"></line>
                                <line x1="23" y1="11" x2="17" y2="11"></line>
                            </svg>
                            Register
                        </Link>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <footer className="notfound-footer">
                <div className="footer-brand">
                    <div className="logo-icon">D</div>
                    <span>DEVIEW</span>
                </div>
                <p>© 2024 DEVIEW - Developer Interview Platform</p>
            </footer>
        </div>
    );
};

export default NotFoundPage;
