/** Company response to candidate counter. */
export type CounterResponseStatus = 'pending' | 'accepted' | 'rejected';

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
    public createdAt: Date = new Date(),
    public responseStatus: CounterResponseStatus = 'pending'
  ) {}
}
