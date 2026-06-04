import { Db } from 'mongodb';
import { connectMongoDB } from '../persistence/mongodb/client/MongoClient.js';
import { createUserIndexes } from '../persistence/mongodb/indexes/user.indexes.js';

let db: Db | null = null;

export async function initializeDatabase(): Promise<Db> {
    if (db) return db;

    db = await connectMongoDB();

    await Promise.all([
        createUserIndexes(db),
    ]);

    return db;
}

export function getDatabase(): Db {
    if (!db) {
        throw new Error('Database not initialized. Call initializeDatabase() first.');
    }
    return db;
}
