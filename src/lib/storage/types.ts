export interface StorageProvider {
  /** Upload a file and return its storage key */
  upload(
    buffer: Buffer,
    originalName: string,
    mimeType: string,
    folder: string
  ): Promise<string>;

  /** Delete a file by its storage key */
  delete(key: string): Promise<void>;

  /** Resolve a public or signed URL from a storage key */
  getUrl(key: string, expiresInSeconds?: number): Promise<string>;

  /** Whether this provider is properly configured */
  isConfigured(): boolean;
}
