/**
 * RZ7 — "player just went live" push trigger.
 *
 * Watches live_players/{name} in Realtime Database. Whenever a value
 * there flips from empty/falsy to something truthy ('yt' | 'kick' |
 * 'admin'), that's someone going live — this sends a real push
 * notification via FCM to every device saved under fcm_tokens/, so
 * people get notified even with the site fully closed.
 *
 * Deploy with: firebase deploy --only functions
 * (requires the Blaze pay-as-you-go plan — see the deployment notes
 * for why that's needed and what it actually costs at this scale)
 */

const { onValueWritten } = require('firebase-functions/v2/database');
const { initializeApp } = require('firebase-admin/app');
const { getDatabase } = require('firebase-admin/database');
const { getMessaging } = require('firebase-admin/messaging');

initializeApp();

exports.onPlayerGoesLive = onValueWritten(
  {
    ref: '/live_players/{playerName}',
    region: 'asia-southeast1', // match your Realtime Database region
  },
  async (event) => {
    const playerName = event.params.playerName;
    const before = event.data.before.val();
    const after  = event.data.after.val();

    const wasLive = !!before;
    const isLive  = !!after;

    // Only fire on a genuine offline → live transition.
    if (wasLive || !isLive) return null;

    const db = getDatabase();
    const tokensSnap = await db.ref('fcm_tokens').get();
    if (!tokensSnap.exists()) return null;

    const tokensObj = tokensSnap.val();
    const tokenEntries = Object.entries(tokensObj); // [key, {token, ts, page}]
    const tokens = tokenEntries.map(([, v]) => v.token).filter(Boolean);
    if (tokens.length === 0) return null;

    const displayName = playerName.charAt(0).toUpperCase() + playerName.slice(1);

    const message = {
      notification: {
        title: '🔴 RZ7 LIVE',
        body: `${displayName} is now LIVE! Tune in now. 👑`,
      },
      data: {
        tag: 'rz7-live-' + playerName,
      },
      tokens,
    };

    const response = await getMessaging().sendEachForMulticast(message);

    // Clean up dead tokens (uninstalled app, revoked permission, etc.)
    // so future sends don't keep wasting time/quota on them.
    const deletions = [];
    response.responses.forEach((res, i) => {
      if (!res.success) {
        const code = res.error && res.error.code;
        if (
          code === 'messaging/registration-token-not-registered' ||
          code === 'messaging/invalid-registration-token'
        ) {
          const [deadKey] = tokenEntries[i];
          deletions.push(db.ref('fcm_tokens/' + deadKey).remove());
        }
      }
    });
    await Promise.all(deletions);

    console.log(
      `Live push sent for ${playerName}: ${response.successCount} ok, ${response.failureCount} failed, ${deletions.length} tokens cleaned up.`
    );
    return null;
  }
);
