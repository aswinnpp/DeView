import { useState } from "react";

import OfferLetterModal from "../../components/applications/OfferLetterModal";
import RejectionEmailModal from "../../components/applications/RejectionEmailModal";
import Button from "../../components/common/Button";
import Table from "../../components/common/Table";
import SearchInput from "../../components/common/SearchInput";
import Input from "../../components/common/Input";
import { useApplication, COMPANY_PLACEHOLDER } from "../../hooks/application/useApplication";

// ==================== TYPE DEFINITIONS ====================
interface Job {
    id: string;
    title: string;
    location: string;
    type: string;
    status: string;
    description?: string;
    requirements?: string;
    applicantCount?: number;
    department?: string;
    salary?: string;
    jobType?: string;
}

interface AvailableSlot {
    id: string;
    interviewerId: string;
    date: string;
    startTime: string;
    endTime: string;
    duration: number;
    status: string;
    interviewerName?: string;
    interviewerEmail?: string;
}

interface Interviewer {
    id: string;
    name: string;
    email: string;
    specialization: string;
    rating: number;
    availability: string;
    completedInterviews: number;
    aiScore?: number;
    slots?: AvailableSlot[];
}

interface CompletedRound {
    roundName: string;
    interviewer: string;
    date: string;
    score: number;
    result: 'PASSED' | 'FAILED';
    feedback: string;
}

interface Candidate {
    id: string;
    applicationId: string;
    jobId: string;
    candidateId: string;
    name: string;
    email: string;
    phone: string;
    location: string;
    experience: string;
    education: string;
    skills: string;
    status: 'PENDING' | 'SHORTLISTED' | 'INTERVIEW_SCHEDULED' | 'INTERVIEW_COMPLETE' | 'HIRED' | 'REJECTED' | 'RESCHEDULE_REQUESTED';
    appliedDate: string;
    resume: string | null;
    coverLetter: string | null;
    aiScore: number;
    currentRound?: string;
    completedRounds?: CompletedRound[];
    interviewDetails?: {
        interviewer: string;
        interviewerEmail: string;
        scheduledDate: string;
        scheduledTime: string;
        round: string;
        meetingLink: string;
    };
    // Reschedule request fields
    rescheduleRequest?: {
        originalDate: string;
        originalTime: string;
        requestedDate: string;
        requestedTime: string;
        reason: string;
        requestedAt: string;
    };
    // Extended profile fields
    title?: string;
    currentCompany?: string;
    currentSalary?: string;
    bio?: string;
    expectedSalary?: string;
    noticePeriod?: string;
    preferredWorkMode?: string;
    preferredJobType?: string;
    willingToRelocate?: boolean;
    skillsArray?: string[];
    languages?: string[];
    university?: string;
    graduationYear?: string;
    linkedinUrl?: string;
    githubUrl?: string;
    dateOfBirth?: string;
    resumeUrl?: string;
}

interface InterviewerWithSlots {
    interviewerId: string;
    name: string;
    email: string;
    totalSlots: number;
    slots: AvailableSlot[];
}

type WorkflowTab = 'PENDING' | 'SHORTLISTED' | 'INTERVIEW_ATTENDEES' | 'INTERVIEW_COMPLETE' | 'HIRED' | 'REJECTED' | 'RESCHEDULE_REQUESTS';

// ==================== DUMMY DATA ====================
const dummyJobs: Job[] = [
    {
        id: 'job-001',
        title: 'Senior Frontend Developer',
        location: 'Bangalore, Karnataka',
        type: 'Full-time',
        status: 'OPEN',
        department: 'Engineering',
        salary: '₹18-25 LPA',
        jobType: 'Full-time',
        applicantCount: 9
    },
    {
        id: 'job-002',
        title: 'Backend Engineer',
        location: 'Hyderabad, Telangana',
        type: 'Full-time',
        status: 'OPEN',
        department: 'Engineering',
        salary: '₹12-18 LPA',
        jobType: 'Full-time',
        applicantCount: 6
    },
    {
        id: 'job-003',
        title: 'DevOps Engineer',
        location: 'Pune, Maharashtra',
        type: 'Contract',
        status: 'OPEN',
        department: 'Infrastructure',
        salary: '₹20-28 LPA',
        jobType: 'Contract',
        applicantCount: 3
    }
];

const dummyInterviewers: Interviewer[] = [
    {
        id: 'int-001', name: 'John Smith', email: 'john.smith@company.com', specialization: 'Frontend Development', rating: 4.8, availability: 'Available', completedInterviews: 45, aiScore: 95,
        slots: [
            { id: 'slot-001', date: '2026-01-28', startTime: '09:00', endTime: '10:00', duration: 60, status: 'available', interviewerId: 'int-001', interviewerName: 'John Smith', interviewerEmail: 'john.smith@company.com' },
            { id: 'slot-002', date: '2026-01-28', startTime: '11:00', endTime: '12:00', duration: 60, status: 'available', interviewerId: 'int-001', interviewerName: 'John Smith', interviewerEmail: 'john.smith@company.com' },
            { id: 'slot-003', date: '2026-01-28', startTime: '14:00', endTime: '15:00', duration: 60, status: 'available', interviewerId: 'int-001', interviewerName: 'John Smith', interviewerEmail: 'john.smith@company.com' },
            { id: 'slot-004', date: '2026-01-29', startTime: '10:00', endTime: '11:00', duration: 60, status: 'available', interviewerId: 'int-001', interviewerName: 'John Smith', interviewerEmail: 'john.smith@company.com' },
            { id: 'slot-005', date: '2026-01-29', startTime: '15:00', endTime: '16:00', duration: 60, status: 'available', interviewerId: 'int-001', interviewerName: 'John Smith', interviewerEmail: 'john.smith@company.com' },
        ]
    },
    {
        id: 'int-002', name: 'Sarah Thompson', email: 'sarah.thompson@company.com', specialization: 'System Design', rating: 4.7, availability: 'Available', completedInterviews: 38, aiScore: 88,
        slots: [
            { id: 'slot-006', date: '2026-01-28', startTime: '10:00', endTime: '11:00', duration: 60, status: 'available', interviewerId: 'int-002', interviewerName: 'Sarah Thompson', interviewerEmail: 'sarah.thompson@company.com' },
            { id: 'slot-007', date: '2026-01-28', startTime: '14:00', endTime: '15:00', duration: 60, status: 'available', interviewerId: 'int-002', interviewerName: 'Sarah Thompson', interviewerEmail: 'sarah.thompson@company.com' },
            { id: 'slot-008', date: '2026-01-30', startTime: '09:00', endTime: '10:00', duration: 60, status: 'available', interviewerId: 'int-002', interviewerName: 'Sarah Thompson', interviewerEmail: 'sarah.thompson@company.com' },
            { id: 'slot-009', date: '2026-01-30', startTime: '11:00', endTime: '12:00', duration: 60, status: 'available', interviewerId: 'int-002', interviewerName: 'Sarah Thompson', interviewerEmail: 'sarah.thompson@company.com' },
        ]
    },
    {
        id: 'int-003', name: 'Mike Johnson', email: 'mike.johnson@company.com', specialization: 'Backend Development', rating: 4.9, availability: 'Busy', completedInterviews: 62, aiScore: 92,
        slots: [
            { id: 'slot-010', date: '2026-01-29', startTime: '09:00', endTime: '10:00', duration: 60, status: 'available', interviewerId: 'int-003', interviewerName: 'Mike Johnson', interviewerEmail: 'mike.johnson@company.com' },
            { id: 'slot-011', date: '2026-01-29', startTime: '16:00', endTime: '17:00', duration: 60, status: 'available', interviewerId: 'int-003', interviewerName: 'Mike Johnson', interviewerEmail: 'mike.johnson@company.com' },
        ]
    },
    {
        id: 'int-004', name: 'Emily Davis', email: 'emily.davis@company.com', specialization: 'HR Screening', rating: 4.6, availability: 'Available', completedInterviews: 120, aiScore: 78,
        slots: [
            { id: 'slot-012', date: '2026-01-28', startTime: '09:00', endTime: '09:30', duration: 30, status: 'available', interviewerId: 'int-004', interviewerName: 'Emily Davis', interviewerEmail: 'emily.davis@company.com' },
            { id: 'slot-013', date: '2026-01-28', startTime: '10:00', endTime: '10:30', duration: 30, status: 'available', interviewerId: 'int-004', interviewerName: 'Emily Davis', interviewerEmail: 'emily.davis@company.com' },
            { id: 'slot-014', date: '2026-01-28', startTime: '11:00', endTime: '11:30', duration: 30, status: 'available', interviewerId: 'int-004', interviewerName: 'Emily Davis', interviewerEmail: 'emily.davis@company.com' },
            { id: 'slot-015', date: '2026-01-29', startTime: '14:00', endTime: '14:30', duration: 30, status: 'available', interviewerId: 'int-004', interviewerName: 'Emily Davis', interviewerEmail: 'emily.davis@company.com' },
            { id: 'slot-016', date: '2026-01-29', startTime: '15:00', endTime: '15:30', duration: 30, status: 'available', interviewerId: 'int-004', interviewerName: 'Emily Davis', interviewerEmail: 'emily.davis@company.com' },
            { id: 'slot-017', date: '2026-01-30', startTime: '10:00', endTime: '10:30', duration: 30, status: 'available', interviewerId: 'int-004', interviewerName: 'Emily Davis', interviewerEmail: 'emily.davis@company.com' },
        ]
    },
    {
        id: 'int-005', name: 'David Wilson', email: 'david.wilson@company.com', specialization: 'Technical Assessment', rating: 4.5, availability: 'Available', completedInterviews: 28, aiScore: 85,
        slots: [
            { id: 'slot-018', date: '2026-01-28', startTime: '13:00', endTime: '14:00', duration: 60, status: 'available', interviewerId: 'int-005', interviewerName: 'David Wilson', interviewerEmail: 'david.wilson@company.com' },
            { id: 'slot-019', date: '2026-01-28', startTime: '15:00', endTime: '16:00', duration: 60, status: 'available', interviewerId: 'int-005', interviewerName: 'David Wilson', interviewerEmail: 'david.wilson@company.com' },
            { id: 'slot-020', date: '2026-01-31', startTime: '09:00', endTime: '10:00', duration: 60, status: 'available', interviewerId: 'int-005', interviewerName: 'David Wilson', interviewerEmail: 'david.wilson@company.com' },
            { id: 'slot-021', date: '2026-01-31', startTime: '11:00', endTime: '12:00', duration: 60, status: 'available', interviewerId: 'int-005', interviewerName: 'David Wilson', interviewerEmail: 'david.wilson@company.com' },
        ]
    },
];

const dummyCandidates: Candidate[] = [
    // PENDING (3) - with full profile details
    {
        id: 'cand-001', applicationId: 'app-001', jobId: 'job-001', candidateId: 'c-001',
        name: 'Priya Sharma', email: 'priya.sharma@email.com', phone: '+91-9876543210', location: 'Bangalore',
        experience: '5 years', education: 'B.Tech Computer Science', skills: 'React, TypeScript, Node.js',
        status: 'PENDING', appliedDate: '2026-01-20', resume: 'resume.pdf', coverLetter: 'Cover letter content', aiScore: 85,
        // Extended profile
        title: 'Senior Frontend Developer',
        currentCompany: 'TCS Digital',
        currentSalary: '₹18 LPA',
        bio: 'Passionate frontend developer with 5 years of experience in building scalable web applications. Expertise in React ecosystem and modern JavaScript frameworks.',
        expectedSalary: '₹25 LPA',
        noticePeriod: '2 months',
        preferredWorkMode: 'Hybrid',
        preferredJobType: 'Full-time',
        willingToRelocate: true,
        skillsArray: ['React', 'TypeScript', 'Node.js', 'Next.js', 'GraphQL', 'TailwindCSS'],
        languages: ['English', 'Hindi', 'Kannada'],
        university: 'IIT Delhi',
        graduationYear: '2019',
        linkedinUrl: 'https://linkedin.com/in/priyasharma',
        githubUrl: 'https://github.com/priyasharma',
        dateOfBirth: '1997-05-15',
        resumeUrl: '/uploads/resumes/priya-sharma-resume.pdf'
    },
    {
        id: 'cand-002', applicationId: 'app-002', jobId: 'job-001', candidateId: 'c-002',
        name: 'Rahul Verma', email: 'rahul.verma@email.com', phone: '+91-9123456789', location: 'Mumbai',
        experience: '3 years', education: 'MCA', skills: 'Node.js, Python, MongoDB',
        status: 'PENDING', appliedDate: '2026-01-21', resume: null, coverLetter: null, aiScore: 72,
        title: 'Backend Developer',
        currentCompany: 'Infosys',
        currentSalary: '₹12 LPA',
        bio: 'Backend developer specializing in Node.js and Python. Experience with microservices architecture and NoSQL databases.',
        expectedSalary: '₹18 LPA',
        noticePeriod: '1 month',
        preferredWorkMode: 'Remote',
        preferredJobType: 'Full-time',
        willingToRelocate: false,
        skillsArray: ['Node.js', 'Python', 'MongoDB', 'Express.js', 'PostgreSQL'],
        languages: ['English', 'Hindi', 'Marathi'],
        university: 'Mumbai University',
        graduationYear: '2021'
    },
    {
        id: 'cand-003', applicationId: 'app-003', jobId: 'job-002', candidateId: 'c-003',
        name: 'Sneha Patel', email: 'sneha.patel@email.com', phone: '+91-8765432109', location: 'Pune',
        experience: '4 years', education: 'B.E. Information Technology', skills: 'AWS, Kubernetes, Terraform',
        status: 'PENDING', appliedDate: '2026-01-22', resume: 'resume.pdf', coverLetter: null, aiScore: 91,
        title: 'DevOps Engineer',
        currentCompany: 'Wipro',
        currentSalary: '₹15 LPA',
        bio: 'DevOps engineer with strong expertise in cloud infrastructure and container orchestration. AWS certified professional.',
        expectedSalary: '₹22 LPA',
        noticePeriod: '3 months',
        preferredWorkMode: 'On-site',
        preferredJobType: 'Full-time',
        willingToRelocate: true,
        skillsArray: ['AWS', 'Kubernetes', 'Terraform', 'Docker', 'Jenkins', 'Ansible'],
        languages: ['English', 'Hindi', 'Gujarati'],
        university: 'Pune University',
        graduationYear: '2020',
        linkedinUrl: 'https://linkedin.com/in/snehapatel',
        githubUrl: 'https://github.com/snehapatel',
        dateOfBirth: '1998-09-22',
        resumeUrl: '/uploads/resumes/sneha-patel-resume.pdf'
    },

    // SHORTLISTED (3)
    { id: 'cand-004', applicationId: 'app-004', jobId: 'job-001', candidateId: 'c-004', name: 'Amit Kumar', email: 'amit.kumar@email.com', phone: '+91-9988776655', location: 'Hyderabad', experience: '6 years', education: 'M.Tech Software Engineering', skills: 'React, Vue.js, GraphQL', status: 'SHORTLISTED', appliedDate: '2026-01-18', resume: 'resume.pdf', coverLetter: 'Cover letter', aiScore: 88 },
    { id: 'cand-005', applicationId: 'app-005', jobId: 'job-002', candidateId: 'c-005', name: 'Kavitha Menon', email: 'kavitha.menon@email.com', phone: '+91-8877665544', location: 'Chennai', experience: '5 years', education: 'B.Tech CS', skills: 'Java, Spring Boot, PostgreSQL', status: 'SHORTLISTED', appliedDate: '2026-01-17', resume: 'resume.pdf', coverLetter: null, aiScore: 82 },
    { id: 'cand-006', applicationId: 'app-006', jobId: 'job-003', candidateId: 'c-006', name: 'Vikram Singh', email: 'vikram.singh@email.com', phone: '+91-7766554433', location: 'Delhi NCR', experience: '7 years', education: 'B.Tech + MBA', skills: 'Docker, Kubernetes, CI/CD', status: 'SHORTLISTED', appliedDate: '2026-01-16', resume: 'resume.pdf', coverLetter: 'Cover letter', aiScore: 94 },

    // INTERVIEW_SCHEDULED (3) - Interview Attendees
    {
        id: 'cand-007', applicationId: 'app-007', jobId: 'job-001', candidateId: 'c-007', name: 'Ananya Reddy', email: 'ananya.reddy@email.com', phone: '+91-6655443322', location: 'Bangalore', experience: '5 years', education: 'B.Tech CS', skills: 'React, Next.js, TypeScript', status: 'INTERVIEW_SCHEDULED', appliedDate: '2026-01-10', resume: 'resume.pdf', coverLetter: null, aiScore: 89,
        currentRound: 'Technical Round 2',
        completedRounds: [
            { roundName: 'HR Screening', interviewer: 'Emily Davis', date: '2026-01-15', score: 4.2, result: 'PASSED', feedback: 'Excellent communication skills.' },
            { roundName: 'Technical Round 1', interviewer: 'John Smith', date: '2026-01-18', score: 4.5, result: 'PASSED', feedback: 'Strong React fundamentals.' }
        ],
        interviewDetails: { interviewer: 'Mike Johnson', interviewerEmail: 'mike.johnson@company.com', scheduledDate: '2026-01-27', scheduledTime: '11:00 AM', round: 'Technical Round 2', meetingLink: 'https://meet.google.com/abc-def' }
    },
    {
        id: 'cand-008', applicationId: 'app-008', jobId: 'job-002', candidateId: 'c-008', name: 'Rohan Gupta', email: 'rohan.gupta@email.com', phone: '+91-5544332211', location: 'Noida', experience: '4 years', education: 'MCA', skills: 'Python, Django, AWS', status: 'INTERVIEW_SCHEDULED', appliedDate: '2026-01-08', resume: 'resume.pdf', coverLetter: 'Cover letter', aiScore: 78,
        currentRound: 'System Design Round',
        completedRounds: [
            { roundName: 'HR Screening', interviewer: 'Emily Davis', date: '2026-01-12', score: 4.0, result: 'PASSED', feedback: 'Good attitude.' },
            { roundName: 'Coding Test', interviewer: 'David Wilson', date: '2026-01-16', score: 4.3, result: 'PASSED', feedback: 'Solved 3/4 problems.' }
        ],
        interviewDetails: { interviewer: 'Sarah Thompson', interviewerEmail: 'sarah.thompson@company.com', scheduledDate: '2026-01-27', scheduledTime: '2:30 PM', round: 'System Design Round', meetingLink: 'https://meet.google.com/xyz-uvw' }
    },
    {
        id: 'cand-009', applicationId: 'app-009', jobId: 'job-003', candidateId: 'c-009', name: 'Meera Nair', email: 'meera.nair@email.com', phone: '+91-4433221100', location: 'Kochi', experience: '6 years', education: 'B.E. Electronics', skills: 'GCP, Docker, GitLab CI', status: 'INTERVIEW_SCHEDULED', appliedDate: '2026-01-05', resume: 'resume.pdf', coverLetter: null, aiScore: 92,
        currentRound: 'Final Round',
        completedRounds: [
            { roundName: 'HR Screening', interviewer: 'Emily Davis', date: '2026-01-08', score: 4.5, result: 'PASSED', feedback: 'Excellent communication.' },
            { roundName: 'Technical Assessment', interviewer: 'David Wilson', date: '2026-01-12', score: 4.7, result: 'PASSED', feedback: 'Outstanding DevOps knowledge.' }
        ],
        interviewDetails: { interviewer: 'Director James', interviewerEmail: 'james@company.com', scheduledDate: '2026-01-27', scheduledTime: '4:00 PM', round: 'Final Round', meetingLink: 'https://zoom.us/j/123456789' }
    },

    // INTERVIEW_COMPLETE (3)
    {
        id: 'cand-010', applicationId: 'app-010', jobId: 'job-001', candidateId: 'c-010', name: 'Arjun Malhotra', email: 'arjun.malhotra@email.com', phone: '+91-9876123456', location: 'Gurgaon', experience: '7 years', education: 'B.Tech NIT', skills: 'React, Angular, TypeScript', status: 'INTERVIEW_COMPLETE', appliedDate: '2026-01-02', resume: 'resume.pdf', coverLetter: 'Cover letter', aiScore: 95,
        completedRounds: [
            { roundName: 'HR Screening', interviewer: 'Emily Davis', date: '2026-01-05', score: 4.3, result: 'PASSED', feedback: 'Professional demeanor.' },
            { roundName: 'Technical Round 1', interviewer: 'John Smith', date: '2026-01-08', score: 4.6, result: 'PASSED', feedback: 'Excellent coding skills.' },
            { roundName: 'System Design', interviewer: 'Sarah Thompson', date: '2026-01-12', score: 4.4, result: 'PASSED', feedback: 'Good system design approach.' },
            { roundName: 'Final Round', interviewer: 'VP Engineering', date: '2026-01-15', score: 4.7, result: 'PASSED', feedback: 'Strong candidate. Recommended for offer.' }
        ]
    },
    {
        id: 'cand-011', applicationId: 'app-011', jobId: 'job-002', candidateId: 'c-011', name: 'Deepika Iyer', email: 'deepika.iyer@email.com', phone: '+91-8765987654', location: 'Bangalore', experience: '5 years', education: 'M.Tech', skills: 'Java, Kotlin, Spring Boot', status: 'INTERVIEW_COMPLETE', appliedDate: '2026-01-03', resume: 'resume.pdf', coverLetter: null, aiScore: 88,
        completedRounds: [
            { roundName: 'HR Screening', interviewer: 'Emily Davis', date: '2026-01-06', score: 4.1, result: 'PASSED', feedback: 'Good communication.' },
            { roundName: 'Coding Test', interviewer: 'David Wilson', date: '2026-01-09', score: 4.8, result: 'PASSED', feedback: 'Perfect score!' },
            { roundName: 'Technical Round', interviewer: 'Mike Johnson', date: '2026-01-13', score: 4.5, result: 'PASSED', feedback: 'Strong technical fundamentals.' }
        ]
    },
    {
        id: 'cand-012', applicationId: 'app-012', jobId: 'job-003', candidateId: 'c-012', name: 'Karthik Rajan', email: 'karthik.rajan@email.com', phone: '+91-7654876543', location: 'Chennai', experience: '8 years', education: 'B.E. + Cloud Certs', skills: 'AWS, Azure, Terraform', status: 'INTERVIEW_COMPLETE', appliedDate: '2026-01-01', resume: 'resume.pdf', coverLetter: 'Cover letter', aiScore: 84,
        completedRounds: [
            { roundName: 'HR Screening', interviewer: 'Emily Davis', date: '2026-01-04', score: 4.0, result: 'PASSED', feedback: 'Mature candidate.' },
            { roundName: 'Technical Assessment', interviewer: 'David Wilson', date: '2026-01-07', score: 4.2, result: 'PASSED', feedback: 'Solid DevOps knowledge.' }
        ]
    },

    // HIRED (3)
    {
        id: 'cand-013', applicationId: 'app-013', jobId: 'job-001', candidateId: 'c-013', name: 'Neha Saxena', email: 'neha.saxena@email.com', phone: '+91-9999888877', location: 'Bangalore', experience: '6 years', education: 'B.Tech CS', skills: 'React, TypeScript, Redux', status: 'HIRED', appliedDate: '2025-12-15', resume: 'resume.pdf', coverLetter: null, aiScore: 96,
        completedRounds: [
            { roundName: 'HR Screening', interviewer: 'Emily Davis', date: '2025-12-18', score: 4.5, result: 'PASSED', feedback: 'Excellent candidate.' },
            { roundName: 'Technical Round', interviewer: 'John Smith', date: '2025-12-21', score: 4.8, result: 'PASSED', feedback: 'Outstanding skills.' },
            { roundName: 'Final Round', interviewer: 'VP Engineering', date: '2025-12-24', score: 4.9, result: 'PASSED', feedback: 'Highly recommended.' }
        ]
    },
    {
        id: 'cand-014', applicationId: 'app-014', jobId: 'job-002', candidateId: 'c-014', name: 'Sanjay Mehta', email: 'sanjay.mehta@email.com', phone: '+91-8888777766', location: 'Delhi NCR', experience: '4 years', education: 'MCA Delhi University', skills: 'Node.js, Python, PostgreSQL', status: 'HIRED', appliedDate: '2025-12-10', resume: 'resume.pdf', coverLetter: 'Cover letter', aiScore: 86,
        completedRounds: [
            { roundName: 'HR Screening', interviewer: 'Emily Davis', date: '2025-12-13', score: 4.3, result: 'PASSED', feedback: 'Good fit.' },
            { roundName: 'Coding Test', interviewer: 'David Wilson', date: '2025-12-16', score: 4.5, result: 'PASSED', feedback: 'Solid coding.' },
            { roundName: 'Final Round', interviewer: 'CTO', date: '2025-12-20', score: 4.6, result: 'PASSED', feedback: 'Selected for hire.' }
        ]
    },
    {
        id: 'cand-015', applicationId: 'app-015', jobId: 'job-003', candidateId: 'c-015', name: 'Pooja Agarwal', email: 'pooja.agarwal@email.com', phone: '+91-7777666655', location: 'Pune', experience: '5 years', education: 'B.Tech IT', skills: 'AWS, Docker, Kubernetes', status: 'HIRED', appliedDate: '2025-12-05', resume: 'resume.pdf', coverLetter: null, aiScore: 90,
        completedRounds: [
            { roundName: 'HR Screening', interviewer: 'Emily Davis', date: '2025-12-08', score: 4.4, result: 'PASSED', feedback: 'Great attitude.' },
            { roundName: 'Technical Assessment', interviewer: 'David Wilson', date: '2025-12-12', score: 4.7, result: 'PASSED', feedback: 'Excellent DevOps skills.' }
        ]
    },

    // REJECTED (3)
    {
        id: 'cand-016', applicationId: 'app-016', jobId: 'job-001', candidateId: 'c-016', name: 'Ravi Shankar', email: 'ravi.shankar@email.com', phone: '+91-6666555544', location: 'Lucknow', experience: '3 years', education: 'BCA', skills: 'React, JavaScript', status: 'REJECTED', appliedDate: '2025-12-20', resume: 'resume.pdf', coverLetter: null, aiScore: 55,
        completedRounds: [
            { roundName: 'HR Screening', interviewer: 'Emily Davis', date: '2025-12-23', score: 3.5, result: 'PASSED', feedback: 'Communication needs improvement.' },
            { roundName: 'Technical Round', interviewer: 'John Smith', date: '2025-12-27', score: 2.5, result: 'FAILED', feedback: 'Lacks depth in React.' }
        ]
    },
    {
        id: 'cand-017', applicationId: 'app-017', jobId: 'job-002', candidateId: 'c-017', name: 'Sunita Devi', email: 'sunita.devi@email.com', phone: '+91-5555444433', location: 'Patna', experience: '2 years', education: 'B.Sc CS', skills: 'Python, Basic SQL', status: 'REJECTED', appliedDate: '2025-12-18', resume: null, coverLetter: null, aiScore: 48,
        completedRounds: [
            { roundName: 'HR Screening', interviewer: 'Emily Davis', date: '2025-12-21', score: 3.8, result: 'PASSED', feedback: 'Enthusiastic but inexperienced.' },
            { roundName: 'Coding Test', interviewer: 'David Wilson', date: '2025-12-25', score: 2.2, result: 'FAILED', feedback: 'Could only solve 1/4 problems.' }
        ]
    },
    {
        id: 'cand-018', applicationId: 'app-018', jobId: 'job-003', candidateId: 'c-018', name: 'Manoj Kumar', email: 'manoj.kumar@email.com', phone: '+91-4444333322', location: 'Indore', experience: '1 year', education: 'Diploma IT', skills: 'Linux, Basic AWS', status: 'REJECTED', appliedDate: '2025-12-12', resume: 'resume.pdf', coverLetter: null, aiScore: 42,
        completedRounds: [
            { roundName: 'HR Screening', interviewer: 'Emily Davis', date: '2025-12-15', score: 2.8, result: 'FAILED', feedback: 'Salary expectations too high for experience.' }
        ]
    },

    // RESCHEDULE REQUESTS (2)
    {
        id: 'cand-019', applicationId: 'app-019', jobId: 'job-001', candidateId: 'c-019', name: 'Deepak Sharma', email: 'deepak.sharma@email.com', phone: '+91-7777888899', location: 'Delhi', experience: '5 years', education: 'B.Tech', skills: 'React, Node.js, AWS', status: 'RESCHEDULE_REQUESTED', appliedDate: '2025-12-20', resume: 'resume.pdf', coverLetter: null, aiScore: 82,
        interviewDetails: {
            interviewer: 'John Smith',
            interviewerEmail: 'john.smith@company.com',
            scheduledDate: '2026-01-30',
            scheduledTime: '10:00',
            round: 'Technical Round',
            meetingLink: 'https://meet.google.com/abc-defg-hij'
        },
        rescheduleRequest: {
            originalDate: '2026-01-30',
            originalTime: '10:00',
            requestedDate: '2026-02-03',
            requestedTime: '14:00',
            reason: 'Personal Emergency',
            requestedAt: '2026-01-28T09:30:00'
        },
        completedRounds: [
            { roundName: 'HR Screening', interviewer: 'Emily Davis', date: '2025-12-25', score: 4.2, result: 'PASSED', feedback: 'Excellent communication skills.' }
        ]
    },
    {
        id: 'cand-020', applicationId: 'app-020', jobId: 'job-002', candidateId: 'c-020', name: 'Priya Patel', email: 'priya.patel@email.com', phone: '+91-6666777700', location: 'Mumbai', experience: '3 years', education: 'MCA', skills: 'Python, Django, PostgreSQL', status: 'RESCHEDULE_REQUESTED', appliedDate: '2025-12-18', resume: 'resume.pdf', coverLetter: 'cover.pdf', aiScore: 76,
        interviewDetails: {
            interviewer: 'Sarah Thompson',
            interviewerEmail: 'sarah.thompson@company.com',
            scheduledDate: '2026-01-29',
            scheduledTime: '11:00',
            round: 'System Design',
            meetingLink: 'https://meet.google.com/xyz-uvwx-stu'
        },
        rescheduleRequest: {
            originalDate: '2026-01-29',
            originalTime: '11:00',
            requestedDate: '2026-02-01',
            requestedTime: '15:00',
            reason: 'Health Issues',
            requestedAt: '2026-01-27T14:15:00'
        },
        completedRounds: [
            { roundName: 'HR Screening', interviewer: 'Emily Davis', date: '2025-12-22', score: 4.0, result: 'PASSED', feedback: 'Good technical background.' },
            { roundName: 'Coding Test', interviewer: 'David Wilson', date: '2025-12-28', score: 4.5, result: 'PASSED', feedback: 'Solved all problems efficiently.' }
        ]
    }
];

// ==================== MAIN COMPONENT ====================
const HRApplicationsPage = () => {
    const {
        jobs,
        candidatePipelineTab,
        setCandidatePipelineTab,
        pendingApplications,
        paginatedCandidates,
        selectedJob,
        selectedCandidate,
        showRejectionModal,
        showCandidateDetail,
        handleSearch,
        handleViewApplications,
        handleReject,
        handleConfirmRejection,
        handleCloseRejectionModal,
        handleCloseCandidateDetail,
        handleSelectCandidate,
    } = useApplication();

    // View states
    const [activeTab, setActiveTab] = useState<WorkflowTab>('PENDING');

    // Modal states
    const [showOfferModal, setShowOfferModal] = useState(false);
    const [showInterviewerModal, setShowInterviewerModal] = useState(false);
    const [showFeedbackModal, setShowFeedbackModal] = useState(false);

    // Schedule interview step state
    const [scheduleStep, setScheduleStep] = useState(1); // 1 = select interviewer, 2 = select date/time/round

    // Slot-based interview scheduling states
    const [selectedRound, setSelectedRound] = useState('HR Screening');
    const [selectedDate, setSelectedDate] = useState('');
    const [selectedTime, setSelectedTime] = useState('');

    // Legacy states (kept for compatibility)
    const [interviewers, setInterviewers] = useState<Interviewer[]>(dummyInterviewers);
    const [selectedInterviewer, setSelectedInterviewer] = useState<Interviewer | null>(null);
    const [isAIScoring, setIsAIScoring] = useState(false);
    const [hasAIScoredInterviewers, setHasAIScoredInterviewers] = useState(false);

    // AI Scoring for pending candidates
    const [isScoringPendingCandidates, setIsScoringPendingCandidates] = useState(false);
    const [scoredCandidateIds, setScoredCandidateIds] = useState<Set<string>>(new Set());

    // Map workflow tab to underlying pipeline tab in useApplication()
    const workflowToPipelineMap: Record<WorkflowTab, "pending" | "shortlist" | "interview" | "complete"> = {
        PENDING: "pending",
        SHORTLISTED: "shortlist",
        INTERVIEW_ATTENDEES: "interview",
        INTERVIEW_COMPLETE: "interview",
        HIRED: "interview",
        RESCHEDULE_REQUESTS: "interview",
        REJECTED: "complete",
    };

    const workflowTabs = [
        { key: 'PENDING' as WorkflowTab, label: 'Pending Applications', color: '#f59e0b' },
        { key: 'SHORTLISTED' as WorkflowTab, label: 'Shortlisted', color: '#3b82f6' },
        { key: 'INTERVIEW_ATTENDEES' as WorkflowTab, label: 'Scheduled Interviews', color: '#8b5cf6' },
        { key: 'RESCHEDULE_REQUESTS' as WorkflowTab, label: 'Reschedule Requests', color: '#f97316' },
        { key: 'INTERVIEW_COMPLETE' as WorkflowTab, label: 'Interview Complete', color: '#06b6d4' },
        { key: 'HIRED' as WorkflowTab, label: 'Hired', color: '#10b981' },
        { key: 'REJECTED' as WorkflowTab, label: 'Rejected', color: '#ef4444' },
    ];

    // Handlers
    const handleAIScorePendingCandidates = async () => {
        setIsScoringPendingCandidates(true);
        // Simulate AI scoring delay
        await new Promise(resolve => setTimeout(resolve, 1500));
        // Add all pending candidates to scored set
        const pendingCandidates = pendingApplications.filter(c => c.status === 'PENDING');
        const newScoredIds = new Set(scoredCandidateIds);
        pendingCandidates.forEach(c => newScoredIds.add(c.id));
        setScoredCandidateIds(newScoredIds);
        setIsScoringPendingCandidates(false);
    };

    const handleViewApplicationsClick = (job: Job) => {
        handleViewApplications(job);
        setActiveTab('PENDING');
        setCandidatePipelineTab(workflowToPipelineMap.PENDING);
    };

    const handleBackToJobs = () => {
        setSelectedJob(null);
        setSelectedCandidate(null);
        setShowCandidateDetail(false);
    };

    const handleViewCandidate = (candidate: Candidate) => {
        setSelectedCandidate(candidate);
        setShowCandidateDetail(true);
    };

    const handleSendOffer = (candidate: Candidate) => {
        setSelectedCandidate(candidate);
        setShowOfferModal(true);
    };

    const handleScheduleInterview = (candidate: Candidate) => {
        setSelectedCandidate(candidate);
        setSelectedInterviewer(null);
        setSelectedSlot(null);
        setSelectedDate('');
        setSelectedTime('');
        setSelectedRound('HR Screening');
        setScheduleStep(1);
        setShowInterviewerModal(true);
    };

    const handleAIMatchInterviewers = async () => {
        setIsAIScoring(true);
        // Simulate AI scoring
        setTimeout(() => {
            const scored = [...interviewers].map(i => ({
                ...i,
                aiScore: Math.floor(Math.random() * 30) + 70
            })).sort((a, b) => (b.aiScore || 0) - (a.aiScore || 0));
            setInterviewers(scored);
            setIsAIScoring(false);
            setHasAIScoredInterviewers(true);
        }, 1500);
    };

    const handleConfirmSchedule = () => {
        if (!selectedInterviewerWithSlots || !selectedSlot || !selectedRound) {
            alert('Please select interviewer, round and time slot');
            return;
        }
        console.log('Scheduling interview:', {
            candidate: selectedCandidate?.name,
            interviewer: selectedInterviewerWithSlots.name,
            slot: selectedSlot,
            round: selectedRound
        });
        alert(`Interview scheduled with ${selectedInterviewerWithSlots.name} on ${formatSlotDate(selectedSlot.date)} at ${selectedSlot.startTime}`);
        setShowInterviewerModal(false);
        setSelectedInterviewerWithSlots(null);
        setSelectedSlot(null);
    };

    // Helper function to format slot date
    const formatSlotDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const handleConfirmOffer = async (data: any) => {
        console.log('Sending offer:', data);
        alert(`Offer letter sent to ${selectedCandidate?.name}!`);
        setShowOfferModal(false);
    };



    const handleAssignNextRound = (candidate: Candidate) => {
        setSelectedCandidate(candidate);
        setShowInterviewerModal(true);
    };

    const getStatusBadge = (status: string) => {
        const colors: Record<string, { bg: string; text: string }> = {
            'PENDING': { bg: '#fef3c7', text: '#92400e' },
            'SHORTLISTED': { bg: '#dbeafe', text: '#1e40af' },
            'INTERVIEW_SCHEDULED': { bg: '#ede9fe', text: '#5b21b6' },
            'INTERVIEW_COMPLETE': { bg: '#cffafe', text: '#0e7490' },
            'HIRED': { bg: '#d1fae5', text: '#065f46' },
            'REJECTED': { bg: '#fee2e2', text: '#991b1b' },
        };
        const style = colors[status] || { bg: '#f3f4f6', text: '#374151' };
        return (
            <span style={{ padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600, backgroundColor: style.bg, color: style.text }}>
                {status.replace('_', ' ')}
            </span>
        );
    };

    const renderScoreBar = (score: number) => {
        const percentage = (score / 5) * 100;
        const color = score >= 4 ? '#10b981' : score >= 3 ? '#f59e0b' : '#ef4444';
        return (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 80, height: 8, backgroundColor: '#1e293b', borderRadius: 4, overflow: 'hidden' }}>
                    <div style={{ width: `${percentage}%`, height: '100%', backgroundColor: color, borderRadius: 4 }} />
                </div>
                <span style={{ color: '#94a3b8', fontSize: 12 }}>{score.toFixed(1)}/5</span>
            </div>
        );
    };

    // ==================== TABLE COLUMN CONFIG ====================
    const jobColumns = [
        {
            header: "Job Title",
            render: (job: Job) => (
                <div className="text-slate-50 font-semibold text-sm">
                    {job.title}
                </div>
            ),
        },
        {
            header: "Location",
            render: (job: Job) => (
                <span className="text-slate-400 text-sm">
                    {job.location}
                </span>
            ),
        },
        {
            header: "Type",
            render: (job: Job) => (
                <span
                    className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ${job.type === "Full-time"
                        ? "bg-blue-500/10 text-blue-400"
                        : "bg-amber-500/10 text-amber-400"
                        }`}
                >
                    {job.type}
                </span>
            ),
        },
        {
            header: "Department",
            render: (job: Job) => (
                <span className="text-slate-400 text-sm">
                    {job.department}
                </span>
            ),
        },
        {
            header: "Salary",
            cellClassName: "text-emerald-400 font-medium text-sm",
            render: (job: Job) => job.salary,
        },
        {
            header: "Applications",
            cellClassName: "text-center",
            render: (job: Job) => (
                <span className="inline-flex items-center justify-center px-3 py-1 rounded-lg text-sm font-semibold bg-blue-500/10 text-blue-400">
                    {job.applicantCount ?? 0}
                </span>
            ),
        },
        {
            header: "Actions",
            cellClassName: "text-right",
            render: (job: Job) => (
                <Button
                    variant="primary"
                    className="text-xs font-semibold bg-blue-600 hover:bg-blue-500"
                    onClick={() => handleViewApplications(job)}
                >
                    View Applications
                </Button>
            ),
        },
    ];

    const buildCandidateColumns = (status: WorkflowTab) => {
        const baseColumns = [
            {
                header: "Candidate",
                render: (candidate: Candidate) => (
                    <div>
                        <div className="text-slate-50 font-semibold text-sm">
                            {candidate.name}
                        </div>
                        <div className="text-slate-500 text-xs mt-1">
                            {candidate.email}
                        </div>
                    </div>
                ),
            },
            {
                header: "Experience",
                render: (candidate: Candidate) => (
                    <span className="text-slate-100 text-sm">
                        {candidate.experience}
                    </span>
                ),
            },
            {
                header: "Location",
                render: (candidate: Candidate) => (
                    <span className="text-slate-400 text-sm">
                        {candidate.location}
                    </span>
                ),
            },
            {
                header: "AI Score",
                cellClassName: "text-center",
                render: (candidate: Candidate) => {
                    const showScore =
                        status !== "PENDING" ||
                        scoredCandidateIds.has(candidate.id);

                    if (!showScore) {
                        return (
                            <span className="inline-flex items-center justify-center px-3 py-1 rounded-lg text-xs font-semibold bg-slate-700/40 text-slate-500">
                                --
                            </span>
                        );
                    }

                    const score = candidate.aiScore;
                    const colorClasses =
                        score >= 80
                            ? "bg-emerald-500/10 text-emerald-400"
                            : score >= 60
                                ? "bg-amber-500/10 text-amber-400"
                                : "bg-red-500/10 text-red-400";

                    return (
                        <span
                            className={`inline-flex items-center justify-center px-3 py-1 rounded-lg text-xs font-semibold ${colorClasses}`}
                        >
                            {score}%
                        </span>
                    );
                },
            },
        ];

        if (status !== "RESCHEDULE_REQUESTS") {
            baseColumns.push({
                header: "Applied",
                render: (candidate: Candidate) => (
                    <span className="text-slate-500 text-[13px]">
                        {candidate.appliedDate}
                    </span>
                ),
            });
        }

        if (status === "INTERVIEW_ATTENDEES") {
            baseColumns.push({
                header: "Current Round",
                render: (candidate: Candidate) => (
                    <span className="text-violet-400 text-[13px] font-medium">
                        {candidate.currentRound || "-"}
                    </span>
                ),
            });
        }

        baseColumns.push({
            header: "Actions",
            cellClassName: "text-right",
            render: (candidate: Candidate) => (
                            <Button
                                variant="secondary"
                                className="bg-slate-700 hover:bg-slate-600 text-xs font-semibold px-3 py-1.5 rounded-md"
                                onClick={() => handleSelectCandidate(candidate)}
                            >
                                View
                            </Button>
            ),
        });

        return baseColumns;
    };

    // ==================== RENDER ====================
    return (
        <>


            {/* JOBS LIST VIEW */}
            {!selectedJob && (
                <>
                    <h1 className="text-[28px] font-bold text-slate-50 mb-6">
                        Job Applications
                    </h1>
                    <Table<Job>
                        columns={jobColumns}
                        data={jobs}
                        rowKey={(job) => job.id}
                        emptyMessage="No jobs available."
                    />
                </>
            )}

            {/* WORKFLOW VIEW (when job is selected) */}
            {selectedJob && (
                <>
                    {/* Header */}
                    <div className="flex items-center gap-4 mb-6">
                        <div>
                            <h1 className="text-2xl font-bold text-slate-50 m-0">
                                {selectedJob.title}
                            </h1>
                            <p className="text-slate-400 text-sm mt-1 mb-0">
                                {selectedJob.location} • {selectedJob.type}
                            </p>
                        </div>
                    </div>

                    {/* Search Input */}
                    <div className="mb-5 max-w-md">
                        <SearchInput
                            placeholder="Search candidates by name or email..."
                            onSearch={handleSearch}
                        />
                    </div>

                    {/* Workflow Tabs */}
                    <div className="flex gap-3 mb-6 flex-wrap">
                        {workflowTabs.map(tab => {

                            return (
                                <Button
                                    key={tab.key}
                                    variant={activeTab === tab.key ? "primary" : "secondary"}
                                    onClick={() => {
                                        setActiveTab(tab.key);
                                        setCandidatePipelineTab(workflowToPipelineMap[tab.key]);
                                    }}
                                    className={`rounded-xl text-sm font-semibold flex items-center gap-2 border-2 px-5 py-2.5 ${activeTab === tab.key
                                        ? "bg-transparent"
                                        : "bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700"
                                        }`}
                                >
                                    {tab.label}

                                </Button>
                            );
                        })}
                    </div>

                    {/* Main Content Area */}
                    <div>

                        {/* AI Score Button for Pending Applications */}
                        {activeTab === 'PENDING' && pendingApplications.some(c => c.status === 'PENDING') && (
                            <div className="mb-4 flex justify-end">
                                <Button
                                    onClick={handleAIScorePendingCandidates}
                                    disabled={isScoringPendingCandidates}
                                    className={`px-6 py-3 rounded-lg text-sm font-semibold flex items-center gap-2 ${isScoringPendingCandidates
                                        ? "bg-slate-600 cursor-wait opacity-70"
                                        : "bg-gradient-to-br from-violet-500 to-indigo-500 hover:from-violet-400 hover:to-indigo-400"
                                        }`}
                                >
                                    {isScoringPendingCandidates ? 'Scoring Candidates...' : 'AI Score Candidates'}
                                </Button>
                            </div>
                        )}

                        {/* Candidates Table */}
                        <Table<Candidate>
                            columns={buildCandidateColumns(activeTab)}
                            data={selectedJob ? paginatedCandidates : []}
                            rowKey={(candidate) => candidate.id}
                            emptyMessage="No candidates in this stage"
                        />
                    </div>
                </>
            )}

            {/* CANDIDATE DETAIL MODAL */}
            {showCandidateDetail && selectedCandidate && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                    <div style={{ backgroundColor: '#1e293b', borderRadius: 16, padding: 24, maxWidth: 700, width: '95%', maxHeight: '90vh', overflow: 'auto' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                            <div>
                                <h3 style={{ color: '#e2e8f0', margin: 0 }}>Candidate Details</h3>
                            </div>
                            <button onClick={() => { setShowCandidateDetail(false); setSelectedCandidate(null); }} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: 24 }}>×</button>
                        </div>

                        {/* Header with Avatar */}
                        <div style={{ marginBottom: 24, display: 'flex', alignItems: 'center', gap: 16 }}>
                            <div style={{
                                width: 64,
                                height: 64,
                                borderRadius: '50%',
                                background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: '#fff',
                                fontWeight: 700,
                                fontSize: 24
                            }}>
                                {selectedCandidate.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <h3 style={{ color: '#f1f5f9', fontSize: 22, fontWeight: 700, margin: 0 }}>{selectedCandidate.name}</h3>
                                {selectedCandidate.title && <p style={{ color: '#8b5cf6', fontSize: 14, margin: '4px 0 0', fontWeight: 500 }}>{selectedCandidate.title}</p>}
                                {selectedCandidate.currentCompany && <p style={{ color: '#64748b', fontSize: 13, margin: '2px 0 0' }}>@ {selectedCandidate.currentCompany}</p>}
                                <div style={{ marginTop: 8 }}>{getStatusBadge(selectedCandidate.status)}</div>
                            </div>
                        </div>

                        {/* Personal Information */}
                        <div style={{ marginBottom: 20, padding: 16, backgroundColor: '#0f172a', borderRadius: 12, border: '1px solid #334155' }}>
                            <h4 style={{ color: '#e2e8f0', fontSize: 14, fontWeight: 600, margin: '0 0 12px', textTransform: 'uppercase', borderBottom: '1px solid #334155', paddingBottom: 8 }}>Personal Information</h4>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                                <div>
                                    <span style={{ color: '#64748b', fontSize: 11, textTransform: 'uppercase' }}>Full Name</span>
                                    <p style={{ color: '#e2e8f0', margin: '4px 0 0', fontSize: 14, fontWeight: 500 }}>{selectedCandidate.name}</p>
                                </div>
                                <div>
                                    <span style={{ color: '#64748b', fontSize: 11, textTransform: 'uppercase' }}>Email</span>
                                    <p style={{ color: '#e2e8f0', margin: '4px 0 0', fontSize: 14, fontWeight: 500 }}>{selectedCandidate.email}</p>
                                </div>
                                <div>
                                    <span style={{ color: '#64748b', fontSize: 11, textTransform: 'uppercase' }}>Phone</span>
                                    <p style={{ color: '#e2e8f0', margin: '4px 0 0', fontSize: 14, fontWeight: 500 }}>{selectedCandidate.phone}</p>
                                </div>
                                <div>
                                    <span style={{ color: '#64748b', fontSize: 11, textTransform: 'uppercase' }}>Location</span>
                                    <p style={{ color: '#e2e8f0', margin: '4px 0 0', fontSize: 14, fontWeight: 500 }}>{selectedCandidate.location}</p>
                                </div>
                                {selectedCandidate.dateOfBirth && (
                                    <div>
                                        <span style={{ color: '#64748b', fontSize: 11, textTransform: 'uppercase' }}>Date of Birth</span>
                                        <p style={{ color: '#e2e8f0', margin: '4px 0 0', fontSize: 14, fontWeight: 500 }}>{selectedCandidate.dateOfBirth}</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Professional Information (Optional) */}
                        {(selectedCandidate.title || selectedCandidate.currentCompany || selectedCandidate.currentSalary || selectedCandidate.experience) && (
                            <div style={{ marginBottom: 20, padding: 16, backgroundColor: '#0f172a', borderRadius: 12, border: '1px solid #334155' }}>
                                <h4 style={{ color: '#e2e8f0', fontSize: 14, fontWeight: 600, margin: '0 0 12px', textTransform: 'uppercase', borderBottom: '1px solid #334155', paddingBottom: 8 }}>Professional Information</h4>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                                    {selectedCandidate.title && (
                                        <div>
                                            <span style={{ color: '#64748b', fontSize: 11, textTransform: 'uppercase' }}>Job Title</span>
                                            <p style={{ color: '#e2e8f0', margin: '4px 0 0', fontSize: 14, fontWeight: 500 }}>{selectedCandidate.title}</p>
                                        </div>
                                    )}
                                    {selectedCandidate.currentCompany && (
                                        <div>
                                            <span style={{ color: '#64748b', fontSize: 11, textTransform: 'uppercase' }}>Current Company</span>
                                            <p style={{ color: '#e2e8f0', margin: '4px 0 0', fontSize: 14, fontWeight: 500 }}>{selectedCandidate.currentCompany}</p>
                                        </div>
                                    )}
                                    <div>
                                        <span style={{ color: '#64748b', fontSize: 11, textTransform: 'uppercase' }}>Experience</span>
                                        <p style={{ color: '#e2e8f0', margin: '4px 0 0', fontSize: 14, fontWeight: 500 }}>{selectedCandidate.experience}</p>
                                    </div>
                                    {selectedCandidate.currentSalary && (
                                        <div>
                                            <span style={{ color: '#64748b', fontSize: 11, textTransform: 'uppercase' }}>Current Salary</span>
                                            <p style={{ color: '#e2e8f0', margin: '4px 0 0', fontSize: 14, fontWeight: 500 }}>{selectedCandidate.currentSalary}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* About & Availability */}
                        {(selectedCandidate.bio || selectedCandidate.expectedSalary || selectedCandidate.noticePeriod) && (
                            <div style={{ marginBottom: 20, padding: 16, backgroundColor: '#0f172a', borderRadius: 12, border: '1px solid #334155' }}>
                                <h4 style={{ color: '#e2e8f0', fontSize: 14, fontWeight: 600, margin: '0 0 12px', textTransform: 'uppercase', borderBottom: '1px solid #334155', paddingBottom: 8 }}>About & Availability</h4>
                                {selectedCandidate.bio && (
                                    <div style={{ marginBottom: 12 }}>
                                        <span style={{ color: '#64748b', fontSize: 11, textTransform: 'uppercase' }}>Bio</span>
                                        <p style={{ color: '#94a3b8', margin: '4px 0 0', fontSize: 13, lineHeight: 1.5 }}>{selectedCandidate.bio}</p>
                                    </div>
                                )}
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                                    {selectedCandidate.expectedSalary && (
                                        <div>
                                            <span style={{ color: '#64748b', fontSize: 11, textTransform: 'uppercase' }}>Expected Salary</span>
                                            <p style={{ color: '#10b981', margin: '4px 0 0', fontSize: 14, fontWeight: 600 }}>{selectedCandidate.expectedSalary}</p>
                                        </div>
                                    )}
                                    {selectedCandidate.noticePeriod && (
                                        <div>
                                            <span style={{ color: '#64748b', fontSize: 11, textTransform: 'uppercase' }}>Notice Period</span>
                                            <p style={{ color: '#f59e0b', margin: '4px 0 0', fontSize: 14, fontWeight: 600 }}>{selectedCandidate.noticePeriod}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Job Preferences */}
                        {(selectedCandidate.preferredWorkMode || selectedCandidate.preferredJobType || selectedCandidate.willingToRelocate !== undefined) && (
                            <div style={{ marginBottom: 20, padding: 16, backgroundColor: '#0f172a', borderRadius: 12, border: '1px solid #334155' }}>
                                <h4 style={{ color: '#e2e8f0', fontSize: 14, fontWeight: 600, margin: '0 0 12px', textTransform: 'uppercase', borderBottom: '1px solid #334155', paddingBottom: 8 }}>Job Preferences</h4>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                                    {selectedCandidate.preferredWorkMode && (
                                        <div>
                                            <span style={{ color: '#64748b', fontSize: 11, textTransform: 'uppercase' }}>Preferred Work Mode</span>
                                            <p style={{ color: '#e2e8f0', margin: '4px 0 0', fontSize: 14, fontWeight: 500 }}>{selectedCandidate.preferredWorkMode}</p>
                                        </div>
                                    )}
                                    {selectedCandidate.preferredJobType && (
                                        <div>
                                            <span style={{ color: '#64748b', fontSize: 11, textTransform: 'uppercase' }}>Preferred Job Type</span>
                                            <p style={{ color: '#e2e8f0', margin: '4px 0 0', fontSize: 14, fontWeight: 500 }}>{selectedCandidate.preferredJobType}</p>
                                        </div>
                                    )}
                                    {selectedCandidate.willingToRelocate !== undefined && (
                                        <div>
                                            <span style={{ color: '#64748b', fontSize: 11, textTransform: 'uppercase' }}>Willing to Relocate</span>
                                            <p style={{ color: selectedCandidate.willingToRelocate ? '#10b981' : '#ef4444', margin: '4px 0 0', fontSize: 14, fontWeight: 500 }}>
                                                {selectedCandidate.willingToRelocate ? 'Yes' : 'No'}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Skills */}
                        <div style={{ marginBottom: 20, padding: 16, backgroundColor: '#0f172a', borderRadius: 12, border: '1px solid #334155' }}>
                            <h4 style={{ color: '#e2e8f0', fontSize: 14, fontWeight: 600, margin: '0 0 12px', textTransform: 'uppercase', borderBottom: '1px solid #334155', paddingBottom: 8 }}>Skills</h4>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                                {(selectedCandidate.skillsArray || selectedCandidate.skills.split(', ')).map((skill, idx) => (
                                    <span key={idx} style={{
                                        padding: '6px 12px',
                                        backgroundColor: '#8b5cf620',
                                        color: '#a78bfa',
                                        borderRadius: 6,
                                        fontSize: 12,
                                        fontWeight: 500
                                    }}>{skill}</span>
                                ))}
                            </div>
                        </div>

                        {/* Languages */}
                        {selectedCandidate.languages && selectedCandidate.languages.length > 0 && (
                            <div style={{ marginBottom: 20, padding: 16, backgroundColor: '#0f172a', borderRadius: 12, border: '1px solid #334155' }}>
                                <h4 style={{ color: '#e2e8f0', fontSize: 14, fontWeight: 600, margin: '0 0 12px', textTransform: 'uppercase', borderBottom: '1px solid #334155', paddingBottom: 8 }}>Languages</h4>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                                    {selectedCandidate.languages.map((lang, idx) => (
                                        <span key={idx} style={{
                                            padding: '6px 12px',
                                            backgroundColor: '#3b82f620',
                                            color: '#60a5fa',
                                            borderRadius: 6,
                                            fontSize: 12,
                                            fontWeight: 500
                                        }}>{lang}</span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Education */}
                        <div style={{ marginBottom: 20, padding: 16, backgroundColor: '#0f172a', borderRadius: 12, border: '1px solid #334155' }}>
                            <h4 style={{ color: '#e2e8f0', fontSize: 14, fontWeight: 600, margin: '0 0 12px', textTransform: 'uppercase', borderBottom: '1px solid #334155', paddingBottom: 8 }}>Education</h4>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                                <div>
                                    <span style={{ color: '#64748b', fontSize: 11, textTransform: 'uppercase' }}>Highest Qualification</span>
                                    <p style={{ color: '#e2e8f0', margin: '4px 0 0', fontSize: 14, fontWeight: 500 }}>{selectedCandidate.education}</p>
                                </div>
                                {selectedCandidate.university && (
                                    <div>
                                        <span style={{ color: '#64748b', fontSize: 11, textTransform: 'uppercase' }}>University/School</span>
                                        <p style={{ color: '#e2e8f0', margin: '4px 0 0', fontSize: 14, fontWeight: 500 }}>{selectedCandidate.university}</p>
                                    </div>
                                )}
                                {selectedCandidate.graduationYear && (
                                    <div>
                                        <span style={{ color: '#64748b', fontSize: 11, textTransform: 'uppercase' }}>Graduation Year</span>
                                        <p style={{ color: '#e2e8f0', margin: '4px 0 0', fontSize: 14, fontWeight: 500 }}>{selectedCandidate.graduationYear}</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Links (Optional) */}
                        {(selectedCandidate.linkedinUrl || selectedCandidate.githubUrl || selectedCandidate.resumeUrl) && (
                            <div style={{ marginBottom: 20, padding: 16, backgroundColor: '#0f172a', borderRadius: 12, border: '1px solid #334155' }}>
                                <h4 style={{ color: '#e2e8f0', fontSize: 14, fontWeight: 600, margin: '0 0 12px', textTransform: 'uppercase', borderBottom: '1px solid #334155', paddingBottom: 8 }}>Links</h4>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
                                    {selectedCandidate.linkedinUrl && (
                                        <a href={selectedCandidate.linkedinUrl} target="_blank" rel="noopener noreferrer" style={{
                                            padding: '8px 16px',
                                            backgroundColor: '#0077b5',
                                            color: '#fff',
                                            borderRadius: 6,
                                            fontSize: 12,
                                            fontWeight: 500,
                                            textDecoration: 'none',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 6
                                        }}>LinkedIn</a>
                                    )}
                                    {selectedCandidate.githubUrl && (
                                        <a href={selectedCandidate.githubUrl} target="_blank" rel="noopener noreferrer" style={{
                                            padding: '8px 16px',
                                            backgroundColor: '#333',
                                            color: '#fff',
                                            borderRadius: 6,
                                            fontSize: 12,
                                            fontWeight: 500,
                                            textDecoration: 'none',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 6
                                        }}>GitHub</a>
                                    )}
                                    {selectedCandidate.resumeUrl && (
                                        <a href={selectedCandidate.resumeUrl} target="_blank" rel="noopener noreferrer" style={{
                                            padding: '8px 16px',
                                            backgroundColor: '#ef4444',
                                            color: '#fff',
                                            borderRadius: 6,
                                            fontSize: 12,
                                            fontWeight: 500,
                                            textDecoration: 'none',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 6
                                        }}>View Resume</a>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Application Info */}
                        <div style={{ marginBottom: 20, padding: 16, backgroundColor: '#0f172a', borderRadius: 12, border: '1px solid #334155' }}>
                            <h4 style={{ color: '#e2e8f0', fontSize: 14, fontWeight: 600, margin: '0 0 12px', textTransform: 'uppercase', borderBottom: '1px solid #334155', paddingBottom: 8 }}>Application Info</h4>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                                <div>
                                    <span style={{ color: '#64748b', fontSize: 11, textTransform: 'uppercase' }}>Applied Date</span>
                                    <p style={{ color: '#e2e8f0', margin: '4px 0 0', fontSize: 14, fontWeight: 500 }}>{selectedCandidate.appliedDate}</p>
                                </div>
                                <div>
                                    <span style={{ color: '#64748b', fontSize: 11, textTransform: 'uppercase' }}>AI Score</span>
                                    <p style={{ color: selectedCandidate.aiScore >= 80 ? '#10b981' : selectedCandidate.aiScore >= 60 ? '#f59e0b' : '#ef4444', margin: '4px 0 0', fontSize: 14, fontWeight: 600 }}>{selectedCandidate.aiScore}%</p>
                                </div>
                            </div>
                        </div>

                        {/* Ongoing Interview (for INTERVIEW_SCHEDULED) */}
                        {selectedCandidate.status === 'INTERVIEW_SCHEDULED' && selectedCandidate.interviewDetails && (
                            <div style={{ marginBottom: 20, padding: 16, backgroundColor: '#8b5cf620', borderRadius: 12, border: '1px solid #8b5cf6' }}>
                                <h4 style={{ color: '#8b5cf6', fontSize: 14, fontWeight: 600, margin: '0 0 12px', textTransform: 'uppercase' }}>Ongoing Interview</h4>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                                    <div><span style={{ color: '#94a3b8', fontSize: 12 }}>Round</span><p style={{ color: '#e2e8f0', margin: '4px 0 0', fontWeight: 600 }}>{selectedCandidate.interviewDetails.round}</p></div>
                                    <div><span style={{ color: '#94a3b8', fontSize: 12 }}>Interviewer</span><p style={{ color: '#e2e8f0', margin: '4px 0 0' }}>{selectedCandidate.interviewDetails.interviewer}</p></div>
                                    <div><span style={{ color: '#94a3b8', fontSize: 12 }}>Date & Time</span><p style={{ color: '#e2e8f0', margin: '4px 0 0' }}>{selectedCandidate.interviewDetails.scheduledDate} at {selectedCandidate.interviewDetails.scheduledTime}</p></div>
                                </div>
                            </div>
                        )}

                        {/* Completed Rounds */}
                        {selectedCandidate.completedRounds && selectedCandidate.completedRounds.length > 0 && (
                            <div style={{ marginBottom: 20 }}>
                                <h4 style={{ color: '#e2e8f0', fontSize: 14, fontWeight: 600, margin: '0 0 12px', textTransform: 'uppercase' }}>Completed Interview Rounds</h4>
                                {selectedCandidate.completedRounds.map((round, idx) => (
                                    <div key={idx} style={{ padding: 12, backgroundColor: '#0f172a', borderRadius: 8, marginBottom: 8, border: `1px solid ${round.result === 'PASSED' ? '#10b981' : '#ef4444'}40` }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                                            <span style={{ color: '#f1f5f9', fontWeight: 600 }}>{round.roundName}</span>
                                            <span style={{ padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 600, backgroundColor: round.result === 'PASSED' ? '#10b98120' : '#ef444420', color: round.result === 'PASSED' ? '#10b981' : '#ef4444' }}>{round.result}</span>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                                            <span style={{ color: '#64748b', fontSize: 12 }}>Interviewer: {round.interviewer}</span>
                                            <span style={{ color: '#64748b', fontSize: 12 }}>{round.date}</span>
                                        </div>
                                        <div style={{ marginBottom: 8 }}>
                                            <span style={{ color: '#94a3b8', fontSize: 12 }}>Score: </span>
                                            <span style={{ color: round.score >= 4 ? '#10b981' : round.score >= 3 ? '#f59e0b' : '#ef4444', fontSize: 12, fontWeight: 600 }}>{round.score.toFixed(1)}/5</span>
                                        </div>
                                        <p style={{ color: '#94a3b8', fontSize: 12, margin: 0, fontStyle: 'italic' }}>"{round.feedback}"</p>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Hired - Show Offer Info */}
                        {selectedCandidate.status === 'HIRED' && (
                            <div style={{ marginBottom: 20, padding: 16, backgroundColor: '#10b98120', borderRadius: 12, border: '1px solid #10b981' }}>
                                <h4 style={{ color: '#10b981', fontSize: 14, fontWeight: 600, margin: '0 0 12px', textTransform: 'uppercase' }}>Offer Letter Sent</h4>
                                <p style={{ color: '#94a3b8', fontSize: 13, margin: 0 }}>Offer letter has been sent to the candidate. Awaiting response.</p>
                            </div>
                        )}

                        {/* Rejected - Show Rejection Info */}
                        {selectedCandidate.status === 'REJECTED' && (
                            <div style={{ marginBottom: 20, padding: 16, backgroundColor: '#ef444420', borderRadius: 12, border: '1px solid #ef4444' }}>
                                <h4 style={{ color: '#ef4444', fontSize: 14, fontWeight: 600, margin: '0 0 12px', textTransform: 'uppercase' }}>Rejected</h4>
                                <p style={{ color: '#94a3b8', fontSize: 13, margin: 0 }}>Candidate has been notified of the rejection.</p>
                            </div>
                        )}

                        {/* Reschedule Request Info */}
                        {selectedCandidate.status === 'RESCHEDULE_REQUESTED' && selectedCandidate.rescheduleRequest && (
                            <div style={{ marginBottom: 20, padding: 16, backgroundColor: '#f9731620', borderRadius: 12, border: '1px solid #f97316' }}>
                                <h4 style={{ color: '#f97316', fontSize: 14, fontWeight: 600, margin: '0 0 16px', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 8 }}>
                                    ⏰ Reschedule Request
                                </h4>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                                    <div style={{ padding: 12, backgroundColor: '#0f172a', borderRadius: 8 }}>
                                        <h5 style={{ color: '#94a3b8', fontSize: 11, fontWeight: 600, margin: '0 0 8px', textTransform: 'uppercase' }}>Original Schedule</h5>
                                        <p style={{ color: '#e2e8f0', margin: 0, fontSize: 14, fontWeight: 500 }}>
                                            {new Date(selectedCandidate.rescheduleRequest.originalDate).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
                                        </p>
                                        <p style={{ color: '#64748b', margin: '4px 0 0', fontSize: 13 }}>
                                            {selectedCandidate.rescheduleRequest.originalTime}
                                        </p>
                                    </div>
                                    <div style={{ padding: 12, backgroundColor: '#10b98120', borderRadius: 8, border: '1px solid #10b981' }}>
                                        <h5 style={{ color: '#10b981', fontSize: 11, fontWeight: 600, margin: '0 0 8px', textTransform: 'uppercase' }}>Requested Schedule</h5>
                                        <p style={{ color: '#e2e8f0', margin: 0, fontSize: 14, fontWeight: 500 }}>
                                            {new Date(selectedCandidate.rescheduleRequest.requestedDate).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
                                        </p>
                                        <p style={{ color: '#64748b', margin: '4px 0 0', fontSize: 13 }}>
                                            {selectedCandidate.rescheduleRequest.requestedTime}
                                        </p>
                                    </div>
                                </div>
                                <div style={{ marginBottom: 12 }}>
                                    <span style={{ color: '#64748b', fontSize: 11, textTransform: 'uppercase' }}>Reason</span>
                                    <p style={{ color: '#e2e8f0', margin: '4px 0 0', fontSize: 14, fontWeight: 500 }}>{selectedCandidate.rescheduleRequest.reason}</p>
                                </div>
                                <div>
                                    <span style={{ color: '#64748b', fontSize: 11, textTransform: 'uppercase' }}>Requested At</span>
                                    <p style={{ color: '#94a3b8', margin: '4px 0 0', fontSize: 13 }}>
                                        {new Date(selectedCandidate.rescheduleRequest.requestedAt).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Action Buttons based on status */}
                        <div style={{ display: 'flex', gap: 12, marginTop: 24, flexWrap: 'wrap' }}>
                            {selectedCandidate.status === 'PENDING' && (
                                <>
                                    <button onClick={() => { setShowCandidateDetail(false); handleShortlist(selectedCandidate); }} style={{ flex: 1, padding: 14, backgroundColor: '#3b82f6', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: 14 }}>Shortlist</button>
                                    <button onClick={() => { setShowCandidateDetail(false); handleReject(selectedCandidate); }} style={{ flex: 1, padding: 14, backgroundColor: '#ef4444', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: 14 }}>Reject</button>
                                </>
                            )}
                            {selectedCandidate.status === 'SHORTLISTED' && (
                                <button onClick={() => { setShowCandidateDetail(false); handleScheduleInterview(selectedCandidate); }} style={{ flex: 1, padding: 14, backgroundColor: '#8b5cf6', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: 14 }}>Schedule Interview</button>
                            )}
                            {selectedCandidate.status === 'INTERVIEW_SCHEDULED' && (
                                <button
                                    onClick={() => {
                                        setShowCandidateDetail(false);
                                        handleScheduleInterview(selectedCandidate);
                                    }}
                                    style={{ flex: 1, padding: 14, backgroundColor: '#f97316', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: 14 }}
                                >
                                    Reschedule Interview
                                </button>
                            )}
                            {selectedCandidate.status === 'INTERVIEW_COMPLETE' && (
                                <>
                                    <button onClick={() => { setShowCandidateDetail(false); handleAssignNextRound(selectedCandidate); }} style={{ flex: 1, padding: 14, backgroundColor: '#8b5cf6', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: 14 }}>Next Round</button>
                                    <button onClick={() => { setShowCandidateDetail(false); handleSendOffer(selectedCandidate); }} style={{ flex: 1, padding: 14, backgroundColor: '#10b981', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: 14 }}>Send Offer</button>
                                    <button onClick={() => { setShowCandidateDetail(false); handleReject(selectedCandidate); }} style={{ flex: 1, padding: 14, backgroundColor: '#ef4444', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: 14 }}>Reject</button>
                                </>
                            )}
                            {selectedCandidate.status === 'RESCHEDULE_REQUESTED' && (
                                <>
                                    <button
                                        onClick={() => {
                                            alert('Reschedule declined. Candidate will be notified to attend the original schedule.');
                                            setShowCandidateDetail(false);
                                        }}
                                        style={{ flex: 1, padding: 14, backgroundColor: '#ef4444', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: 14 }}
                                    >
                                        ✗ Decline
                                    </button>
                                    <button
                                        onClick={() => {
                                            setShowCandidateDetail(false);
                                            handleScheduleInterview(selectedCandidate);
                                        }}
                                        style={{ flex: 1, padding: 14, backgroundColor: '#f97316', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: 14 }}
                                    >
                                        Propose New Time
                                    </button>
                                </>
                            )}
                            <button onClick={() => { setShowCandidateDetail(false); setSelectedCandidate(null); }} style={{ flex: 1, padding: 14, backgroundColor: '#334155', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: 14 }}>Close</button>
                        </div>
                    </div>
                </div>
            )}

            {/* SCHEDULE INTERVIEW MODAL - Three Step Flow */}
            {showInterviewerModal && selectedCandidate && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                    <div style={{ backgroundColor: '#1e293b', borderRadius: 16, padding: 24, maxWidth: 800, width: '95%', maxHeight: '90vh', overflow: 'auto' }}>

                        {/* Header */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                            <div>
                                <h3 style={{ color: '#e2e8f0', margin: 0 }}>Schedule Interview</h3>
                                <p style={{ color: '#94a3b8', margin: '4px 0 0', fontSize: 14 }}>for {selectedCandidate.name}</p>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                <span style={{ padding: '6px 14px', borderRadius: 20, fontSize: 13, fontWeight: 600, backgroundColor: scheduleStep === 1 ? '#3b82f620' : scheduleStep === 2 ? '#8b5cf620' : '#10b98120', color: scheduleStep === 1 ? '#3b82f6' : scheduleStep === 2 ? '#8b5cf6' : '#10b981' }}>
                                    Step {scheduleStep} of 3
                                </span>
                                <button onClick={() => { setShowInterviewerModal(false); setSelectedInterviewer(null); setScheduleStep(1); }} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: 24 }}>×</button>
                            </div>
                        </div>

                        {/* STEP 1: Select Round */}
                        {scheduleStep === 1 && (
                            <>
                                <div style={{ marginBottom: 24 }}>
                                    <h4 style={{ color: '#e2e8f0', fontSize: 14, fontWeight: 600, margin: '0 0 12px', textTransform: 'uppercase' }}>Select Interview Round</h4>
                                    <p style={{ color: '#94a3b8', fontSize: 12, marginBottom: 16 }}>Choose the type of interview round for this candidate:</p>
                                    <div style={{ display: 'grid', gap: 10 }}>
                                        {['HR Screening', 'Technical Round 1', 'Technical Round 2', 'Coding Test', 'Final Round'].map(round => (
                                            <div
                                                key={round}
                                                onClick={() => setSelectedRound(round)}
                                                style={{
                                                    padding: 16,
                                                    backgroundColor: selectedRound === round ? '#334155' : '#0f172a',
                                                    border: selectedRound === round ? '2px solid #3b82f6' : '1px solid #334155',
                                                    borderRadius: 10,
                                                    cursor: 'pointer',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: 12
                                                }}
                                            >
                                                <div style={{
                                                    width: 20,
                                                    height: 20,
                                                    borderRadius: '50%',
                                                    border: selectedRound === round ? '6px solid #3b82f6' : '2px solid #64748b',
                                                    backgroundColor: selectedRound === round ? '#fff' : 'transparent'
                                                }} />
                                                <span style={{ color: selectedRound === round ? '#3b82f6' : '#e2e8f0', fontWeight: 500, fontSize: 15 }}>{round}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Next Button */}
                                <button
                                    onClick={() => setScheduleStep(2)}
                                    disabled={!selectedRound}
                                    style={{
                                        width: '100%',
                                        padding: 14,
                                        backgroundColor: !selectedRound ? '#475569' : '#3b82f6',
                                        color: '#fff',
                                        border: 'none',
                                        borderRadius: 8,
                                        cursor: !selectedRound ? 'not-allowed' : 'pointer',
                                        fontWeight: 600,
                                        fontSize: 16,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: 8
                                    }}
                                >
                                    Next: Select Interviewer →
                                </button>
                            </>
                        )}

                        {/* STEP 2: Select Interviewer */}
                        {scheduleStep === 2 && (
                            <>
                                {/* Selected Round Summary */}
                                <div style={{ marginBottom: 20, padding: 16, backgroundColor: '#0f172a', borderRadius: 12, border: '1px solid #334155' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <div>
                                            <span style={{ color: '#64748b', fontSize: 11, textTransform: 'uppercase' }}>Selected Round</span>
                                            <p style={{ color: '#3b82f6', fontWeight: 600, fontSize: 16, margin: '4px 0 0' }}>{selectedRound}</p>
                                        </div>
                                        <button
                                            onClick={handleAIMatchInterviewers}
                                            disabled={isAIScoring}
                                            style={{
                                                padding: '10px 20px',
                                                background: 'linear-gradient(135deg, #8b5cf6, #6366f1)',
                                                color: '#fff',
                                                border: 'none',
                                                borderRadius: 8,
                                                cursor: isAIScoring ? 'wait' : 'pointer',
                                                fontWeight: 600,
                                                fontSize: 13,
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 8,
                                                opacity: isAIScoring ? 0.7 : 1
                                            }}
                                        >
                                            {isAIScoring ? 'Scoring...' : 'AI Match'}
                                        </button>
                                    </div>
                                </div>

                                {/* Interviewers List */}
                                <div style={{ marginBottom: 20 }}>
                                    <h4 style={{ color: '#e2e8f0', fontSize: 14, fontWeight: 600, margin: '0 0 12px', textTransform: 'uppercase' }}>Select Interviewer</h4>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 350, overflowY: 'auto' }}>
                                        {interviewers.map(interviewer => (
                                            <div
                                                key={interviewer.id}
                                                onClick={() => setSelectedInterviewer(interviewer)}
                                                style={{
                                                    padding: '12px 16px',
                                                    backgroundColor: selectedInterviewer?.id === interviewer.id ? '#1e293b' : '#0f172a',
                                                    border: selectedInterviewer?.id === interviewer.id ? '2px solid #8b5cf6' : '1px solid #334155',
                                                    borderRadius: 8,
                                                    cursor: 'pointer',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'space-between'
                                                }}
                                            >
                                                <div>
                                                    <span style={{ color: '#f1f5f9', fontWeight: 600, fontSize: 14 }}>{interviewer.name}</span>
                                                    <span style={{ color: '#64748b', fontSize: 13, marginLeft: 12 }}>{interviewer.specialization}</span>
                                                </div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                                    {hasAIScoredInterviewers && interviewer.aiScore && (
                                                        <span style={{
                                                            padding: '4px 10px',
                                                            borderRadius: 6,
                                                            fontSize: 11,
                                                            fontWeight: 600,
                                                            background: 'linear-gradient(135deg, #8b5cf6, #6366f1)',
                                                            color: '#fff'
                                                        }}>
                                                            AI {interviewer.aiScore}%
                                                        </span>
                                                    )}
                                                    {selectedInterviewer?.id === interviewer.id && (
                                                        <span style={{ color: '#8b5cf6', fontSize: 16, fontWeight: 700 }}>✓</span>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Navigation Buttons */}
                                <div style={{ display: 'flex', gap: 12 }}>
                                    <button
                                        onClick={() => setScheduleStep(1)}
                                        style={{
                                            flex: 1,
                                            padding: 14,
                                            backgroundColor: '#334155',
                                            color: '#fff',
                                            border: 'none',
                                            borderRadius: 8,
                                            cursor: 'pointer',
                                            fontWeight: 600,
                                            fontSize: 15
                                        }}
                                    >
                                        ← Back
                                    </button>
                                    <button
                                        onClick={() => setScheduleStep(3)}
                                        disabled={!selectedInterviewer}
                                        style={{
                                            flex: 2,
                                            padding: 14,
                                            backgroundColor: !selectedInterviewer ? '#475569' : '#8b5cf6',
                                            color: '#fff',
                                            border: 'none',
                                            borderRadius: 8,
                                            cursor: !selectedInterviewer ? 'not-allowed' : 'pointer',
                                            fontWeight: 600,
                                            fontSize: 15,
                                            opacity: !selectedInterviewer ? 0.6 : 1
                                        }}
                                    >
                                        Next: Select Date & Time →
                                    </button>
                                </div>
                            </>
                        )}

                        {/* STEP 3: Select Date & Time */}
                        {scheduleStep === 3 && selectedInterviewer && (
                            <>
                                {/* Selection Summary */}
                                <div style={{ marginBottom: 20, padding: 12, backgroundColor: '#0f172a', borderRadius: 8, border: '1px solid #334155', display: 'flex', gap: 20, flexWrap: 'wrap' }}>
                                    <div>
                                        <span style={{ color: '#64748b', fontSize: 11, textTransform: 'uppercase' }}>Round</span>
                                        <p style={{ color: '#3b82f6', fontWeight: 600, fontSize: 14, margin: '4px 0 0' }}>{selectedRound}</p>
                                    </div>
                                    <div>
                                        <span style={{ color: '#64748b', fontSize: 11, textTransform: 'uppercase' }}>Interviewer</span>
                                        <p style={{ color: '#8b5cf6', fontWeight: 600, fontSize: 14, margin: '4px 0 0' }}>{selectedInterviewer.name}</p>
                                    </div>
                                </div>

                                {/* Select Date */}
                                <div className="mb-6">
                                    <h4 className="text-[14px] font-semibold text-slate-100 mb-3 uppercase tracking-wide">
                                        Select Date
                                    </h4>
                                    <p className="text-[12px] text-slate-400 mb-3">
                                        Choose a date to see available time slots:
                                    </p>
                                    <Input
                                        type="date"
                                        value={selectedDate}
                                        onChange={(e) => {
                                            setSelectedDate(e.target.value);
                                            setSelectedTime('');
                                        }}
                                        className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 text-[15px] cursor-pointer focus:outline-none focus:border-indigo-500 focus:shadow-[0_0_0_2px_rgba(79,70,229,0.4)]"
                                    />
                                </div>

                                {/* Select Time (only show if date is selected) */}
                                {selectedDate && (
                                    <div style={{ marginBottom: 24 }}>
                                        <h4 style={{ color: '#e2e8f0', fontSize: 14, fontWeight: 600, margin: '0 0 12px', textTransform: 'uppercase' }}>Select Time</h4>
                                        <p style={{ color: '#94a3b8', fontSize: 12, marginBottom: 12 }}>
                                            {selectedInterviewer.name}'s available slots for {new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}:
                                        </p>
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
                                            {/* Dummy time slots */}
                                            {[
                                                { time: '09:00', endTime: '10:00', duration: 60 },
                                                { time: '10:30', endTime: '11:30', duration: 60 },
                                                { time: '14:00', endTime: '15:00', duration: 60 },
                                                { time: '15:30', endTime: '16:30', duration: 60 },
                                            ].map(slot => (
                                                <div
                                                    key={slot.time}
                                                    onClick={() => setSelectedTime(slot.time)}
                                                    style={{
                                                        padding: '14px 16px',
                                                        backgroundColor: selectedTime === slot.time ? '#334155' : '#0f172a',
                                                        border: selectedTime === slot.time ? '2px solid #10b981' : '1px solid #334155',
                                                        borderRadius: 10,
                                                        cursor: 'pointer',
                                                        textAlign: 'center'
                                                    }}
                                                >
                                                    <span style={{ color: selectedTime === slot.time ? '#10b981' : '#e2e8f0', fontWeight: 600, fontSize: 15 }}>
                                                        {slot.time} - {slot.endTime}
                                                    </span>
                                                    <p style={{ color: '#64748b', fontSize: 11, margin: '4px 0 0' }}>{slot.duration} min</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Summary */}
                                {selectedDate && selectedTime && (
                                    <div style={{ marginBottom: 24, padding: 16, backgroundColor: '#10b98120', borderRadius: 12, border: '1px solid #10b981' }}>
                                        <h4 style={{ color: '#10b981', fontSize: 14, fontWeight: 600, margin: '0 0 12px' }}>Interview Summary</h4>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                                            <div><span style={{ color: '#94a3b8', fontSize: 12 }}>Candidate</span><p style={{ color: '#e2e8f0', margin: '4px 0 0', fontWeight: 500 }}>{selectedCandidate.name}</p></div>
                                            <div><span style={{ color: '#94a3b8', fontSize: 12 }}>Interviewer</span><p style={{ color: '#e2e8f0', margin: '4px 0 0', fontWeight: 500 }}>{selectedInterviewer.name}</p></div>
                                            <div><span style={{ color: '#94a3b8', fontSize: 12 }}>Round</span><p style={{ color: '#e2e8f0', margin: '4px 0 0', fontWeight: 500 }}>{selectedRound}</p></div>
                                            <div><span style={{ color: '#94a3b8', fontSize: 12 }}>Date & Time</span><p style={{ color: '#e2e8f0', margin: '4px 0 0', fontWeight: 500 }}>
                                                {new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} at {selectedTime}
                                            </p></div>
                                        </div>
                                    </div>
                                )}

                                {/* Buttons */}
                                <div style={{ display: 'flex', gap: 12 }}>
                                    <button
                                        onClick={() => { setScheduleStep(2); setSelectedDate(''); setSelectedTime(''); }}
                                        style={{
                                            flex: 1,
                                            padding: 14,
                                            backgroundColor: '#334155',
                                            color: '#fff',
                                            border: 'none',
                                            borderRadius: 8,
                                            cursor: 'pointer',
                                            fontWeight: 600,
                                            fontSize: 16
                                        }}
                                    >
                                        ← Back
                                    </button>
                                    <button
                                        onClick={() => {
                                            if (!selectedDate || !selectedTime) {
                                                alert('Please select a date and time');
                                                return;
                                            }
                                            console.log('Scheduling interview:', {
                                                candidate: selectedCandidate?.name,
                                                interviewer: selectedInterviewer.name,
                                                date: selectedDate,
                                                time: selectedTime,
                                                round: selectedRound
                                            });
                                            alert(`Interview scheduled with ${selectedInterviewer.name} on ${new Date(selectedDate).toLocaleDateString()} at ${selectedTime}`);
                                            setShowInterviewerModal(false);
                                            setSelectedInterviewer(null);
                                            setSelectedDate('');
                                            setSelectedTime('');
                                            setScheduleStep(1);
                                        }}
                                        disabled={!selectedDate || !selectedTime}
                                        style={{
                                            flex: 2,
                                            padding: 14,
                                            backgroundColor: (!selectedDate || !selectedTime) ? '#475569' : '#10b981',
                                            color: '#fff',
                                            border: 'none',
                                            borderRadius: 8,
                                            cursor: (!selectedDate || !selectedTime) ? 'not-allowed' : 'pointer',
                                            fontWeight: 600,
                                            fontSize: 16
                                        }}
                                    >
                                        Schedule Interview
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}

            {/* EXISTING OFFER LETTER MODAL */}
            <OfferLetterModal
                isOpen={showOfferModal}
                onClose={() => { setShowOfferModal(false); setSelectedCandidate(null); }}
                onConfirm={handleConfirmOffer}
                candidate={selectedCandidate ? { name: selectedCandidate.name, email: selectedCandidate.email } : null}
                job={selectedJob ? { title: selectedJob.title, location: selectedJob.location, jobType: selectedJob.jobType || 'Full-time', salary: selectedJob.salary, department: selectedJob.department } : null}
                company={COMPANY_PLACEHOLDER}
                isLoading={false}
            />

            {/* EXISTING REJECTION EMAIL MODAL */}
            <RejectionEmailModal
                isOpen={showRejectionModal}
                onClose={() => { setShowRejectionModal(false); setSelectedCandidate(null); }}
                onConfirm={handleConfirmRejection}
                candidate={selectedCandidate ? { name: selectedCandidate.name, email: selectedCandidate.email } : null}
                job={selectedJob ? { title: selectedJob.title } : null}
                company={COMPANY_PLACEHOLDER}
                isLoading={false}
            />

            {/* INTERVIEW FEEDBACK MODAL */}
            {showFeedbackModal && selectedCandidate && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                    <div style={{ backgroundColor: '#1e293b', borderRadius: 16, padding: 24, maxWidth: 700, width: '95%', maxHeight: '90vh', overflow: 'auto' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                            <div>
                                <h3 style={{ color: '#e2e8f0', margin: 0 }}>Interview Progress</h3>
                                <p style={{ color: '#94a3b8', margin: '4px 0 0', fontSize: 14 }}>{selectedCandidate.name}</p>
                            </div>
                            <button onClick={() => { setShowFeedbackModal(false); }} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: 24 }}>×</button>
                        </div>

                        {/* Candidate Summary */}
                        <div style={{ marginBottom: 24, padding: 16, backgroundColor: '#0f172a', borderRadius: 12 }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                                <div>
                                    <span style={{ color: '#64748b', fontSize: 12 }}>Email</span>
                                    <p style={{ color: '#e2e8f0', margin: '4px 0 0', fontSize: 14 }}>{selectedCandidate.email}</p>
                                </div>
                                <div>
                                    <span style={{ color: '#64748b', fontSize: 12 }}>Experience</span>
                                    <p style={{ color: '#e2e8f0', margin: '4px 0 0', fontSize: 14 }}>{selectedCandidate.experience}</p>
                                </div>
                                <div>
                                    <span style={{ color: '#64748b', fontSize: 12 }}>Location</span>
                                    <p style={{ color: '#e2e8f0', margin: '4px 0 0', fontSize: 14 }}>{selectedCandidate.location}</p>
                                </div>
                                <div>
                                    <span style={{ color: '#64748b', fontSize: 12 }}>AI Score</span>
                                    <p style={{ color: selectedCandidate.aiScore >= 80 ? '#10b981' : '#f59e0b', margin: '4px 0 0', fontSize: 14, fontWeight: 600 }}>{selectedCandidate.aiScore}%</p>
                                </div>
                            </div>
                        </div>

                        {/* Completed Rounds */}
                        <h4 style={{ color: '#e2e8f0', fontSize: 14, fontWeight: 600, margin: '0 0 16px', textTransform: 'uppercase' }}>Completed Interview Rounds</h4>

                        {selectedCandidate.completedRounds && selectedCandidate.completedRounds.length > 0 ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                {selectedCandidate.completedRounds.map((round, idx) => (
                                    <div key={idx} style={{
                                        padding: 16,
                                        backgroundColor: '#0f172a',
                                        borderRadius: 12,
                                        border: `1px solid ${round.result === 'PASSED' ? '#10b981' : '#ef4444'}40`
                                    }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                                <span style={{
                                                    width: 32, height: 32,
                                                    borderRadius: 8,
                                                    backgroundColor: round.result === 'PASSED' ? '#10b98120' : '#ef444420',
                                                    color: round.result === 'PASSED' ? '#10b981' : '#ef4444',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    fontSize: 14, fontWeight: 700
                                                }}>
                                                    {idx + 1}
                                                </span>
                                                <div>
                                                    <span style={{ color: '#f1f5f9', fontWeight: 600, fontSize: 15 }}>{round.roundName}</span>
                                                    <p style={{ color: '#64748b', fontSize: 12, margin: '2px 0 0' }}>{round.date}</p>
                                                </div>
                                            </div>
                                            <span style={{
                                                padding: '6px 14px',
                                                borderRadius: 6,
                                                fontSize: 12,
                                                fontWeight: 600,
                                                backgroundColor: round.result === 'PASSED' ? '#10b98120' : '#ef444420',
                                                color: round.result === 'PASSED' ? '#10b981' : '#ef4444'
                                            }}>
                                                {round.result}
                                            </span>
                                        </div>

                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                                            <div>
                                                <span style={{ color: '#64748b', fontSize: 12 }}>Interviewer</span>
                                                <p style={{ color: '#e2e8f0', margin: '4px 0 0', fontSize: 14 }}>{round.interviewer}</p>
                                            </div>
                                            <div>
                                                <span style={{ color: '#64748b', fontSize: 12 }}>Score</span>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                                                    <div style={{ width: 100, height: 8, backgroundColor: '#334155', borderRadius: 4, overflow: 'hidden' }}>
                                                        <div style={{
                                                            width: `${(round.score / 5) * 100}%`,
                                                            height: '100%',
                                                            backgroundColor: round.score >= 4 ? '#10b981' : round.score >= 3 ? '#f59e0b' : '#ef4444',
                                                            borderRadius: 4
                                                        }} />
                                                    </div>
                                                    <span style={{ color: '#e2e8f0', fontSize: 14, fontWeight: 600 }}>{round.score.toFixed(1)}/5</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div style={{ backgroundColor: '#1e293b', borderRadius: 8, padding: 12 }}>
                                            <span style={{ color: '#64748b', fontSize: 12 }}>Feedback</span>
                                            <p style={{ color: '#e2e8f0', margin: '6px 0 0', fontSize: 14, fontStyle: 'italic', lineHeight: 1.5 }}>"{round.feedback}"</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div style={{ padding: 24, textAlign: 'center', color: '#64748b', backgroundColor: '#0f172a', borderRadius: 12 }}>
                                No interview rounds completed yet
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
                            <button
                                onClick={() => { setShowFeedbackModal(false); handleAssignNextRound(selectedCandidate); }}
                                style={{ flex: 1, padding: 14, backgroundColor: '#8b5cf6', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: 14 }}
                            >
                                Assign Next Round
                            </button>
                            <button
                                onClick={() => { setShowFeedbackModal(false); handleSendOffer(selectedCandidate); }}
                                style={{ flex: 1, padding: 14, backgroundColor: '#10b981', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: 14 }}
                            >
                                Send Offer
                            </button>
                            <button
                                onClick={() => { setShowFeedbackModal(false); handleReject(selectedCandidate); }}
                                style={{ flex: 1, padding: 14, backgroundColor: '#ef4444', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: 14 }}
                            >
                                Reject
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </>

    );
};

export default HRApplicationsPage;
