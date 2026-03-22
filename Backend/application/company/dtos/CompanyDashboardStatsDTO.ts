/** Company dashboard stats — input + output in one module. */

export interface ICompanyDashboardStatsInputDTO {
  companyId: string;
}

export type CompanyDashboardApplicationDayDTO = {
  day: string;
  dateLabel: string;
  applications: number;
};

export type CompanyDashboardNamedCountDTO = {
  name: string;
  value: number;
};

export type CompanyDashboardJobApplicationsDTO = {
  name: string;
  applications: number;
};

export type CompanyDashboardMonthlyInterviewDTO = {
  month: string;
  interviews: number;
};

export type CompanyDashboardWeeklyInterviewDTO = {
  day: string;
  interviews: number;
};

export interface ICompanyDashboardStatsOutputDTO {
  companyName: string | null;
  applicationsOverTime: CompanyDashboardApplicationDayDTO[];
  applicationStatus: CompanyDashboardNamedCountDTO[];
  applicationsByJob: CompanyDashboardJobApplicationsDTO[];
  monthlyInterviews: CompanyDashboardMonthlyInterviewDTO[];
  interviewStatus: CompanyDashboardNamedCountDTO[];
  weeklyInterviews: CompanyDashboardWeeklyInterviewDTO[];
}
