import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { companyApprovalService, type CompanyApprovalStatus } from '../../services/companyApproval.service';
import { Button } from '../../components/common';

const CompanyApprovalPendingPage = () => {
    const navigate = useNavigate();
    const [approval, setApproval] = useState<CompanyApprovalStatus | null>(null);
    const [loading, setLoading] = useState(true);

    const loadApproval = async () => {
        try {
            setLoading(true);
            const { data: response } = await companyApprovalService.getMyApproval();
            if (response) {
                setApproval(response);

                if (response.status === 'approved') {
                    navigate('/company/dashboard');
                }
            } else {
                navigate('/company/approval-form');
            }
        } catch (err) {
            console.error('Failed to load approval:', err);
            navigate('/company/approval-form');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadApproval();
    }, []);

    const handleResubmit = () => {
        navigate('/company/approval-form', {
            state: { previousApproval: approval }
        });
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0f172a] text-[#e2e8f0] p-10">
                <main style={{ maxWidth: 600, margin: '0 auto', textAlign: 'center', paddingTop: 100 }}>
                    <h2 style={{ color: '#f1f5f9' }}>Loading...</h2>
                </main>
            </div>
        );
    }

    if (!approval) {
        return null;
    }

    return (
        <div className="min-h-screen bg-[#0f172a] text-[#e2e8f0] p-10">
            <header style={{ marginBottom: 40, borderBottom: '1px solid #334155', paddingBottom: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <h1 style={{ margin: 0, fontSize: 24, color: '#f8fafc' }}>Company Onboarding</h1>
                </div>
            </header>

            <main style={{ maxWidth: 600, margin: '0 auto', textAlign: 'center' }}>

                {/* Rejection Mode */}
                {approval.status === 'rejected' ? (
                    <div style={{ background: '#1e293b', border: '1px solid #ef4444', borderRadius: 12, padding: 32 }}>
                        
                        <h2 style={{ color: '#ef4444', marginBottom: 12 }}>Application Rejected</h2>
                        <p style={{ color: '#cbd5e1', marginBottom: 24 }}>
                            <strong>Reason:</strong> {approval.rejectionReason || 'No reason provided'}
                        </p>
                        <p style={{ color: '#94a3b8', fontSize: 14, marginBottom: 24 }}>
                            Please review the feedback and submit a new application with the required corrections.
                        </p>
                        <Button
                            variant="danger"
                            onClick={handleResubmit}
                            className="py-2.5 px-6 rounded-md font-bold"
                        >
                            Submit New Application
                        </Button>
                    </div>
                ) : (
                    /* Pending Mode */
                    <div style={{ background: '#1e293b', border: '1px solid #f59e0b', borderRadius: 12, padding: 32 }}>
                        <div style={{ fontSize: 48, marginBottom: 16 }}>⏳</div>
                        <h2 style={{ color: '#fbbf24', marginBottom: 12 }}>Approval Pending</h2>
                        <div style={{ marginBottom: 24 }}>
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

                        <Button
                            variant="secondary"
                            onClick={loadApproval}
                            className="mt-5 py-2 px-5 rounded-md text-[13px]"
                        >
                             Refresh Status
                        </Button>
                    </div>
                )}

            </main>
        </div>
    );
};

export default CompanyApprovalPendingPage;
