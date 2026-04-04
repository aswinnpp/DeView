import React, { useCallback } from "react";
import { ProfessionalProfilePageContent } from "../../components/profile/ProfessionalProfilePageContent";
import { useHrProfile } from "../../hooks/hr";
import { hrProfileService } from "../../services/hrProfile.service";

const HR_PROFILE_COPY = {
  createSubtitle: "Complete your profile so your team knows who they are working with.",
  editSubtitle: "Update your professional information",
  titlePlaceholder: "e.g., Senior HR Business Partner",
  bioPlaceholder: "Brief summary of your HR and recruiting experience...",
  skillsReadOnlyHeading: "Skills",
  skillsFormSectionTitle: "Skills",
  skillsInputLabel: "Professional skills (Press Enter to add)",
} as const;

const HRProfilePage: React.FC = () => {
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
    getProfilePicViewUrl,
  } = useHrProfile();

  const updateProfilePicPartial = useCallback(async (stored: string) => {
    await hrProfileService.updateProfilePartial({ profilePicUrl: stored });
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
      feedbackTitleId="hr-profile-feedback-title"
      uploadCategory="hrProfilePic"
      updateProfilePicPartial={updateProfilePicPartial}
      getProfilePicViewUrl={getProfilePicViewUrl}
      copy={HR_PROFILE_COPY}
    />
  );
};

export default HRProfilePage;
