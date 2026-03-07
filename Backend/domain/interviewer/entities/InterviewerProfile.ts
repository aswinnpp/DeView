export class InterviewerProfile {
  constructor(
    public id: string | null,
    public userId: string,
    public fullName: string,
    public phone: string,
    public location: string,
    public title: string,
    public currentCompany: string,
    public yearsOfExperience: number,
    public bio: string,
    public technicalSkills: string[],
    public languages: string[],
    public education: string,
    public university: string,
    public linkedinUrl: string,
    public githubUrl: string,
    public createdAt: Date = new Date(),
    public updatedAt: Date = new Date()
  ) {}

  updateFields(
    fields: Partial<
      Omit<
        InterviewerProfile,
        "id" | "userId" | "createdAt" | "updatedAt"
      >
    >
  ): void {
    if (fields.fullName !== undefined) this.fullName = fields.fullName;
    if (fields.phone !== undefined) this.phone = fields.phone;
    if (fields.location !== undefined) this.location = fields.location;
    if (fields.title !== undefined) this.title = fields.title;
    if (fields.currentCompany !== undefined) this.currentCompany = fields.currentCompany;
    if (fields.yearsOfExperience !== undefined) this.yearsOfExperience = fields.yearsOfExperience;
    if (fields.bio !== undefined) this.bio = fields.bio;
    if (fields.technicalSkills !== undefined) this.technicalSkills = fields.technicalSkills;
    if (fields.languages !== undefined) this.languages = fields.languages;
    if (fields.education !== undefined) this.education = fields.education;
    if (fields.university !== undefined) this.university = fields.university;
    if (fields.linkedinUrl !== undefined) this.linkedinUrl = fields.linkedinUrl;
    if (fields.githubUrl !== undefined) this.githubUrl = fields.githubUrl;
    this.updatedAt = new Date();
  }
}
