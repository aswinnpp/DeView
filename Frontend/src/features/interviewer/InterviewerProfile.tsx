import React from "react";
import { Button, Input } from "../../components/common";
import { useInterviewerProfile } from "../../hooks/interviewer";

const inputClass =
  "w-full bg-white/5 border border-white/15 rounded-lg text-slate-100 py-3 px-4 text-sm placeholder:text-slate-500 focus:outline-none focus:border-blue-500/50 focus:bg-white/[0.08] transition";
const labelClass = "text-slate-300 text-sm font-medium";
const wrapperClass = "flex flex-col gap-2";
const errorClass = "text-red-400 text-xs mt-1";

const InterviewerProfileSettings: React.FC = () => {
  const {
    form,
    profileData,
    profileLoading,
    formValues,
    isEditing,
    setIsEditing,
    isCreating,
    isUpdating,
    handleLogout,
    handleArrayInput,
    onSubmit,
    getInitials,
  } = useInterviewerProfile();

  const { register, handleSubmit, formState: { errors } } = form;

  if (profileLoading) {
    return (
      <div className="max-w-[1000px] mx-auto py-6 text-slate-300">
        Loading profile...
      </div>
    );
  }

  return (
    <div className="max-w-[1000px] mx-auto">
      {!isEditing && profileData?.hasProfile ? (
        <>
          {/* Hero */}
          <div className="bg-gradient-to-br from-blue-500/10 to-violet-500/10 border border-white/10 rounded-2xl p-8 md:p-10 mb-6">
            <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-6">
              <div className="flex flex-col sm:flex-row gap-6 items-start flex-1">
                <div className="w-[70px] h-[70px] rounded-full bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center text-2xl font-bold text-white border-[3px] border-white/20 shadow-lg shadow-blue-500/25 shrink-0">
                  {getInitials(formValues.fullName)}
                </div>
                <div className="flex-1 min-w-0">
                  <h1 className="text-2xl md:text-3xl font-bold text-slate-50 m-0 mb-1.5">
                    {formValues.fullName}
                  </h1>
                  <p className="text-slate-400 text-base m-0 mb-3.5 font-medium">
                    {formValues.title}
                  </p>
                  <div className="flex flex-wrap gap-4">
                    {formValues.currentCompany && (
                      <span className="text-slate-300 text-sm font-medium py-1.5 px-3.5 bg-white/5 rounded-full border border-white/10">
                        {formValues.currentCompany}
                      </span>
                    )}
                    <span className="text-slate-300 text-sm font-medium py-1.5 px-3.5 bg-white/5 rounded-full border border-white/10">
                      {formValues.yearsOfExperience} years experience
                    </span>
                    {formValues.location && (
                      <span className="text-slate-300 text-sm font-medium py-1.5 px-3.5 bg-white/5 rounded-full border border-white/10">
                        {formValues.location}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex gap-3 shrink-0">
                <Button variant="ghostOutline" onClick={() => setIsEditing(true)} className="!py-3 !px-6">
                  Edit Profile
                </Button>
                <Button variant="danger" onClick={handleLogout}>
                  Logout
                </Button>
              </div>
            </div>
          </div>

          {/* Profile card */}
          <div className="bg-white/[0.03] border border-white/10 rounded-xl p-8">
            <div className="py-6 border-b border-white/10 first:pt-0 last:border-b-0 last:pb-0">
              <h3 className="text-[13px] font-semibold text-slate-400 uppercase tracking-wider m-0 mb-3">
                About
              </h3>
              <p className="text-slate-300 leading-relaxed text-[15px] m-0">
                {formValues.bio}
              </p>
            </div>

            {formValues.technicalSkills?.length > 0 && (
              <div className="py-6 border-b border-white/10">
                <h3 className="text-[13px] font-semibold text-slate-400 uppercase tracking-wider m-0 mb-3">
                  Skills
                </h3>
                <div className="flex flex-wrap gap-2.5">
                  {formValues.technicalSkills.map((item, index) => (
                    <span
                      key={index}
                      className="py-2 px-4 rounded-full text-sm font-medium bg-violet-500/20 border border-violet-500/30 text-violet-300"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {formValues.languages?.length > 0 && (
              <div className="py-6 border-b border-white/10">
                <h3 className="text-[13px] font-semibold text-slate-400 uppercase tracking-wider m-0 mb-3">
                  Languages
                </h3>
                <div className="flex flex-wrap gap-2.5">
                  {formValues.languages.map((item, index) => (
                    <span
                      key={index}
                      className="py-2 px-4 rounded-full text-sm font-medium bg-blue-500/20 border border-blue-500/35 text-blue-300"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="py-6 border-b border-white/10">
              <h3 className="text-[13px] font-semibold text-slate-400 uppercase tracking-wider m-0 mb-3">
                Education
              </h3>
              <p className="text-slate-200 text-[15px] font-medium m-0">
                {formValues.education}
              </p>
              {formValues.university && (
                <p className="text-slate-400 text-[15px] m-0 mt-1">
                  {formValues.university}
                </p>
              )}
            </div>

            {(formValues.linkedinUrl || formValues.githubUrl) && (
              <div className="py-6">
                <h3 className="text-[13px] font-semibold text-slate-400 uppercase tracking-wider m-0 mb-3">
                  Links
                </h3>
                <div className="grid gap-2.5">
                  {formValues.linkedinUrl && (
                    <a
                      href={formValues.linkedinUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between py-3.5 px-4 bg-white/[0.04] border border-white/10 rounded-lg text-slate-300 font-medium text-sm no-underline transition hover:bg-white/[0.08] hover:border-blue-500/30 hover:translate-x-1"
                    >
                      <span>LinkedIn Profile</span>
                      <span className="text-blue-400 text-base">→</span>
                    </a>
                  )}
                  {formValues.githubUrl && (
                    <a
                      href={formValues.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between py-3.5 px-4 bg-white/[0.04] border border-white/10 rounded-lg text-slate-300 font-medium text-sm no-underline transition hover:bg-white/[0.08] hover:border-blue-500/30 hover:translate-x-1"
                    >
                      <span>GitHub Profile</span>
                      <span className="text-blue-400 text-base">→</span>
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="max-w-[900px] mx-auto">
          <div className="mb-8">
            <h1 className="text-slate-50 text-2xl md:text-3xl font-bold m-0 mb-2">
              {profileData?.hasProfile ? "Edit Profile" : "Create Your Profile"}
            </h1>
            <p className="text-slate-400 text-[15px] m-0">
              {profileData?.hasProfile
                ? "Update your professional information"
                : "Complete your profile to start conducting interviews"}
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            {/* Personal */}
            <section className="bg-white/[0.03] border border-white/10 rounded-xl p-6">
              <h3 className="text-slate-50 font-semibold mb-4">Personal Information</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Full Name *"
                  placeholder="John Doe"
                  className={inputClass}
                  labelClassName={labelClass}
                  wrapperClassName={wrapperClass}
                  error={errors.fullName?.message}
                  errorClassName={errorClass}
                  {...register("fullName")}
                />
                <Input
                  label="Phone"
                  type="tel"
                  placeholder="+91 9876543210"
                  className={inputClass}
                  labelClassName={labelClass}
                  wrapperClassName={wrapperClass}
                  error={errors.phone?.message}
                  errorClassName={errorClass}
                  {...register("phone")}
                />
              </div>
              <div className="mt-4">
                <Input
                  label="Location"
                  placeholder="Mumbai, India"
                  className={inputClass}
                  labelClassName={labelClass}
                  wrapperClassName={wrapperClass}
                  error={errors.location?.message}
                  errorClassName={errorClass}
                  {...register("location")}
                />
              </div>
            </section>

            {/* Professional */}
            <section className="bg-white/[0.03] border border-white/10 rounded-xl p-6">
              <h3 className="text-slate-50 font-semibold mb-4">Professional Information</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Professional Title *"
                  placeholder="Senior Software Engineer"
                  className={inputClass}
                  labelClassName={labelClass}
                  wrapperClassName={wrapperClass}
                  error={errors.title?.message}
                  errorClassName={errorClass}
                  {...register("title")}
                />
                <Input
                  label="Current Company"
                  placeholder="Google, Microsoft, etc."
                  className={inputClass}
                  labelClassName={labelClass}
                  wrapperClassName={wrapperClass}
                  error={errors.currentCompany?.message}
                  errorClassName={errorClass}
                  {...register("currentCompany")}
                />
              </div>
              <div className="mt-4 space-y-4">
                <Input
                  label="Years of Experience *"
                  type="number"
                  min={0}
                  placeholder="0"
                  className={inputClass}
                  labelClassName={labelClass}
                  wrapperClassName={wrapperClass}
                  error={errors.yearsOfExperience?.message}
                  errorClassName={errorClass}
                  {...register("yearsOfExperience", { valueAsNumber: true })}
                />
                <div className={wrapperClass}>
                  <label className={labelClass}>Professional Bio *</label>
                  <textarea
                    rows={4}
                    placeholder="Brief summary of your professional experience..."
                    className={`${inputClass} min-h-[100px] resize-y font-inherit`}
                    {...register("bio")}
                  />
                  {errors.bio && <span className={errorClass}>{errors.bio.message}</span>}
                </div>
              </div>
            </section>

            {/* Skills */}
            <section className="bg-white/[0.03] border border-white/10 rounded-xl p-6">
              <h3 className="text-slate-50 font-semibold mb-4">Skills</h3>
              <div className={wrapperClass}>
                <label className={labelClass}>Technical Skills (Press Enter to add)</label>
                <input
                  type="text"
                  className={inputClass}
                  placeholder="Add skill - Press Enter"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      const target = e.target as HTMLInputElement;
                      handleArrayInput("technicalSkills", target.value, "add");
                      target.value = "";
                    }
                  }}
                />
                <div className="flex flex-wrap gap-2 mt-2">
                  {formValues.technicalSkills.map((item, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-2 py-1.5 px-3 bg-violet-500/20 border border-violet-500/30 rounded-full text-violet-300 text-sm"
                    >
                      {item}
                      <button
                        type="button"
                        onClick={() => handleArrayInput("technicalSkills", "", "remove", index)}
                        className="bg-transparent border-none text-red-400 cursor-pointer p-0 ml-1 hover:text-red-300"
                        aria-label="Remove skill"
                      >
                        ✕
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </section>

            {/* Languages */}
            <section className="bg-white/[0.03] border border-white/10 rounded-xl p-6">
              <h3 className="text-slate-50 font-semibold mb-4">Languages</h3>
              <div className={wrapperClass}>
                <label className={labelClass}>Languages Known (Press Enter to add)</label>
                <input
                  type="text"
                  className={inputClass}
                  placeholder="Add language - Press Enter"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      const target = e.target as HTMLInputElement;
                      handleArrayInput("languages", target.value, "add");
                      target.value = "";
                    }
                  }}
                />
                {errors.languages?.message && (
                  <span className={errorClass}>{errors.languages.message}</span>
                )}
                <div className="flex flex-wrap gap-2 mt-2">
                  {formValues.languages.map((item, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-2 py-1.5 px-3 bg-blue-500/20 border border-blue-500/35 rounded-full text-blue-300 text-sm"
                    >
                      {item}
                      <button
                        type="button"
                        onClick={() => handleArrayInput("languages", "", "remove", index)}
                        className="bg-transparent border-none text-red-400 cursor-pointer p-0 ml-1 hover:text-red-300"
                        aria-label="Remove language"
                      >
                        ✕
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </section>

            {/* Education */}
            <section className="bg-white/[0.03] border border-white/10 rounded-xl p-6">
              <h3 className="text-slate-50 font-semibold mb-4">Education</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Highest Degree *"
                  placeholder="B.Tech in Computer Science"
                  className={inputClass}
                  labelClassName={labelClass}
                  wrapperClassName={wrapperClass}
                  error={errors.education?.message}
                  errorClassName={errorClass}
                  {...register("education")}
                />
                <Input
                  label="University/Institution"
                  placeholder="IIT Delhi"
                  className={inputClass}
                  labelClassName={labelClass}
                  wrapperClassName={wrapperClass}
                  error={errors.university?.message}
                  errorClassName={errorClass}
                  {...register("university")}
                />
              </div>
            </section>

            {/* Links */}
            <section className="bg-white/[0.03] border border-white/10 rounded-xl p-6">
              <h3 className="text-slate-50 font-semibold mb-4">
                Links <span className="text-slate-500 text-sm font-normal">(Optional)</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="LinkedIn URL"
                  type="url"
                  placeholder="https://linkedin.com/in/..."
                  className={inputClass}
                  labelClassName={labelClass}
                  wrapperClassName={wrapperClass}
                  error={errors.linkedinUrl?.message}
                  errorClassName={errorClass}
                  {...register("linkedinUrl")}
                />
                <Input
                  label="GitHub URL"
                  type="url"
                  placeholder="https://github.com/..."
                  className={inputClass}
                  labelClassName={labelClass}
                  wrapperClassName={wrapperClass}
                  error={errors.githubUrl?.message}
                  errorClassName={errorClass}
                  {...register("githubUrl")}
                />
              </div>
            </section>

            <div className="flex gap-3 mt-6">
              <Button
                type="submit"
                variant="violet"
                disabled={isCreating || isUpdating}
                className="!py-3.5 !px-8 !text-base"
              >
                {isCreating || isUpdating
                  ? "Saving..."
                  : profileData?.hasProfile
                    ? "Update Profile"
                    : "Create Profile"}
              </Button>
              {profileData?.hasProfile && (
                <Button
                  type="button"
                  variant="ghostOutline"
                  onClick={() => setIsEditing(false)}
                  disabled={isCreating || isUpdating}
                  className="!py-3.5 !px-8"
                >
                  Cancel
                </Button>
              )}
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default InterviewerProfileSettings;
