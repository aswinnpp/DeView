/** Company response to candidate counter. */
export type CounterResponseStatus = 'pending' | 'accepted' | 'rejected';

export type CounterLetterTerms = {
  salary?: string;
  location?: string;
  startDate?: string;
  benefits?: string;
  positionTitle?: string;
};

/** Candidate counter proposal linked to an offer mail (stored in `counterLetters` collection). */
export class CounterLetter {
  constructor(
    public id: string | null,
    public offerMailId: string,
    public applicationId: string,
    public jobId: string,
    public companyId: string,
    public candidateUserId: string,
    public content: string,
    public salary?: string,
    public location?: string,
    public startDate?: string,
    public benefits?: string,
    public positionTitle?: string,
    public createdAt: Date = new Date(),
    public responseStatus: CounterResponseStatus = 'pending'
  ) {}
}
