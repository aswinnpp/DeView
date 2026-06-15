import { MongoClient, Db } from "mongodb";
import { env } from "../../../config/env";

let client: MongoClient;
let db: Db;

export async function connectMongoDB(): Promise<Db> {
    if (!env.MONGO_URI) {
        throw new Error("MONGO_URI is not defined in environment variables");
    }
    if (db) {
        return db;
    }

    client = new MongoClient(env.MONGO_URI, {
        maxPoolSize: env.MONGO_MAX_POOL_SIZE,
        minPoolSize: env.MONGO_MIN_POOL_SIZE,
        maxIdleTimeMS: env.MONGO_MAX_IDLE_TIME_MS,
        serverSelectionTimeoutMS: env.MONGO_SERVER_SELECTION_TIMEOUT_MS,
        socketTimeoutMS: env.MONGO_SOCKET_TIMEOUT_MS,
        retryWrites: true,
        retryReads: true,
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
