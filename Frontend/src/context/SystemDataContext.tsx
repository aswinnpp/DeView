import { createContext, useContext, useMemo, useState } from "react";
import type { ReactNode } from "react";
import type { IInterview, ICandidate } from "../types";

// Type Definitions
interface ISubscriptionPlan {
    id: string;
    name: string;
    price: string;
    duration?: string;
    status?: string;
    features: string[];
}

interface IPaymentRequest {
    id: string;
    status: string;
    createdAt: string;
    hrName: string;
    interviewerId: string;
    interviewerName: string;
    interviewerEmail: string;
    amount: number;
    note: string;
    from: string;
    paidAt?: string;
}

interface IHR {
    id: string;
    active: boolean;
}

interface IInterviewer {
    id: string;
    active: boolean;
    walletBalance?: number;
    pendingAmount?: number;
}

interface ICompanyDocumentUpload {
    fileName: string;
    fileUrl: string;
    uploadedAt: string;
    marked: boolean;
}

type ICompanyDocuments = Record<string, ICompanyDocumentUpload>;

interface ICompany {
    id: string;
    status: string;
    subscription: string;
    address: string;
    contact: string;
    contactPerson: string;
    contactPhone: string;
    taxId: string;
    employees: string;
    website: string;
    documents: ICompanyDocuments;
    rejectionReason: string;
    owner: ICompanyOwner | null;
    debugOtp?: string;
    generatedOtp?: string;
}

interface ICompanyOwner {
    id: string;
    name: string;
    email: string;
    password: string;
}

interface IJob {
    id: string;
    createdAt: string;
    applicants: IJobApplicant[];
    status: string;
}

interface IJobApplicant {
    candidateId: string;
    status: string;
    updatedAt: string;
}

interface IMail {
    id: string;
    candidateEmail: string;
    candidateName: string;
    type: 'offer' | 'rejection';
    subject: string;
    content: string;
    jobTitle: string;
    companyName: string;
    sentAt: string;
    read: boolean;
    jobId?: string;
    hrName?: string;
    offerDetails?: {
        position: string;
        salary: string;
        startDate: string;
        location: string;
        benefits?: string[];
    };
    status?: 'pending' | 'accepted' | 'rejected' | 'counter_sent';
    counterDetails?: {
        expectedSalary: string;
        preferredStartDate: string;
        preferredLocation: string;
        additionalNotes: string;
        submittedAt: string;
    };
}

interface ISystemDataContextType {
    hrs: IHR[];
    interviews: IInterview[];
    interviewers: IInterviewer[];
    candidates: ICandidate[];
    paymentRequests: IPaymentRequest[];
    companies: ICompany[];
    jobs: IJob[];
    subscriptionPlans: ISubscriptionPlan[];
    mails: IMail[];
    addHr: (hr: IHR) => void;
    toggleInterviewerActive: (id: string) => void;
    addInterviewer: (interviewer: IInterviewer) => void;
    toggleHrActive: (id: string) => void;
    toggleCandidateActive: (id: string) => void;
    createPaymentRequest: (payload: Partial<IPaymentRequest>) => void;
    markPaymentRequestPaid: (id: string) => void;
    registerCompany: (companyData: Partial<ICompany>) => ICompany;
    updateCompany: (id: string, updates: Partial<ICompany>) => void;
    markCompanyPendingApproval: (id: string) => void;
    adminApproveCompanyInline: (id: string) => void;
    adminRejectCompanyInline: (id: string, reason: string) => void;
    subscribeCompany: (id: string, plan: string) => void;
    upsertSubscriptionPlan: (plan: ISubscriptionPlan) => void;
    attachCompanyOwnerCredentials: (id: string, ownerPayload: Partial<ICompanyOwner> & { name: string; email: string; password: string }) => void;
    createJob: (jobData: Partial<IJob>) => IJob;
    updateJob: (id: string, updates: Partial<IJob>) => void;
    deleteJob: (id: string) => void;
    updateCandidate: (id: string, updates: Partial<ICandidate>) => void;
    updateJobApplicantStatus: (jobId: string, candidateId: string, status: string) => void;
    scheduleInterviewForApplicant: (jobId: string, candidateId: string, details: Partial<IInterview> & { candidateName: string }) => void;
    markMailAsRead: (mailId: string) => void;
    sendCounterOffer: (mailId: string, counterDetails: IMail['counterDetails']) => void;
    acceptOffer: (mailId: string) => void;
    rejectOffer: (mailId: string) => void;
}

const SystemDataContext = createContext<ISystemDataContextType | null>(null);

interface ISystemDataProviderProps {
    children: ReactNode;
}

export const SystemDataProvider = ({ children }: ISystemDataProviderProps) => {
    const [hrs, setHrs] = useState<IHR[]>([]);
    const [interviews, setInterviews] = useState<IInterview[]>([]);
    const [interviewers, setInterviewers] = useState<IInterviewer[]>([]);
    const [candidates, setCandidates] = useState<ICandidate[]>([]);
    const [companies, setCompanies] = useState<ICompany[]>([]);
    const [jobs, setJobs] = useState<IJob[]>([]);
    const [subscriptionPlans, setSubscriptionPlans] = useState<ISubscriptionPlan[]>([
        { id: "plan-free", name: "Free", price: "₹0", features: ["Basic access"] },
        { id: "plan-pro", name: "Pro", price: "₹9,999", features: ["Priority support", "More jobs"] },
        { id: "plan-enterprise", name: "Enterprise", price: "Custom", features: ["Custom SLA", "Dedicated CSM"] },
    ]);

    const [paymentRequests, setPaymentRequests] = useState<IPaymentRequest[]>([]);

    // Initialize mails with current user's email from localStorage
    const getUserEmail = () => localStorage.getItem('userEmail') || 'candidate@example.com';
    const getUserName = () => localStorage.getItem('userName') || 'Candidate';

    const [mails, setMails] = useState<IMail[]>([
        {
            id: 'mail-1',
            candidateEmail: getUserEmail(),
            candidateName: getUserName(),
            type: 'offer',
            subject: 'Job Offer - Senior Frontend Developer',
            content: `Dear ${getUserName()},\n\nWe are pleased to offer you the position of Senior Frontend Developer at TechCorp Solutions.\n\nAfter careful consideration of your qualifications and interview performance, we believe you would be an excellent addition to our team.\n\nPlease review the offer details below and respond within 7 days.\n\nBest regards,\nHR Team`,
            jobTitle: 'Senior Frontend Developer',
            companyName: 'TechCorp Solutions',
            sentAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            read: false,
            hrName: 'Sarah Johnson',
            offerDetails: {
                position: 'Senior Frontend Developer',
                salary: '₹18-22 LPA',
                startDate: 'January 15, 2026',
                location: 'Bangalore, Karnataka',
                benefits: ['Health Insurance', 'Flexible work hours', 'Professional development budget', 'Stock options']
            }
        },
        {
            id: 'mail-2',
            candidateEmail: getUserEmail(),
            candidateName: getUserName(),
            type: 'rejection',
            subject: 'Application Status - Backend Developer Position',
            content: `Dear ${getUserName()},\n\nThank you for your interest in the Backend Developer position at InnovateTech.\n\nAfter careful consideration, we have decided to move forward with other candidates whose experience more closely aligns with our current needs.\n\nWe wish you the best in your job search.\n\nBest regards,\nRecruitment Team`,
            jobTitle: 'Backend Developer',
            companyName: 'InnovateTech',
            sentAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
            read: true,
            hrName: 'Michael Chen'
        }
    ]);

    // HR Actions
    const addHr = (hr: IHR) => {
        setHrs((prev) => [hr, ...prev]);
    };

    const toggleHrActive = (id: string) => {
        setHrs((prev) =>
            prev.map((hr) =>
                hr.id === id ? { ...hr, active: !hr.active } : hr
            )
        );
    };

    // Interviewer Actions
    const toggleInterviewerActive = (id: string) => {
        setInterviewers((prev) =>
            prev.map((intv) =>
                intv.id === id ? { ...intv, active: !intv.active } : intv
            )
        );
    };

    const addInterviewer = (interviewer: IInterviewer) => {
        setInterviewers((prev) => [interviewer, ...prev]);
    };

    // Candidate Actions
    const toggleCandidateActive = (id: string) => {
        setCandidates((prev) =>
            prev.map((cand) =>
                cand.id === id ? { ...cand, active: !cand.active } : cand
            )
        );
    };

    // Payment Actions
    const createPaymentRequest = (payload: Partial<IPaymentRequest>) => {
        setPaymentRequests((prev) => [
            {
                id: `req-${Date.now()}`,
                status: "pending",
                createdAt: new Date().toISOString(),
                hrName: "",
                interviewerId: "",
                interviewerName: "",
                interviewerEmail: "",
                amount: 0,
                note: "",
                from: "",
                ...payload,
            },
            ...prev,
        ]);
    };

    const markPaymentRequestPaid = (id: string) => {
        setPaymentRequests((prev) =>
            prev.map((req) =>
                req.id === id ? { ...req, status: "paid", paidAt: new Date().toISOString() } : req
            )
        );

        setInterviewers((prev) =>
            prev.map((intv) => {
                const req = paymentRequests.find((r) => r.id === id);
                if (!req || intv.id !== req.interviewerId) return intv;
                const amount = Number(req.amount) || 0;
                return {
                    ...intv,
                    walletBalance: (intv.walletBalance || 0) + amount,
                    pendingAmount: Math.max(0, (intv.pendingAmount || 0) - amount),
                };
            })
        );
    };

    // Company Actions
    const registerCompany = (companyData: Partial<ICompany>): ICompany => {
        const newCompany: ICompany = {
            id: `comp-${Date.now()}`,
            status: "profile_incomplete",
            subscription: "none",
            address: "",
            contact: "",
            contactPerson: "",
            contactPhone: "",
            taxId: "",
            employees: "",
            website: "",
            documents: {},
            rejectionReason: "",
            owner: null,
            debugOtp: companyData.debugOtp || companyData.generatedOtp || "",
            ...companyData
        };
        setCompanies(prev => [newCompany, ...prev]);
        return newCompany;
    };

    const updateCompany = (id: string, updates: Partial<ICompany>) => {
        setCompanies(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
    };

    const markCompanyPendingApproval = (id: string) => {
        updateCompany(id, { status: "pending_approval", rejectionReason: "" });
    };

    const adminApproveCompanyInline = (id: string) => {
        updateCompany(id, { status: "approved", rejectionReason: "" });
    };

    const adminRejectCompanyInline = (id: string, reason: string) => {
        updateCompany(id, { status: "rejected", rejectionReason: reason });
    };

    const subscribeCompany = (id: string, plan: string) => {
        updateCompany(id, { subscription: plan });
    };

    const upsertSubscriptionPlan = (plan: ISubscriptionPlan) => {
        setSubscriptionPlans((prev) => {
            const existing = prev.find((p) => p.id === plan.id);
            if (!existing) {
                return [...prev, { ...plan }];
            }
            return prev.map((p) => (p.id === plan.id ? { ...p, ...plan } : p));
        });
    };

    const attachCompanyOwnerCredentials = (id: string, ownerPayload: Partial<ICompanyOwner> & { name: string; email: string; password: string }) => {
        updateCompany(id, {
            owner: {
                id: ownerPayload.id || `owner-${Date.now()}`,
                name: ownerPayload.name,
                email: ownerPayload.email,
                password: ownerPayload.password,
            }
        });
    };

    // Job Actions
    const createJob = (jobData: Partial<IJob>): IJob => {
        const newJob: IJob = {
            id: `job-${Date.now()}`,
            createdAt: new Date().toISOString(),
            applicants: [],
            status: "OPEN",
            ...jobData
        };
        setJobs(prev => [newJob, ...prev]);
        return newJob;
    };

    const updateJob = (id: string, updates: Partial<IJob>) => {
        setJobs(prev => prev.map(j => j.id === id ? { ...j, ...updates } : j));
    };

    const deleteJob = (id: string) => {
        setJobs(prev => prev.filter(j => j.id !== id));
    };

    const updateJobApplicantStatus = (jobId: string, candidateId: string, status: string) => {
        const stage = status;
        setJobs(prev =>
            prev.map(job => {
                if (job.id !== jobId) return job;
                return {
                    ...job,
                    applicants: (job.applicants || []).map(app =>
                        app.candidateId === candidateId
                            ? { ...app, status: stage, updatedAt: new Date().toISOString() }
                            : app
                    )
                };
            })
        );

        setCandidates(prev =>
            prev.map(candidate =>
                candidate.id === candidateId ? { ...candidate, status: stage } : candidate
            )
        );
    };

    const scheduleInterviewForApplicant = (jobId: string, candidateId: string, details: Partial<IInterview> & { candidateName: string }) => {
        const newInterview: IInterview = {
            id: `int-${Date.now()}`,
            hrName: details.hrName || "HR Partner",
            interviewerName: details.interviewerName || "Interviewer TBD",
            candidateName: details.candidateName,
            candidateId,
            scheduledAt: details.scheduledAt || new Date().toISOString(),
            jd: details.jd || "Interview slot",
            jobId
        };

        setInterviews(prev => [newInterview, ...prev]);
    };

    const updateCandidate = (id: string, updates: Partial<ICandidate>) => {
        setCandidates((prev) =>
            prev.map((cand) => (cand.id === id ? { ...cand, ...updates } : cand))
        );
    };

    // Mail Actions
    const markMailAsRead = (mailId: string) => {
        setMails(prev => prev.map(mail =>
            mail.id === mailId ? { ...mail, read: true } : mail
        ));
    };

    const sendCounterOffer = (mailId: string, counterDetails: IMail['counterDetails']) => {
        setMails(prev => prev.map(mail =>
            mail.id === mailId ? {
                ...mail,
                status: 'counter_sent',
                counterDetails: {
                    ...counterDetails!,
                    submittedAt: new Date().toISOString()
                }
            } : mail
        ));
    };

    const acceptOffer = (mailId: string) => {
        setMails(prev => prev.map(mail =>
            mail.id === mailId ? { ...mail, status: 'accepted' } : mail
        ));
    };

    const rejectOffer = (mailId: string) => {
        setMails(prev => prev.map(mail =>
            mail.id === mailId ? { ...mail, status: 'rejected' } : mail
        ));
    };

    const value = useMemo(
        () => ({
            hrs,
            interviews,
            interviewers,
            candidates,
            paymentRequests,
            companies,
            jobs,
            subscriptionPlans,
            addHr,
            toggleInterviewerActive,
            addInterviewer,
            toggleHrActive,
            toggleCandidateActive,
            createPaymentRequest,
            markPaymentRequestPaid,
            registerCompany,
            updateCompany,
            markCompanyPendingApproval,
            adminApproveCompanyInline,
            adminRejectCompanyInline,
            subscribeCompany,
            upsertSubscriptionPlan,
            attachCompanyOwnerCredentials,
            createJob,
            updateJob,
            deleteJob,
            updateCandidate,
            updateJobApplicantStatus,
            scheduleInterviewForApplicant,
            mails,
            markMailAsRead,
            sendCounterOffer,
            acceptOffer,
            rejectOffer
        }),
        [hrs, interviews, interviewers, candidates, paymentRequests, companies, jobs, subscriptionPlans, mails]
    );

    return <SystemDataContext.Provider value={value}>{children}</SystemDataContext.Provider>;
};

export const useSystemData = (): ISystemDataContextType => {
    const ctx = useContext(SystemDataContext);
    if (!ctx) {
        throw new Error("useSystemData must be used within a SystemDataProvider");
    }
    return ctx;
};
