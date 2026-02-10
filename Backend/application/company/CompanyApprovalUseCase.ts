import { MongoCompanyApprovalRepository, SubmitApprovalData } from '../../infrastructure/persistence/mongodb/repositories/MongoCompanyApprovalRepository.js';
import { CompanyDocuments } from '../../infrastructure/persistence/mongodb/schemas/CompanyApprovalDocument.js';

// Request/Response types
export interface CheckStatusRequest {
    userId: string;
}

export interface SubmitApprovalRequest {
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

export interface UseCaseResult {
    success: boolean;
    error?: string;
    message?: string;
    data?: any;
}

export class CompanyApprovalUseCase {
    constructor(
        private readonly companyApprovalRepository: MongoCompanyApprovalRepository
    ) { }

    /**
     * Check approval status for a user (used during login)
     */
    async checkStatus(request: CheckStatusRequest): Promise<UseCaseResult> {
        const { userId } = request;

        // Validation
        if (!userId || typeof userId !== 'string' || userId.trim() === '') {
            return {
                success: false,
                error: 'userId is required'
            };
        }

        const result = await this.companyApprovalRepository.checkStatus(userId.trim());

        return {
            success: true,
            data: result
        };
    }

    /**
     * Submit a new company approval request
     */
    async submit(request: SubmitApprovalRequest): Promise<UseCaseResult> {
        const { userId, companyName, address, contactPerson, contactEmail, contactPhone, taxId, numberOfEmployees, documents } = request;

        // Validate required fields
        if (!userId || userId.trim() === '') {
            return { success: false, error: 'userId is required' };
        }

        if (!companyName || companyName.trim() === '') {
            return { success: false, error: 'Company name is required' };
        }

        if (!address || address.trim() === '') {
            return { success: false, error: 'Address is required' };
        }

        if (!contactPerson || contactPerson.trim() === '') {
            return { success: false, error: 'Contact person is required' };
        }

        if (!contactEmail || contactEmail.trim() === '') {
            return { success: false, error: 'Contact email is required' };
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(contactEmail)) {
            return { success: false, error: 'Invalid email format' };
        }

        if (!contactPhone || contactPhone.trim() === '') {
            return { success: false, error: 'Contact phone is required' };
        }

        if (contactPhone.length < 10) {
            return { success: false, error: 'Phone number must be at least 10 digits' };
        }

        if (!taxId || taxId.trim() === '') {
            return { success: false, error: 'Tax ID is required' };
        }

        if (!numberOfEmployees) {
            return { success: false, error: 'Number of employees is required' };
        }

        // Validate required documents
        const requiredDocs = ['certificateOfIncorporation', 'gstCertificate', 'panCard', 'addressProof', 'authorizedSignatoryId'];
        const missingDocs: string[] = [];

        for (const docKey of requiredDocs) {
            if (!documents || !documents[docKey as keyof CompanyDocuments]) {
                missingDocs.push(docKey);
            }
        }

        if (missingDocs.length > 0) {
            return {
                success: false,
                error: `Missing required documents: ${missingDocs.join(', ')}`
            };
        }

        // Check if user already has a pending/approved request
        const existing = await this.companyApprovalRepository.findByUserId(userId);
        if (existing) {
            if (existing.status === 'pending') {
                return {
                    success: false,
                    error: 'You already have a pending approval request'
                };
            }
            if (existing.status === 'approved') {
                return {
                    success: false,
                    error: 'Your company is already approved'
                };
            }
            // If rejected, they can resubmit (we could delete the old one or update it)
        }

        // Create the approval request
        const approvalId = await this.companyApprovalRepository.create({
            userId: userId.trim(),
            companyName: companyName.trim(),
            address: address.trim(),
            contactPerson: contactPerson.trim(),
            contactEmail: contactEmail.trim().toLowerCase(),
            contactPhone: contactPhone.trim(),
            taxId: taxId.trim(),
            website: request.website?.trim(),
            numberOfEmployees,
            documents
        });

        return {
            success: true,
            message: 'Approval request submitted successfully',
            data: { approvalId }
        };
    }
}
