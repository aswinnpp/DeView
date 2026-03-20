import React from 'react';
import { Link } from 'react-router-dom';
import Background from '@components/Background/Background';

const LandingPage = () => {
    return (
        <div className="min-h-screen relative font-[Inter,-apple-system,BlinkMacSystemFont,'Segoe_UI',Roboto,sans-serif] text-white overflow-x-hidden">
            <Background />

            {/* Header */}
            <header className="fixed top-0 left-0 right-0 z-[100] flex justify-between items-center py-5 px-15 bg-[rgba(15,15,25,0.9)] backdrop-blur-[10px] border-b border-[rgba(255,255,255,0.1)] max-md:px-4 max-md:py-3">
                <div className="flex items-center gap-2.5 max-md:gap-2 min-w-0">
                   
                    <h1 className="text-[22px] max-md:text-lg font-bold tracking-[2px] m-0 truncate">DEVIEW</h1>
                </div>
                <nav className="flex items-center gap-4 max-md:gap-3 shrink-0">
                    <Link to="/login" className="text-[rgba(255,255,255,0.8)] no-underline text-[15px] max-md:text-sm font-medium whitespace-nowrap">Login</Link>
                    <Link to="/register" className="bg-linear-to-br from-brand-primary to-brand-secondary text-white py-2.5 px-6 max-md:py-2 max-md:px-4 rounded-lg no-underline font-semibold text-sm max-md:text-[13px] whitespace-nowrap">Get Started</Link>
                </nav>
            </header>

            {/* Hero Section */}
            <section className="min-h-screen flex items-center justify-center pt-[120px] pb-20 px-15 text-center max-md:pt-[100px] max-md:pb-12 max-md:px-4">
                <div className="max-w-[800px]">
                    <span className="inline-block bg-[rgba(102,126,234,0.15)] border border-[rgba(102,126,234,0.3)] text-[#a5b4fc] py-2 px-5 max-md:py-1.5 max-md:px-4 rounded-[20px] text-sm max-md:text-xs font-medium mb-6 max-md:mb-4">Developer Interview Platform</span>
                    <h1 className="text-[56px] font-extrabold leading-[1.2] mb-6 max-md:text-3xl max-sm:text-2xl">
                        Streamline Your <span className="bg-linear-to-br from-brand-primary to-brand-pink bg-clip-text text-transparent">Interview Process</span>
                    </h1>
                    <p className="text-xl text-[rgba(255,255,255,0.7)] leading-relaxed mb-10 max-w-[600px] mx-auto max-md:text-sm max-sm:text-[13px]">
                        The all-in-one platform connecting companies, interviewers, and candidates
                        for seamless, efficient technical hiring. Built specifically for developer interviews.
                    </p>
                    <div className="flex gap-4 justify-center max-md:flex-col max-md:gap-3 max-md:items-stretch max-md:max-w-[280px] max-md:mx-auto">
                        <Link to="/register" className="bg-linear-to-br from-brand-primary to-brand-secondary text-white py-4 px-8 max-md:py-3 max-md:px-6 rounded-[10px] no-underline font-semibold text-base max-md:text-sm text-center">Start Free Trial</Link>
                        <Link to="/login" className="bg-[rgba(255,255,255,0.1)] text-white py-4 px-8 max-md:py-3 max-md:px-6 rounded-[10px] no-underline font-semibold text-base max-md:text-sm text-center border border-[rgba(255,255,255,0.2)]">Sign In</Link>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-25 px-15 bg-[rgba(15,15,25,0.5)] max-md:py-12 max-md:px-4">
                <h2 className="text-center text-4xl font-bold mb-4 max-md:text-2xl max-sm:text-xl">Why Choose DEVIEW?</h2>
                <p className="text-center text-lg text-[rgba(255,255,255,0.6)] max-w-[600px] mx-auto mb-[50px] max-md:mb-8 leading-relaxed max-md:text-base max-sm:text-sm">
                    Everything you need to conduct effective developer interviews and hire the best talent.
                </p>
                <div className="grid grid-cols-4 gap-6 max-w-[1200px] mx-auto max-lg:grid-cols-2 max-md:grid-cols-1">
                    {[
                        {
                            icon: <><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></>,
                            title: 'For Companies',
                            desc: 'Post technical jobs, manage applications, track candidates through your hiring pipeline, and build your engineering team efficiently.'
                        },
                        {
                            icon: <><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></>,
                            title: 'For HR Teams',
                            desc: 'Schedule interviews with ease, coordinate between candidates and interviewers, manage interview slots, and streamline communication.'
                        },
                        {
                            icon: <><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></>,
                            title: 'For Interviewers',
                            desc: 'Manage your availability, conduct structured technical interviews, provide detailed feedback, and track your interview history.'
                        },
                        {
                            icon: <><path d="M22 10v6M2 10l10-5 10 5-10 5z"></path><path d="M6 12v5c3 3 9 3 12 0v-5"></path></>,
                            title: 'For Candidates',
                            desc: 'Browse developer jobs, apply with your profile, track application status in real-time, and prepare for your technical interviews.'
                        }
                    ].map((feature, i) => (
                        <div key={i} className="bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.08)] rounded-2xl max-md:rounded-xl py-8 px-6 max-md:py-6 max-md:px-4 text-center">
                            <div className="w-15 h-15 bg-linear-to-br from-[rgba(102,126,234,0.15)] to-[rgba(118,75,162,0.15)] rounded-[14px] flex items-center justify-center mx-auto mb-5 text-[#a5b4fc]">
                                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">{feature.icon}</svg>
                            </div>
                            <h3 className="text-lg max-md:text-base font-semibold mb-3">{feature.title}</h3>
                            <p className="text-sm max-md:text-[13px] text-[rgba(255,255,255,0.6)] leading-relaxed">{feature.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Unique Features - What Sets Us Apart */}
            <section className="py-25 px-15 max-md:py-12 max-md:px-4">
                <h2 className="text-center text-4xl font-bold mb-4 max-md:text-2xl max-sm:text-xl">What Makes DEVIEW Unique</h2>
                <p className="text-center text-lg text-[rgba(255,255,255,0.6)] max-w-[600px] mx-auto mb-[50px] max-md:mb-8 leading-relaxed max-md:text-base max-sm:text-sm">
                    Features you won't find anywhere else. Built exclusively to revolutionize technical hiring.
                </p>
                <div className="grid grid-cols-3 gap-6 max-w-[1100px] mx-auto max-lg:grid-cols-2 max-md:grid-cols-1">
                    {/* Highlight Card 1 */}
                    <div className="flex gap-4 max-md:flex-col max-md:gap-3 p-6 max-md:p-4 bg-linear-to-br from-[rgba(102,126,234,0.08)] to-[rgba(118,75,162,0.08)] border border-[rgba(102,126,234,0.25)] rounded-xl transition-all duration-300 relative overflow-hidden hover:-translate-y-0.5 hover:border-[rgba(102,126,234,0.4)] hover:shadow-[0_8px_32px_rgba(102,126,234,0.15)] before:content-[''] before:absolute before:top-0 before:left-0 before:right-0 before:h-[3px] before:bg-linear-to-r before:from-brand-primary before:via-brand-secondary before:to-brand-pink">
                        <div className="w-12 h-12 bg-linear-to-br from-[rgba(102,126,234,0.25)] to-[rgba(118,75,162,0.25)] rounded-[10px] flex items-center justify-center shrink-0 text-[#a5b4fc]">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M12 2L2 7l10 5 10-5-10-5z"></path><path d="M2 17l10 5 10-5"></path><path d="M2 12l10 5 10-5"></path>
                            </svg>
                        </div>
                        <div>
                            <span className="inline-block py-1 px-2.5 text-[11px] font-semibold uppercase tracking-[0.5px] rounded bg-linear-to-br from-[rgba(102,126,234,0.2)] to-[rgba(118,75,162,0.2)] text-[#a5b4fc] border border-[rgba(102,126,234,0.3)] mb-2">AI-Powered</span>
                            <h4 className="text-base font-semibold mb-2">Smart Candidate Shortlisting</h4>
                            <p className="text-sm text-[rgba(255,255,255,0.6)] leading-normal">Our AI analyzes resumes, skills, and experience to automatically shortlist the best-fit candidates for your job requirements. Save hours of manual screening.</p>
                        </div>
                    </div>
                    {/* Highlight Card 2 */}
                    <div className="flex gap-4 max-md:flex-col max-md:gap-3 p-6 max-md:p-4 bg-linear-to-br from-[rgba(102,126,234,0.08)] to-[rgba(118,75,162,0.08)] border border-[rgba(102,126,234,0.25)] rounded-xl transition-all duration-300 relative overflow-hidden hover:-translate-y-0.5 hover:border-[rgba(102,126,234,0.4)] hover:shadow-[0_8px_32px_rgba(102,126,234,0.15)] before:content-[''] before:absolute before:top-0 before:left-0 before:right-0 before:h-[3px] before:bg-linear-to-r before:from-brand-primary before:via-brand-secondary before:to-brand-pink">
                        <div className="w-12 h-12 bg-linear-to-br from-[rgba(102,126,234,0.25)] to-[rgba(118,75,162,0.25)] rounded-[10px] flex items-center justify-center shrink-0 text-[#a5b4fc]">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                            </svg>
                        </div>
                        <div>
                            <span className="inline-block py-1 px-2.5 text-[11px] font-semibold uppercase tracking-[0.5px] rounded bg-linear-to-br from-[rgba(102,126,234,0.2)] to-[rgba(118,75,162,0.2)] text-[#a5b4fc] border border-[rgba(102,126,234,0.3)] mb-2">AI-Powered</span>
                            <h4 className="text-base font-semibold mb-2">AI Interviewer Matching</h4>
                            <p className="text-sm text-[rgba(255,255,255,0.6)] leading-normal">Intelligent matching of candidates with the right interviewers based on technical skills, domain expertise, and availability. Perfect interviewer-candidate pairing every time.</p>
                        </div>
                    </div>
                    {/* Highlight Card 3 - Exclusive */}
                    <div className="flex gap-4 max-md:flex-col max-md:gap-3 p-6 max-md:p-4 bg-linear-to-br from-[rgba(102,126,234,0.08)] to-[rgba(118,75,162,0.08)] border border-[rgba(102,126,234,0.25)] rounded-xl transition-all duration-300 relative overflow-hidden hover:-translate-y-0.5 hover:border-[rgba(102,126,234,0.4)] hover:shadow-[0_8px_32px_rgba(102,126,234,0.15)] before:content-[''] before:absolute before:top-0 before:left-0 before:right-0 before:h-[3px] before:bg-linear-to-r before:from-brand-primary before:via-brand-secondary before:to-brand-pink">
                        <div className="w-12 h-12 bg-linear-to-br from-[rgba(236,72,153,0.25)] to-[rgba(190,24,93,0.25)] rounded-[10px] flex items-center justify-center shrink-0 text-[#f9a8d4]">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><path d="M9 15l2 2 4-4"></path>
                            </svg>
                        </div>
                        <div>
                            <span className="inline-block py-1 px-2.5 text-[11px] font-semibold uppercase tracking-[0.5px] rounded bg-linear-to-br from-[rgba(236,72,153,0.2)] to-[rgba(190,24,93,0.2)] text-[#f9a8d4] border border-[rgba(236,72,153,0.3)] mb-2">Exclusive</span>
                            <h4 className="text-base font-semibold mb-2">In-App Offer Letters</h4>
                            <p className="text-sm text-[rgba(255,255,255,0.6)] leading-normal">Send professional offer letters directly within DEVIEW. No external emails, no switching platforms. Complete hiring workflow from application to onboarding in one place.</p>
                        </div>
                    </div>
                    {/* Standard Cards */}
                    {[
                        {
                            icon: <><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></>,
                            title: 'Real-time Scheduling',
                            desc: 'Interviewers set their availability, and HR can schedule interviews instantly without back-and-forth emails.'
                        },
                        {
                            icon: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></>,
                            title: 'Complete Pipeline Tracking',
                            desc: 'Track every candidate through your pipeline with status updates, notes, and structured feedback.'
                        },
                        {
                            icon: <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>,
                            title: 'Secure & Compliant',
                            desc: 'Enterprise-grade security with role-based permissions and data protection compliance.'
                        }
                    ].map((item, i) => (
                        <div key={i} className="flex gap-4 max-md:flex-col max-md:gap-3 p-6 max-md:p-4 bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.08)] rounded-xl transition-all duration-300 hover:-translate-y-0.5 hover:border-[rgba(255,255,255,0.15)]">
                            <div className="w-12 h-12 bg-linear-to-br from-[rgba(102,126,234,0.15)] to-[rgba(118,75,162,0.15)] rounded-[10px] flex items-center justify-center shrink-0 text-[#a5b4fc]">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">{item.icon}</svg>
                            </div>
                            <div>
                                <h4 className="text-base font-semibold mb-2">{item.title}</h4>
                                <p className="text-sm text-[rgba(255,255,255,0.6)] leading-normal">{item.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* How It Works */}
            <section className="py-25 px-15 bg-[rgba(15,15,25,0.5)] max-md:py-12 max-md:px-4">
                <h2 className="text-center text-4xl font-bold mb-4 max-md:text-2xl max-sm:text-xl">How It Works</h2>
                <p className="text-center text-lg text-[rgba(255,255,255,0.6)] max-w-[600px] mx-auto mb-[50px] max-md:mb-8 leading-relaxed max-md:text-base max-sm:text-sm">
                    Get started in minutes with our simple onboarding process.
                </p>
                <div className="flex items-center justify-center gap-5 max-w-[900px] mx-auto max-md:flex-col max-md:gap-6">
                    {[
                        { num: '1', title: 'Create Account', desc: 'Sign up as a company, interviewer, or candidate with email or Google' },
                        { num: '2', title: 'Complete Profile', desc: 'Set up your profile with relevant information and preferences' },
                        { num: '3', title: 'Start Hiring', desc: 'Post jobs, apply to positions, or conduct technical interviews' }
                    ].map((step, i) => (
                        <React.Fragment key={i}>
                            {i > 0 && <div className="w-20 h-0.5 bg-linear-to-r from-[rgba(102,126,234,0.5)] to-[rgba(118,75,162,0.5)] shrink-0 max-md:w-0.5 max-md:h-10"></div>}
                            <div className="text-center flex-1 min-w-0">
                                <div className="w-[50px] h-[50px] max-md:w-12 max-md:h-12 bg-linear-to-br from-brand-primary to-brand-secondary rounded-full flex items-center justify-center text-xl max-md:text-lg font-bold mx-auto mb-4">{step.num}</div>
                                <h3 className="text-lg max-md:text-base font-semibold mb-2">{step.title}</h3>
                                <p className="text-sm max-md:text-[13px] text-[rgba(255,255,255,0.6)] leading-normal">{step.desc}</p>
                            </div>
                        </React.Fragment>
                    ))}
                </div>
            </section>

            {/* Stats Section */}
            <section className="py-20 px-15 bg-linear-to-br from-[rgba(102,126,234,0.08)] to-[rgba(118,75,162,0.08)] flex justify-center gap-20 max-lg:gap-10 max-md:flex-wrap max-md:gap-6 max-md:py-10 max-md:px-4">
                {[
                    { number: '0', label: 'Companies' },
                    { number: '0', label: 'Interviews Conducted' },
                    { number: '0', label: 'Developers Hired' },
                ].map((stat, i) => (
                    <div key={i} className="text-center max-md:flex-[1_1_45%] max-sm:flex-[1_1_100%]">
                        <span className="block text-[42px] max-md:text-3xl max-sm:text-2xl font-extrabold bg-linear-to-br from-brand-primary to-brand-pink bg-clip-text text-transparent">{stat.number}</span>
                        <span className="text-sm max-md:text-xs text-[rgba(255,255,255,0.6)] mt-1 block">{stat.label}</span>
                    </div>
                ))}
            </section>
            

            <section className="py-25 px-15 max-md:py-12 max-md:px-4">
                <h2 className="text-center text-4xl font-bold mb-4 max-md:text-2xl max-sm:text-xl">Built for Technical Hiring</h2>
                <p className="text-center text-lg text-[rgba(255,255,255,0.6)] max-w-[600px] mx-auto mb-[50px] max-md:mb-8 leading-relaxed max-md:text-base max-sm:text-sm">
                    Whether you're a startup or enterprise, DEVIEW scales with your hiring needs.
                </p>
                <div className="grid grid-cols-3 gap-6 max-w-[1000px] mx-auto max-md:grid-cols-1">
                    {[
                        { title: 'Startups', desc: 'Start free and scale as you grow. Perfect for early-stage companies building their first engineering team.' },
                        { title: 'Growing Companies', desc: 'Streamline your hiring process with dedicated HR tools, multiple interviewers, and structured pipelines.' },
                        { title: 'Enterprise', desc: 'Full customization, advanced analytics, dedicated support, and enterprise-grade security features.' }
                    ].map((uc, i) => (
                        <div key={i} className="bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.08)] rounded-2xl max-md:rounded-xl p-8 max-md:p-5 text-center">
                            <h4 className="text-xl max-md:text-lg font-semibold mb-3 text-[#a5b4fc]">{uc.title}</h4>
                            <p className="text-[15px] max-md:text-sm text-[rgba(255,255,255,0.6)] leading-relaxed">{uc.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-25 px-15 bg-[rgba(15,15,25,0.5)] text-center max-md:py-12 max-md:px-4">
                <div>
                    <h2 className="text-[40px] font-bold mb-4 max-md:text-2xl max-sm:text-xl">Ready to Transform Your Technical Hiring?</h2>
                    <p className="text-lg max-md:text-base max-sm:text-sm text-[rgba(255,255,255,0.7)] mb-8 max-md:mb-6">Join hundreds of companies already using DEVIEW to hire the best developers.</p>
                    <div className="flex flex-col items-center gap-3">
                        <Link to="/register" className="bg-linear-to-br from-brand-pink to-brand-pink-dark text-white py-[18px] px-10 max-md:py-4 max-md:px-8 rounded-[10px] no-underline font-semibold text-base max-md:text-sm inline-block">Get Started Free</Link>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-10 px-15 border-t border-[rgba(255,255,255,0.1)] bg-[rgba(15,15,25,0.9)] max-md:py-6 max-md:px-4">
                   

                    <p className="text-[rgba(255,255,255,0.4)] text-sm max-md:text-xs max-md:order-3">
                        © 2024 DEVIEW - Developer Interview Platform. All rights reserved.
                    </p>
               
            </footer>
        </div>
    );
};

export default LandingPage;
