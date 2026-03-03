import React, { useState, useEffect } from 'react';

interface OfferLetterModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (data: OfferLetterData) => Promise<void>;
    candidate: {
        name: string;
        email: string;
    } | null;
    job: {
        title: string;
        department?: string;
        location?: string;
        jobType?: string;
        salary?: string;
    } | null;
    company: {
        name?: string;
        address?: string;
        website?: string;
        contactPerson?: string;
    } | null;
    isLoading?: boolean;
}

export interface OfferLetterData {
    content: string;
    salary: string;
    location: string;
    startDate: string;
    benefits: string;
}

const OfferLetterModal: React.FC<OfferLetterModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    candidate,
    job,
    company,
    isLoading = false
}) => {
    const [content, setContent] = useState('');
    const [salary, setSalary] = useState('');
    const [location, setLocation] = useState('');
    const [startDate, setStartDate] = useState('');
    const [benefits, setBenefits] = useState('');

    useEffect(() => {
        if (isOpen && candidate && job) {
            setContent(`We are delighted to extend an offer of employment for the position of ${job.title} at ${company?.name || 'our company'}. After careful consideration of your qualifications and interview performance, we believe you will be an excellent addition to our team.

This offer is contingent upon successful completion of background verification and reference checks. Please confirm your acceptance of this offer by responding to this email within 7 business days.

We are excited about the prospect of you joining our team and look forward to your positive response.`);
            setSalary(job.salary || '');
            setLocation(job.location || '');
            setStartDate('');
            setBenefits('');
        }
    }, [isOpen, candidate, job, company]);

    const handleConfirm = async () => {
        await onConfirm({
            content,
            salary,
            location,
            startDate,
            benefits
        });
    };

    const resetForm = () => {
        setContent('');
        setSalary('');
        setLocation('');
        setStartDate('');
        setBenefits('');
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    if (!isOpen || !candidate) return null;

    return (
        <div
            className="fixed inset-0 bg-black/85 flex items-center justify-center z-[1000] p-5 overflow-y-auto"
            onClick={handleClose}
        >
            <div
                className="bg-white rounded-xl max-w-[800px] w-full shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header - Company Branding */}
                <div className="bg-gradient-to-br from-indigo-500 to-violet-600 py-10 px-[50px] text-white shrink-0">
                    <h1 className="m-0 text-[32px] font-bold tracking-tight">
                        {company?.name || 'Company Name'}
                    </h1>
                    <p className="mt-2 text-sm opacity-90">
                        {company?.address || 'Company Address'} | {company?.website || 'www.company.com'}
                    </p>
                </div>

                {/* Letter Body - Scrollable */}
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

                    <h2 className="m-0 mb-5 text-2xl font-bold text-gray-900 border-b-4 border-indigo-500 pb-2.5">
                        Offer of Employment
                    </h2>

                    <div className="mb-5">
                        <p className="m-0 text-[15px] text-gray-700 font-semibold">
                            Dear {candidate.name},
                        </p>
                    </div>

                    {/* Editable Content */}
                    <div className="mb-5">
                        <label className="block text-xs text-gray-500 mb-2 font-semibold uppercase tracking-wider">
                            Letter Content (Editable)
                        </label>
                        <textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            rows={8}
                            className="w-full p-4 bg-gray-50 border-2 border-gray-200 rounded-lg text-gray-700 text-[15px] leading-relaxed font-sans resize-y"
                        />
                    </div>

                    {/* Position Details */}
                    <div className="bg-gray-50 border-2 border-gray-200 rounded-lg p-6 mb-5">
                        <h3 className="m-0 mb-5 text-lg text-gray-900">Position Details</h3>

                        {/* Static fields */}
                        <div className="grid grid-cols-2 gap-4 mb-5">
                            <div>
                                <label className="block text-xs text-gray-500 mb-1.5 font-semibold">Position</label>
                                <div className="py-2.5 px-3 bg-gray-200 rounded-md text-gray-700 text-sm">
                                    {job?.title}
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs text-gray-500 mb-1.5 font-semibold">Department</label>
                                <div className="py-2.5 px-3 bg-gray-200 rounded-md text-gray-700 text-sm">
                                    {job?.department || 'Engineering'}
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs text-gray-500 mb-1.5 font-semibold">Employment Type</label>
                                <div className="py-2.5 px-3 bg-gray-200 rounded-md text-gray-700 text-sm">
                                    {job?.jobType || 'Full-time'}
                                </div>
                            </div>
                        </div>

                        {/* Editable fields */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs text-gray-500 mb-1.5 font-semibold">
                                    Salary / Compensation *
                                </label>
                                <input
                                    type="text"
                                    value={salary}
                                    onChange={(e) => setSalary(e.target.value)}
                                    placeholder="e.g., $80,000 - $100,000 per year"
                                    className="w-full py-2.5 px-3 bg-white border-2 border-gray-200 rounded-md text-gray-700 text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-xs text-gray-500 mb-1.5 font-semibold">
                                    Work Location *
                                </label>
                                <input
                                    type="text"
                                    value={location}
                                    onChange={(e) => setLocation(e.target.value)}
                                    placeholder="e.g., New York, NY (Hybrid)"
                                    className="w-full py-2.5 px-3 bg-white border-2 border-gray-200 rounded-md text-gray-700 text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-xs text-gray-500 mb-1.5 font-semibold">
                                    Start Date *
                                </label>
                                <input
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    className="w-full py-2.5 px-3 bg-white border-2 border-gray-200 rounded-md text-gray-700 text-sm"
                                />
                            </div>
                        </div>

                        {/* Benefits field - full width */}
                        <div className="mt-4">
                            <label className="block text-xs text-gray-500 mb-1.5 font-semibold">
                                Benefits & Perks
                            </label>
                            <textarea
                                value={benefits}
                                onChange={(e) => setBenefits(e.target.value)}
                                placeholder="e.g., Health insurance, 401(k) with company match, Unlimited PTO, Remote work flexibility, Stock options..."
                                rows={3}
                                className="w-full py-2.5 px-3 bg-white border-2 border-gray-200 rounded-md text-gray-700 text-sm resize-y font-sans"
                            />
                        </div>
                    </div>

                    {/* Signature */}
                    <div className="mt-10">
                        <p className="m-0 font-semibold text-gray-900">Sincerely,</p>
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
                        className={`py-3 px-6 text-sm rounded-lg border-0 bg-gradient-to-br from-indigo-500 to-violet-600 text-white font-semibold shadow-md ${isLoading ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'}`}
                        onClick={handleConfirm}
                        disabled={isLoading}
                    >
                        {isLoading ? 'Sending...' : 'Send Offer Letter'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default OfferLetterModal;
