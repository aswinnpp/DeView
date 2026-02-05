import { Db } from 'mongodb';
import { MongoUserRepository } from '../persistence/mongodb/repositories/MongoUserRepository.js';
import { MongoOTPRepository } from '../persistence/mongodb/repositories/MongoOTPRepository.js';
import { MongoRefreshTokenRepository } from '../persistence/mongodb/repositories/MongoRefreshTokenRepository.js';
import { UserDocument } from '../persistence/mongodb/schemas/UserDocument.js';
import { OTPDocument } from '../persistence/mongodb/schemas/OTPDocument.js';
import { RefreshTokenDocument } from '../persistence/mongodb/schemas/RefreshTokenDocument.js';

export interface Repositories {
    userRepository: MongoUserRepository;
    otpRepository: MongoOTPRepository;
    refreshTokenRepository: MongoRefreshTokenRepository;
}

export function createRepositories(db: Db): Repositories {
    const usersCollection = db.collection<UserDocument>('users');
    const otpsCollection = db.collection<OTPDocument>('otps');
    const refreshTokensCollection = db.collection<RefreshTokenDocument>('refresh_tokens');

    return {
        userRepository: new MongoUserRepository(usersCollection),
        otpRepository: new MongoOTPRepository(otpsCollection),
        refreshTokenRepository: new MongoRefreshTokenRepository(refreshTokensCollection),
    };
}
