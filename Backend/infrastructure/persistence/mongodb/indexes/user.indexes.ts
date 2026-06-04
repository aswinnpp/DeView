import { Db } from 'mongodb';

export async function createUserIndexes(db: Db): Promise<void> {
    const usersCollection = db.collection('users');
    await usersCollection.createIndex(
        { email: 1 },
        { unique: true, name: 'email_unique' }
    );
    await usersCollection.createIndex(
        { role: 1 },
        { name: 'role_index' }
    );
    await usersCollection.createIndex(
        { isActive: 1, role: 1 },
        { name: 'active_role_index' }
    );
}
