import { Collection } from 'mongodb';
import { CompanyApprovalDocument, CompanyDocuments } from '../schemas/CompanyApprovalDocument.js';

export interface CompanyApprovalStatusResponse {
    exists: boolean;
    status: 'not_found' | 'pending' | 'approved' | 'rejected';
    companyName?: string;
    rejectionReason?: string;
}

export interface SubmitApprovalData {
    userId: string;
    companyName: string;
    address: string;
    contactPerson: string;
    contactEmail: string;
    contactPhone: string;
    taxId: string;
    website?: string;
    numberOfEmployees: string;
    documents: CompanyDocuments;
}

export class MongoCompanyApprovalRepository {
    constructor(private readonly collection: Collection<CompanyApprovalDocument>) { }

    /**
     * Check if a company approval exists for a user and return its status
     */
    async checkStatus(userId: string): Promise<CompanyApprovalStatusResponse> {
        const doc = await this.collection.findOne({ userId });

        if (!doc) {
            return {
                exists: false,
                status: 'not_found'
            };
        }

        return {
            exists: true,
            status: doc.status,
            companyName: doc.companyName,
            rejectionReason: doc.rejectionReason
        };
    }

    /**
     * Find approval by user ID
     */
    async findByUserId(userId: string): Promise<CompanyApprovalDocument | null> {
        return await this.collection.findOne({ userId });
    }

    /**
     * Create a new company approval request
     */
    async create(data: SubmitApprovalData): Promise<string> {
        const doc: CompanyApprovalDocument = {
            userId: data.userId,
            companyName: data.companyName,
            address: data.address,
            contactPerson: data.contactPerson,
            contactEmail: data.contactEmail,
            contactPhone: data.contactPhone,
            taxId: data.taxId,
            website: data.website,
            numberOfEmployees: data.numberOfEmployees,
            documents: data.documents,
            status: 'pending',
            createdAt: new Date(),
            updatedAt: new Date()
        };

        const result = await this.collection.insertOne(doc);
        return result.insertedId.toString();
    }
}
