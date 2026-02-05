import { Db } from 'mongodb';

export async function createOTPIndexes(db: Db): Promise<void> {
    const otpCollection = db.collection('otps');
    await otpCollection.createIndex(
        { createdAt: 1 },
        { expireAfterSeconds: 60 }
    );
    await otpCollection.createIndex(
        { email: 1 },
        { unique: false }
    );
    console.log('✅ OTP TTL indexes created (60 seconds expiry)');
}
