import { Collection } from 'mongodb';
import { OTPRepository } from '../../../../domain/otp/repositories/OTPRepository.js';
import { OTPDocument } from '../schemas/OTPDocument.js';

export class MongoOTPRepository implements OTPRepository {
    constructor(private readonly collection: Collection<OTPDocument>) { }
    async saveOTP(email: string, otp: string): Promise<void> {
        await this.collection.deleteMany({ email });
        await this.collection.insertOne({
            email,
            otp,
            createdAt: new Date(),
        });
    }
    async findOTP(email: string): Promise<string | null> {
        const doc = await this.collection.findOne({ email });
        return doc ? doc.otp : null;
    }
    async deleteOTP(email: string): Promise<void> {
        await this.collection.deleteMany({ email });
    }
}
