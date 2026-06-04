import { ObjectId } from 'mongodb';

export interface ISubscription {
    _id?: ObjectId;
    name: string
    price: number;
    duration: 'Monthly' | 'Quarterly' | 'Annual';
    isActive: boolean;
    interviewLimit: number;
    interviewUnlimited: boolean;
    jobPostLimit: number;
    jobUnlimited: boolean;
    hasAI: boolean;
    createdAt: Date;
    updatedAt: Date;
}
