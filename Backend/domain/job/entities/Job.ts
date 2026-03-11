import { DomainError } from '../../../shared/errors/DomainError.js';
import type { IJobApplicantDetail } from './JobApplicant.js';

export type JobStatus = 'OPEN' | 'CLOSED';

export class Job {
  constructor(
    public id: string | null,
    public companyId: string,
    public title: string,
    public department: string,
    public location: string,
    public jobType: string,
    public workMode: string,
    public experienceLevel: string,
    public minExperience?: string,
    public maxExperience?: string,
    public salary?: string,
    public salaryNonDisclosure: boolean = false,
    public skills: string = '',
    public qualifications: string = '',
    public responsibilities: string = '',
    public benefits?: string,
    public description: string = '',
    public applicationDeadline?: string,
    public numberOfPositions: number = 1,
    public interviewRounds: string[] = [],
    public status: JobStatus = 'OPEN',
    public applicants: IJobApplicantDetail[] = [],
    public createdAt: Date = new Date(),
    public updatedAt: Date = new Date()
  ) {
    this.syncStatusWithDeadline();
  }

  
  private syncStatusWithDeadline() {
    if (!this.applicationDeadline) return;

    const deadline = new Date(this.applicationDeadline);
    if (Number.isNaN(deadline.getTime())) return;

    const now = new Date();
    if (deadline < now) {
      this.status = 'CLOSED';
    }
  }

  updateFields(fields: Partial<Omit<Job, 'id' | 'companyId' | 'createdAt' | 'updatedAt'>>) {
    if (fields.title !== undefined) this.title = fields.title;
    if (fields.department !== undefined) this.department = fields.department;
    if (fields.location !== undefined) this.location = fields.location;
    if (fields.jobType !== undefined) this.jobType = fields.jobType;
    if (fields.workMode !== undefined) this.workMode = fields.workMode;
    if (fields.experienceLevel !== undefined) this.experienceLevel = fields.experienceLevel;
    if (fields.minExperience !== undefined) this.minExperience = fields.minExperience;
    if (fields.maxExperience !== undefined) this.maxExperience = fields.maxExperience;
    if (fields.salary !== undefined) this.salary = fields.salary;
    if (fields.salaryNonDisclosure !== undefined) this.salaryNonDisclosure = fields.salaryNonDisclosure;
    if (fields.skills !== undefined) this.skills = fields.skills;
    if (fields.qualifications !== undefined) this.qualifications = fields.qualifications;
    if (fields.responsibilities !== undefined) this.responsibilities = fields.responsibilities;
    if (fields.benefits !== undefined) this.benefits = fields.benefits;
    if (fields.description !== undefined) this.description = fields.description;
    if (fields.applicationDeadline !== undefined) this.applicationDeadline = fields.applicationDeadline;
    if (fields.numberOfPositions !== undefined) this.numberOfPositions = fields.numberOfPositions;
    if (fields.interviewRounds !== undefined) this.interviewRounds = fields.interviewRounds;
    if (fields.status !== undefined) this.status = fields.status as JobStatus;

    this.syncStatusWithDeadline();
    this.updatedAt = new Date();
  }

  toggleStatus(next: JobStatus) {
    if (next !== 'OPEN' && next !== 'CLOSED') {
      throw new DomainError('Invalid job status');
    }
    this.status = next;
    this.updatedAt = new Date();
  }
}

