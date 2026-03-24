import { writeFile, mkdir, unlink } from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import { randomUUID } from "crypto";
import type { StorageProvider } from "./types";

const PUBLIC_DIR = path.join(process.cwd(), "public");

export const localProvider: StorageProvider = {
  isConfigured() {
    return true; // always available as fallback
  },

  async upload(buffer, originalName, _mimeType, folder) {
    const uploadDir = path.join(PUBLIC_DIR, "uploads", folder);
    await mkdir(uploadDir, { recursive: true });

    const ext = path.extname(originalName);
    const filename = `${randomUUID()}${ext}`;
    await writeFile(path.join(uploadDir, filename), buffer);

    // Return a web-accessible path (acts as the "key")
    return `/uploads/${folder}/${filename}`;
  },

  async delete(key) {
    const filePath = path.join(PUBLIC_DIR, key);
    if (existsSync(filePath)) {
      await unlink(filePath);
    }
  },

  async getUrl(key) {
    // Local files are served statically — key IS the URL
    return key;
  },
};
