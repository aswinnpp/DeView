import { MongoClient, Db } from "mongodb";
let client: MongoClient;
let db: Db;
export async function connectMongoDB(): Promise<Db> {
    if (!process.env.MONGO_URI) {
        throw new Error("MONGO_URI is not defined in environment variables");
    }
    if (db) {
        return db;
    }

    // Connection pooling configuration for better performance
    client = new MongoClient(process.env.MONGO_URI, {
        maxPoolSize: 10,              // Maximum connections in the pool
        minPoolSize: 2,               // Minimum connections to maintain
        maxIdleTimeMS: 30000,         // Close idle connections after 30 seconds
        serverSelectionTimeoutMS: 5000, // Timeout for server selection
        socketTimeoutMS: 45000,       // Socket timeout
        retryWrites: true,            // Retry failed writes
        retryReads: true,             // Retry failed reads
    });

    await client.connect();
    db = client.db();
    return db;
}
export const connectDB = connectMongoDB;
export function getMongoDB(): Db {
    if (!db) {
        throw new Error("MongoDB not connected. Call connectMongoDB() first.");
    }
    return db;
}
export async function disconnectMongoDB(): Promise<void> {
    if (client) {
        await client.close();
    }
}
