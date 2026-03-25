import { r2Provider } from "./r2";
import { localProvider } from "./local";
import type { StorageProvider } from "./types";

export type { StorageProvider };

/**
 * Active storage provider.
 *
 * To swap providers, change the priority list below or add a new
 * provider that implements StorageProvider and include it here.
 *
 * Priority: R2 → local (dev fallback)
 */
function resolveProvider(): StorageProvider {
  if (r2Provider.isConfigured()) return r2Provider;
  return localProvider;
}

export const storage = resolveProvider();

/** True when the active provider is not the local fallback */
export function isRemoteStorage(): boolean {
  return storage !== localProvider;
}

/** @deprecated Use isRemoteStorage() instead */
export function isR2Configured(): boolean {
  return r2Provider.isConfigured();
}

/** Resolve a URL from a storage key (signed or public) */
export async function getSignedMediaUrl(key: string, expiresInSeconds = 3600): Promise<string> {
  return storage.getUrl(key, expiresInSeconds);
}
