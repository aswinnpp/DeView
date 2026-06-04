import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { companyApprovalService, type CompanyApprovalStatus } from '../../services/companyApproval.service';
import { Button } from '../../components/common';

const CompanyApprovalPendingPage = () => {
    const navigate = useNavigate();
    const [approval, setApproval] = useState<CompanyApprovalStatus | null>(null);
    const [loading, setLoading] = useState(true);
    const [needsApproval, setNeedsApproval] = useState(false);

    const loadApproval = useCallback(async () => {
        try {
            setLoading(true);
            setNeedsApproval(false);
            const { data: response } = await companyApprovalService.getMyApproval();
            if (response) {
                setApproval(response);

                if (response.status === 'approved') {
                    navigate('/company/dashboard');
                }
            } else {
                setNeedsApproval(true);
            }
        } catch (err: unknown) {
            const status = (err as { response?: { status?: number } })?.response?.status;
            if (status === 404) {
                setNeedsApproval(true);
            } else {
                navigate('/company/approval-form');
            }
        } finally {
            setLoading(false);
        }
    },[navigate])

    useEffect(() => {
        loadApproval();
    }, [loadApproval]);

    const handleResubmit = () => {
        navigate('/company/approval-form', {
            state: { previousApproval: approval }
        });
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0f172a] text-[#e2e8f0] p-10 max-md:p-4">
                <main className="max-w-[600px] mx-auto text-center pt-[100px] max-md:pt-16">
                    <h2 className="text-[#f1f5f9] text-lg max-md:text-base">Loading...</h2>
                </main>
            </div>
        );
    }

    if (needsApproval || !approval) {
        return (
            <div className="min-h-screen bg-[#0f172a] text-[#e2e8f0] p-10 max-md:p-4 pb-20">
                <header className="mb-10 max-md:mb-6 border-b border-[#334155] pb-5 max-md:pb-4">
                    <div className="flex items-center gap-3">
                        <h1 className="m-0 text-2xl max-md:text-xl font-bold text-[#f8fafc]">Company Onboarding</h1>
                    </div>
                </header>

                <main className="max-w-[600px] mx-auto text-center">
                    <div className="bg-[#1e293b] border border-[#6366f1] rounded-xl max-md:rounded-lg p-8 max-md:p-5">
                        <div className="text-5xl max-md:text-4xl mb-4">📋</div>
                        <h2 className="text-[#a5b4fc] mb-3 text-xl max-md:text-lg font-bold">Company Approval Needed</h2>
                        <p className="text-[#94a3b8] text-sm max-md:text-[13px] mb-6 max-md:mb-4">
                            You need to submit your company verification to get started. Complete the approval form to begin the onboarding process.
                        </p>
                        <Button
                            variant="primary"
                            onClick={() => navigate('/company/approval-form')}
                            className="w-full py-2.5 px-6 rounded-md font-bold text-sm max-md:text-[13px]"
                        >
                            Submit Approval Form
                        </Button>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0f172a] text-[#e2e8f0] p-10 max-md:p-4 pb-20">
            <header className="mb-10 max-md:mb-6 border-b border-[#334155] pb-5 max-md:pb-4">
                <div className="flex items-center gap-3">
                    <h1 className="m-0 text-2xl max-md:text-xl font-bold text-[#f8fafc]">Company Onboarding</h1>
                </div>
            </header>

            <main className="max-w-[600px] mx-auto text-center">

                {/* Rejection Mode */}
                {approval.status === 'rejected' ? (
                    <div className="bg-[#1e293b] border border-[#ef4444] rounded-xl max-md:rounded-lg p-8 max-md:p-5">
                        <h2 className="text-[#ef4444] mb-3 text-xl max-md:text-lg font-bold">Application Rejected</h2>
                        <p className="text-[#cbd5e1] mb-6 max-md:mb-4 text-sm max-md:text-[13px]">
                            <strong>Reason:</strong> {approval.rejectionReason || 'No reason provided'}
                        </p>
                        <p className="text-[#94a3b8] text-sm max-md:text-xs mb-6 max-md:mb-4">
                            Please review the feedback and submit a new application with the required corrections.
                        </p>
                        <Button
                            variant="danger"
                            onClick={handleResubmit}
                            className="w-full py-2.5 px-6 rounded-md font-bold text-sm max-md:text-[13px]"
                        >
                            Submit New Application
                        </Button>
                    </div>
                ) : (
                    /* Pending Mode */
                    <div className="bg-[#1e293b] border border-[#f59e0b] rounded-xl max-md:rounded-lg p-8 max-md:p-5">
                        <div className="text-5xl max-md:text-4xl mb-4">⏳</div>
                        <h2 className="text-[#fbbf24] mb-3 text-xl max-md:text-lg font-bold">Approval Pending</h2>
                        <div className="mb-6 max-md:mb-4">
                            <p className="text-[#e2e8f0] text-lg max-md:text-base font-semibold break-words">{approval.companyName}</p>
                            <p className="text-[#94a3b8] text-sm max-md:text-[13px] mt-1">Your company is under admin review.</p>
                        </div>

                        <div className="bg-[#0f172a] rounded-lg p-4 max-md:p-3 text-left mb-6 max-md:mb-4 space-y-3 max-md:space-y-2">
                            <div className="flex flex-col gap-0.5 sm:flex-row sm:justify-between sm:items-center sm:gap-2">
                                <span className="text-[#64748b] text-sm shrink-0">Contact:</span>
                                <span className="text-[#e2e8f0] text-sm break-words sm:text-right">{approval.contactPerson}</span>
                            </div>
                            <div className="flex flex-col gap-0.5 sm:flex-row sm:justify-between sm:items-center sm:gap-2">
                                <span className="text-[#64748b] text-sm shrink-0">Email:</span>
                                <span className="text-[#e2e8f0] text-sm break-all sm:text-right">{approval.contactEmail}</span>
                            </div>
                            <div className="flex flex-col gap-0.5 sm:flex-row sm:justify-between sm:items-center sm:gap-2">
                                <span className="text-[#64748b] text-sm shrink-0">Submitted:</span>
                                <span className="text-[#e2e8f0] text-sm sm:text-right">{new Date(approval.createdAt).toLocaleDateString()}</span>
                            </div>
                        </div>

                        <p className="text-[#64748b] text-[13px] max-md:text-xs mb-4">
                            We usually reply within 24 hours.
                        </p>

                        <Button
                            variant="secondary"
                            onClick={loadApproval}
                            className="w-full mt-5 max-md:mt-4 py-2.5 px-5 rounded-md text-[13px]"
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
