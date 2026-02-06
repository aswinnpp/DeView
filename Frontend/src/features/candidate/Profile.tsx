import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { CandidateNavHeader } from '../../components/common';
import { useCandidateProfile } from '../../hooks/useCandidateProfile';
import { FormField, ProfileSection, ArrayField } from '../../components/form/ProfileFormComponents';
import './Profile.css';

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

    // All logic is now in the hook - Profile.tsx is purely presentational
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

    // Calculate progress bar class
    const progressComplete = (locationState?.completionPercentage || 0) >= 80;

    if (isLoading) {
        return (
            <div className="candidate-container">
                <div className="candidate-card">
                    <CandidateNavHeader title="PROFILE" currentPage="profile" />
                    <div className="profile-loading">
                        <div className="loading-spinner"></div>
                        <p>Loading profile...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="candidate-container">
            <div className="candidate-card">
                <CandidateNavHeader title="PROFILE" currentPage="profile" />

                <div className="profile-content-full">

                    {/* Error Display - shows backend validation errors */}
                    {error && (
                        <div className="error-alert">
                            <span className="error-alert-text">⚠️ {error}</span>
                            <button className="error-alert-dismiss" onClick={clearError}>
                                Dismiss
                            </button>
                        </div>
                    )}

                    {!profileExists && (
                        <div className="profile-welcome">
                            <h2>Welcome! Let's set up your profile</h2>
                            <p>Complete your profile to apply for jobs and get noticed by employers.</p>
                        </div>
                    )}

                    {showProfileWarning && (
                        <div className="warning-alert">
                            <h3 className="warning-alert-title">
                                ⚠️ Complete Your Profile to Continue
                            </h3>

                            {locationState?.completionPercentage !== undefined && (
                                <div className="progress-container">
                                    <div className="progress-header">
                                        <span className="progress-label">Profile Completion</span>
                                        <span className={`progress-value ${progressComplete ? 'complete' : 'incomplete'}`}>
                                            {locationState.completionPercentage}% / 80%
                                        </span>
                                    </div>
                                    <div className="progress-bar">
                                        <div
                                            className={`progress-fill ${progressComplete ? 'complete' : 'incomplete'}`}
                                            style={{ width: `${locationState.completionPercentage}%` }}
                                        />
                                    </div>
                                </div>
                            )}

                            <div className="text-center mt-16">
                                <button
                                    className="warning-alert-dismiss"
                                    onClick={() => setShowProfileWarning(false)}
                                >
                                    Got it
                                </button>
                            </div>
                        </div>
                    )}

                    <div className="profile-main-full">
                        <div className="profile-header">
                            <div className="profile-left">
                                <div className="avatar-placeholder">
                                    {profileData.fullName ? profileData.fullName.charAt(0).toUpperCase() : '👤'}
                                </div>
                                <div className="profile-info">
                                    <h1 className="profile-name">{profileData.fullName || 'Your Name'}</h1>
                                    <p className="profile-title">{profileData.title || 'Your Title'}</p>
                                    {profileData.currentCompany && <p className="profile-company">@ {profileData.currentCompany}</p>}
                                    {profileData.location && <p className="profile-location">📍 {profileData.location}</p>}
                                </div>
                            </div>

                            <div className="profile-actions">
                                {!isEditing ? (
                                    <>
                                        <button className="edit-profile-btn" onClick={() => setIsEditing(true)}>
                                            Edit Profile
                                        </button>
                                        <button
                                            className="logout-btn"
                                            onClick={handleLogout}
                                            disabled={isLoggingOut}
                                        >
                                            {isLoggingOut ? 'Logging out...' : 'Logout'}
                                        </button>
                                    </>
                                ) : (
                                    <div className="edit-actions">
                                        <button className="save-btn" onClick={handleSave} disabled={isSaving}>
                                            {isSaving ? 'Saving...' : 'Save'}
                                        </button>
                                        {profileExists && (
                                            <button className="cancel-btn" onClick={handleCancel}>Cancel</button>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="profile-sections">
                            {/* Personal Information */}
                            <ProfileSection title="Personal Information">
                                <FormField label="Full Name" name="fullName" value={profileData.fullName} onChange={handleInputChange} disabled={!isEditing} placeholder="Enter your full name" required error={validationErrors.fullName} />
                                <FormField label="Email" name="email" value={profileData.email} onChange={handleInputChange} disabled type="email" />
                                <FormField label="Phone" name="phone" value={profileData.phone} onChange={handleInputChange} disabled={!isEditing} placeholder="+1 (555) 123-4567" error={validationErrors.phone} />
                                <FormField label="Location" name="location" value={profileData.location} onChange={handleInputChange} disabled={!isEditing} placeholder="City, Country" />
                                <FormField label="Date of Birth" name="dateOfBirth" value={profileData.dateOfBirth} onChange={handleInputChange} disabled={!isEditing} type="date" error={validationErrors.dateOfBirth} />
                            </ProfileSection>

                            {/* Professional Information - OPTIONAL (not counted toward profile completion) */}
                            <ProfileSection title="Professional Information" optional>
                                <FormField label="Job Title" name="title" value={profileData.title} onChange={handleInputChange} disabled={!isEditing} placeholder="e.g., Frontend Developer" />
                                <FormField label="Current Company" name="currentCompany" value={profileData.currentCompany} onChange={handleInputChange} disabled={!isEditing} placeholder="e.g., Google" />
                                <FormField label="Current Salary" name="currentSalary" value={profileData.currentSalary} onChange={handleInputChange} disabled={!isEditing} placeholder="e.g., $80,000/year" />
                                <FormField label="Years of Experience" name="experience" value={profileData.experience} onChange={handleInputChange} disabled={!isEditing} placeholder="e.g., 3 years" />
                            </ProfileSection>

                            {/* About & Availability */}
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

                            {/* Job Preferences */}
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

                            {/* Skills */}
                            <ArrayField
                                items={profileData.skills}
                                field="skills"
                                isEditing={isEditing}
                                onChange={handleArrayChange}
                                onAdd={addArrayItem}
                                onRemove={removeArrayItem}
                                label="Skills"
                            />

                            {/* Languages */}
                            <ArrayField
                                items={profileData.languages}
                                field="languages"
                                isEditing={isEditing}
                                onChange={handleArrayChange}
                                onAdd={addArrayItem}
                                onRemove={removeArrayItem}
                                label="Languages"
                            />

                            {/* Education */}
                            <ProfileSection title="Education">
                                <FormField label="Highest Qualification" name="education" value={profileData.education} onChange={handleInputChange} disabled={!isEditing} placeholder="e.g., Bachelor of Science in Computer Science" />
                                <FormField label="University/School" name="university" value={profileData.university} onChange={handleInputChange} disabled={!isEditing} placeholder="e.g., Stanford University" />
                                <FormField label="Graduation Year" name="graduationYear" value={profileData.graduationYear} onChange={handleInputChange} disabled={!isEditing} placeholder="e.g., 2021" />
                            </ProfileSection>

                            {/* Links */}
                            <ProfileSection title="Links" optional>
                                <FormField label="LinkedIn URL" name="linkedinUrl" value={profileData.linkedinUrl} onChange={handleInputChange} disabled={!isEditing} placeholder="https://linkedin.com/in/yourprofile" error={validationErrors.linkedinUrl} />
                                <FormField label="GitHub URL" name="githubUrl" value={profileData.githubUrl} onChange={handleInputChange} disabled={!isEditing} placeholder="https://github.com/yourusername" error={validationErrors.githubUrl} />
                            </ProfileSection>

                            {/* Resume Upload */}
                            <section className="profile-section">
                                <h3 className="section-title">Resume</h3>
                                <div className="resume-upload-container">
                                    {profileData.resumeUrl ? (
                                        <div className="resume-display">
                                            <span className="resume-icon">📄</span>
                                            <a
                                                href={`${API_BASE_URL}${profileData.resumeUrl}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="resume-link"
                                            >
                                                View Resume
                                            </a>
                                            {isEditing && (
                                                <label className="resume-replace-btn">
                                                    {isUploading ? 'Uploading...' : 'Replace'}
                                                    <input
                                                        type="file"
                                                        accept=".pdf"
                                                        onChange={handleResumeUpload}
                                                        disabled={isUploading}
                                                        style={{ display: 'none' }}
                                                    />
                                                </label>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="resume-upload">
                                            {isEditing ? (
                                                <label className="resume-upload-btn">
                                                    {isUploading ? 'Uploading...' : '📤 Upload Resume (PDF)'}
                                                    <input
                                                        type="file"
                                                        accept=".pdf"
                                                        onChange={handleResumeUpload}
                                                        disabled={isUploading}
                                                        style={{ display: 'none' }}
                                                    />
                                                </label>
                                            ) : (
                                                <p className="no-data">No resume uploaded yet</p>
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
