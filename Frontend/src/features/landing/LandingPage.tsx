import React from 'react';
import { Link } from 'react-router-dom';
import Background from '@components/Background/Background';
import './LandingPage.css';

const LandingPage: React.FC = () => {
    return (
        <div className="landing-container">
            <Background />

            {/* Header */}
            <header className="landing-header">
                <div className="landing-logo">
                    <div className="logo-icon">D</div>
                    <h1>DEVIEW</h1>
                </div>
                <nav className="landing-nav">
                    <Link to="/login" className="nav-link">Login</Link>
                    <Link to="/register" className="nav-btn">Get Started</Link>
                </nav>
            </header>

            {/* Hero Section */}
            <section className="hero-section">
                <div className="hero-content">
                    <span className="hero-badge">Developer Interview Platform</span>
                    <h1 className="hero-title">
                        Streamline Your <span className="gradient-text">Interview Process</span>
                    </h1>
                    <p className="hero-subtitle">
                        The all-in-one platform connecting companies, interviewers, and candidates
                        for seamless, efficient technical hiring. Built specifically for developer interviews.
                    </p>
                    <div className="hero-actions">
                        <Link to="/register" className="primary-btn">Start Free Trial</Link>
                        <Link to="/login" className="secondary-btn">Sign In</Link>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="features-section">
                <h2 className="section-title">Why Choose DEVIEW?</h2>
                <p className="section-subtitle">
                    Everything you need to conduct effective developer interviews and hire the best talent.
                </p>
                <div className="features-grid">
                    <div className="feature-card">
                        <div className="feature-icon-box">
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                                <polyline points="9 22 9 12 15 12 15 22"></polyline>
                            </svg>
                        </div>
                        <h3>For Companies</h3>
                        <p>Post technical jobs, manage applications, track candidates through your hiring pipeline, and build your engineering team efficiently.</p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon-box">
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                                <circle cx="9" cy="7" r="4"></circle>
                                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                            </svg>
                        </div>
                        <h3>For HR Teams</h3>
                        <p>Schedule interviews with ease, coordinate between candidates and interviewers, manage interview slots, and streamline communication.</p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon-box">
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
                                <line x1="8" y1="21" x2="16" y2="21"></line>
                                <line x1="12" y1="17" x2="12" y2="21"></line>
                            </svg>
                        </div>
                        <h3>For Interviewers</h3>
                        <p>Manage your availability, conduct structured technical interviews, provide detailed feedback, and track your interview history.</p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon-box">
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M22 10v6M2 10l10-5 10 5-10 5z"></path>
                                <path d="M6 12v5c3 3 9 3 12 0v-5"></path>
                            </svg>
                        </div>
                        <h3>For Candidates</h3>
                        <p>Browse developer jobs, apply with your profile, track application status in real-time, and prepare for your technical interviews.</p>
                    </div>
                </div>
            </section>

            {/* Unique Features - What Sets Us Apart */}
            <section className="platform-section">
                <h2 className="section-title">What Makes DEVIEW Unique</h2>
                <p className="section-subtitle">
                    Features you won't find anywhere else. Built exclusively to revolutionize technical hiring.
                </p>
                <div className="platform-grid">
                    <div className="platform-card highlight-card">
                        <div className="platform-icon ai-icon">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
                                <path d="M2 17l10 5 10-5"></path>
                                <path d="M2 12l10 5 10-5"></path>
                            </svg>
                        </div>
                        <div className="platform-content">
                            <span className="feature-badge">AI-Powered</span>
                            <h4>Smart Candidate Shortlisting</h4>
                            <p>Our AI analyzes resumes, skills, and experience to automatically shortlist the best-fit candidates for your job requirements. Save hours of manual screening.</p>
                        </div>
                    </div>
                    <div className="platform-card highlight-card">
                        <div className="platform-icon ai-icon">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                                <circle cx="9" cy="7" r="4"></circle>
                                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                            </svg>
                        </div>
                        <div className="platform-content">
                            <span className="feature-badge">AI-Powered</span>
                            <h4>AI Interviewer Matching</h4>
                            <p>Intelligent matching of candidates with the right interviewers based on technical skills, domain expertise, and availability. Perfect interviewer-candidate pairing every time.</p>
                        </div>
                    </div>
                    <div className="platform-card highlight-card">
                        <div className="platform-icon exclusive-icon">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                <polyline points="14 2 14 8 20 8"></polyline>
                                <path d="M9 15l2 2 4-4"></path>
                            </svg>
                        </div>
                        <div className="platform-content">
                            <span className="feature-badge exclusive">Exclusive</span>
                            <h4>In-App Offer Letters</h4>
                            <p>Send professional offer letters directly within DEVIEW. No external emails, no switching platforms. Complete hiring workflow from application to onboarding in one place.</p>
                        </div>
                    </div>
                    <div className="platform-card">
                        <div className="platform-icon">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="10"></circle>
                                <polyline points="12 6 12 12 16 14"></polyline>
                            </svg>
                        </div>
                        <div className="platform-content">
                            <h4>Real-time Scheduling</h4>
                            <p>Interviewers set their availability, and HR can schedule interviews instantly without back-and-forth emails.</p>
                        </div>
                    </div>
                    <div className="platform-card">
                        <div className="platform-icon">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                <polyline points="14 2 14 8 20 8"></polyline>
                                <line x1="16" y1="13" x2="8" y2="13"></line>
                                <line x1="16" y1="17" x2="8" y2="17"></line>
                            </svg>
                        </div>
                        <div className="platform-content">
                            <h4>Complete Pipeline Tracking</h4>
                            <p>Track every candidate through your pipeline with status updates, notes, and structured feedback.</p>
                        </div>
                    </div>
                    <div className="platform-card">
                        <div className="platform-icon">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                            </svg>
                        </div>
                        <div className="platform-content">
                            <h4>Secure & Compliant</h4>
                            <p>Enterprise-grade security with role-based permissions and data protection compliance.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* How It Works */}
            <section className="how-it-works-section">
                <h2 className="section-title">How It Works</h2>
                <p className="section-subtitle">
                    Get started in minutes with our simple onboarding process.
                </p>
                <div className="steps-container">
                    <div className="step">
                        <div className="step-number">1</div>
                        <h3>Create Account</h3>
                        <p>Sign up as a company, interviewer, or candidate with email or Google</p>
                    </div>
                    <div className="step-divider"></div>
                    <div className="step">
                        <div className="step-number">2</div>
                        <h3>Complete Profile</h3>
                        <p>Set up your profile with relevant information and preferences</p>
                    </div>
                    <div className="step-divider"></div>
                    <div className="step">
                        <div className="step-number">3</div>
                        <h3>Start Hiring</h3>
                        <p>Post jobs, apply to positions, or conduct technical interviews</p>
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="stats-section">
                <div className="stat-item">
                    <span className="stat-number">0</span>
                    <span className="stat-label">Companies</span>
                </div>
                <div className="stat-item">
                    <span className="stat-number">0</span>
                    <span className="stat-label">Interviews Conducted</span>
                </div>
                <div className="stat-item">
                    <span className="stat-number">0</span>
                    <span className="stat-label">Developers Hired</span>
                </div>
                <div className="stat-item">
                    <span className="stat-number">0%</span>
                    <span className="stat-label">Satisfaction Rate</span>
                </div>
            </section>

            {/* Testimonials / Use Cases */}
            <section className="use-cases-section">
                <h2 className="section-title">Built for Technical Hiring</h2>
                <p className="section-subtitle">
                    Whether you're a startup or enterprise, DEVIEW scales with your hiring needs.
                </p>
                <div className="use-cases-grid">
                    <div className="use-case-card">
                        <h4>Startups</h4>
                        <p>Start free and scale as you grow. Perfect for early-stage companies building their first engineering team.</p>
                    </div>
                    <div className="use-case-card">
                        <h4>Growing Companies</h4>
                        <p>Streamline your hiring process with dedicated HR tools, multiple interviewers, and structured pipelines.</p>
                    </div>
                    <div className="use-case-card">
                        <h4>Enterprise</h4>
                        <p>Full customization, advanced analytics, dedicated support, and enterprise-grade security features.</p>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="cta-section">
                <div className="cta-content">
                    <h2>Ready to Transform Your Technical Hiring?</h2>
                    <p>Join hundreds of companies already using DEVIEW to hire the best developers.</p>
                    <div className="cta-actions">
                        <Link to="/register" className="cta-btn">Get Started Free</Link>
                        <span className="cta-note">No credit card required</span>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="landing-footer">
                <div className="footer-content">
                    <div className="footer-brand">
                        <div className="logo-icon small">D</div>
                        <span>DEVIEW</span>
                    </div>
                    <div className="footer-links">
                        <Link to="/login">Login</Link>
                        <Link to="/register">Register</Link>
                    </div>
                    <p className="footer-text">
                        © 2024 DEVIEW - Developer Interview Platform. All rights reserved.
                    </p>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
