/** Candidate response to an offer letter (stored on the offer mail record). */
export type OfferMailStatus = 'pending' | 'accepted' | 'declined' | 'counter';

export class OfferMail {
  constructor(
    public id: string | null,
    public applicationId: string,
    public jobId: string,
    public companyId: string,
    public candidateUserId: string,
    public candidateName: string,
    public candidateEmail: string,
    public content: string,
    public salary?: string,
    public location?: string,
    public startDate?: string,
    public benefits?: string,
    public positionTitle?: string,
    public status: OfferMailStatus = 'pending',
    public createdAt: Date = new Date(),
    /** DocuSign envelope for embedded acceptance signing (pending until completed). */
    public docusignAcceptanceEnvelopeId?: string
  ) {}
}
