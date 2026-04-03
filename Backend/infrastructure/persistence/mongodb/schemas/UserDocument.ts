import { ObjectId } from 'mongodb';

export interface IUserDocument {
    _id?: ObjectId;
    fullName: string;
    companyName?: string | null;
    companyId?: string; // Links HR users to their company
    email: string;
    passwordHash?: string;
    role: string;
    isActive: boolean;
    isEmailVerified: boolean;
    googleId?: string;
    createdAt: Date;
    updatedAt: Date;
   
}
