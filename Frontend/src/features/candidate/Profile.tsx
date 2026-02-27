import { useEffect, useRef } from 'react';
import { Input, Button } from '../../components/common';
import CandidateNavHeader from './CandidateNavHeader';
import { useCandidateProfile } from '../../hooks/candidate/useCandidateProfile';
import { useFileUpload } from '../../hooks/useFileUpload';



const Profile = () => {
    const errorBannerRef = useRef<HTMLDivElement>(null);

    const {
        form,
        profileData,
        isEditing,
        setIsEditing,
        isLoading,
        isSaving,
        isLoggingOut,
        validationErrors,
        profileExists,
        handleArrayChange,
        addArrayItem,
        removeArrayItem,
        handleFormSubmit,
        handleCancel,
        handleLogout,
        error: formError,
    } = useCandidateProfile();

    const { upload, isUploading, uploadedFile } = useFileUpload();

    useEffect(() => {
        if (uploadedFile?.url) {
            form.setValue('resumeUrl', uploadedFile.url, { shouldDirty: true, shouldValidate: true });
        }
    }, [uploadedFile, form]);

    const handleResumeSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        e.target.value = '';
        upload(file, 'resume');
    };

    const handleEditClick = () => setIsEditing(true);
    const handleCancelClick = () => handleCancel();

    useEffect(() => {
        if (formError && errorBannerRef.current) {
            errorBannerRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    }, [formError]);

    const { register } = form;


    const errorBorderStyle = (fieldError?: string): React.CSSProperties =>
        fieldError ? { borderColor: '#ef4444', boxShadow: '0 0 0 1px rgba(239, 68, 68, 0.3)' } : {};

    if (isLoading) {
        return (
            <div className="min-h-screen w-full bg-linear-to-br from-[#111318] to-[#0b0f17] font-[Inter,-apple-system,BlinkMacSystemFont,'Segoe_UI',Roboto,sans-serif] text-[rgba(255,255,255,0.95)] box-border">
                <div className="w-full min-h-screen bg-[rgba(15,15,25,0.96)] border border-[rgba(255,255,255,0.03)] backdrop-blur-[10px] overflow-hidden">
                    <CandidateNavHeader title="PROFILE" currentPage="profile" />
                    <div className="pt-[72px] flex flex-col items-center justify-center min-h-[400px] gap-4">
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

                <div className="pt-[72px] py-7 px-12 max-md:py-5 max-md:px-4 pb-20 max-md:pb-12 w-full box-border max-[480px]:p-[18px] max-[480px]:pt-[68px]">



                    {!profileExists && (
                        <div className="bg-linear-to-br from-[rgba(102,126,234,0.1)] to-[rgba(118,75,162,0.1)] border border-[rgba(102,126,234,0.2)] p-6 max-md:p-4 rounded-xl mb-6 max-md:mb-4 text-center">
                            <h2 className="m-0 mb-2 max-md:mb-1.5 text-white text-xl max-md:text-lg font-bold">Welcome! Let's set up your profile</h2>
                            <p className="m-0 text-[rgba(255,255,255,0.7)] text-[15px] max-md:text-sm">Complete your profile to apply for jobs and get noticed by employers.</p>
                        </div>
                    )}

                  

                    <form
                        id="candidate-profile-form"
                        className="max-w-[1100px] mx-auto"
                        onSubmit={handleFormSubmit}
                        noValidate
                    >
                        {/* Profile Header */}
                        <div className="flex justify-between items-center gap-[18px] mb-[18px] max-md:mb-4 max-[900px]:flex-col max-[900px]:items-start max-[900px]:gap-3">
                            <div className="flex gap-4 max-md:gap-3 items-center min-w-0 flex-1">
                                <div className="w-22 h-22 max-md:w-16 max-md:h-16 rounded-[14px] bg-linear-to-br from-brand-primary to-brand-secondary flex items-center justify-center text-4xl max-md:text-3xl shadow-[0_6px_18px_rgba(0,0,0,0.4)] max-[480px]:w-[72px] max-[480px]:h-[72px] max-[480px]:text-[28px] shrink-0">
                                    {profileData.fullName ? profileData.fullName.charAt(0).toUpperCase() : '👤'}
                                </div>
                                <div className="flex flex-col gap-1.5 min-w-0 flex-1">
                                    <h1 className="m-0 text-2xl max-md:text-xl font-extrabold text-white max-[480px]:text-lg truncate">{profileData.fullName || 'Your Name'}</h1>
                                    <p className="m-0 text-sm max-md:text-xs text-[rgba(255,255,255,0.8)] font-semibold truncate">{profileData.title || 'Your Title'}</p>
                                    {profileData.currentCompany && <p className="m-0 text-[13px] max-md:text-xs text-[rgba(255,255,255,0.6)] truncate">@ {profileData.currentCompany}</p>}
                                    {profileData.location && <p className="m-0 text-[13px] max-md:text-xs text-[rgba(255,255,255,0.7)] truncate">📍 {profileData.location}</p>}
                                </div>
                            </div>

                            <div className="flex gap-3 max-md:gap-2 items-center max-[900px]:w-full max-[900px]:justify-end max-md:flex-wrap">
                                {!isEditing ? (
                                    <>
                                        <Button type="button" variant="primary" className="py-2.5 px-4 max-md:py-2 max-md:px-3 max-md:text-sm rounded-[10px] font-bold" onClick={handleEditClick}>
                                            Edit Profile
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="danger"
                                            className="py-2.5 px-4 max-md:py-2 max-md:px-3 max-md:text-sm rounded-[10px] font-bold max-md:ml-0"
                                            onClick={handleLogout}
                                            disabled={isLoggingOut}
                                        >
                                            {isLoggingOut ? 'Logging out...' : 'Logout'}
                                        </Button>
                                    </>
                                ) : (
                                    <div className="flex gap-3 max-md:gap-2 items-center max-md:w-full max-md:flex-col">
                                        <Button type="button" variant="secondary" className="py-2.5 px-4 max-md:w-full max-md:py-2 max-md:text-sm rounded-[10px] font-bold" onClick={handleCancelClick}>Cancel</Button>
                                        <Button type="submit" variant="primary" className="py-2.5 px-4 max-md:w-full max-md:py-2 max-md:text-sm rounded-[10px] font-bold disabled:opacity-60 disabled:cursor-not-allowed" disabled={isSaving}>
                                            {isSaving ? 'Saving...' : 'Save'}
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {formError && (
                            <div ref={errorBannerRef} className="mb-4 p-3 rounded-lg bg-[rgba(239,68,68,0.15)] border border-[rgba(239,68,68,0.3)] text-[#ef4444] text-sm" role="alert">
                                {formError}
                            </div>
                        )}

                        {/* Profile Sections - full form */}
                        <div className="flex flex-col gap-6 mt-1.5">

                            <section className="bg-[rgba(255,255,255,0.01)] rounded-xl p-[18px] max-md:p-4 border border-[rgba(255,255,255,0.02)]">
                                <h3 className="m-0 mb-2.5 max-md:mb-2 text-base max-md:text-sm font-bold text-white">Personal Information</h3>
                                <div className="grid grid-cols-2 gap-y-3 gap-x-[18px] max-md:gap-y-2 max-md:gap-x-0 max-[900px]:grid-cols-1">
                                    <Input label="Full Name *" {...register('fullName')} disabled={!isEditing} placeholder="Enter your full name" className="bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.04)] text-[rgba(255,255,255,0.95)] py-2.5 px-3 rounded-lg text-sm outline-none placeholder:text-[rgba(255,255,255,0.45)] disabled:opacity-70" labelClassName="text-[13px] text-[rgba(255,255,255,0.8)] font-semibold" errorClassName="text-[#ef4444] text-xs mt-1 block" wrapperClassName="flex flex-col gap-2" error={validationErrors.fullName?.message} style={errorBorderStyle(validationErrors.fullName?.message)} />
                                    <Input label="Email" {...register('email')} type="email" disabled className="bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.04)] text-[rgba(255,255,255,0.95)] py-2.5 px-3 rounded-lg text-sm outline-none placeholder:text-[rgba(255,255,255,0.45)] disabled:opacity-70" labelClassName="text-[13px] text-[rgba(255,255,255,0.8)] font-semibold" wrapperClassName="flex flex-col gap-2" />
                                    <Input label="Phone *" {...register('phone')} disabled={!isEditing} placeholder="+1 (555) 123-4567" className="bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.04)] text-[rgba(255,255,255,0.95)] py-2.5 px-3 rounded-lg text-sm outline-none placeholder:text-[rgba(255,255,255,0.45)] disabled:opacity-70" labelClassName="text-[13px] text-[rgba(255,255,255,0.8)] font-semibold" errorClassName="text-[#ef4444] text-xs mt-1 block" wrapperClassName="flex flex-col gap-2" error={validationErrors.phone?.message} style={errorBorderStyle(validationErrors.phone?.message)} />
                                    <Input label="Location *" {...register('location')} disabled={!isEditing} placeholder="City, Country" className="bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.04)] text-[rgba(255,255,255,0.95)] py-2.5 px-3 rounded-lg text-sm outline-none placeholder:text-[rgba(255,255,255,0.45)] disabled:opacity-70" labelClassName="text-[13px] text-[rgba(255,255,255,0.8)] font-semibold" errorClassName="text-[#ef4444] text-xs mt-1 block" wrapperClassName="flex flex-col gap-2" error={validationErrors.location?.message} style={errorBorderStyle(validationErrors.location?.message)} />
                                    <Input label="Date of Birth *" {...register('dateOfBirth')} type="date" disabled={!isEditing} className="bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.04)] text-[rgba(255,255,255,0.95)] py-2.5 px-3 rounded-lg text-sm outline-none placeholder:text-[rgba(255,255,255,0.45)] disabled:opacity-70" labelClassName="text-[13px] text-[rgba(255,255,255,0.8)] font-semibold" errorClassName="text-[#ef4444] text-xs mt-1 block" wrapperClassName="flex flex-col gap-2" error={validationErrors.dateOfBirth?.message} style={errorBorderStyle(validationErrors.dateOfBirth?.message)} />
                                </div>
                            </section>

                            <section className="bg-[rgba(255,255,255,0.01)] rounded-xl p-[18px] max-md:p-4 border border-[rgba(255,255,255,0.02)]">
                                <h3 className="m-0 mb-2.5 max-md:mb-2 text-base max-md:text-sm font-bold text-white">About & Availability</h3>
                                <div className="grid grid-cols-2 gap-y-3 gap-x-[18px] max-md:gap-y-2 max-md:gap-x-0 max-[900px]:grid-cols-1">
                                    {/* Bio - textarea */}
                                    <div className="flex flex-col gap-2">
                                        <label className="text-[13px] text-[rgba(255,255,255,0.8)] font-semibold">Bio *</label>
                                        <textarea
                                            className="bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.04)] text-[rgba(255,255,255,0.95)] py-2.5 px-3 rounded-lg text-sm outline-none resize-y min-h-16 placeholder:text-[rgba(255,255,255,0.45)] disabled:opacity-70"
                                            {...register('bio')}
                                            disabled={!isEditing}
                                            rows={4}
                                            placeholder="Tell employers about yourself..."
                                            style={errorBorderStyle(validationErrors.bio?.message)}
                                        />
                                        {validationErrors.bio?.message && <span className="text-[#ef4444] text-xs mt-1 block">{validationErrors.bio.message}</span>}
                                    </div>

                                    <Input label="Expected Salary *" {...register('expectedSalary')} disabled={!isEditing} placeholder="e.g., $100,000/year" className="bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.04)] text-[rgba(255,255,255,0.95)] py-2.5 px-3 rounded-lg text-sm outline-none placeholder:text-[rgba(255,255,255,0.45)] disabled:opacity-70" labelClassName="text-[13px] text-[rgba(255,255,255,0.8)] font-semibold" errorClassName="text-[#ef4444] text-xs mt-1 block" wrapperClassName="flex flex-col gap-2" error={validationErrors.expectedSalary?.message} style={errorBorderStyle(validationErrors.expectedSalary?.message)} />

                                    {/* Notice Period - select */}
                                    <div className="flex flex-col gap-2">
                                        <label className="text-[13px] text-[rgba(255,255,255,0.8)] font-semibold">Notice Period *</label>
                                        <select
                                            className="bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.04)] text-[rgba(255,255,255,0.95)] py-2.5 px-3 rounded-lg text-sm outline-none appearance-none bg-no-repeat bg-[right_12px_center] pr-9 disabled:opacity-70 [&_option]:bg-[#1a1a2e] [&_option]:text-white"
                                            {...register('noticePeriod')}
                                            disabled={!isEditing}
                                            style={{ ...errorBorderStyle(validationErrors.noticePeriod?.message), backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='rgba(255,255,255,0.6)' d='M6 8L1 3h10z'/%3E%3C/svg%3E\")" }}
                                        >
                                            <option value="">Select notice period</option>
                                            <option value="Immediate">Immediate</option>
                                            <option value="1 week">1 week</option>
                                            <option value="2 weeks">2 weeks</option>
                                            <option value="1 month">1 month</option>
                                            <option value="2 months">2 months</option>
                                            <option value="3 months">3 months</option>
                                        </select>
                                        {validationErrors.noticePeriod?.message && <span className="text-[#ef4444] text-xs mt-1 block">{validationErrors.noticePeriod.message}</span>}
                                    </div>
                                </div>
                            </section>

                            {/* Job Preferences */}
                            <section className="bg-[rgba(255,255,255,0.01)] rounded-xl p-[18px] max-md:p-4 border border-[rgba(255,255,255,0.02)]">
                                <h3 className="m-0 mb-2.5 max-md:mb-2 text-base max-md:text-sm font-bold text-white">Job Preferences</h3>
                                <div className="grid grid-cols-2 gap-y-3 gap-x-[18px] max-md:gap-y-2 max-md:gap-x-0 max-[900px]:grid-cols-1">
                                    {/* Preferred Work Mode - select */}
                                    <div className="flex flex-col gap-2">
                                        <label className="text-[13px] text-[rgba(255,255,255,0.8)] font-semibold">Preferred Work Mode</label>
                                        <select
                                            className="bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.04)] text-[rgba(255,255,255,0.95)] py-2.5 px-3 rounded-lg text-sm outline-none appearance-none bg-no-repeat bg-[right_12px_center] pr-9 disabled:opacity-70 [&_option]:bg-[#1a1a2e] [&_option]:text-white"
                                            {...register('preferredWorkMode')}
                                            disabled={!isEditing}
                                            style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='rgba(255,255,255,0.6)' d='M6 8L1 3h10z'/%3E%3C/svg%3E\")" }}
                                        >
                                            <option value="">Select work mode</option>
                                            <option value="Remote">Remote</option>
                                            <option value="Hybrid">Hybrid</option>
                                            <option value="On-site">On-site</option>
                                            <option value="Flexible">Flexible</option>
                                        </select>
                                        {validationErrors.preferredWorkMode?.message && <span className="text-[#ef4444] text-xs mt-1 block">{validationErrors.preferredWorkMode.message}</span>}
                                    </div>

                                    {/* Preferred Job Type - select */}
                                    <div className="flex flex-col gap-2">
                                        <label className="text-[13px] text-[rgba(255,255,255,0.8)] font-semibold">Preferred Job Type</label>
                                        <select
                                            className="bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.04)] text-[rgba(255,255,255,0.95)] py-2.5 px-3 rounded-lg text-sm outline-none appearance-none bg-no-repeat bg-[right_12px_center] pr-9 disabled:opacity-70 [&_option]:bg-[#1a1a2e] [&_option]:text-white"
                                            {...register('preferredJobType')}
                                            disabled={!isEditing}
                                            style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='rgba(255,255,255,0.6)' d='M6 8L1 3h10z'/%3E%3C/svg%3E\")" }}
                                        >
                                            <option value="">Select job type</option>
                                            <option value="Full-time">Full-time</option>
                                            <option value="Part-time">Part-time</option>
                                            <option value="Contract">Contract</option>
                                            <option value="Freelance">Freelance</option>
                                            <option value="Internship">Internship</option>
                                        </select>
                                        {validationErrors.preferredJobType?.message && <span className="text-[#ef4444] text-xs mt-1 block">{validationErrors.preferredJobType.message}</span>}
                                    </div>

                                    {/* Willing to Relocate - checkbox */}
                                    <div className="flex flex-row items-center gap-2">
                                        <label className="text-[13px] text-[rgba(255,255,255,0.8)] font-semibold flex items-center gap-2.5 cursor-pointer text-sm">
                                            <input
                                                type="checkbox"
                                                {...register('willingToRelocate')}
                                                disabled={!isEditing}
                                                className="w-[18px] h-[18px] accent-brand-primary cursor-pointer"
                                            />
                                            Willing to Relocate
                                        </label>
                                    </div>
                                </div>
                            </section>

                            <section className="bg-[rgba(255,255,255,0.01)] rounded-xl p-[18px] max-md:p-4 border border-[rgba(255,255,255,0.02)]">
                                <h3 className="m-0 mb-2.5 max-md:mb-2 text-base max-md:text-sm font-bold text-white">Skills *</h3>
                                <div className="flex flex-wrap gap-2.5 max-md:gap-2 items-center">
                                    {profileData.skills.map((item: string, index: number) => (
                                        <div key={index}>
                                            {isEditing ? (
                                                <div className="flex gap-2 items-center">
                                                    <input
                                                        className="py-2 px-2.5 rounded-lg border border-[rgba(255,255,255,0.04)] bg-[rgba(255,255,255,0.02)] text-[rgba(255,255,255,0.92)]"
                                                        value={item}
                                                        onChange={(e) => handleArrayChange('skills', index, e.target.value)}
                                                        placeholder="Enter skill"
                                                    />
                                                    <Button
                                                        type="button"
                                                        variant="danger"
                                                        className="py-1.5 px-2.5 rounded-md text-xs"
                                                        onClick={() => removeArrayItem('skills', index)}
                                                    >
                                                        Remove
                                                    </Button>
                                                </div>
                                            ) : (
                                                <span className="bg-[rgba(255,255,255,0.03)] text-[rgba(255,255,255,0.9)] py-2 px-3 rounded-full font-semibold">{item}</span>
                                            )}
                                        </div>
                                    ))}
                                    {isEditing && (
                                        <Button type="button" variant="secondary" className="!bg-[rgba(255,255,255,0.03)] border border-dashed border-[rgba(255,255,255,0.06)] !text-[rgba(255,255,255,0.9)] py-2 px-3 rounded-[10px] font-bold" onClick={() => addArrayItem('skills')}>
                                            Add Skill
                                        </Button>
                                    )}
                                    {!isEditing && profileData.skills.length === 0 && (
                                        <p className="text-[rgba(255,255,255,0.5)] italic text-sm m-0">No skills added yet</p>
                                    )}
                                    {(validationErrors.skills?.message || (isEditing && (!profileData.skills.length || !profileData.skills.some((s: string) => s.trim() !== '')))) && (
                                        <span className="text-[#ef4444] text-xs mt-2 block w-full">{validationErrors.skills?.message || 'Skills required'}</span>
                                    )}
                                </div>
                            </section>

                            {/* Languages */}
                            <section className="bg-[rgba(255,255,255,0.01)] rounded-xl p-[18px] max-md:p-4 border border-[rgba(255,255,255,0.02)]">
                                <h3 className="m-0 mb-2.5 max-md:mb-2 text-base max-md:text-sm font-bold text-white">Languages *</h3>
                                <div className="flex flex-wrap gap-2.5 max-md:gap-2 items-center">
                                    {profileData.languages.map((item: string, index: number) => (
                                        <div key={index}>
                                            {isEditing ? (
                                                <div className="flex gap-2 items-center">
                                                    <input
                                                        className="py-2 px-2.5 rounded-lg border border-[rgba(255,255,255,0.04)] bg-[rgba(255,255,255,0.02)] text-[rgba(255,255,255,0.92)]"
                                                        value={item}
                                                        onChange={(e) => handleArrayChange('languages', index, e.target.value)}
                                                        placeholder="Enter language"
                                                    />
                                                    <Button
                                                        type="button"
                                                        variant="danger"
                                                        className="py-1.5 px-2.5 rounded-md text-xs"
                                                        onClick={() => removeArrayItem('languages', index)}
                                                    >
                                                        Remove
                                                    </Button>
                                                </div>
                                            ) : (
                                                <span className="bg-[rgba(255,255,255,0.03)] text-[rgba(255,255,255,0.9)] py-2 px-3 rounded-full font-semibold">{item}</span>
                                            )}
                                        </div>
                                    ))}
                                    {isEditing && (
                                        <Button type="button" variant="secondary" className="!bg-[rgba(255,255,255,0.03)] border border-dashed border-[rgba(255,255,255,0.06)] !text-[rgba(255,255,255,0.9)] py-2 px-3 rounded-[10px] font-bold" onClick={() => addArrayItem('languages')}>
                                            Add Language
                                        </Button>
                                    )}
                                    {!isEditing && profileData.languages.length === 0 && (
                                        <p className="text-[rgba(255,255,255,0.5)] italic text-sm m-0">No languages added yet</p>
                                    )}
                                </div>
                                {validationErrors.languages?.message && <span className="text-[#ef4444] text-xs mt-2 block">{validationErrors.languages.message}</span>}
                            </section>

                            {/* Education */}
                            <section className="bg-[rgba(255,255,255,0.01)] rounded-xl p-[18px] max-md:p-4 border border-[rgba(255,255,255,0.02)]">
                                <h3 className="m-0 mb-2.5 max-md:mb-2 text-base max-md:text-sm font-bold text-white">Education</h3>
                                <div className="grid grid-cols-2 gap-y-3 gap-x-[18px] max-md:gap-y-2 max-md:gap-x-0 max-[900px]:grid-cols-1">
                                    <Input label="Highest Qualification *" {...register('education')} disabled={!isEditing} placeholder="e.g., Bachelor of Science in Computer Science" className="bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.04)] text-[rgba(255,255,255,0.95)] py-2.5 px-3 rounded-lg text-sm outline-none placeholder:text-[rgba(255,255,255,0.45)] disabled:opacity-70" labelClassName="text-[13px] text-[rgba(255,255,255,0.8)] font-semibold" errorClassName="text-[#ef4444] text-xs mt-1 block" wrapperClassName="flex flex-col gap-2" error={validationErrors.education?.message} style={errorBorderStyle(validationErrors.education?.message)} />
                                    <Input label="University/School *" {...register('university')} disabled={!isEditing} placeholder="e.g., Stanford University" className="bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.04)] text-[rgba(255,255,255,0.95)] py-2.5 px-3 rounded-lg text-sm outline-none placeholder:text-[rgba(255,255,255,0.45)] disabled:opacity-70" labelClassName="text-[13px] text-[rgba(255,255,255,0.8)] font-semibold" errorClassName="text-[#ef4444] text-xs mt-1 block" wrapperClassName="flex flex-col gap-2" error={validationErrors.university?.message} style={errorBorderStyle(validationErrors.university?.message)} />
                                    <Input label="Graduation Year *" {...register('graduationYear')} disabled={!isEditing} placeholder="e.g., 2021" className="bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.04)] text-[rgba(255,255,255,0.95)] py-2.5 px-3 rounded-lg text-sm outline-none placeholder:text-[rgba(255,255,255,0.45)] disabled:opacity-70" labelClassName="text-[13px] text-[rgba(255,255,255,0.8)] font-semibold" errorClassName="text-[#ef4444] text-xs mt-1 block" wrapperClassName="flex flex-col gap-2" error={validationErrors.graduationYear?.message} style={errorBorderStyle(validationErrors.graduationYear?.message)} />
                                </div>
                            </section>
                            <section className="bg-[rgba(255,255,255,0.01)] rounded-xl p-[18px] max-md:p-4 border border-[rgba(255,255,255,0.02)]">
                                <h3 className="m-0 mb-2.5 max-md:mb-2 text-base max-md:text-sm font-bold text-white">Resume</h3>
                                <div className="py-4 max-md:py-3">
                                    {profileData.resumeUrl || isUploading ? (
                                        <div className="flex flex-wrap items-center gap-3 p-4 bg-[rgba(102,126,234,0.1)] border border-[rgba(102,126,234,0.2)] rounded-[10px]">
                                           
                                            {profileData.resumeUrl && (
                                                <a
                                                    href={profileData.resumeUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-brand-primary no-underline font-medium transition-colors duration-200 hover:text-brand-secondary hover:underline"
                                                >
                                                    View Resume
                                                </a>
                                            )}
                                            {isUploading && (
                                                <span className="text-[rgba(255,255,255,0.75)] text-sm">
                                                    Uploading…
                                                </span>
                                            )}
                                            {isEditing && (
                                                <label className="ml-auto py-2 px-4 bg-[rgba(255,255,255,0.1)] border border-[rgba(255,255,255,0.2)] rounded-md text-white text-[13px] cursor-pointer transition-all duration-200 hover:bg-[rgba(255,255,255,0.15)]">
                                                    {profileData.resumeUrl ? 'Replace' : 'Upload'}
                                                    <input
                                                        type="file"
                                                        accept=".pdf"
                                                        onChange={handleResumeSelect}
                                                        disabled={isUploading}
                                                        className="hidden"
                                                    />
                                                </label>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-[rgba(255,255,255,0.2)] rounded-[10px] bg-[rgba(255,255,255,0.02)] transition-all duration-200 hover:border-[rgba(102,126,234,0.4)] hover:bg-[rgba(102,126,234,0.05)]">
                                            {isEditing ? (
                                                <div className="flex flex-col items-center">
                                                    <label className="inline-flex items-center gap-2 py-3 px-6 bg-linear-to-br from-brand-primary to-brand-secondary rounded-lg text-white text-sm font-medium cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_20px_rgba(102,126,234,0.3)]">
                                                        {isUploading ? 'Uploading…' : '↑ Upload Resume '}
                                                        <input
                                                            type="file"
                                                            accept=".pdf"
                                                            onChange={handleResumeSelect}
                                                            className="hidden"
                                                            disabled={isUploading}
                                                        />
                                                    </label>
                                                </div>
                                            ) : (
                                                <p className="text-[rgba(255,255,255,0.5)] italic text-sm m-0">No resume uploaded yet</p>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </section>

                            <section className="bg-[rgba(255,255,255,0.01)] rounded-xl p-[18px] max-md:p-4 border border-[rgba(255,255,255,0.02)]">
                                <h3 className="m-0 mb-2.5 max-md:mb-2 text-base max-md:text-sm font-bold text-white">Professional & Links (optional)</h3>
                                <div className="grid grid-cols-2 gap-y-3 gap-x-[18px] max-md:gap-y-2 max-md:gap-x-0 max-[900px]:grid-cols-1">
                                    <Input label="Job Title" {...register('title')} disabled={!isEditing} placeholder="e.g., Frontend Developer" className="bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.04)] text-[rgba(255,255,255,0.95)] py-2.5 px-3 rounded-lg text-sm outline-none placeholder:text-[rgba(255,255,255,0.45)] disabled:opacity-70" labelClassName="text-[13px] text-[rgba(255,255,255,0.8)] font-semibold" errorClassName="text-[#ef4444] text-xs mt-1 block" wrapperClassName="flex flex-col gap-2" error={validationErrors.title?.message} style={errorBorderStyle(validationErrors.title?.message)} />
                                    <Input label="Current Company" {...register('currentCompany')} disabled={!isEditing} placeholder="e.g., Google" className="bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.04)] text-[rgba(255,255,255,0.95)] py-2.5 px-3 rounded-lg text-sm outline-none placeholder:text-[rgba(255,255,255,0.45)] disabled:opacity-70" labelClassName="text-[13px] text-[rgba(255,255,255,0.8)] font-semibold" errorClassName="text-[#ef4444] text-xs mt-1 block" wrapperClassName="flex flex-col gap-2" error={validationErrors.currentCompany?.message} style={errorBorderStyle(validationErrors.currentCompany?.message)} />
                                    <Input label="Current Salary" {...register('currentSalary')} disabled={!isEditing} placeholder="e.g., $80,000/year" className="bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.04)] text-[rgba(255,255,255,0.95)] py-2.5 px-3 rounded-lg text-sm outline-none placeholder:text-[rgba(255,255,255,0.45)] disabled:opacity-70" labelClassName="text-[13px] text-[rgba(255,255,255,0.8)] font-semibold" errorClassName="text-[#ef4444] text-xs mt-1 block" wrapperClassName="flex flex-col gap-2" error={validationErrors.currentSalary?.message} style={errorBorderStyle(validationErrors.currentSalary?.message)} />
                                    <Input label="Years of Experience" {...register('experience')} disabled={!isEditing} placeholder="e.g., 3 years" className="bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.04)] text-[rgba(255,255,255,0.95)] py-2.5 px-3 rounded-lg text-sm outline-none placeholder:text-[rgba(255,255,255,0.45)] disabled:opacity-70" labelClassName="text-[13px] text-[rgba(255,255,255,0.8)] font-semibold" errorClassName="text-[#ef4444] text-xs mt-1 block" wrapperClassName="flex flex-col gap-2" error={validationErrors.experience?.message} style={errorBorderStyle(validationErrors.experience?.message)} />
                                    <Input label="LinkedIn URL" {...register('linkedinUrl')} disabled={!isEditing} placeholder="https://linkedin.com/in/yourprofile" className="bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.04)] text-[rgba(255,255,255,0.95)] py-2.5 px-3 rounded-lg text-sm outline-none placeholder:text-[rgba(255,255,255,0.45)] disabled:opacity-70" labelClassName="text-[13px] text-[rgba(255,255,255,0.8)] font-semibold" errorClassName="text-[#ef4444] text-xs mt-1 block" wrapperClassName="flex flex-col gap-2" error={validationErrors.linkedinUrl?.message} style={errorBorderStyle(validationErrors.linkedinUrl?.message)} />
                                    <Input label="GitHub URL" {...register('githubUrl')} disabled={!isEditing} placeholder="https://github.com/yourusername" className="bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.04)] text-[rgba(255,255,255,0.95)] py-2.5 px-3 rounded-lg text-sm outline-none placeholder:text-[rgba(255,255,255,0.45)] disabled:opacity-70" labelClassName="text-[13px] text-[rgba(255,255,255,0.8)] font-semibold" errorClassName="text-[#ef4444] text-xs mt-1 block" wrapperClassName="flex flex-col gap-2" error={validationErrors.githubUrl?.message} style={errorBorderStyle(validationErrors.githubUrl?.message)} />
                                </div>
                            </section>
                        </div>

                        {isEditing && (
                            <div className="flex justify-end max-md:justify-stretch mt-8 max-md:mt-6 pt-6 max-md:pt-4 border-t border-[rgba(255,255,255,0.06)]">
                                <Button type="submit" variant="primary" className="py-2.5 px-6 max-md:w-full max-md:py-2 max-md:text-sm rounded-[10px] font-bold disabled:opacity-60 disabled:cursor-not-allowed" disabled={isSaving}>
                                    {isSaving ? 'Saving...' : 'Save'}
                                </Button>
                            </div>
                        )}
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Profile;
