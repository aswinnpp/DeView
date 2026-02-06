import { Db } from 'mongodb';
import { MongoUserRepository } from '../persistence/mongodb/repositories/MongoUserRepository.js';
import { RedisOTPRepository } from '../persistence/redis/RedisOTPRepository.js';
import { UserDocument } from '../persistence/mongodb/schemas/UserDocument.js';

export interface Repositories {
    userRepository: MongoUserRepository;
    otpRepository: RedisOTPRepository;
}

export function createRepositories(db: Db): Repositories {
    const usersCollection = db.collection<UserDocument>('users');

    return {
        userRepository: new MongoUserRepository(usersCollection),
        otpRepository: new RedisOTPRepository(),
    };
}
