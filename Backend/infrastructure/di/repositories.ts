import { Db } from 'mongodb';
import { MongoUserRepository } from '../persistence/mongodb/repositories/MongoUserRepository.js';
import { MongoCompanyApprovalRepository } from '../persistence/mongodb/repositories/MongoCompanyApprovalRepository.js';
import { RedisOTPRepository } from '../persistence/redis/RedisOTPRepository.js';
import { UserDocument } from '../persistence/mongodb/schemas/UserDocument.js';
import { CompanyApprovalDocument } from '../persistence/mongodb/schemas/CompanyApprovalDocument.js';

export interface Repositories {
    userRepository: MongoUserRepository;
    otpRepository: RedisOTPRepository;
    companyApprovalRepository: MongoCompanyApprovalRepository;
}

export function createRepositories(db: Db): Repositories {
    const usersCollection = db.collection<UserDocument>('users');
    const companyApprovalsCollection = db.collection<CompanyApprovalDocument>('companyApprovals');

    return {
        userRepository: new MongoUserRepository(usersCollection),
        otpRepository: new RedisOTPRepository(),
        companyApprovalRepository: new MongoCompanyApprovalRepository(companyApprovalsCollection),
    };
}

