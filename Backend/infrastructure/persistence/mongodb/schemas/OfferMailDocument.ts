import { ObjectId } from 'mongodb';
import type { OfferMailStatus } from '../../../../domain/entities/OfferMail.js';

export interface IOfferMailDocument {
  _id?: ObjectId;
  applicationId: string;
  jobId: string;
  companyId: string;
  candidateUserId: string;
  candidateName: string;
  candidateEmail: string;
  content: string;
  salary?: string;
  location?: string;
  startDate?: string;
  benefits?: string;
  /** Optional position title override (used for counter terms & rendering). */
  positionTitle?: string;
  /** Candidate response; omitted on legacy docs — treat as pending when reading. */
  status?: OfferMailStatus;
  /**
   * @deprecated Counter text lives in `counterLetters` collection. May remain on old rows until migrated.
   */
  counterLetter?: string;
  counterSentAt?: Date;
  createdAt: Date;
  /** Set when candidate starts DocuSign acceptance; cleared if envelope voided. */
  docusignAcceptanceEnvelopeId?: string;
}
