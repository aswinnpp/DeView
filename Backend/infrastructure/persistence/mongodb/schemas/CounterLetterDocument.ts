import { ObjectId } from 'mongodb';

export type CounterResponseStatusDoc = 'pending' | 'accepted' | 'rejected';

export interface ICounterLetterDocument {
  _id?: ObjectId;
  offerMailId: string;
  applicationId: string;
  jobId: string;
  companyId: string;
  candidateUserId: string;
  content: string;
  createdAt: Date;
  /** Company response to the counter; omitted means pending. */
  responseStatus?: CounterResponseStatusDoc;
}
