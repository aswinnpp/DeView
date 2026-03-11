import { MongoClient, Db } from "mongodb";
import { env } from "../../../config/env.js";
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
        maxPoolSize: 10,              
        minPoolSize: 2,               
        maxIdleTimeMS: 30000,         
        serverSelectionTimeoutMS: 5000, 
        socketTimeoutMS: 45000,       
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
