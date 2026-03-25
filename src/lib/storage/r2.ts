import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { randomUUID } from "crypto";
import path from "path";
import type { StorageProvider } from "./types";

function createR2Client() {
  return new S3Client({
    region: "auto",
    endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID!,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
    },
  });
}

export const r2Provider: StorageProvider = {
  isConfigured() {
    return !!(
      process.env.R2_ACCOUNT_ID &&
      process.env.R2_ACCESS_KEY_ID &&
      process.env.R2_SECRET_ACCESS_KEY &&
      process.env.R2_BUCKET
    );
  },

  async upload(buffer, originalName, mimeType, folder) {
    const ext = path.extname(originalName);
    const key = `${folder}/${randomUUID()}${ext}`;

    await createR2Client().send(
      new PutObjectCommand({
        Bucket: process.env.R2_BUCKET!,
        Key: key,
        Body: buffer,
        ContentType: mimeType,
      })
    );

    return key;
  },

  async delete(key) {
    await createR2Client().send(
      new DeleteObjectCommand({
        Bucket: process.env.R2_BUCKET!,
        Key: key,
      })
    );
  },

  async getUrl(key, expiresInSeconds = 3600) {
    if (process.env.R2_PUBLIC_URL) {
      const base = process.env.R2_PUBLIC_URL.replace(/\/$/, "");
      return `${base}/${key}`;
    }

    const command = new GetObjectCommand({
      Bucket: process.env.R2_BUCKET!,
      Key: key,
    });

    return getSignedUrl(createR2Client(), command, { expiresIn: expiresInSeconds });
  },
};
