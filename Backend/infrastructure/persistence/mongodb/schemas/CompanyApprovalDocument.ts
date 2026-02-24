import { ObjectId } from 'mongodb';

export interface ICompanyApprovalDocument {
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
    documents: ICompanyDocuments;
    status: 'pending' | 'approved' | 'rejected';
    rejectionReason?: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface ICompanyDocuments {
    certificateOfIncorporation?: IDocumentUpload;
    gstCertificate?: IDocumentUpload;
    panCard?: IDocumentUpload;
    addressProof?: IDocumentUpload;
    authorizedSignatoryId?: IDocumentUpload;
    bankDocument?: IDocumentUpload;
}

export interface IDocumentUpload {
    fileName: string;
    fileUrl: string;
    uploadedAt: Date;
    marked: boolean;
}
