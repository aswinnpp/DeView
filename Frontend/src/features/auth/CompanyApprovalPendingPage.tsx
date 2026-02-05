import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './CompanyStyles.css';
import { useApi } from '../../hooks/useApi';

interface CompanyApproval {
    id: string;
    companyName: string;
    contactPerson: string;
    contactEmail: string;
    status: 'pending' | 'approved' | 'rejected';
    rejectionReason?: string;
    createdAt: string;
}

const CompanyApprovalPendingPage = () => {
    const navigate = useNavigate();
    const [approval, setApproval] = useState<CompanyApproval | null>(null);
    const [loading, setLoading] = useState(true);

    const { execute: fetchApproval } = useApi({
        url: '/company-approvals/my-approval',
        method: 'GET',
        immediate: false,
        requireAuth: true,
    });

    const { execute: deleteApproval } = useApi({
        url: '',
        method: 'DELETE',
        immediate: false,
        requireAuth: true,
    });

    useEffect(() => {
        loadApproval();
    }, []);

    const loadApproval = async () => {
        try {
            setLoading(true);
            const response = await fetchApproval() as any;
            if (response?.data) {
                setApproval(response.data);

                // If approved, redirect to company dashboard
                if (response.data.status === 'approved') {
                    navigate('/company/dashboard');
                }
            } else {
                // No approval found, redirect to form
                navigate('/company/approval');
            }
        } catch (err) {
            console.error('Failed to load approval:', err);
            navigate('/company/approval');
        } finally {
            setLoading(false);
        }
    };

    const handleResubmit = async () => {
        if (!approval?.id) return;

        try {
            // Delete the rejected approval
            await deleteApproval({ url: `/company-approvals/${approval.id}` });
            // Navigate to form
            navigate('/company/approval');
        } catch (err) {
            console.error('Failed to delete approval:', err);
            alert('Failed to prepare resubmission. Please try again.');
        }
    };

    if (loading) {
        return (
            <div className="candidate-container" style={{ minHeight: '100vh', background: '#0f172a', color: '#e2e8f0', padding: 40 }}>
                <main style={{ maxWidth: 600, margin: '0 auto', textAlign: 'center', paddingTop: 100 }}>
                    <div style={{ fontSize: 48, marginBottom: 16 }}>⏳</div>
                    <h2 style={{ color: '#f1f5f9' }}>Loading...</h2>
                </main>
            </div>
        );
    }

    if (!approval) {
        return null;
    }

    return (
        <div className="candidate-container" style={{ minHeight: '100vh', background: '#0f172a', color: '#e2e8f0', padding: 40 }}>
            <header style={{ marginBottom: 40, borderBottom: '1px solid #334155', paddingBottom: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div className="logo-icon" style={{ fontSize: 24 }}>🏢</div>
                    <h1 style={{ margin: 0, fontSize: 24, color: '#f8fafc' }}>Company Onboarding</h1>
                </div>
            </header>

            <main style={{ maxWidth: 600, margin: '0 auto', textAlign: 'center' }}>

                {/* Rejection Mode */}
                {approval.status === 'rejected' ? (
                    <div style={{ background: '#1e293b', border: '1px solid #ef4444', borderRadius: 12, padding: 32 }}>
                        <div style={{ fontSize: 48, marginBottom: 16 }}>❌</div>
                        <h2 style={{ color: '#ef4444', marginBottom: 12 }}>Application Rejected</h2>
                        <p style={{ color: '#cbd5e1', marginBottom: 24 }}>
                            <strong>Reason:</strong> {approval.rejectionReason || 'No reason provided'}
                        </p>
                        <p style={{ color: '#94a3b8', fontSize: 14, marginBottom: 24 }}>
                            Please review the feedback and submit a new application with the required corrections.
                        </p>
                        <button
                            onClick={handleResubmit}
                            style={{
                                background: '#ef4444',
                                border: 'none',
                                padding: '10px 24px',
                                borderRadius: 6,
                                color: 'white',
                                fontWeight: 'bold',
                                cursor: 'pointer',
                                transition: 'opacity 0.2s'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.opacity = '0.8'}
                            onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                        >
                            Submit New Application
                        </button>
                    </div>
                ) : (
                    /* Pending Mode */
                    <div style={{ background: '#1e293b', border: '1px solid #f59e0b', borderRadius: 12, padding: 32 }}>
                        <div style={{ fontSize: 48, marginBottom: 16 }}>⏳</div>
                        <h2 style={{ color: '#fbbf24', marginBottom: 12 }}>Approval Pending</h2>
                        <div className="banner-content" style={{ marginBottom: 24 }}>
                            <p style={{ color: '#e2e8f0', fontSize: 18, fontWeight: 600 }}>{approval.companyName}</p>
                            <p style={{ color: '#94a3b8' }}>Your company is under admin review.</p>
                        </div>

                        <div style={{ background: '#0f172a', borderRadius: 8, padding: 16, textAlign: 'left', marginBottom: 24 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                                <span style={{ color: '#64748b' }}>Contact:</span>
                                <span>{approval.contactPerson}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                                <span style={{ color: '#64748b' }}>Email:</span>
                                <span>{approval.contactEmail}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: '#64748b' }}>Submitted:</span>
                                <span>{new Date(approval.createdAt).toLocaleDateString()}</span>
                            </div>
                        </div>

                        <p style={{ color: '#64748b', fontSize: 13 }}>
                            We usually reply within 24 hours.
                        </p>

                        <button
                            onClick={loadApproval}
                            style={{
                                marginTop: 20,
                                background: '#334155',
                                border: 'none',
                                padding: '8px 20px',
                                borderRadius: 6,
                                color: '#e2e8f0',
                                fontSize: 13,
                                cursor: 'pointer',
                                transition: 'opacity 0.2s'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.opacity = '0.8'}
                            onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                        >
                            🔄 Refresh Status
                        </button>
                    </div>
                )}

            </main>
        </div>
    );
};

export default CompanyApprovalPendingPage;
