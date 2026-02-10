import { ObjectId } from 'mongodb';

export interface CompanyApprovalDocument {
    _id?: ObjectId;
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
    status: 'pending' | 'approved' | 'rejected';
    rejectionReason?: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface CompanyDocuments {
    certificateOfIncorporation?: DocumentUpload;
    gstCertificate?: DocumentUpload;
    panCard?: DocumentUpload;
    addressProof?: DocumentUpload;
    authorizedSignatoryId?: DocumentUpload;
    bankDocument?: DocumentUpload;
}

export interface DocumentUpload {
    fileName: string;
    fileUrl: string;
    uploadedAt: Date;
}
