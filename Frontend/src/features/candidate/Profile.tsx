import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { CandidateNavHeader } from '../../components/common';
import { useCandidateProfile } from '../../hooks/useCandidateProfile';
import { FormField, ProfileSection, ArrayField } from '../../components/form/ProfileFormComponents';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

interface LocationState {
    from?: string;
    profileIncomplete?: boolean;
    showProfileWarning?: boolean;
    missingFields?: string[];
    completionPercentage?: number;
    requiredPercentage?: number;
}

const Profile: React.FC = () => {
    const location = useLocation();
    const locationState = location.state as LocationState | null;
    const [showProfileWarning, setShowProfileWarning] = useState(
        locationState?.profileIncomplete || locationState?.showProfileWarning || false
    );

    const {
        profileData,
        isEditing,
        setIsEditing,
        isLoading,
        isSaving,
        isUploading,
        isLoggingOut,
        error,
        clearError,
        validationErrors,
        profileExists,
        handleInputChange,
        handleArrayChange,
        addArrayItem,
        removeArrayItem,
        handleSave,
        handleCancel,
        handleResumeUpload,
        handleLogout,
    } = useCandidateProfile();

    const progressComplete = (locationState?.completionPercentage || 0) >= 80;

    if (isLoading) {
        return (
            <div className="min-h-screen w-full bg-linear-to-br from-[#111318] to-[#0b0f17] font-[Inter,-apple-system,BlinkMacSystemFont,'Segoe_UI',Roboto,sans-serif] text-[rgba(255,255,255,0.95)] box-border">
                <div className="w-full min-h-screen bg-[rgba(15,15,25,0.96)] border border-[rgba(255,255,255,0.03)] backdrop-blur-[10px] overflow-hidden">
                    <CandidateNavHeader title="PROFILE" currentPage="profile" />
                    <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
                        <div className="w-12 h-12 border-4 border-[rgba(255,255,255,0.1)] border-t-brand-primary rounded-full animate-spin"></div>
                        <p className="text-[rgba(255,255,255,0.7)] text-base">Loading profile...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen w-full bg-linear-to-br from-[#111318] to-[#0b0f17] font-[Inter,-apple-system,BlinkMacSystemFont,'Segoe_UI',Roboto,sans-serif] text-[rgba(255,255,255,0.95)] box-border">
            <div className="w-full min-h-screen bg-[rgba(15,15,25,0.96)] border border-[rgba(255,255,255,0.03)] backdrop-blur-[10px] overflow-hidden">
                <CandidateNavHeader title="PROFILE" currentPage="profile" />

                <div className="py-7 px-12 pb-20 w-full box-border max-[480px]:p-[18px]">

                    {/* Error Alert */}
                    {error && (
                        <div className="bg-[rgba(239,68,68,0.15)] border border-[rgba(239,68,68,0.4)] rounded-xl py-4 px-5 mb-5 flex justify-between items-center">
                            <span className="text-brand-red text-sm">⚠️ {error}</span>
                            <button className="bg-[rgba(239,68,68,0.2)] border border-[rgba(239,68,68,0.4)] rounded-md text-brand-red py-1.5 px-3 text-xs cursor-pointer transition-colors duration-200 hover:bg-[rgba(239,68,68,0.3)]" onClick={clearError}>
                                Dismiss
                            </button>
                        </div>
                    )}

                    {/* Welcome for new profiles */}
                    {!profileExists && (
                        <div className="bg-linear-to-br from-[rgba(102,126,234,0.1)] to-[rgba(118,75,162,0.1)] border border-[rgba(102,126,234,0.2)] p-6 rounded-xl mb-6 text-center">
                            <h2 className="m-0 mb-2 text-white text-xl font-bold">Welcome! Let's set up your profile</h2>
                            <p className="m-0 text-[rgba(255,255,255,0.7)] text-[15px]">Complete your profile to apply for jobs and get noticed by employers.</p>
                        </div>
                    )}

                    {/* Profile Warning */}
                    {showProfileWarning && (
                        <div className="bg-[rgba(251,191,36,0.15)] border border-[rgba(251,191,36,0.4)] rounded-xl py-5 px-6 mb-5">
                            <h3 className="text-[#fbbf24] m-0 mb-4 text-lg text-center">
                                ⚠️ Complete Your Profile to Continue
                            </h3>

                            {locationState?.completionPercentage !== undefined && (
                                <div className="max-w-[400px] mx-auto">
                                    <div className="flex justify-between mb-2">
                                        <span className="text-[#94a3b8] text-sm">Profile Completion</span>
                                        <span className={`font-bold text-sm ${progressComplete ? 'text-brand-green' : 'text-[#fbbf24]'}`}>
                                            {locationState.completionPercentage}% / 80%
                                        </span>
                                    </div>
                                    <div className="w-full h-2.5 bg-[rgba(255,255,255,0.1)] rounded-[5px] overflow-hidden">
                                        <div
                                            className={`h-full rounded-[5px] transition-[width] duration-300 ${progressComplete ? 'bg-linear-to-r from-brand-green to-[#34d399]' : 'bg-linear-to-r from-brand-amber to-[#fbbf24]'}`}
                                            style={{ width: `${locationState.completionPercentage}%` }}
                                        />
                                    </div>
                                </div>
                            )}

                            <div className="text-center mt-4">
                                <button
                                    className="py-2.5 px-6 bg-linear-to-br from-brand-violet to-brand-cyan border-none rounded-lg text-white text-sm font-semibold cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(139,92,246,0.3)]"
                                    onClick={() => setShowProfileWarning(false)}
                                >
                                    Got it
                                </button>
                            </div>
                        </div>
                    )}

                    <div className="max-w-[1100px] mx-auto">
                        {/* Profile Header */}
                        <div className="flex justify-between items-center gap-[18px] mb-[18px] max-[900px]:flex-col max-[900px]:items-start max-[900px]:gap-3">
                            <div className="flex gap-4 items-center">
                                <div className="w-22 h-22 rounded-[14px] bg-linear-to-br from-brand-primary to-brand-secondary flex items-center justify-center text-4xl shadow-[0_6px_18px_rgba(0,0,0,0.4)] max-[480px]:w-[72px] max-[480px]:h-[72px] max-[480px]:text-[28px]">
                                    {profileData.fullName ? profileData.fullName.charAt(0).toUpperCase() : '👤'}
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <h1 className="m-0 text-2xl font-extrabold text-white max-[480px]:text-xl">{profileData.fullName || 'Your Name'}</h1>
                                    <p className="m-0 text-sm text-[rgba(255,255,255,0.8)] font-semibold">{profileData.title || 'Your Title'}</p>
                                    {profileData.currentCompany && <p className="m-0 text-[13px] text-[rgba(255,255,255,0.6)]">@ {profileData.currentCompany}</p>}
                                    {profileData.location && <p className="m-0 text-[13px] text-[rgba(255,255,255,0.7)]">📍 {profileData.location}</p>}
                                </div>
                            </div>

                            <div className="flex gap-3 items-center max-[900px]:w-full max-[900px]:justify-end">
                                {!isEditing ? (
                                    <>
                                        <button className="border-none py-2.5 px-4 rounded-[10px] font-bold cursor-pointer bg-linear-to-br from-brand-primary to-brand-secondary text-white" onClick={() => setIsEditing(true)}>
                                            Edit Profile
                                        </button>
                                        <button
                                            className="bg-linear-to-br from-brand-red to-brand-red-dark text-white border-none py-2.5 px-4 rounded-[10px] font-bold cursor-pointer ml-3 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(239,68,68,0.3)]"
                                            onClick={handleLogout}
                                            disabled={isLoggingOut}
                                        >
                                            {isLoggingOut ? 'Logging out...' : 'Logout'}
                                        </button>
                                    </>
                                ) : (
                                    <div className="flex gap-3 items-center">
                                        <button className="border-none py-2.5 px-4 rounded-[10px] font-bold cursor-pointer bg-linear-to-br from-brand-green to-brand-green-dark text-white disabled:opacity-60 disabled:cursor-not-allowed" onClick={handleSave} disabled={isSaving}>
                                            {isSaving ? 'Saving...' : 'Save'}
                                        </button>
                                        {profileExists && (
                                            <button className="border-none py-2.5 px-4 rounded-[10px] font-bold cursor-pointer bg-[rgba(255,255,255,0.04)] text-[rgba(255,255,255,0.9)]" onClick={handleCancel}>Cancel</button>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Profile Sections */}
                        <div className="flex flex-col gap-6 mt-1.5">
                            <ProfileSection title="Personal Information">
                                <FormField label="Full Name" name="fullName" value={profileData.fullName} onChange={handleInputChange} disabled={!isEditing} placeholder="Enter your full name" required error={validationErrors.fullName} />
                                <FormField label="Email" name="email" value={profileData.email} onChange={handleInputChange} disabled type="email" />
                                <FormField label="Phone" name="phone" value={profileData.phone} onChange={handleInputChange} disabled={!isEditing} placeholder="+1 (555) 123-4567" error={validationErrors.phone} />
                                <FormField label="Location" name="location" value={profileData.location} onChange={handleInputChange} disabled={!isEditing} placeholder="City, Country" />
                                <FormField label="Date of Birth" name="dateOfBirth" value={profileData.dateOfBirth} onChange={handleInputChange} disabled={!isEditing} type="date" error={validationErrors.dateOfBirth} />
                            </ProfileSection>

                            <ProfileSection title="Professional Information" optional>
                                <FormField label="Job Title" name="title" value={profileData.title} onChange={handleInputChange} disabled={!isEditing} placeholder="e.g., Frontend Developer" />
                                <FormField label="Current Company" name="currentCompany" value={profileData.currentCompany} onChange={handleInputChange} disabled={!isEditing} placeholder="e.g., Google" />
                                <FormField label="Current Salary" name="currentSalary" value={profileData.currentSalary} onChange={handleInputChange} disabled={!isEditing} placeholder="e.g., $80,000/year" />
                                <FormField label="Years of Experience" name="experience" value={profileData.experience} onChange={handleInputChange} disabled={!isEditing} placeholder="e.g., 3 years" />
                            </ProfileSection>

                            <ProfileSection title="About & Availability">
                                <FormField label="Bio" name="bio" value={profileData.bio} onChange={handleInputChange} disabled={!isEditing} type="textarea" rows={4} placeholder="Tell employers about yourself..." required error={validationErrors.bio} />
                                <FormField label="Expected Salary" name="expectedSalary" value={profileData.expectedSalary} onChange={handleInputChange} disabled={!isEditing} placeholder="e.g., $100,000/year" required error={validationErrors.expectedSalary} />
                                <FormField
                                    label="Notice Period"
                                    name="noticePeriod"
                                    value={profileData.noticePeriod}
                                    onChange={handleInputChange}
                                    disabled={!isEditing}
                                    type="select"
                                    required
                                    options={[
                                        { value: '', label: 'Select notice period' },
                                        { value: 'Immediate', label: 'Immediate' },
                                        { value: '1 week', label: '1 week' },
                                        { value: '2 weeks', label: '2 weeks' },
                                        { value: '1 month', label: '1 month' },
                                        { value: '2 months', label: '2 months' },
                                        { value: '3 months', label: '3 months' }
                                    ]}
                                    error={validationErrors.noticePeriod}
                                />
                            </ProfileSection>

                            <ProfileSection title="Job Preferences">
                                <FormField
                                    label="Preferred Work Mode"
                                    name="preferredWorkMode"
                                    value={profileData.preferredWorkMode}
                                    onChange={handleInputChange}
                                    disabled={!isEditing}
                                    type="select"
                                    options={[
                                        { value: '', label: 'Select work mode' },
                                        { value: 'Remote', label: 'Remote' },
                                        { value: 'Hybrid', label: 'Hybrid' },
                                        { value: 'On-site', label: 'On-site' },
                                        { value: 'Flexible', label: 'Flexible' }
                                    ]}
                                />
                                <FormField
                                    label="Preferred Job Type"
                                    name="preferredJobType"
                                    value={profileData.preferredJobType}
                                    onChange={handleInputChange}
                                    disabled={!isEditing}
                                    type="select"
                                    options={[
                                        { value: '', label: 'Select job type' },
                                        { value: 'Full-time', label: 'Full-time' },
                                        { value: 'Part-time', label: 'Part-time' },
                                        { value: 'Contract', label: 'Contract' },
                                        { value: 'Freelance', label: 'Freelance' },
                                        { value: 'Internship', label: 'Internship' }
                                    ]}
                                />
                                <FormField label="Willing to Relocate" name="willingToRelocate" value={profileData.willingToRelocate} onChange={handleInputChange} disabled={!isEditing} type="checkbox" />
                            </ProfileSection>

                            <ArrayField items={profileData.skills} field="skills" isEditing={isEditing} onChange={handleArrayChange} onAdd={addArrayItem} onRemove={removeArrayItem} label="Skills" />
                            <ArrayField items={profileData.languages} field="languages" isEditing={isEditing} onChange={handleArrayChange} onAdd={addArrayItem} onRemove={removeArrayItem} label="Languages" />

                            <ProfileSection title="Education">
                                <FormField label="Highest Qualification" name="education" value={profileData.education} onChange={handleInputChange} disabled={!isEditing} placeholder="e.g., Bachelor of Science in Computer Science" />
                                <FormField label="University/School" name="university" value={profileData.university} onChange={handleInputChange} disabled={!isEditing} placeholder="e.g., Stanford University" />
                                <FormField label="Graduation Year" name="graduationYear" value={profileData.graduationYear} onChange={handleInputChange} disabled={!isEditing} placeholder="e.g., 2021" />
                            </ProfileSection>

                            <ProfileSection title="Links" optional>
                                <FormField label="LinkedIn URL" name="linkedinUrl" value={profileData.linkedinUrl} onChange={handleInputChange} disabled={!isEditing} placeholder="https://linkedin.com/in/yourprofile" error={validationErrors.linkedinUrl} />
                                <FormField label="GitHub URL" name="githubUrl" value={profileData.githubUrl} onChange={handleInputChange} disabled={!isEditing} placeholder="https://github.com/yourusername" error={validationErrors.githubUrl} />
                            </ProfileSection>

                            {/* Resume Upload */}
                            <section className="bg-[rgba(255,255,255,0.01)] rounded-xl p-[18px] border border-[rgba(255,255,255,0.02)]">
                                <h3 className="m-0 mb-2.5 text-base font-bold text-white">Resume</h3>
                                <div className="py-4">
                                    {profileData.resumeUrl ? (
                                        <div className="flex items-center gap-3 p-4 bg-[rgba(102,126,234,0.1)] border border-[rgba(102,126,234,0.2)] rounded-[10px]">
                                            <span className="text-2xl">📄</span>
                                            <a
                                                href={`${API_BASE_URL}${profileData.resumeUrl}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-brand-primary no-underline font-medium transition-colors duration-200 hover:text-brand-secondary hover:underline"
                                            >
                                                View Resume
                                            </a>
                                            {isEditing && (
                                                <label className="ml-auto py-2 px-4 bg-[rgba(255,255,255,0.1)] border border-[rgba(255,255,255,0.2)] rounded-md text-white text-[13px] cursor-pointer transition-all duration-200 hover:bg-[rgba(255,255,255,0.15)]">
                                                    {isUploading ? 'Uploading...' : 'Replace'}
                                                    <input
                                                        type="file"
                                                        accept=".pdf"
                                                        onChange={handleResumeUpload}
                                                        disabled={isUploading}
                                                        className="hidden"
                                                    />
                                                </label>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-[rgba(255,255,255,0.2)] rounded-[10px] bg-[rgba(255,255,255,0.02)] transition-all duration-200 hover:border-[rgba(102,126,234,0.4)] hover:bg-[rgba(102,126,234,0.05)]">
                                            {isEditing ? (
                                                <label className="inline-flex items-center gap-2 py-3 px-6 bg-linear-to-br from-brand-primary to-brand-secondary rounded-lg text-white text-sm font-medium cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_20px_rgba(102,126,234,0.3)]">
                                                    {isUploading ? 'Uploading...' : '📤 Upload Resume (PDF)'}
                                                    <input
                                                        type="file"
                                                        accept=".pdf"
                                                        onChange={handleResumeUpload}
                                                        disabled={isUploading}
                                                        className="hidden"
                                                    />
                                                </label>
                                            ) : (
                                                <p className="text-[rgba(255,255,255,0.5)] italic text-sm m-0">No resume uploaded yet</p>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </section>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
