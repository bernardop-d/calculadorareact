import { prisma } from "@/lib/db";

interface PushPayload {
  title: string;
  body?: string;
  url?: string;
}

// TODO: Install web-push package: npm install web-push @types/web-push
// Then set VAPID_PUBLIC_KEY and VAPID_PRIVATE_KEY environment variables.
// Generate keys with: npx web-push generate-vapid-keys
export async function sendPushNotification(payload: PushPayload): Promise<void> {
  try {
    // Check if web-push is installed (optional dependency)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let webpush: any = null;
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      webpush = require("web-push");
    } catch {
      console.warn("[Push] web-push not installed — skipping push notifications");
      return;
    }

    const vapidPublicKey = process.env.VAPID_PUBLIC_KEY;
    const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

    if (!vapidPublicKey || !vapidPrivateKey) {
      console.warn("[Push] VAPID keys not configured — skipping push notifications");
      return;
    }

    webpush.setVapidDetails(
      `mailto:admin@${new URL(appUrl).hostname}`,
      vapidPublicKey,
      vapidPrivateKey
    );

    const subscriptions = await prisma.pushSubscription.findMany();
    if (subscriptions.length === 0) return;

    const message = JSON.stringify(payload);
    const results = await Promise.allSettled(
      subscriptions.map((sub) =>
        webpush.sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
          message
        )
      )
    );

    const failed = results.filter((r) => r.status === "rejected").length;
    if (failed > 0) {
      console.warn(`[Push] ${failed}/${subscriptions.length} notifications failed`);
    }
  } catch (err) {
    console.error("[Push] sendPushNotification error:", err);
  }
}
