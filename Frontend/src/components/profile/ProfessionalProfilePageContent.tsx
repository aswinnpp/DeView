import React, { useEffect, useRef, useState } from "react";
import type { UseFormReturn, SubmitHandler } from "react-hook-form";
import { useFieldArray } from "react-hook-form";
import { Button, Input } from "../common";
import { ChangePasswordModal } from "../auth/ChangePasswordModal";
import { useFileUpload } from "../../hooks/useFileUpload";
import type { UploadCategory } from "../../services/upload.service";
import type { InterviewerProfileFormValues } from "../../../../Shared/contracts/interviewer/interviewerProfile.schema";
import Cropper, { type ReactCropperElement } from "react-cropper";
import "cropperjs/dist/cropper.css";

const inputClass =
  "w-full bg-white/5 border border-white/15 rounded-lg text-slate-100 py-3 px-4 text-sm placeholder:text-slate-500 focus:outline-none focus:border-blue-500/50 focus:bg-white/[0.08] transition";
const labelClass = "text-slate-300 text-sm font-medium";
const wrapperClass = "flex flex-col gap-2";
const errorClass = "text-red-400 text-xs mt-1";

export interface ProfessionalProfileFeedback {
  variant: "success" | "error";
  message: string;
}

export interface GetProfileState {
  hasProfile: boolean;
  data?: InterviewerProfileFormValues;
}

export interface ProfessionalProfileCopy {
  createSubtitle: string;
  editSubtitle: string;
  titlePlaceholder: string;
  bioPlaceholder: string;
  skillsReadOnlyHeading: string;
  skillsFormSectionTitle: string;
  skillsInputLabel: string;
}

export interface ProfessionalProfilePageContentProps {
  form: UseFormReturn<InterviewerProfileFormValues>;
  profileData: GetProfileState | null;
  profileLoading: boolean;
  isEditing: boolean;
  setIsEditing: (v: boolean) => void;
  isCreating: boolean;
  isUpdating: boolean;
  handleLogout: () => void;
  handleArrayInput: (
    field: "technicalSkills" | "languages",
    value: string,
    action: "add" | "remove",
    index?: number
  ) => void;
  onSubmit: SubmitHandler<InterviewerProfileFormValues>;
  getInitials: (name: string) => string;
  fetchProfile: () => Promise<void>;
  profileFeedback: ProfessionalProfileFeedback | null;
  dismissProfileFeedback: () => void;
  feedbackTitleId: string;
  uploadCategory: UploadCategory;
  updateProfilePicPartial: (stored: string) => Promise<void>;
  getProfilePicViewUrl: () => Promise<{ url: string }>;
  copy: ProfessionalProfileCopy;
}

export const ProfessionalProfilePageContent: React.FC<ProfessionalProfilePageContentProps> = ({
  form,
  profileData,
  profileLoading,
  isEditing,
  setIsEditing,
  isCreating,
  isUpdating,
  handleLogout,
  handleArrayInput,
  onSubmit,
  getInitials,
  fetchProfile,
  profileFeedback,
  dismissProfileFeedback,
  feedbackTitleId,
  uploadCategory,
  updateProfilePicPartial,
  getProfilePicViewUrl,
  copy,
}) => {
  const formValues = form.watch();
  const {
    register,
    formState: { errors },
  } = form;
  const { control } = form;
  const { fields: educationFields, append: appendEducation, remove: removeEducation } =
    useFieldArray({
      control,
      name: "educationList",
    });
  const { fields: workFields, append: appendWork, remove: removeWork } = useFieldArray({
    control,
    name: "workExperience",
  });

  const totalWorkYears =
    (formValues.workExperience ?? []).reduce(
      (sum, w) => sum + (Number.isFinite(w.years) ? w.years : 0),
      0
    ) ?? 0;
  const primaryCompany =
    formValues.workExperience?.[0]?.company ?? formValues.currentCompany ?? "";
  const { upload: uploadProfilePic, isUploading: isProfilePicUploading } = useFileUpload();
  const [profilePicPreviewUrl, setProfilePicPreviewUrl] = useState<string | null>(null);
  const [profilePicViewUrl, setProfilePicViewUrl] = useState<string>("");
  const lastUploadedKeyRef = useRef<string | null>(null);
  const [isCropModalOpen, setIsCropModalOpen] = useState(false);
  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);
  const cropperRef = useRef<ReactCropperElement>(null);

  useEffect(() => {
    const keyOrUrl = formValues.profilePicUrl?.trim();
    if (!keyOrUrl || profilePicPreviewUrl) return;
    if (lastUploadedKeyRef.current && keyOrUrl === lastUploadedKeyRef.current && profilePicViewUrl) return;

    let cancelled = false;
    getProfilePicViewUrl()
      .then((res) => {
        if (!cancelled) setProfilePicViewUrl(res.url);
      })
      .catch(() => {
        if (!cancelled) setProfilePicViewUrl("");
      });
    return () => {
      cancelled = true;
    };
  }, [formValues.profilePicUrl, profilePicPreviewUrl, profilePicViewUrl, getProfilePicViewUrl]);

  useEffect(() => {
    return () => {
      if (profilePicPreviewUrl) URL.revokeObjectURL(profilePicPreviewUrl);
    };
  }, [profilePicPreviewUrl]);

  useEffect(() => {
    if (!profileFeedback) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") dismissProfileFeedback();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [profileFeedback, dismissProfileFeedback]);

  const closeCropModal = () => {
    setIsCropModalOpen(false);
    setCropSrc((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
    setProfilePicPreviewUrl(null);
  };

  const handleProfilePicSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const nextPreview = URL.createObjectURL(file);
    setProfilePicPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return nextPreview;
    });
    setCropSrc(nextPreview);
    setIsCropModalOpen(true);
    e.target.value = "";
  };

  const handleCropAndUploadProfilePic = async () => {
    const cropper = cropperRef.current?.cropper;
    if (!cropper) return;

    const canvas = cropper.getCroppedCanvas({
      width: 512,
      height: 512,
      imageSmoothingEnabled: true,
      imageSmoothingQuality: "high",
    });

    const blob: Blob | null = await new Promise((resolve) =>
      canvas.toBlob((b) => resolve(b), "image/webp", 0.92)
    );
    if (!blob) return;

    const file = new File([blob], "profile.webp", { type: "image/webp" });
    const res = await uploadProfilePic(file, uploadCategory);
    if (!(res?.key || res?.url)) return;

    const stored = res.key ?? res.url;
    lastUploadedKeyRef.current = stored;
    if (res.url) setProfilePicViewUrl(res.url);
    setProfilePicPreviewUrl(null);

    form.setValue("profilePicUrl", stored, { shouldDirty: true });
    try {
      await updateProfilePicPartial(stored);
      await fetchProfile();
    } catch {
      // ignore; user can save via form submit
    } finally {
      closeCropModal();
    }
  };

  const handleChangePassword = () => {
    setIsChangePasswordModalOpen(true);
  };

  if (profileLoading) {
    return (
      <div className="max-w-[1000px] mx-auto py-6 text-slate-300">
        Loading profile...
      </div>
    );
  }

  return (
    <div className="max-w-[1000px] mx-auto px-3 sm:px-0">
      {!isEditing && profileData?.hasProfile ? (
        <>
          <div className="bg-gradient-to-br from-slate-900/60 via-slate-900/40 to-slate-950/60 border border-white/10 rounded-2xl p-8 md:p-10 mb-6 shadow-[0_18px_50px_rgba(0,0,0,0.45)]">
            <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-6">
              <div className="flex flex-col sm:flex-row gap-6 items-start flex-1">
                <div className="relative group w-[84px] h-[84px] shrink-0">
                  <div className="w-full h-full rounded-2xl overflow-hidden bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center text-2xl font-bold text-white border border-white/15 shadow-[0_12px_32px_rgba(37,99,235,0.25)]">
                    {profilePicPreviewUrl || profilePicViewUrl ? (
                      <img
                        src={profilePicPreviewUrl ?? profilePicViewUrl}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      getInitials(formValues.fullName)
                    )}
                  </div>
                  <label className="absolute inset-0 flex items-center justify-center rounded-2xl bg-black/55 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleProfilePicSelect}
                      disabled={isProfilePicUploading}
                      className="hidden"
                    />
                    <span className="text-white text-[11px] font-semibold px-2.5 py-1 bg-white/15 rounded-md border border-white/20">
                      {isProfilePicUploading ? "Uploading…" : "Change photo"}
                    </span>
                  </label>
                </div>
                <div className="flex-1 min-w-0">
                  <h1 className="text-2xl md:text-3xl font-extrabold text-slate-50 m-0 mb-1">
                    {formValues.fullName}
                  </h1>
                  <p className="text-slate-300/80 text-base m-0 mb-3 font-semibold">
                    {formValues.title}
                  </p>
                  <div className="flex flex-wrap gap-4">
                    {primaryCompany && (
                      <span className="text-slate-200 text-sm font-semibold py-1.5 px-3.5 bg-white/5 rounded-full border border-white/10">
                        {primaryCompany}
                      </span>
                    )}
                    <span className="text-slate-200 text-sm font-semibold py-1.5 px-3.5 bg-white/5 rounded-full border border-white/10">
                      {totalWorkYears} years experience
                    </span>
                    {formValues.location && (
                      <span className="text-slate-200 text-sm font-semibold py-1.5 px-3.5 bg-white/5 rounded-full border border-white/10">
                        {formValues.location}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 shrink-0 w-full sm:w-auto">
                <Button
                  variant="secondary"
                  onClick={handleChangePassword}
                  className="!py-3 !px-6 !font-semibold !w-full sm:!w-auto"
                >
                  Change Password
                </Button>
                <Button
                  variant="ghostOutline"
                  onClick={() => setIsEditing(true)}
                  className="!py-3 !px-6 !font-semibold !w-full sm:!w-auto"
                >
                  Edit Profile
                </Button>

                <Button variant="danger" onClick={handleLogout} className="!w-full sm:!w-auto">
                  Logout
                </Button>
              </div>
            </div>
          </div>

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
                  {copy.skillsReadOnlyHeading}
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
              <div className="space-y-2">
                {(formValues.educationList ?? [])
                  .filter((e) => e.degree?.trim() || e.university?.trim())
                  .map((item, index) => (
                    <div key={index}>
                      <p className="text-slate-200 text-[15px] font-medium m-0">
                        {item.degree}
                      </p>
                      {item.university && (
                        <p className="text-slate-400 text-[15px] m-0 mt-1">
                          {item.university}
                        </p>
                      )}
                      {item.year && item.year.trim() && (
                        <p className="text-slate-500 text-[13px] m-0 mt-1">
                          {item.year.trim()}
                        </p>
                      )}
                    </div>
                  ))}
              </div>
            </div>

            {(formValues.workExperience ?? []).filter((w) => w.company?.trim()).length > 0 && (
              <div className="py-6 border-b border-white/10">
                <h3 className="text-[13px] font-semibold text-slate-400 uppercase tracking-wider m-0 mb-3">
                  Work Experience
                </h3>
                <div className="space-y-2">
                  {formValues.workExperience
                    .filter((w) => w.company?.trim())
                    .map((w, index) => (
                      <div key={index}>
                        <p className="text-slate-200 text-[15px] font-medium m-0">
                          {w.jobTitle?.trim() ? `${w.jobTitle.trim()} - ` : ""}
                          {w.company}
                        </p>
                        <p className="text-slate-400 text-[15px] m-0 mt-1">
                          {w.years} years experience
                        </p>
                      </div>
                    ))}
                </div>
              </div>
            )}

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
              {profileData?.hasProfile ? copy.editSubtitle : copy.createSubtitle}
            </p>
          </div>

          <form
            onSubmit={form.handleSubmit(
              onSubmit as unknown as Parameters<typeof form.handleSubmit>[0]
            )}
            className="flex flex-col gap-4"
          >
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

            <section className="bg-white/[0.03] border border-white/10 rounded-xl p-6">
              <h3 className="text-slate-50 font-semibold mb-4">Professional Information</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Professional Title *"
                  placeholder={copy.titlePlaceholder}
                  className={inputClass}
                  labelClassName={labelClass}
                  wrapperClassName={wrapperClass}
                  error={errors.title?.message}
                  errorClassName={errorClass}
                  {...register("title")}
                />
              </div>

              <div className="mt-6 space-y-6">
                <div>
                  <div className="flex items-center justify-between gap-3 mb-3">
                    <h4 className="text-slate-50 font-semibold">Work Experience</h4>
                    <Button
                      type="button"
                      variant="ghostOutline"
                      className="!py-2 !px-4 !text-sm"
                      onClick={() =>
                        appendWork({
                          company: "",
                          jobTitle: "",
                          years: 0,
                          description: "",
                        })
                      }
                    >
                      Add
                    </Button>
                  </div>

                  <div className="space-y-4">
                    {workFields.map((field, index) => {
                      const entryErrors = errors.workExperience?.[index];
                      const canRemove = workFields.length > 1;
                      return (
                        <div
                          key={field.id}
                          className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end"
                        >
                          <Input
                            label="Company *"
                            placeholder="Google, Microsoft, etc."
                            className={inputClass}
                            labelClassName={labelClass}
                            wrapperClassName={wrapperClass}
                            error={entryErrors?.company?.message}
                            errorClassName={errorClass}
                            {...register(`workExperience.${index}.company`)}
                          />
                          <Input
                            label="Years *"
                            type="number"
                            min={0}
                            placeholder="0"
                            className={inputClass}
                            labelClassName={labelClass}
                            wrapperClassName={wrapperClass}
                            error={entryErrors?.years?.message}
                            errorClassName={errorClass}
                            {...register(`workExperience.${index}.years`, {
                              valueAsNumber: true,
                            })}
                          />
                          <Input
                            label="Job Title"
                            placeholder="e.g., Senior Engineer"
                            className={inputClass}
                            labelClassName={labelClass}
                            wrapperClassName={wrapperClass}
                            error={entryErrors?.jobTitle?.message}
                            errorClassName={errorClass}
                            {...register(`workExperience.${index}.jobTitle`)}
                          />

                          <div className="sm:col-span-3 flex justify-end">
                            <Button
                              type="button"
                              variant="danger"
                              className="!py-2 !px-4 !text-sm"
                              disabled={!canRemove}
                              onClick={() => removeWork(index)}
                            >
                              Remove
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className={wrapperClass}>
                  <label className={labelClass}>Professional Bio *</label>
                  <textarea
                    rows={4}
                    placeholder={copy.bioPlaceholder}
                    className={`${inputClass} min-h-[100px] resize-y font-inherit`}
                    {...register("bio")}
                  />
                  {errors.bio && <span className={errorClass}>{errors.bio.message}</span>}
                </div>
              </div>
            </section>

            <section className="bg-white/[0.03] border border-white/10 rounded-xl p-6">
              <h3 className="text-slate-50 font-semibold mb-4">{copy.skillsFormSectionTitle}</h3>
              <div className={wrapperClass}>
                <label className={labelClass}>{copy.skillsInputLabel}</label>
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

            <section className="bg-white/[0.03] border border-white/10 rounded-xl p-6">
              <h3 className="text-slate-50 font-semibold mb-4">Education</h3>
              <div className="space-y-4">
                {educationFields.map((field, index) => {
                  const entryErrors = errors.educationList?.[index];
                  const canRemove = educationFields.length > 1;
                  return (
                    <div key={field.id} className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
                      <Input
                        label="Degree *"
                        placeholder="B.Tech in Computer Science"
                        className={inputClass}
                        labelClassName={labelClass}
                        wrapperClassName={wrapperClass}
                        error={entryErrors?.degree?.message}
                        errorClassName={errorClass}
                        {...register(`educationList.${index}.degree`)}
                      />
                      <Input
                        label="Institution *"
                        placeholder="IIT Delhi"
                        className={inputClass}
                        labelClassName={labelClass}
                        wrapperClassName={wrapperClass}
                        error={entryErrors?.university?.message}
                        errorClassName={errorClass}
                        {...register(`educationList.${index}.university`)}
                      />
                      <Input
                        label="Year"
                        placeholder="e.g., 2020"
                        className={inputClass}
                        labelClassName={labelClass}
                        wrapperClassName={wrapperClass}
                        error={entryErrors?.year?.message}
                        errorClassName={errorClass}
                        {...register(`educationList.${index}.year`)}
                      />

                      <div className="sm:col-span-3 flex justify-end">
                        <Button
                          type="button"
                          variant="danger"
                          className="!py-2 !px-4 !text-sm"
                          disabled={!canRemove}
                          onClick={() => removeEducation(index)}
                        >
                          Remove
                        </Button>
                      </div>
                    </div>
                  );
                })}

                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="ghostOutline"
                    className="!py-2 !px-5 !text-sm !font-semibold"
                    onClick={() =>
                      appendEducation({
                        degree: "",
                        university: "",
                        year: "",
                      })
                    }
                  >
                    Add Education
                  </Button>
                </div>
              </div>
            </section>

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

            <div className="flex flex-col sm:flex-row gap-3 mt-6">
              <Button
                type="submit"
                variant="violet"
                disabled={isCreating || isUpdating}
                className="!py-3.5 !px-8 !text-base !w-full sm:!w-auto"
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
                  className="!py-3.5 !px-8 !w-full sm:!w-auto"
                >
                  Cancel
                </Button>
              )}
            </div>
          </form>
        </div>
      )}
      {isCropModalOpen && cropSrc && (
        <div className="fixed inset-0 z-[1250] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-slate-900 rounded-2xl max-w-2xl w-full border border-slate-700 shadow-2xl shadow-black/60 overflow-hidden">
            <div className="px-6 pt-6 pb-4 border-b border-slate-800">
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-lg font-bold text-slate-50 m-0">Crop profile photo</h3>
                <Button
                  type="button"
                  variant="ghostOutline"
                  onClick={closeCropModal}
                  disabled={isProfilePicUploading}
                  className="!py-2 !px-3"
                >
                  Close
                </Button>
              </div>
            </div>

            <div className="p-4">
              <Cropper
                src={cropSrc}
                style={{ height: 420, width: "100%" }}
                aspectRatio={1}
                viewMode={1}
                guides={false}
                background={false}
                responsive={true}
                autoCropArea={1}
                checkOrientation={false}
                ref={cropperRef}
              />
            </div>

            <div className="px-6 pb-6 pt-2 flex gap-3 justify-end border-t border-slate-800">
              <Button
                type="button"
                variant="secondary"
                onClick={closeCropModal}
                disabled={isProfilePicUploading}
                className="bg-slate-800/80 text-slate-300 border border-slate-600 hover:bg-slate-700 hover:text-slate-100 hover:border-slate-500 py-2.5 px-5 rounded-xl text-sm font-semibold transition"
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="violet"
                onClick={handleCropAndUploadProfilePic}
                disabled={isProfilePicUploading}
                className="!py-2.5 !px-6 rounded-xl text-sm font-semibold disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isProfilePicUploading ? "Uploading…" : "Save photo"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {profileFeedback ? (
        <div
          className="fixed inset-0 z-[1100] flex items-center justify-center bg-black/70 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby={feedbackTitleId}
          onClick={() => dismissProfileFeedback()}
        >
          <div
            className="w-full max-w-md rounded-xl border border-slate-200/10 bg-slate-900/95 p-5 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2
              id={feedbackTitleId}
              className={`m-0 text-base font-bold ${
                profileFeedback.variant === "success" ? "text-emerald-300" : "text-red-300"
              }`}
            >
              {profileFeedback.variant === "success" ? "Success" : "Something went wrong"}
            </h2>
            <p className="m-0 mt-2 text-sm text-slate-300">{profileFeedback.message}</p>
            <div className="mt-5 flex justify-end">
              <Button
                type="button"
                variant={profileFeedback.variant === "success" ? "violet" : "secondary"}
                onClick={() => dismissProfileFeedback()}
                className="sm:min-w-[108px]"
              >
                OK
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      <ChangePasswordModal
        isOpen={isChangePasswordModalOpen}
        onClose={() => setIsChangePasswordModalOpen(false)}
      />
    </div>
  );
};
