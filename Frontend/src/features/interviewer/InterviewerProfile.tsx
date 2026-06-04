import React, { useCallback } from "react";
import { ProfessionalProfilePageContent } from "../../components/profile/ProfessionalProfilePageContent";
import { useInterviewerProfile } from "../../hooks/interviewer";
import { interviewerProfileService } from "../../services/interviewerProfile.service";

const INTERVIEWER_PROFILE_COPY = {
  createSubtitle: "Complete your profile to start conducting interviews",
  editSubtitle: "Update your professional information",
  titlePlaceholder: "Senior Software Engineer",
  bioPlaceholder: "Brief summary of your professional experience...",
  skillsReadOnlyHeading: "Skills",
  skillsFormSectionTitle: "Skills",
  skillsInputLabel: "Technical Skills (Press Enter to add)",
} as const;

const InterviewerProfileSettings: React.FC = () => {
  const {
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
  } = useInterviewerProfile();

  const getProfilePicViewUrl = useCallback(
    () => interviewerProfileService.getProfilePicViewUrl(),
    []
  );

  const updateProfilePicPartial = useCallback(async (stored: string) => {
    await interviewerProfileService.updateProfilePartial({ profilePicUrl: stored });
  }, []);

  return (
    <ProfessionalProfilePageContent
      form={form}
      profileData={profileData}
      profileLoading={profileLoading}
      isEditing={isEditing}
      setIsEditing={setIsEditing}
      isCreating={isCreating}
      isUpdating={isUpdating}
      handleLogout={handleLogout}
      handleArrayInput={handleArrayInput}
      onSubmit={onSubmit}
      getInitials={getInitials}
      fetchProfile={fetchProfile}
      profileFeedback={profileFeedback}
      dismissProfileFeedback={dismissProfileFeedback}
      feedbackTitleId="interviewer-profile-feedback-title"
      uploadCategory="interviewerProfilePic"
      updateProfilePicPartial={updateProfilePicPartial}
      getProfilePicViewUrl={getProfilePicViewUrl}
      copy={INTERVIEWER_PROFILE_COPY}
    />
  );
};

export default InterviewerProfileSettings;
