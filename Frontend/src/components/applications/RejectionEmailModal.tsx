import React, { useState, useEffect } from 'react';

interface RejectionEmailModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (content: string) => Promise<void>;
    candidate: {
        name: string;
        email: string;
    } | null;
    job: {
        title: string;
    } | null;
    company: {
        name?: string;
        address?: string;
        website?: string;
        contactPerson?: string;
    } | null;
    isLoading?: boolean;
}

const RejectionEmailModal: React.FC<RejectionEmailModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    candidate,
    job,
    company,
    isLoading = false
}) => {
    const [content, setContent] = useState('');

    useEffect(() => {
        if (isOpen && candidate && job) {
            setContent(`Thank you for your interest in the ${job.title} position at ${company?.name || 'our company'} and for taking the time to interview with us.

After careful consideration, we have decided to move forward with other candidates whose qualifications more closely match our current needs.

We appreciate your interest and wish you the best in your job search.`);
        }
    }, [isOpen, candidate, job, company]);

    const handleConfirm = async () => {
        await onConfirm(content);
    };

    const handleClose = () => {
        setContent('');
        onClose();
    };

    if (!isOpen || !candidate) return null;

    return (
        <div
            className="fixed inset-0 bg-black/85 flex items-center justify-center z-[1000] p-5 overflow-y-auto"
            onClick={handleClose}
        >
            <div
                className="bg-white rounded-xl max-w-[700px] w-full shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header - Company Branding */}
                <div className="bg-gradient-to-br from-red-500 to-red-600 py-10 px-[50px] text-white shrink-0">
                    <h1 className="m-0 text-[32px] font-bold tracking-tight">
                        {company?.name || 'Company Name'}
                    </h1>
                    <p className="mt-2 text-sm opacity-90">
                        {company?.address || 'Company Address'} | {company?.website || 'www.company.com'}
                    </p>
                </div>

                {/* Email Body - Scrollable */}
                <div className="p-[50px] bg-white text-gray-800 overflow-y-auto flex-1">
                    {/* Date */}
                    <div className="mb-8">
                        <p className="m-0 text-sm text-gray-500">
                            {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                        </p>
                    </div>

                    {/* Recipient */}
                    <div className="mb-8">
                        <p className="m-0 text-base font-semibold text-gray-900">
                            {candidate.name}
                        </p>
                        <p className="mt-1 text-sm text-gray-500">
                            {candidate.email}
                        </p>
                    </div>

                    <h2 className="m-0 mb-5 text-2xl font-bold text-gray-900 border-b-4 border-red-500 pb-2.5">
                        Application Status Update
                    </h2>

                    <div className="mb-5">
                        <p className="m-0 text-[15px] text-gray-700 font-semibold">
                            Dear {candidate.name},
                        </p>
                    </div>

                    {/* Editable Content */}
                    <div className="mb-8">
                        <label className="block text-xs text-gray-500 mb-2 font-semibold uppercase tracking-wider">
                            Email Content (Editable)
                        </label>
                        <textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            rows={6}
                            className="w-full p-4 bg-gray-50 border-2 border-gray-200 rounded-lg text-gray-700 text-[15px] leading-relaxed font-sans resize-y"
                        />
                    </div>

                    {/* Application Details */}
                    <div className="bg-red-50 border-2 border-red-200 rounded-lg p-5 mb-8">
                        <h3 className="m-0 mb-3 text-base text-red-800">Application Details</h3>
                        <table className="w-full border-collapse">
                            <tbody>
                                <tr>
                                    <td className="py-1.5 font-semibold text-gray-500 w-[40%]">Position Applied:</td>
                                    <td className="py-1.5 text-gray-900">{job?.title}</td>
                                </tr>
                                <tr>
                                    <td className="py-1.5 font-semibold text-gray-500">Application Date:</td>
                                    <td className="py-1.5 text-gray-900">
                                        {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    {/* Signature */}
                    <div className="mt-10">
                        <p className="m-0 text-[15px] text-gray-700 leading-relaxed">
                            We wish you all the best in your future endeavors and career pursuits.
                        </p>
                        <p className="mt-5 font-semibold text-gray-900">Sincerely,</p>
                        <p className="mt-4 font-semibold text-gray-900">
                            {company?.contactPerson || 'HR Team'}
                        </p>
                        <p className="mt-1 text-sm text-gray-500">
                            {company?.name || 'Company Name'}
                        </p>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="py-6 px-[50px] bg-gray-50 border-t border-gray-200 flex gap-3 justify-end shrink-0">
                    <button
                        className="py-3 px-6 text-sm rounded-lg border border-gray-300 bg-white text-gray-700 font-semibold cursor-pointer"
                        onClick={handleClose}
                    >
                        Cancel
                    </button>
                    <button
                        className={`py-3 px-6 text-sm rounded-lg border-0 bg-gradient-to-br from-red-500 to-red-600 text-white font-semibold shadow-md ${isLoading ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'}`}
                        onClick={handleConfirm}
                        disabled={isLoading}
                    >
                        {isLoading ? 'Sending...' : 'Send Rejection Email'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RejectionEmailModal;
