export interface FileStoragePort {
    save(originalName: string, data: Buffer): Promise<string>;
    getPublicUrl(storedName: string): string;
}
