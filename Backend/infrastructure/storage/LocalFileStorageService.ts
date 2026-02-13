import path from 'path';
import fs from 'fs';
import { randomUUID } from 'crypto';
import { env } from '../config/env.js';

const UPLOADS_DIR = path.join(process.cwd(), 'uploads');

// Ensure uploads directory exists
if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

export class LocalFileStorageService {
    async save(originalName: string, data: Buffer): Promise<string> {
        const ext = path.extname(originalName);
        const safeName = `${randomUUID()}${ext}`;
        const filePath = path.join(UPLOADS_DIR, safeName);

        fs.writeFileSync(filePath, data);

        return safeName;
    }

    getPublicUrl(storedName: string): string {
        return `http://localhost:${env.PORT}/uploads/${storedName}`;
    }
}
